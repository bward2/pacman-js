const assert = require('assert');
const sinon = require('sinon');
const Pickup = require('../scripts/pickups/pickup');

let pickup;
let pacman;
let mazeDiv;

beforeEach(() => {
  global.document = {
    createElement: () => ({
      classList: {
        add: () => { },
      },
      style: {},
    }),
  };

  pacman = {
    position: {
      top: 10,
      left: 10,
    },
    measurement: 16,
  };

  mazeDiv = {
    appendChild: () => { },
  };

  pickup = new Pickup('pacdot', 8, 1, 1, pacman, mazeDiv);
});

describe('pickup', () => {
  describe('setStyleMeasurements', () => {
    it('sets measurements for pacdots', () => {
      pickup.setStyleMeasurements('pacdot', 8, 1, 1, pacman, mazeDiv);

      assert.strictEqual(pickup.size, 2);
      assert.strictEqual(pickup.x, 11);
      assert.strictEqual(pickup.y, 11);
      assert.deepEqual(pickup.animationTarget.style, {
        backgroundImage: 'url(app/style/graphics/spriteSheets/pickups/'
          + 'pacdot.svg',
        backgroundSize: '2px',
        height: '2px',
        left: '11px',
        position: 'absolute',
        top: '11px',
        width: '2px',
      });
    });

    it('sets measurements for powerPellets', () => {
      pickup.setStyleMeasurements('powerPellet', 8, 1, 1, pacman, mazeDiv);

      assert.strictEqual(pickup.size, 8);
      assert.strictEqual(pickup.x, 8);
      assert.strictEqual(pickup.y, 8);
      assert.deepEqual(pickup.animationTarget.style, {
        backgroundImage: 'url(app/style/graphics/spriteSheets/pickups/'
         + 'powerPellet.svg',
        backgroundSize: '8px',
        height: '8px',
        left: '8px',
        position: 'absolute',
        top: '8px',
        width: '8px',
      });
    });
  });

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

    it('emits powerUp event if a powerPellet collides with Pacman', () => {
      pickup.type = 'powerPellet';
      pickup.checkForCollision = sinon.fake.returns(true);
      global.window = {
        dispatchEvent: sinon.fake(),
      };

      pickup.update();
      assert(global.window.dispatchEvent.calledWith(new Event('powerUp')));
    });
  });
});
