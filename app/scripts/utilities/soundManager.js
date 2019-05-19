class SoundManager {
  constructor() {
    this.baseUrl = 'app/style/audio/';
    this.fileFormat = 'mp3';
  }

  /**
   * Plays a single sound effect
   * @param {String} sound
   */
  play(sound) {
    const audio = new Audio(`${this.baseUrl}${sound}.${this.fileFormat}`);
    audio.play();
  }
}

// removeIf(production)
module.exports = SoundManager;
// endRemoveIf(production)
