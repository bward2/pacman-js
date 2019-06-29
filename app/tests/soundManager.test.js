const assert = require('assert');
const sinon = require('sinon');
const SoundManager = require('../scripts/utilities/soundManager');

let comp;

describe('soundManager', () => {
  beforeEach(() => {
    global.Audio = class {
      play() { }
    };
    global.AudioContext = class { };

    comp = new SoundManager();
  });

  describe('play', () => {
    it('plays a given sound effect', () => {
      const spy = sinon.spy(global, 'Audio');

      comp.play('some_sound');
      assert(spy.calledWith('app/style/audio/some_sound.mp3'));
    });
  });

  describe('playDotSound', () => {
    it('alternates between two dot sounds', () => {
      const spy = sinon.spy(global, 'Audio');

      comp.playDotSound();
      assert(spy.calledWith('app/style/audio/dot_1.mp3'));

      comp.dotPlayer = undefined;
      comp.playDotSound();
      assert(spy.calledWith('app/style/audio/dot_2.mp3'));
    });

    it('does nothing if another dot sound is already playing', () => {
      comp.dotPlayer = {};
      const spy = sinon.spy(global, 'Audio');

      comp.playDotSound();
      assert(!spy.called);
    });
  });

  describe('dotSoundEnded', () => {
    it('deletes the current dotPlayer', () => {
      comp.dotPlayer = {};

      comp.dotSoundEnded();
      assert.strictEqual(comp.dotPlayer, undefined);
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
    });

    it('does nothing if fetchingAmbience is TRUE', () => {
      comp.fetchingAmbience = true;

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
