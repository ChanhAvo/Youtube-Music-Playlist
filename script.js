let player;
let isPlaying = false;

const API_KEY = ""; 


async function checkVideoAvailability(videoId) {
  const url = `https://www.googleapis.com/youtube/v3/videos?part=status&id=${videoId}&key=${API_KEY}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.items && data.items.length > 0) {
      const status = data.items[0].status;
      return status.embeddable; // Check if the video is embeddable
    }
    return false;
  } catch (error) {
    console.error("Error checking video availability:", error);
    return false;
  }
}

async function fetchVideoTitle(videoId) {
  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${API_KEY}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.items && data.items.length > 0) {
      return data.items[0].snippet.title; // Extract video title
    }
    return "Unknown Title";
  } catch (error) {
    console.error("Error fetching video title:", error);
    return "Unknown Title";
  }
}


// Initialize YouTube IFrame API
function onYouTubeIframeAPIReady() {
  player = new YT.Player("player", {
    height: "200",
    width: "400",
    videoId: "",
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
    },
  });
}

function onPlayerReady() {
  console.log("Player is ready"); // Debug log to ensure this is triggered
  document.getElementById("play-pause-btn").addEventListener("click", togglePlayPause);
  document.getElementById("prev-btn").addEventListener("click", playPrevious);
  document.getElementById("next-btn").addEventListener("click", playNext);
  document.getElementById("add-to-playlist").addEventListener("click", addSongToPlaylist);
  document.getElementById("create-playlist-btn").addEventListener("click", createPlaylist);

  document.getElementById("playlist-select").addEventListener("change", (event) => {
    const selectedPlaylist = event.target.value;
    playlistManager.setActivePlaylist(selectedPlaylist);
    updatePlaylistUI(); 
  });
}

function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.ENDED && playlistManager.activePlaylist) {
    playlistManager.activePlaylist.removeCurrentSong();
    updatePlaylistUI();
    playNext();
  }
}


function togglePlayPause() {
  if (isPlaying) {
    player.pauseVideo();
    isPlaying = false;
  } else {
    player.playVideo();
    isPlaying = true;
  }
}

function playNext() {
  const nextSong = playlistManager.activePlaylist.getNextSong();
  if (nextSong) {
    player.loadVideoById(nextSong.videoId);
    player.playVideo();
    isPlaying = true;
  }
}

function playPrevious() {
  const previousSong = playlistManager.activePlaylist.getPreviousSong();
  if (previousSong) {
    player.loadVideoById(previousSong.videoId);
    player.playVideo();
    isPlaying = true;
  }
}

async function addSongToPlaylist() {
  const urlInput = document.getElementById("youtube-link").value.trim(); // Get input
  const videoId = getYouTubeVideoId(urlInput); // Extract video ID
  const playlistName = document.getElementById("playlist-select").value;

  if (!playlistName || !playlistManager.getPlaylist(playlistName)) {
    showWarning("Please create a playlist before adding songs.");
    return;
  }

  if (!videoId) {
    showWarning("Invalid YouTube URL. Please provide a valid link."); // Display warning
    return;
  }

  const isAvailable = await checkVideoAvailability(videoId);
  if (!isAvailable) {
    showWarning("This video is unavailable or restricted. Please try another link."); // Display warning
    return;
  }

  const title = await fetchVideoTitle(videoId); // Fetch title
  const playlist = playlistManager.getPlaylist(playlistName);
  playlist.addSong(videoId, title); // Add to playlist
  updatePlaylistUI(); 
}

function createPlaylist() {
  const playlistName = prompt("Enter the name for the new playlist:");
  if (playlistName) {
    playlistManager.createPlaylist(playlistName);
    updatePlaylistDropdown();
    playlistManager.setActivePlaylist(playlistName);
    updatePlaylistUI();
  }
}

function updatePlaylistDropdown() {
  const select = document.getElementById("playlist-select");
  select.innerHTML = "";

  Object.keys(playlistManager.playlists).forEach((name) => {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    select.appendChild(option);
  });

  // Set the dropdown to the active playlist
  if (playlistManager.activePlaylist) {
    select.value = playlistManager.activePlaylist.name;
  }
}

function showWarning(message) {
  const warningDiv = document.createElement("div");
  warningDiv.textContent = message;
  warningDiv.style.position = "fixed";
  warningDiv.style.top = "20px";
  warningDiv.style.left = "50%";
  warningDiv.style.transform = "translateX(-50%)";
  warningDiv.style.padding = "10px 20px";
  warningDiv.style.backgroundColor = "#f8d7da";
  warningDiv.style.color = "#721c24";
  warningDiv.style.border = "1px solid #f5c6cb";
  warningDiv.style.borderRadius = "5px";
  warningDiv.style.zIndex = "1000";

  document.body.appendChild(warningDiv);

  // Automatically remove the warning after 3 seconds
  setTimeout(() => {
    document.body.removeChild(warningDiv);
  }, 3000);
}

function getYouTubeVideoId(url) {
    const regExp =
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|.*[?&]v=)|youtu\.be\/)([\w-]{11})/;
    const match = url.match(regExp);
    return match ? match[1] : null;
  }
  

function updatePlaylistUI() {
  const playlist = playlistManager.activePlaylist;
  const ul = document.getElementById("playlist");
  ul.innerHTML = "";

  if (!playlist) return;

  playlist.songs.forEach((song) => {
    const li = document.createElement("li");

    // Song title
    const songTitle = document.createElement("span");
    songTitle.textContent = song.title;
    songTitle.style.marginRight = "10px";
    songTitle.style.cursor = "pointer";
    songTitle.addEventListener("click", () => {
      playlist.currentIndex = playlist.songs.findIndex((s) => s.videoId === song.videoId);
      player.loadVideoById(song.videoId);
      player.playVideo();
      isPlaying = true;
    });

    // Remove button
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Remove";
    removeBtn.style.marginLeft = "10px";
    removeBtn.style.backgroundColor = "#f44336";
    removeBtn.style.color = "white";
    removeBtn.style.border = "none";
    removeBtn.style.borderRadius = "5px";
    removeBtn.style.cursor = "pointer";
    removeBtn.addEventListener("click", () => {
      playlist.removeSongById(song.videoId);
      updatePlaylistUI();
    });

    li.appendChild(songTitle);
    li.appendChild(removeBtn);
    ul.appendChild(li);
  });
}


function updatePlaylistUIAfterRemoval() {
  const ul = document.getElementById("playlist");
  ul.innerHTML = ""; // Clear existing list
  playlist.songs.forEach(song => {
    updatePlaylistUI(song.videoId, song.title); // Rebuild the playlist UI
  });
}