class SoundManager {
  constructor() {
    this.baseUrl = 'app/style/audio/';
    this.fileFormat = 'mp3';

    this.ambience = new AudioContext();
  }

  /**
   * Plays a single sound effect
   * @param {String} sound
   */
  play(sound) {
    const audio = new Audio(`${this.baseUrl}${sound}.${this.fileFormat}`);
    audio.play();
  }

  /**
   * Loops an ambient sound
   * @param {String} sound
   */
  async setAmbience(sound) {
    if (this.source) {
      this.source.stop();
    }

    const response = await fetch(`${this.baseUrl}${sound}.${this.fileFormat}`);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await this.ambience.decodeAudioData(arrayBuffer);

    this.source = this.ambience.createBufferSource();
    this.source.buffer = audioBuffer;
    this.source.connect(this.ambience.destination);
    this.source.loop = true;
    this.source.start();
  }
}

// removeIf(production)
module.exports = SoundManager;
// endRemoveIf(production)
