const assert = require('assert');
const sinon = require('sinon');
const Ghost = require('../scripts/characters/ghost');
const CharacterUtil = require('../scripts/utilities/characterUtil');

const scaledTileSize = 8;
const mazeArray = [
  ['X', 'X', 'X'],
  ['X', ' ', ' '],
  ['X', ' ', 'X'],
];

let pacman;
let ghost;

beforeEach(() => {
  global.document = {
    getElementById: () => ({
      style: {},
    }),
  };

  pacman = {
    velocityPerMs: 1,
    moving: true,
    position: {
      top: 100,
      left: 100,
    },
  };

  ghost = new Ghost(scaledTileSize, undefined, pacman, undefined,
    new CharacterUtil());
});

describe('ghost', () => {
  describe('setMovementStats', () => {
    it('sets the ghost\'s various movement stats', () => {
      ghost.setMovementStats(pacman);
      assert.strictEqual(ghost.slowSpeed, 0.75);
      assert.strictEqual(ghost.mediumSpeed, 0.90);
      assert.strictEqual(ghost.fastSpeed, 1.05);
      assert.strictEqual(ghost.chasedSpeed, 0.5);
      assert.strictEqual(ghost.tunnelSpeed, 0.5);
      assert.strictEqual(ghost.eyeSpeed, 3);
      assert.strictEqual(ghost.velocityPerMs, 0.75);
      assert.strictEqual(ghost.direction, 'left');
      assert.strictEqual(ghost.moving, false);
    });
  });

  describe('setSpriteAnimationStats', () => {
    it('sets various stats for the ghost\'s sprite animation', () => {
      ghost.setSpriteAnimationStats();

      assert.strictEqual(ghost.msBetweenSprites, 250);
      assert.strictEqual(ghost.msSinceLastSprite, 0);
      assert.strictEqual(ghost.spriteFrames, 2);
      assert.strictEqual(ghost.backgroundOffsetPixels, 0);
    });
  });

  describe('setStyleMeasurements', () => {
    it('sets the ghost\'s measurement properties', () => {
      ghost.animationTarget.style = {};
      ghost.setStyleMeasurements(scaledTileSize, 2);
      assert.strictEqual(ghost.measurement, 16);
      assert.deepEqual(ghost.animationTarget.style, {
        height: '16px',
        width: '16px',
        backgroundSize: '32px',
      });
    });
  });

  describe('setDefaultPosition', () => {
    it('sets the correct position for blinky', () => {
      ghost.setDefaultPosition(scaledTileSize, 'blinky');
      assert.deepEqual(ghost.position, { top: 84, left: 104 });
      assert.deepEqual(ghost.oldPosition, { top: 84, left: 104 });
      assert.strictEqual(ghost.animationTarget.style.top, '84px');
      assert.strictEqual(ghost.animationTarget.style.left, '104px');
    });

    it('sets the correct default position if the name is missing', () => {
      ghost.setDefaultPosition(scaledTileSize, undefined);
      assert.deepEqual(ghost.position, { top: 0, left: 0 });
      assert.deepEqual(ghost.oldPosition, { top: 0, left: 0 });
      assert.strictEqual(ghost.animationTarget.style.top, '0px');
      assert.strictEqual(ghost.animationTarget.style.left, '0px');
    });
  });

  describe('setSpriteSheet', () => {
    it('sets the correct spritesheet for any given direction', () => {
      const bUrl = 'url(app/style/graphics/spriteSheets/characters/ghosts/';

      ghost.setSpriteSheet('blinky', 'up');
      assert.strictEqual(
        ghost.animationTarget.style.backgroundImage,
        `${bUrl}blinky/blinky_up.svg)`,
      );
      ghost.setSpriteSheet('blinky', 'down');
      assert.strictEqual(
        ghost.animationTarget.style.backgroundImage,
        `${bUrl}blinky/blinky_down.svg)`,
      );
      ghost.setSpriteSheet('blinky', 'left');
      assert.strictEqual(
        ghost.animationTarget.style.backgroundImage,
        `${bUrl}blinky/blinky_left.svg)`,
      );
      ghost.setSpriteSheet('blinky', 'right');
      assert.strictEqual(
        ghost.animationTarget.style.backgroundImage,
        `${bUrl}blinky/blinky_right.svg)`,
      );
    });
  });

  describe('isInTunnel', () => {
    it('returns TRUE if the ghost is in either warp tunnel', () => {
      assert(ghost.isInTunnel({ x: 0, y: 14 }));
      assert(ghost.isInTunnel({ x: 30, y: 14 }));
    });

    it('returns FALSE if the ghost is away from the warp tunnels', () => {
      assert(!ghost.isInTunnel({ x: 15, y: 14 }));
      assert(!ghost.isInTunnel({ x: 0, y: 0 }));
    });
  });

  describe('getTile', () => {
    it('returns a tile if the given coordinates are free', () => {
      const tile = ghost.getTile(mazeArray, 1, 1);
      assert.deepEqual(tile, { x: 1, y: 1 });
    });

    it('returns FALSE if the given coordinates are a wall', () => {
      const tile = ghost.getTile(mazeArray, 0, 0);
      assert.strictEqual(tile, false);
    });

    it('returns FALSE if the given coordinates are outside the maze', () => {
      const tile = ghost.getTile(mazeArray, -1, -1);
      assert.strictEqual(tile, false);
    });
  });

  describe('determinePossibleMoves', () => {
    it('returns a list of moves given valid coordinates', () => {
      const possibleMoves = ghost.determinePossibleMoves(
        { x: 1, y: 1 }, 'right', mazeArray,
      );
      assert.deepEqual(possibleMoves, {
        down: { x: 1, y: 2 },
        right: { x: 2, y: 1 },
      });
    });

    it('does not allow the ghost to turn around at a crossroads', () => {
      const possibleMoves = ghost.determinePossibleMoves(
        { x: 1, y: 1 }, 'up', mazeArray,
      );
      assert.deepEqual(possibleMoves, {
        right: { x: 2, y: 1 },
      });
    });

    it('returns an empty object if no moves are available', () => {
      const possibleMoves = ghost.determinePossibleMoves(
        { x: -1, y: -1 }, 'up', mazeArray,
      );
      assert.deepEqual(possibleMoves, {});
    });
  });

  describe('calculateDistance', () => {
    it('uses the Pythagorean Theorem to measure distance', () => {
      const distance = ghost.calculateDistance(
        { x: 0, y: 0 }, { x: 3, y: 4 },
      );
      assert.strictEqual(distance, 5);
    });

    it('returns zero if the two given positions are identical', () => {
      const distance = ghost.calculateDistance(
        { x: 0, y: 0 }, { x: 0, y: 0 },
      );
      assert.strictEqual(distance, 0);
    });
  });

  describe('blinkyBestMove', () => {
    it('returns the move which moves Blinky closest to Pacman', () => {
      const possibleMoves = {
        up: { x: 1, y: 0 },
        down: { x: 1, y: 2 },
        left: { x: 0, y: 1 },
        right: { x: 2, y: 1 },
      };

      const bestMove = ghost.blinkyBestMove(
        possibleMoves, { x: 3, y: 1 },
      );
      assert.strictEqual(bestMove, 'right');
    });

    it('returns UNDEFINED if there are no possible moves', () => {
      const bestMove = ghost.blinkyBestMove(
        {}, { x: 3, y: 1 },
      );
      assert.strictEqual(bestMove, undefined);
    });
  });

  describe('determineBestMove', () => {
    it('calls the correct functions given a ghost name', () => {
      const blinkySpy = ghost.blinkyBestMove = sinon.fake();

      ghost.determineBestMove('blinky');
      assert(blinkySpy.called);
    });

    it('returns the ghost\'s current direciton by default', () => {
      ghost.direction = 'up';
      const bestMove = ghost.determineBestMove();
      assert.strictEqual(bestMove, 'up');
    });
  });

  describe('determineDirection', () => {
    it('returns the new direction if there is only one possible move', () => {
      ghost.determinePossibleMoves = sinon.fake.returns({ up: '' });

      const direction = ghost.determineDirection();
      assert.strictEqual(direction, 'up');
    });

    it('calls determineBestMove if there are multiple possible moves', () => {
      ghost.determinePossibleMoves = sinon.fake.returns({ up: '', down: '' });
      const bestSpy = ghost.determineBestMove = sinon.fake.returns('down');

      const direciton = ghost.determineDirection();
      assert(bestSpy.called);
      assert.strictEqual(direciton, 'down');
    });

    it('returns the ghost\'s default direction if there are no moves', () => {
      ghost.determinePossibleMoves = sinon.fake.returns({});

      const direciton = ghost.determineDirection(
        undefined, undefined, undefined, 'right',
      );
      assert.strictEqual(direciton, 'right');
    });
  });

  describe('handleSnappedMovement', () => {
    it('calls determineDirection to decide where to turn', () => {
      ghost.characterUtil.determineGridPosition = sinon.fake();
      const direcitonSpy = ghost.determineDirection = sinon.fake();
      const spriteSpy = ghost.setSpriteSheet = sinon.fake();
      ghost.characterUtil.getPropertyToChange = sinon.fake.returns('top');
      ghost.characterUtil.getVelocity = sinon.fake.returns(10);

      const newPosition = ghost.handleSnappedMovement(50);
      assert(direcitonSpy.called);
      assert(spriteSpy.called);
      assert.deepEqual(newPosition, { top: 500, left: 0 });
    });
  });

  describe('handleUnsnappedMovement', () => {
    it('returns the desired new position', () => {
      const desired = {
        newPosition: { top: 25, left: 50 },
      };
      ghost.characterUtil.determineNewPositions = sinon.fake.returns(desired);
      ghost.characterUtil.changingGridPosition = sinon.fake.returns(false);

      const newPosition = ghost.handleUnsnappedMovement();
      assert.deepEqual(newPosition, desired.newPosition);
    });

    it('returns a snapped position if changing tiles', () => {
      const snappedPosition = { top: 125, left: 150 };
      ghost.characterUtil.determineNewPositions = sinon.fake.returns({
        newGridPosition: '',
      });
      ghost.characterUtil.changingGridPosition = sinon.fake.returns(true);
      ghost.characterUtil.snapToGrid = sinon.fake.returns(snappedPosition);

      const newPosition = ghost.handleUnsnappedMovement();
      assert.deepEqual(newPosition, snappedPosition);
    });
  });

  describe('checkCollision', () => {
    it('emits the deathSequence event when <1 tile away from Pacman', () => {
      const dispatchSpy = sinon.fake();
      global.window = {
        dispatchEvent: dispatchSpy,
      };
      global.Event = sinon.fake();

      ghost.checkCollision({ x: 0, y: 0 }, { x: 1, y: 0 });
      assert(!dispatchSpy.called);

      ghost.checkCollision({ x: 0, y: 0 }, { x: 0.9, y: 0 });
      assert(dispatchSpy.called);
    });
  });

  describe('draw', () => {
    it('updates various css properties and animates the spritesheet', () => {
      const drawValueSpy = sinon.fake.returns(100);
      const stutterSpy = sinon.fake.returns('visible');
      const spriteSpy = sinon.fake.returns({
        msSinceLastSprite: '',
        animationTarget: '',
        backgroundOffsetPixels: '',
      });
      ghost.characterUtil.calculateNewDrawValue = drawValueSpy;
      ghost.characterUtil.checkForStutter = stutterSpy;
      ghost.characterUtil.advanceSpriteSheet = spriteSpy;

      ghost.draw(1);
      assert(drawValueSpy.calledTwice);
      assert(stutterSpy.called);
      assert(spriteSpy.called);
    });
  });

  describe('update', () => {
    it('calls handleSnappedMovement if the ghost is snapped', () => {
      const snappedSpy = ghost.handleSnappedMovement = sinon.fake();
      ghost.characterUtil.determineGridPosition = sinon.fake();
      ghost.isInTunnel = sinon.fake();
      ghost.characterUtil.handleWarp = sinon.fake();
      ghost.characterUtil.snapToGrid = sinon.fake.returns(ghost.position);
      ghost.checkCollision = sinon.fake();
      pacman.moving = true;

      ghost.update();
      assert(snappedSpy.called);
    });

    it('calls handleUnsnappedMovement if the ghost is not snapped', () => {
      const unsnappedSpy = ghost.handleUnsnappedMovement = sinon.fake();
      ghost.characterUtil.determineGridPosition = sinon.fake();
      ghost.isInTunnel = sinon.fake();
      ghost.characterUtil.handleWarp = sinon.fake();
      ghost.characterUtil.snapToGrid = sinon.fake();
      ghost.checkCollision = sinon.fake();
      pacman.moving = true;

      ghost.update();
      assert(unsnappedSpy.called);
    });

    it('does not call movement handlers unless the ghost is moving', () => {
      const snappedSpy = ghost.handleSnappedMovement = sinon.fake();
      const unsnappedSpy = ghost.handleUnsnappedMovement = sinon.fake();
      ghost.moving = false;
      pacman.moving = false;

      ghost.update();
      assert(!snappedSpy.called);
      assert(!unsnappedSpy.called);
    });

    it('waits for Pacman to start moving', () => {
      pacman.moving = false;
      ghost.update();
      assert(!ghost.moving);
    });

    it('sets the ghost\'s velocity to tunnelSpeed if needed', () => {
      ghost.characterUtil.determineGridPosition = sinon.fake();
      ghost.isInTunnel = sinon.fake.returns(true);
      ghost.handleUnsnappedMovement = sinon.fake();
      ghost.characterUtil.handleWarp = sinon.fake();
      ghost.checkCollision = sinon.fake();

      ghost.update();
    });
  });
});
