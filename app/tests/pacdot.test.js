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
    it('should return TRUE if the Pacdot is contained within Pacman\'s dimensions', () => {
      assert.strictEqual(pacdot.checkForCollision(1, 1, 1, 0, 0, 10), true);
    });

    it('should return FALSE if the Pacdot is not touching the Pacman object', () => {
      assert.strictEqual(pacdot.checkForCollision(0, 0, 1, 10, 10, 10), false);
    });

    it('should return FALSE if the Pacdot is only partially overlapping Pacman', () => {
      assert.strictEqual(pacdot.checkForCollision(0, 0, 5, 1, 1, 10), false);
    });
  });

  describe('update', () => {
    it('should turn the Pacdot\'s visibility to HIDDEN if a collision with Pacman occurs', () => {
      const collisionSpy = pacdot.checkForCollision = sinon.fake.returns(true);

      pacdot.update();
      assert.strictEqual(pacdot.animationTarget.style.visibility, 'hidden');
    });

    it('should leave the Pacdot\'s visibility alone if a collision has not yet occured', () => {
      const collisionSpy = pacdot.checkForCollision = sinon.fake.returns(false);

      pacdot.update();
      assert.notStrictEqual(pacdot.animationTarget.style.visibility, 'hidden');
    });

    it('should not perform collision-detection if the Pacdot is already hidden', () => {
      const collisionSpy = pacdot.checkForCollision = sinon.fake();

      pacdot.animationTarget.style.visibility = 'hidden';
      pacdot.update();
      assert(collisionSpy.notCalled);
    });
  });
});
