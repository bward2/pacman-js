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

  playDotSound() {
    this.queuedDotSound = true;

    if (!this.dotPlayer) {
      this.queuedDotSound = false;
      this.dotSound = (this.dotSound === 2) ? 1 : 2;

      this.dotPlayer = new Audio(
        `${this.baseUrl}dot_${this.dotSound}.${this.fileFormat}`,
      );
      this.dotPlayer.onended = () => {
        this.dotPlayer = undefined;

        if (this.queuedDotSound) {
          this.playDotSound();
        }
      };
      this.dotPlayer.play();
    }
  }

  /**
   * Loops an ambient sound
   * @param {String} sound
   */
  async setAmbience(sound) {
    this.currentAmbience = sound;

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

  /**
   * Resumes the ambience
   */
  resumeAmbience() {
    if (this.source) {
      // Resetting the ambience since an AudioBufferSourceNode can only
      // have 'start()' called once
      this.setAmbience(this.currentAmbience);
    }
  }

  /**
   * Stops the ambience
   */
  stopAmbience() {
    if (this.source) {
      this.source.stop();
    }
  }
}

// removeIf(production)
module.exports = SoundManager;
// endRemoveIf(production)
