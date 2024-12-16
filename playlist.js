class Playlist {
  constructor(name) {
    this.name = name;
    this.songs = [];
    this.priorityQueue = [];
    this.currentIndex = -1;
  }

  addSong(videoId, title) {
    this.songs.push({ videoId, title });
  }

  addPriority(videoId) {
    const songIndex = this.songs.findIndex((song) => song.videoId === videoId);

  if (songIndex !== -1) {
    const [likedSong] = this.songs.splice(songIndex, 1);
    this.priorityQueue = this.priorityQueue.filter((id) => id !== videoId);
    this.priorityQueue.push(videoId);

    let insertPosition = 0; 
    for (let i = 0; i < this.songs.length; i++) {
      if (this.priorityQueue.includes(this.songs[i].videoId)) {
        insertPosition = i + 1; 
      }
    }
    this.songs.splice(insertPosition, 0, likedSong);
  }
  }

  removePriority(videoId) {
    this.priorityQueue = this.priorityQueue.filter((id) => id !== videoId);
  }

  getNextSong() {
    
    if (this.priorityQueue.length > 0) {
      const nextPrioritySongId = this.priorityQueue.shift();
      const nextSongIndex = this.songs.findIndex((song) => song.videoId === nextPrioritySongId);
      if (nextSongIndex !== -1) {
        this.currentIndex = nextSongIndex;
        return this.songs[nextSongIndex];
      }
    }

    
    if (this.currentIndex < this.songs.length - 1) {
      this.currentIndex++;
      return this.songs[this.currentIndex];
    }

    return null; 
  }

  getPreviousSong() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      return this.songs[this.currentIndex];
    }
    return null;
  }

  getCurrentSong() {
    return this.songs[this.currentIndex] || null;
  }

  removeCurrentSong() {
    if (this.currentIndex >= 0 && this.currentIndex < this.songs.length) {
      this.songs.splice(this.currentIndex, 1);
      this.currentIndex--;
    }
  }

  removeSongById(videoId) {
    const songIndex = this.songs.findIndex((song) => song.videoId === videoId);
    if (songIndex !== -1) {
      this.songs.splice(songIndex, 1);
      this.removePriority(videoId); 
      if (this.currentIndex >= songIndex) {
        this.currentIndex--;
      }
    }
  }
}

class PlaylistManager {
  constructor() {
    this.playlists = {};
    this.activePlaylist = null;
  }

  createPlaylist(name) {
    if (!this.playlists[name]) {
      this.playlists[name] = new Playlist(name);
    }
  }

  getPlaylist(name) {
    return this.playlists[name] || null;
  }

  setActivePlaylist(name) {
    this.activePlaylist = this.getPlaylist(name);
  }
}

const playlistManager = new PlaylistManager();
