class SoundManager {
  constructor() {
    this.baseUrl = 'app/style/audio/';
    this.fileFormat = 'mp3';
    this.masterVolume = 1;
    this.paused = false;
    this.cutscene = true;

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.ambience = new AudioContext();

    // Cache for sound effects to avoid recreating them
    this.soundEffectCache = new Map();
    this.currentDotSound = 1;
  }

  /**
   * Gets or creates a cached audio element for a sound effect
   * @param {String} sound
   * @returns {Audio}
   */
  getOrCreateAudio(sound, isDotSound = false) {
    if (!this.soundEffectCache.has(sound)) {
      const audio = new Audio(`${this.baseUrl}${sound}.${this.fileFormat}`);
      audio.volume = this.masterVolume;
      if (isDotSound) {
        audio.onended = this.dotSoundEnded.bind(this);
      }
      this.soundEffectCache.set(sound, audio);
    }
    return this.soundEffectCache.get(sound);
  }

  /**
   * Sets the cutscene flag to determine if players should be able to resume ambience
   * @param {Boolean} newValue
   */
  setCutscene(newValue) {
    this.cutscene = newValue;
  }

  /**
   * Sets the master volume for all sounds and stops/resumes ambience
   * @param {(0|1)} newVolume
   */
  setMasterVolume(newVolume) {
    this.masterVolume = newVolume;

    // Update all cached sound effects
    const audioArray = Array.from(this.soundEffectCache.values());
    for (let index = 0; index < audioArray.length; index += 1) {
      audioArray[index].volume = this.masterVolume;
    }

    if (this.masterVolume === 0) {
      this.stopAmbience();
    } else {
      this.resumeAmbience(this.paused);
    }
  }

  /**
   * Plays a single sound effect
   * @param {String} sound
   */
  play(sound) {
    const audio = this.getOrCreateAudio(sound);
    audio.currentTime = 0;
    audio.play();
  }

  /**
   * Special method for eating dots. The dots should alternate between two
   * sound effects, but not too quickly.
   */
  playDotSound() {
    this.queuedDotSound = true;

    if (!this.dotPlayer) {
      this.queuedDotSound = false;
      this.currentDotSound = (this.currentDotSound === 1) ? 2 : 1;

      this.dotPlayer = this.getOrCreateAudio(`dot_${this.currentDotSound}`, true);
      this.dotPlayer.currentTime = 0;
      this.dotPlayer.play();
    }
  }

  /**
   * Deletes the dotSound player and plays another dot sound if needed
   */
  dotSoundEnded() {
    this.dotPlayer = undefined;

    if (this.queuedDotSound) {
      this.playDotSound();
    }
  }

  /**
   * Loops an ambient sound
   * @param {String} sound
   */
  async setAmbience(sound, keepCurrentAmbience) {
    if (!this.fetchingAmbience && !this.cutscene) {
      if (!keepCurrentAmbience) {
        this.currentAmbience = sound;
        this.paused = false;
      } else {
        this.paused = true;
      }

      if (this.ambienceSource) {
        this.ambienceSource.stop();
      }

      if (this.masterVolume !== 0) {
        this.fetchingAmbience = true;
        const response = await fetch(
          `${this.baseUrl}${sound}.${this.fileFormat}`,
        );
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.ambience.decodeAudioData(arrayBuffer);

        this.ambienceSource = this.ambience.createBufferSource();
        this.ambienceSource.buffer = audioBuffer;
        this.ambienceSource.connect(this.ambience.destination);
        this.ambienceSource.loop = true;
        this.ambienceSource.start();

        this.fetchingAmbience = false;
      }
    }
  }

  /**
   * Resumes the ambience
   */
  resumeAmbience(paused) {
    if (this.ambienceSource) {
      // Resetting the ambience since an AudioBufferSourceNode can only
      // have 'start()' called once
      if (paused) {
        this.setAmbience('pause_beat', true);
      } else {
        this.setAmbience(this.currentAmbience);
      }
    }
  }

  /**
   * Stops the ambience
   */
  stopAmbience() {
    if (this.ambienceSource) {
      this.ambienceSource.stop();
    }
  }
}

// removeIf(production)
module.exports = SoundManager;
// endRemoveIf(production)
