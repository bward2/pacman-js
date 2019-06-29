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
  describe('reset', () => {
    it('sets visibility according to type', () => {
      pickup.animationTarget.style.visibility = 'blah';

      pickup.type = 'pacdot';
      pickup.reset();
      assert.strictEqual(pickup.animationTarget.style.visibility, 'visible');

      pickup.type = 'fruit';
      pickup.reset();
      assert.strictEqual(pickup.animationTarget.style.visibility, 'hidden');
    });
  });

  describe('setStyleMeasurements', () => {
    it('sets measurements for pacdots', () => {
      pickup.setStyleMeasurements('pacdot', 8, 1, 1);

      assert.strictEqual(pickup.size, 2);
      assert.strictEqual(pickup.x, 11);
      assert.strictEqual(pickup.y, 11);
      assert.deepEqual(pickup.animationTarget.style, {
        backgroundImage: 'url(app/style/graphics/spriteSheets/pickups/'
          + 'pacdot.svg)',
        backgroundSize: '2px',
        height: '2px',
        left: '11px',
        position: 'absolute',
        top: '11px',
        visibility: 'visible',
        width: '2px',
      });
    });

    it('sets measurements for powerPellets', () => {
      pickup.setStyleMeasurements('powerPellet', 8, 1, 1);

      assert.strictEqual(pickup.size, 8);
      assert.strictEqual(pickup.x, 8);
      assert.strictEqual(pickup.y, 8);
      assert.deepEqual(pickup.animationTarget.style, {
        backgroundImage: 'url(app/style/graphics/spriteSheets/pickups/'
         + 'powerPellet.svg)',
        backgroundSize: '8px',
        height: '8px',
        left: '8px',
        position: 'absolute',
        top: '8px',
        visibility: 'visible',
        width: '8px',
      });
    });

    it('sets measurements for fruits', () => {
      pickup.type = 'fruit';
      pickup.setStyleMeasurements('fruit', 8, 1, 1, 100);

      assert.strictEqual(pickup.size, 16);
      assert.strictEqual(pickup.x, 4);
      assert.strictEqual(pickup.y, 4);
      assert.deepEqual(pickup.animationTarget.style, {
        backgroundImage: 'url(app/style/graphics/spriteSheets/pickups/'
         + 'cherry.svg)',
        backgroundSize: '16px',
        height: '16px',
        left: '4px',
        position: 'absolute',
        top: '4px',
        width: '16px',
        visibility: 'hidden',
      });
    });
  });

  describe('determineImage', () => {
    let baseUrl;

    beforeEach(() => {
      baseUrl = 'url(app/style/graphics/spriteSheets/pickups/';
    });

    it('returns correct images for fruits', () => {
      assert.strictEqual(
        pickup.determineImage('fruit', 100),
        `${baseUrl}cherry.svg)`,
      );

      assert.strictEqual(
        pickup.determineImage('fruit', 300),
        `${baseUrl}strawberry.svg)`,
      );

      assert.strictEqual(
        pickup.determineImage('fruit', 500),
        `${baseUrl}orange.svg)`,
      );

      assert.strictEqual(
        pickup.determineImage('fruit', 700),
        `${baseUrl}apple.svg)`,
      );

      assert.strictEqual(
        pickup.determineImage('fruit', 1000),
        `${baseUrl}melon.svg)`,
      );

      assert.strictEqual(
        pickup.determineImage('fruit', 2000),
        `${baseUrl}galaxian.svg)`,
      );

      assert.strictEqual(
        pickup.determineImage('fruit', 3000),
        `${baseUrl}bell.svg)`,
      );

      assert.strictEqual(
        pickup.determineImage('fruit', 5000),
        `${baseUrl}key.svg)`,
      );
    });

    it('returns cherry by default for unrecognized fruit', () => {
      const unknown = pickup.determineImage('fruit', undefined);
      assert.strictEqual(unknown, `${baseUrl}cherry.svg)`);
    });

    it('returns correct images for other pickups', () => {
      const pacdot = pickup.determineImage('pacdot', undefined);
      assert.strictEqual(pacdot, `${baseUrl}pacdot.svg)`);

      const powerPellet = pickup.determineImage('powerPellet', undefined);
      assert.strictEqual(powerPellet, `${baseUrl}powerPellet.svg)`);
    });
  });

  describe('showFruit', () => {
    it('sets the point value, image, and visibility', () => {
      pickup.points = 0;
      pickup.animationTarget.style.backgroundImage = '';
      pickup.animationTarget.style.visibility = '';
      pickup.determineImage = sinon.fake.returns('svg');

      pickup.showFruit(100);
      assert.strictEqual(pickup.points, 100);
      assert.strictEqual(pickup.animationTarget.style.backgroundImage, 'svg');
      assert.strictEqual(pickup.animationTarget.style.visibility, 'visible');
    });
  });

  describe('hideFruit', () => {
    it('sets the visibility to HIDDEN', () => {
      pickup.animationTarget.style.visibility = 'visible';

      pickup.hideFruit();
      assert.strictEqual(pickup.animationTarget.style.visibility, 'hidden');
    });
  });

  describe('checkForCollision', () => {
    it('returns TRUE if the Pickup is colliding', () => {
      assert(pickup.checkForCollision(
        { x: 7.4, y: 7.4, size: 5 },
        { x: 0, y: 0, size: 10 },
      ));
    });

    it('returns FALSE if it is not', () => {
      assert(!pickup.checkForCollision(
        { x: 7.5, y: 7.5, size: 5 },
        { x: 0, y: 0, size: 10 },
      ));
    });
  });

  describe('checkPacmanProximity', () => {
    beforeEach(() => {
      pickup.center = { x: 0, y: 0 };
    });

    it('returns TRUE if the pickup is close to Pacman', () => {
      pickup.checkPacmanProximity(5, { x: 3, y: 4 });
      assert(pickup.nearPacman);
    });

    it('returns FALSE otherwise', () => {
      pickup.checkPacmanProximity(4.9, { x: 3, y: 4 });
      assert(!pickup.nearPacman);
    });

    it('sets background color when debugging', () => {
      pickup.checkPacmanProximity(5, { x: 3, y: 4 }, true);
      assert.strictEqual(pickup.animationTarget.style.background, 'lime');

      pickup.checkPacmanProximity(4.9, { x: 3, y: 4 }, true);
      assert.strictEqual(pickup.animationTarget.style.background, 'red');
    });

    it('skips execution if the pickup is hidden', () => {
      pickup.animationTarget.style.visibility = 'hidden';
      pickup.nearPacman = false;

      pickup.checkPacmanProximity(5, { x: 3, y: 4 });
      assert(!pickup.nearPacman);
    });
  });

  describe('shouldCheckForCollision', () => {
    it('only returns TRUE when the Pickup is near Pacman and visible', () => {
      pickup.animationTarget.style.visibility = 'visible';
      pickup.nearPacman = true;
      assert(pickup.shouldCheckForCollision());

      pickup.nearPacman = false;
      assert(!pickup.shouldCheckForCollision());

      pickup.animationTarget.style.visibility = 'hidden';
      assert(!pickup.shouldCheckForCollision());

      pickup.nearPacman = true;
      assert(!pickup.shouldCheckForCollision());
    });
  });

  describe('update', () => {
    beforeEach(() => {
      global.window = {
        dispatchEvent: sinon.fake(),
      };
    });

    it('turns the Pickup\'s visibility to HIDDEN after collision', () => {
      pickup.shouldCheckForCollision = sinon.fake.returns(true);
      pickup.checkForCollision = sinon.fake.returns(true);

      pickup.update();
      assert.strictEqual(pickup.animationTarget.style.visibility, 'hidden');
    });

    it('leaves the Pickup\'s visibility until collision', () => {
      pickup.shouldCheckForCollision = sinon.fake.returns(true);
      pickup.checkForCollision = sinon.fake.returns(false);

      pickup.update();
      assert.notStrictEqual(pickup.animationTarget.style.visibility, 'hidden');
    });

    it('emits the awardPoints event after a collision', () => {
      pickup.points = 100;
      pickup.shouldCheckForCollision = sinon.fake.returns(true);
      pickup.checkForCollision = sinon.fake.returns(true);

      pickup.update();
      assert(global.window.dispatchEvent.calledWith(
        new CustomEvent('awardPoints', {
          detail: {
            points: pickup.points,
          },
        }),
      ));
    });

    it('emits dotEaten event if a pacdot collides with Pacman', () => {
      pickup.type = 'pacdot';
      pickup.shouldCheckForCollision = sinon.fake.returns(true);
      pickup.checkForCollision = sinon.fake.returns(true);

      pickup.update();
      assert(global.window.dispatchEvent.calledWith(new Event('dotEaten')));
    });

    it('emits powerUp event if a powerPellet collides with Pacman', () => {
      pickup.type = 'powerPellet';
      pickup.shouldCheckForCollision = sinon.fake.returns(true);
      pickup.checkForCollision = sinon.fake.returns(true);

      pickup.update();
      assert(global.window.dispatchEvent.calledWith(new Event('dotEaten')));
      assert(global.window.dispatchEvent.calledWith(new Event('powerUp')));
    });

    it('emits no events if an unrecognized item collides with Pacman', () => {
      pickup.type = 'blah';
      pickup.shouldCheckForCollision = sinon.fake.returns(true);
      pickup.checkForCollision = sinon.fake.returns(true);

      pickup.update();
    });

    it('does nothing if shouldCheckForCollision returns FALSE', () => {
      pickup.shouldCheckForCollision = sinon.fake.returns(false);
      pickup.checkForCollision = sinon.fake();

      pickup.update();
      assert(!pickup.checkForCollision.called);
    });
  });
});
