const assert = require('assert');
const sinon = require('sinon');
const Pacdot = require('../scripts/pickups/pacdot');

let pacdot;

beforeEach(() => {
  global.document = {
    createElement: () => ({
      classList: {
        add: () => { },
      },
      style: {},
    }),
  };

  const pacman = {
    position: {
      top: 10,
      left: 10,
    },
    measurement: 16,
  };

  const mazeDiv = {
    appendChild: () => { },
  };

  pacdot = new Pacdot(8, 1, 1, pacman, mazeDiv);
});

describe('pacdot', () => {
  describe('checkForCollision', () => {
    it('returns TRUE if the Pacdot is colliding', () => {
      assert.strictEqual(pacdot.checkForCollision(1, 1, 1, 0, 0, 10), true);
    });

    it('returns FALSE if it is not', () => {
      assert.strictEqual(pacdot.checkForCollision(0, 0, 1, 10, 10, 10), false);
    });

    it('returns FALSE if the Pacdot is only partially colliding', () => {
      assert.strictEqual(pacdot.checkForCollision(0, 0, 5, 1, 1, 10), false);
    });
  });

  describe('update', () => {
    it('turns the Pacdot\'s visibility to HIDDEN after collision', () => {
      pacdot.checkForCollision = sinon.fake.returns(true);

      pacdot.update();
      assert.strictEqual(pacdot.animationTarget.style.visibility, 'hidden');
    });

    it('leaves the Pacdot\'s visibility until collision', () => {
      pacdot.checkForCollision = sinon.fake.returns(false);

      pacdot.update();
      assert.notStrictEqual(pacdot.animationTarget.style.visibility, 'hidden');
    });

    it('only performs collision-detection once', () => {
      const collisionSpy = pacdot.checkForCollision = sinon.fake();

      pacdot.animationTarget.style.visibility = 'hidden';
      pacdot.update();
      assert(collisionSpy.notCalled);
    });
  });
});
