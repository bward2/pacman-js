class SoundManager {
  constructor() {
    this.baseUrl = 'app/style/audio/';
    this.fileFormat = 'mp3';
    this.masterVolume = 1;
    this.paused = false;
    this.cutscene = true;

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.ambience = new AudioContext();

    // Dedicated AudioContext for dot sounds (mobile optimization)
    this.dotContext = new AudioContext();
    this.dotGain = this.dotContext.createGain();
    this.dotGain.gain.value = 1;
    this.dotGain.connect(this.dotContext.destination);

    // Pre-load dot sound buffers
    this.dotBuffers = {};
    this.initializeDotSounds();

    // Dot sound state
    this.dotSound = 0; // Will alternate between 1 and 2
    this.queuedDotSound = false;
    this.dotPlayerActive = false;
  }

  /**
   * Pre-loads both dot sound buffers for instant playback
   */
  async initializeDotSounds() {
    const [response1, response2] = await Promise.all([
      fetch(`${this.baseUrl}dot_1.${this.fileFormat}`),
      fetch(`${this.baseUrl}dot_2.${this.fileFormat}`),
    ]);

    const [arrayBuffer1, arrayBuffer2] = await Promise.all([
      response1.arrayBuffer(),
      response2.arrayBuffer(),
    ]);

    const [audioBuffer1, audioBuffer2] = await Promise.all([
      this.dotContext.decodeAudioData(arrayBuffer1),
      this.dotContext.decodeAudioData(arrayBuffer2),
    ]);

    this.dotBuffers[1] = audioBuffer1;
    this.dotBuffers[2] = audioBuffer2;
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

    if (this.soundEffect) {
      this.soundEffect.volume = this.masterVolume;
    }

    // Update dot sound gain
    if (this.dotGain) {
      this.dotGain.gain.value = this.masterVolume;
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
    this.soundEffect = new Audio(`${this.baseUrl}${sound}.${this.fileFormat}`);
    this.soundEffect.volume = this.masterVolume;
    this.soundEffect.play();
  }

  /**
   * Special method for eating dots. The dots should alternate between two
   * sound effects, but not too quickly. Uses pre-loaded AudioBuffers for
   * instant playback on mobile.
   */
  playDotSound() {
    this.queuedDotSound = true;

    if (!this.dotPlayerActive && this.dotBuffers[1] && this.dotBuffers[2]) {
      this.queuedDotSound = false;
      this.dotPlayerActive = true;

      // Alternate between dot sounds
      this.dotSound = (this.dotSound === 1) ? 2 : 1;

      // Create a new BufferSourceNode (cheap operation)
      const source = this.dotContext.createBufferSource();
      source.buffer = this.dotBuffers[this.dotSound];
      source.connect(this.dotGain);

      // Play immediately
      source.start(0);

      // Use setTimeout with buffer duration + 100ms gap to preserve "wa ka" timing
      const { duration } = this.dotBuffers[this.dotSound];
      setTimeout(() => {
        this.dotSoundEnded();
      }, (duration * 1000) + 100);
    }
  }

  /**
   * Called when a dot sound finishes playing. Plays another dot sound if queued.
   */
  dotSoundEnded() {
    this.dotPlayerActive = false;

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
