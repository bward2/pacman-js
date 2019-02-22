const assert = require('assert');
const sinon = require('sinon');
const Pickup = require('../scripts/pickups/pickup');

let pickup;

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

  pickup = new Pickup(8, 1, 1, pacman, mazeDiv);
});

describe('pickup', () => {
  describe('checkForCollision', () => {
    it('returns TRUE if the Pickup is colliding', () => {
      assert.strictEqual(pickup.checkForCollision(1, 1, 1, 0, 0, 10), true);
    });

    it('returns FALSE if it is not', () => {
      assert.strictEqual(pickup.checkForCollision(0, 0, 1, 10, 10, 10), false);
    });

    it('returns FALSE if the Pickup is only partially colliding', () => {
      assert.strictEqual(pickup.checkForCollision(0, 0, 5, 1, 1, 10), false);
    });
  });

  describe('update', () => {
    it('turns the Pickup\'s visibility to HIDDEN after collision', () => {
      pickup.checkForCollision = sinon.fake.returns(true);

      pickup.update();
      assert.strictEqual(pickup.animationTarget.style.visibility, 'hidden');
    });

    it('leaves the Pickup\'s visibility until collision', () => {
      pickup.checkForCollision = sinon.fake.returns(false);

      pickup.update();
      assert.notStrictEqual(pickup.animationTarget.style.visibility, 'hidden');
    });

    it('only performs collision-detection once', () => {
      const collisionSpy = pickup.checkForCollision = sinon.fake();

      pickup.animationTarget.style.visibility = 'hidden';
      pickup.update();
      assert(collisionSpy.notCalled);
    });
  });
});
