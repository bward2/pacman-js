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

    it('loops an ambient sound', async () => {
      await comp.setAmbience('some_sound');
      assert(global.fetch.calledWith('app/style/audio/some_sound.mp3'));
      assert(arraySpy.called);
      assert(comp.ambience.decodeAudioData.called);
      assert(comp.ambience.createBufferSource.called);
      assert(connectSpy.calledWith(comp.ambience.destination));
      assert.strictEqual(comp.source.loop, true);
      assert(startSpy.called);
    });

    it('stops previously running ambience', () => {
      comp.source = {
        stop: sinon.fake(),
      };

      comp.setAmbience('some_sound');
      assert(comp.source.stop.called);
    });
  });
});
