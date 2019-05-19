// const assert = require('assert');
// const sinon = require('sinon');
const SoundManager = require('../scripts/utilities/soundManager');

let comp;

describe('soundManager', () => {
  beforeEach(() => {
    global.Audio = class {
      play() { }
    };

    comp = new SoundManager();
  });

  describe('play', () => {
    it('plays a given sound effect', () => {
      comp.play();
    });
  });
});
