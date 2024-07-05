document.getElementById('uploadForm').addEventListener('submit', function(e) {
    e.preventDefault();
  
    const formData = new FormData();
    const fileField = document.querySelector('input[type="file"]');
  
    formData.append('video', fileField.files[0]);
  
    fetch('/upload', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      const message = document.getElementById('message');
      message.textContent = data.message;
  
      if (data.video) {
        addVideoToGrid(data.video);
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });
  });
  
  // Function to add a video to the video grid
  function addVideoToGrid(video) {
    const videoGrid = document.getElementById('videoGrid');
    const videoContainer = document.createElement('div');
    videoContainer.className = 'video-container';
    videoContainer.dataset.id = video.id;
  
    const videoElement = document.createElement('video');
    videoElement.controls = true;
    videoElement.src = video.path;
  
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', () => deleteVideo(video.id, videoContainer));
  
    videoContainer.appendChild(videoElement);
    videoContainer.appendChild(deleteButton);
    videoGrid.appendChild(videoContainer);
  }
  
  // Function to delete a video
  function deleteVideo(videoId, videoContainer) {
    fetch(`/videos/${videoId}`, {
      method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
      const message = document.getElementById('message');
      message.textContent = data.message;
      videoContainer.remove();
    })
    .catch(error => {
      console.error('Error:', error);
    });
  }
  
  // Fetch and display all uploaded videos
  function loadVideos() {
    fetch('/videos')
    .then(response => response.json())
    .then(videos => {
      videos.forEach(video => addVideoToGrid(video));
    })
    .catch(error => {
      console.error('Error:', error);
    });
  }
  
  // Load videos on page load
  window.onload = loadVideos;
  
