class Playlist {
  constructor(name) {
    this.name = name;
    this.songs = [];
    this.currentIndex = -1;
  }

  addSong(videoId, title) {
    this.songs.push({ videoId, title });
  }

  getNextSong() {
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
