class SoundManager {
  constructor() {
    this.baseUrl = 'app/style/audio/';
    this.fileFormat = 'mp3';
    this.masterVolume = 1;
    this.paused = false;
    this.cutscene = true;
    this.dotLoopTimeout = null;

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.ambience = new AudioContext();

    // Separate AudioContext for dot loop
    this.dotLoopContext = new AudioContext();

    // Cache for sound effects to avoid recreating them
    this.soundEffectCache = new Map();

    // Initialize the dot loop
    this.initializeDotLoop();
  }

  /**
   * Initializes the dot loop audio context
   */
  async initializeDotLoop() {
    try {
      const response = await fetch(`${this.baseUrl}dot_loop.${this.fileFormat}`);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.dotLoopContext.decodeAudioData(arrayBuffer);

      this.dotLoopBuffer = audioBuffer;
      this.dotLoopGain = this.dotLoopContext.createGain();
      this.dotLoopGain.gain.value = 0;
      this.dotLoopGain.connect(this.dotLoopContext.destination);

      this.startDotLoop();
    } catch (error) {
      console.error('Failed to initialize dot loop:', error);
    }
  }

  /**
   * Starts the dot loop playback
   */
  startDotLoop() {
    if (this.dotLoopBuffer) {
      this.dotLoopSource = this.dotLoopContext.createBufferSource();
      this.dotLoopSource.buffer = this.dotLoopBuffer;
      this.dotLoopSource.connect(this.dotLoopGain);
      this.dotLoopSource.loop = true;
      this.dotLoopSource.start();
    }
  }

  /**
   * Gets or creates a cached audio element for a sound effect
   * @param {String} sound
   * @returns {Audio}
   */
  getOrCreateAudio(sound) {
    if (!this.soundEffectCache.has(sound)) {
      const audio = new Audio(`${this.baseUrl}${sound}.${this.fileFormat}`);
      audio.volume = this.masterVolume;
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
   * Special method for eating dots. Toggles the dot loop volume on for 0.15 seconds.
   * If another dot sound is requested while the volume is on, resets the timer.
   */
  playDotSound() {
    if (this.masterVolume === 0 || !this.dotLoopGain) {
      return;
    }

    // Clear existing timeout if one is running
    if (this.dotLoopTimeout) {
      clearTimeout(this.dotLoopTimeout);
    }

    // Turn volume on
    this.dotLoopGain.gain.value = 1;

    // Set timeout to turn volume off after 0.15 seconds
    this.dotLoopTimeout = setTimeout(() => {
      this.dotLoopGain.gain.value = 0;
      this.dotLoopTimeout = null;
    }, 150);
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
