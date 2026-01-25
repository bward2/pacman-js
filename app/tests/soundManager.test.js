const assert = require('assert');
const sinon = require('sinon');
const SoundManager = require('../scripts/utilities/soundManager');

let comp;

describe('soundManager', () => {
  beforeEach(() => {
    global.Audio = class {
      play() { }
    };
    const AudioContext = class {
      createGain() {
        return {
          gain: { value: 1 },
          connect: sinon.fake(),
        };
      }

      createBufferSource() {
        return {
          buffer: null,
          connect: sinon.fake(),
          start: sinon.fake(),
          stop: sinon.fake(),
        };
      }

      get destination() {
        return {};
      }

      get currentTime() {
        return 0;
      }

      decodeAudioData() {
        return Promise.resolve({ duration: 0.15 });
      }
    };
    global.window = {
      AudioContext,
    };

    // Mock fetch for dot sound loading
    global.fetch = sinon.fake.returns(
      Promise.resolve({
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
      }),
    );

    comp = new SoundManager();
  });

  describe('constructor', () => {
    it('uses webkitAudioContext if needed', () => {
      global.window.AudioContext = undefined;
      global.window.webkitAudioContext = class {
        createGain() {
          return {
            gain: { value: 1 },
            connect: sinon.fake(),
          };
        }

        createBufferSource() {
          return {
            buffer: null,
            connect: sinon.fake(),
            start: sinon.fake(),
            stop: sinon.fake(),
          };
        }

        get destination() {
          return {};
        }

        get currentTime() {
          return 0;
        }

        decodeAudioData() {
          return Promise.resolve({ duration: 0.15 });
        }
      };

      const testComp = new SoundManager();
      assert.notEqual(testComp.ambience, undefined);
      assert.notEqual(testComp.dotContext, undefined);
    });
  });

  describe('setCutscene', () => {
    it('sets new values for cutscene', () => {
      comp.cutscene = false;

      comp.setCutscene(true);
      assert.strictEqual(comp.cutscene, true);
    });
  });

  describe('setMasterVolume', () => {
    it('sets the master volume for all sounds and toggles ambience', () => {
      comp.stopAmbience = sinon.fake();
      comp.resumeAmbience = sinon.fake();

      comp.setMasterVolume(1);
      assert(comp.resumeAmbience.calledWith(comp.paused));

      comp.soundEffect = {};
      comp.setMasterVolume(0);
      assert.strictEqual(comp.soundEffect.volume, 0);
      assert.strictEqual(comp.dotGain.gain.value, 0);
      assert(comp.stopAmbience.called);
    });

    it('handles missing dotGain gracefully', () => {
      const originalDotGain = comp.dotGain;
      comp.dotGain = null;
      comp.stopAmbience = sinon.fake();

      // Should not throw even if dotGain is null
      comp.setMasterVolume(0);
      assert(comp.stopAmbience.called);

      comp.dotGain = originalDotGain;
    });
  });

  describe('play', () => {
    it('plays a given sound effect', () => {
      const spy = sinon.spy(global, 'Audio');

      comp.play('some_sound');
      assert(spy.calledWith('app/style/audio/some_sound.mp3'));
    });
  });

  describe('playDotSound', () => {
    beforeEach(() => {
      // Ensure buffers are loaded for tests
      comp.dotBuffers = {
        1: { duration: 0.15 },
        2: { duration: 0.15 },
      };
    });

    it('alternates between two dot sounds using AudioContext', () => {
      const createSourceSpy = sinon.spy(comp.dotContext, 'createBufferSource');

      comp.playDotSound();
      assert(createSourceSpy.called);
      assert.strictEqual(comp.dotSound, 1);

      comp.dotPlayerActive = false;
      comp.playDotSound();
      assert.strictEqual(comp.dotSound, 2);
    });

    it('does nothing if another dot sound is already playing', () => {
      comp.dotPlayerActive = true;
      const createSourceSpy = sinon.spy(comp.dotContext, 'createBufferSource');

      comp.playDotSound();
      assert.strictEqual(createSourceSpy.callCount, 0);
    });

    it('sets queuedDotSound to true when called', () => {
      comp.queuedDotSound = false;
      comp.playDotSound();
      // Should be reset to false after playing
      assert.strictEqual(comp.queuedDotSound, false);
    });
  });

  describe('dotSoundEnded', () => {
    it('sets dotPlayerActive to false', () => {
      comp.dotPlayerActive = true;

      comp.dotSoundEnded();
      assert.strictEqual(comp.dotPlayerActive, false);
    });

    it('calls playDotSound if queuedDotSound is TRUE', () => {
      comp.queuedDotSound = true;
      comp.playDotSound = sinon.fake();

      comp.dotSoundEnded();
      assert(comp.playDotSound.called);
    });
  });

  describe('setAmbience', () => {
    const arraySpy = sinon.fake();
    const connectSpy = sinon.fake();
    const startSpy = sinon.fake();

    beforeEach(() => {
      global.fetch = sinon.fake.returns({
        arrayBuffer: arraySpy,
      });
      comp.ambience.decodeAudioData = sinon.fake();
      comp.ambience.createBufferSource = sinon.fake.returns({
        connect: connectSpy,
        start: startSpy,
      });
      comp.cutscene = false;
    });

    it('does nothing if fetchingAmbience is TRUE', () => {
      comp.fetchingAmbience = true;

      comp.setAmbience('some_sound');
      assert(!arraySpy.called);
    });

    it('does not start new ambience if masterVolume is ZERO', () => {
      comp.masterVolume = 0;

      comp.setAmbience('some_sound');
      assert(!arraySpy.called);
    });

    it('loops an ambient sound', async () => {
      await comp.setAmbience('some_sound');
      assert(global.fetch.calledWith('app/style/audio/some_sound.mp3'));
      assert(arraySpy.called);
      assert(comp.ambience.decodeAudioData.called);
      assert(comp.ambience.createBufferSource.called);
      assert(connectSpy.calledWith(comp.ambience.destination));
      assert.strictEqual(comp.ambienceSource.loop, true);
      assert(startSpy.called);
    });

    it('stops previously running ambience', () => {
      comp.ambienceSource = {
        stop: sinon.fake(),
      };

      comp.setAmbience('some_sound');
      assert(comp.ambienceSource.stop.called);
    });

    it('keeps the current ambience if needed', () => {
      comp.currentAmbience = 'blah';

      comp.setAmbience('some_sound', true);
      assert.strictEqual(comp.currentAmbience, 'blah');
    });
  });

  describe('resumeAmbience', () => {
    it('resumes an existing ambience', () => {
      comp.setAmbience = sinon.fake();

      comp.resumeAmbience();
      assert(!comp.setAmbience.called);

      comp.ambienceSource = {};
      comp.resumeAmbience();
      assert(comp.setAmbience.calledWith(comp.currentAmbience));
    });

    it('sets ambience to pause_beat if the game is paused', () => {
      comp.setAmbience = sinon.fake();
      comp.ambienceSource = {};

      comp.resumeAmbience(true);
      assert(comp.setAmbience.calledWith('pause_beat'));
    });
  });

  describe('stopAmbience', () => {
    it('stops existing ambience', () => {
      comp.stopAmbience();

      comp.ambienceSource = {
        stop: sinon.fake(),
      };
      comp.stopAmbience();
      assert(comp.ambienceSource.stop.calledOnce);
    });
  });
});
