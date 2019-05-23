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
});
