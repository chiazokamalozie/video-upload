const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');

const app = express();
const PORT = 3000;
const metadataFilePath = path.join(__dirname, 'uploads', 'metadata.json');

// Middleware to serve static files
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// Multer upload configuration
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /mp4|mkv|avi/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Videos Only!');
    }
  },
  limits: { fileSize: 100 * 1024 * 1024 } // 100 MB limit
}).single('video');

// Helper function to load metadata
const loadMetadata = async () => {
  try {
    const metadata = await fs.readJson(metadataFilePath);
    return metadata;
  } catch (err) {
    return [];
  }
};

// Helper function to save metadata
const saveMetadata = async (metadata) => {
  await fs.writeJson(metadataFilePath, metadata, { spaces: 2 });
};

// Video upload endpoint
app.post('/upload', async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).send({ message: err });
    }

    const newVideo = { id: Date.now(), filename: req.file.filename, path: `/uploads/${req.file.filename}` };
    const metadata = await loadMetadata();
    metadata.push(newVideo);
    await saveMetadata(metadata);

    res.send({ message: 'File uploaded successfully', video: newVideo });
  });
});

// Endpoint to get all uploaded videos
app.get('/videos', async (req, res) => {
  const metadata = await loadMetadata();
  res.send(metadata);
});

// Endpoint to delete a video
app.delete('/videos/:id', async (req, res) => {
  const videoId = parseInt(req.params.id);
  let metadata = await loadMetadata();
  const video = metadata.find(v => v.id === videoId);

  if (!video) {
    return res.status(404).send({ message: 'Video not found' });
  }

  const filePath = path.join(__dirname, 'uploads', video.filename);

  try {
    await fs.remove(filePath);
    metadata = metadata.filter(v => v.id !== videoId);
    await saveMetadata(metadata);
    res.send({ message: 'Video deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Error deleting video' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
