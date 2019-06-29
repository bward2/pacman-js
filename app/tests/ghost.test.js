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
let comp;

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

  comp = new Ghost(scaledTileSize, undefined, pacman, undefined, 1,
    new CharacterUtil());
});

describe('ghost', () => {
  describe('setMovementStats', () => {
    it('sets the ghost\'s various movement stats', () => {
      comp.setMovementStats(pacman, undefined, 1);
      assert.strictEqual(comp.slowSpeed, 0.76);
      assert.strictEqual(comp.mediumSpeed, 0.885);
      assert.strictEqual(comp.fastSpeed, 1.01);
      assert.strictEqual(comp.scaredSpeed, 0.5);
      assert.strictEqual(comp.transitionSpeed, 0.4);
      assert.strictEqual(comp.eyeSpeed, 2);
      assert.strictEqual(comp.velocityPerMs, 0.76);
      assert.strictEqual(comp.defaultDirection, 'left');
      assert.strictEqual(comp.direction, 'left');
      assert.strictEqual(comp.moving, false);
    });

    it('sets the correct direction for each ghost', () => {
      comp.setMovementStats(pacman, 'blinky');
      assert.strictEqual(comp.direction, 'left');

      comp.setMovementStats(pacman, 'pinky');
      assert.strictEqual(comp.direction, 'down');

      comp.setMovementStats(pacman, 'inky');
      assert.strictEqual(comp.direction, 'up');

      comp.setMovementStats(pacman, 'clyde');
      assert.strictEqual(comp.direction, 'up');
    });
  });

  describe('setSpriteAnimationStats', () => {
    it('sets various stats for the ghost\'s sprite animation', () => {
      comp.setSpriteAnimationStats();

      assert.strictEqual(comp.msBetweenSprites, 250);
      assert.strictEqual(comp.msSinceLastSprite, 0);
      assert.strictEqual(comp.spriteFrames, 2);
      assert.strictEqual(comp.backgroundOffsetPixels, 0);
    });
  });

  describe('setStyleMeasurements', () => {
    it('sets the ghost\'s measurement properties', () => {
      comp.animationTarget.style = {};
      comp.setStyleMeasurements(scaledTileSize, 2);
      assert.strictEqual(comp.measurement, 16);
      assert.deepEqual(comp.animationTarget.style, {
        height: '16px',
        width: '16px',
        backgroundSize: '32px',
      });
    });
  });

  describe('setDefaultPosition', () => {
    it('sets the correct position for each ghost', () => {
      comp.setDefaultPosition(scaledTileSize, 'blinky');
      assert.deepEqual(comp.defaultPosition,
        {
          top: comp.scaledTileSize * 10.5,
          left: comp.scaledTileSize * 13,
        });

      comp.setDefaultPosition(scaledTileSize, 'pinky');
      assert.deepEqual(comp.defaultPosition,
        {
          top: comp.scaledTileSize * 13.5,
          left: comp.scaledTileSize * 13,
        });

      comp.setDefaultPosition(scaledTileSize, 'inky');
      assert.deepEqual(comp.defaultPosition,
        {
          top: scaledTileSize * 13.5,
          left: scaledTileSize * 11,
        });

      comp.setDefaultPosition(scaledTileSize, 'clyde');
      assert.deepEqual(comp.defaultPosition,
        {
          top: scaledTileSize * 13.5,
          left: scaledTileSize * 15,
        });

      comp.setDefaultPosition(scaledTileSize, undefined);
      assert.deepEqual(comp.defaultPosition, { top: 0, left: 0 });
    });

    it('updates various position properties', () => {
      comp.setDefaultPosition(scaledTileSize, 'blinky');
      assert.deepEqual(comp.position, comp.defaultPosition);
      assert.deepEqual(comp.oldPosition, comp.position);
      assert.strictEqual(comp.animationTarget.style.top,
        `${comp.position.top}px`);
      assert.strictEqual(comp.animationTarget.style.left,
        `${comp.position.left}px`);
    });
  });

  describe('setSpriteSheet', () => {
    it('sets the correct spritesheet if the ghost is scared', () => {
      comp.mode = 'scared';
      comp.scaredColor = 'blue';
      comp.setSpriteSheet(undefined, undefined, 'scared');
      assert.strictEqual(
        comp.animationTarget.style.backgroundImage,
        'url(app/style/graphics/spriteSheets/characters/ghosts/'
        + 'scared_blue.svg)',
      );

      comp.scaredColor = 'white';
      comp.setSpriteSheet(undefined, undefined, 'scared');
      assert.strictEqual(
        comp.animationTarget.style.backgroundImage,
        'url(app/style/graphics/spriteSheets/characters/ghosts/'
        + 'scared_white.svg)',
      );
    });

    it('sets the correct spritesheets for eyes mode', () => {
      const url = 'url(app/style/graphics/spriteSheets/characters/ghosts/';

      comp.setSpriteSheet('blinky', 'up', 'eyes');
      assert.strictEqual(
        comp.animationTarget.style.backgroundImage, `${url}eyes_up.svg)`,
      );

      comp.setSpriteSheet('blinky', 'down', 'eyes');
      assert.strictEqual(
        comp.animationTarget.style.backgroundImage, `${url}eyes_down.svg)`,
      );

      comp.setSpriteSheet('blinky', 'left', 'eyes');
      assert.strictEqual(
        comp.animationTarget.style.backgroundImage, `${url}eyes_left.svg)`,
      );

      comp.setSpriteSheet('blinky', 'right', 'eyes');
      assert.strictEqual(
        comp.animationTarget.style.backgroundImage, `${url}eyes_right.svg)`,
      );
    });

    it('sets the correct spritesheet for any given direction', () => {
      const url = 'url(app/style/graphics/spriteSheets/characters/ghosts/';

      comp.setSpriteSheet('blinky', 'up');
      assert.strictEqual(
        comp.animationTarget.style.backgroundImage,
        `${url}blinky/blinky_up.svg)`,
      );
      comp.setSpriteSheet('blinky', 'down');
      assert.strictEqual(
        comp.animationTarget.style.backgroundImage,
        `${url}blinky/blinky_down.svg)`,
      );
      comp.setSpriteSheet('blinky', 'left');
      assert.strictEqual(
        comp.animationTarget.style.backgroundImage,
        `${url}blinky/blinky_left.svg)`,
      );
      comp.setSpriteSheet('blinky', 'right');
      assert.strictEqual(
        comp.animationTarget.style.backgroundImage,
        `${url}blinky/blinky_right.svg)`,
      );
    });

    it('adds emotion if the ghost is moving quickly', () => {
      const url = 'url(app/style/graphics/spriteSheets/characters/ghosts/';

      comp.defaultSpeed = comp.mediumSpeed;
      comp.setSpriteSheet('blinky', 'up', 'chase');
      assert.strictEqual(
        comp.animationTarget.style.backgroundImage,
        `${url}blinky/blinky_up_annoyed.svg)`,
      );

      comp.defaultSpeed = comp.fastSpeed;
      comp.setSpriteSheet('blinky', 'up', 'chase');
      assert.strictEqual(
        comp.animationTarget.style.backgroundImage,
        `${url}blinky/blinky_up_angry.svg)`,
      );
    });
  });

  describe('reset', () => {
    it('resets the character to its default state', () => {
      comp.name = 'blinky';
      comp.position = '';
      comp.direction = '';
      comp.animationTarget.style.backgroundImage = '';
      comp.backgroundOffsetPixels = '';
      comp.animationTarget.style.backgroundPosition = '';

      comp.reset();
      assert.deepEqual(comp.position, comp.defaultPosition);
      assert.strictEqual(comp.direction, comp.defaultDirection);
      assert.strictEqual(comp.animationTarget.style.backgroundImage,
        'url(app/style/graphics/spriteSheets/characters/ghosts/blinky'
        + '/blinky_left.svg)');
      assert.strictEqual(comp.backgroundOffsetPixels, 0);
      assert.strictEqual(comp.animationTarget.style.backgroundPosition,
        '0px 0px');
    });

    it('resets extra params for full game resets', () => {
      comp.defaultSpeed = 123;
      comp.cruiseElroy = true;

      comp.reset(true);
      assert.notStrictEqual(comp.defaultSpeed, 123);
      assert.strictEqual(comp.cruiseElroy, undefined);
    });
  });

  describe('setDefaultMode', () => {
    it('starts ghosts in scatter mode', () => {
      comp.setDefaultMode();
      assert.strictEqual(comp.defaultMode, 'scatter');
      assert.strictEqual(comp.mode, 'scatter');
    });

    it('sets idleMode for all ghosts except blinky', () => {
      comp.name = 'blinky';
      comp.idleMode = undefined;
      comp.setDefaultMode();
      assert.strictEqual(comp.idleMode, undefined);

      comp.name = 'pinky';
      comp.setDefaultMode();
      assert.strictEqual(comp.idleMode, 'idle');
    });
  });

  describe('isInTunnel', () => {
    it('returns TRUE if the ghost is in either warp tunnel', () => {
      assert(comp.isInTunnel({ x: 0, y: 14 }));
      assert(comp.isInTunnel({ x: 30, y: 14 }));
    });

    it('returns FALSE otherwise', () => {
      assert(!comp.isInTunnel({ x: 15, y: 14 }));
      assert(!comp.isInTunnel({ x: 0, y: 0 }));
    });
  });

  describe('isInGhostHouse', () => {
    it('returns TRUE if the ghost is in the Ghost House', () => {
      assert(comp.isInGhostHouse({ x: 10, y: 15 }));
    });

    it('returns FALSE otherwise', () => {
      assert(!comp.isInGhostHouse({ x: 0, y: 0 }));
    });
  });

  describe('getTile', () => {
    it('returns a tile if the given coordinates are free', () => {
      const tile = comp.getTile(mazeArray, 1, 1);
      assert.deepEqual(tile, { x: 1, y: 1 });
    });

    it('returns FALSE if the given coordinates are a wall', () => {
      const tile = comp.getTile(mazeArray, 0, 0);
      assert.strictEqual(tile, false);
    });

    it('returns FALSE if the given coordinates are outside the maze', () => {
      const tile = comp.getTile(mazeArray, -1, -1);
      assert.strictEqual(tile, false);
    });
  });

  describe('determinePossibleMoves', () => {
    it('returns a list of moves given valid coordinates', () => {
      const possibleMoves = comp.determinePossibleMoves(
        { x: 1, y: 1 }, 'right', mazeArray,
      );
      assert.deepEqual(possibleMoves, {
        down: { x: 1, y: 2 },
        right: { x: 2, y: 1 },
      });
    });

    it('does not allow the ghost to turn around at a crossroads', () => {
      const possibleMoves = comp.determinePossibleMoves(
        { x: 1, y: 1 }, 'up', mazeArray,
      );
      assert.deepEqual(possibleMoves, {
        right: { x: 2, y: 1 },
      });
    });

    it('returns an empty object if no moves are available', () => {
      const possibleMoves = comp.determinePossibleMoves(
        { x: -1, y: -1 }, 'up', mazeArray,
      );
      assert.deepEqual(possibleMoves, {});
    });
  });

  describe('calculateDistance', () => {
    it('uses the Pythagorean Theorem to measure distance', () => {
      const distance = comp.calculateDistance(
        { x: 0, y: 0 }, { x: 3, y: 4 },
      );
      assert.strictEqual(distance, 5);
    });

    it('returns zero if the two given positions are identical', () => {
      const distance = comp.calculateDistance(
        { x: 0, y: 0 }, { x: 0, y: 0 },
      );
      assert.strictEqual(distance, 0);
    });
  });

  describe('getPositionInFrontOfPacman', () => {
    it('returns the correct result for any orientation', () => {
      const pacmanPos = { x: 10, y: 10 };

      comp.pacman.direction = 'up';
      assert.deepEqual(comp.getPositionInFrontOfPacman(pacmanPos, 4),
        { x: 10, y: 6 });

      comp.pacman.direction = 'down';
      assert.deepEqual(comp.getPositionInFrontOfPacman(pacmanPos, 4),
        { x: 10, y: 14 });

      comp.pacman.direction = 'left';
      assert.deepEqual(comp.getPositionInFrontOfPacman(pacmanPos, 4),
        { x: 6, y: 10 });

      comp.pacman.direction = 'right';
      assert.deepEqual(comp.getPositionInFrontOfPacman(pacmanPos, 4),
        { x: 14, y: 10 });
    });
  });

  describe('determinePinkyTarget', () => {
    it('returns the correct target for Pinky', () => {
      comp.getPositionInFrontOfPacman = sinon.fake();
      const pacmanPos = { x: 10, y: 10 };

      comp.determinePinkyTarget(pacmanPos);
      assert(comp.getPositionInFrontOfPacman.calledWith(pacmanPos, 4));
    });
  });

  describe('determineInkyTarget', () => {
    it('returns the correct target for Inky', () => {
      const pacmanPos = { x: 10, y: 10 };
      comp.blinky = {};
      comp.characterUtil.determineGridPosition = sinon.fake.returns(
        { x: 0, y: 0 },
      );
      comp.getPositionInFrontOfPacman = sinon.fake.returns(
        { x: 12, y: 10 },
      );

      const result = comp.determineInkyTarget(pacmanPos);
      assert.deepEqual(result, { x: 24, y: 20 });
    });
  });

  describe('determineClydeTarget', () => {
    it('returns Pacman\'s position when far away', () => {
      comp.calculateDistance = sinon.fake.returns(10);

      const result = comp.determineClydeTarget(
        { x: 1, y: 1 }, { x: 2, y: 2 },
      );
      assert(comp.calculateDistance.calledWith(
        { x: 1, y: 1 }, { x: 2, y: 2 },
      ));
      assert.deepEqual(result, { x: 2, y: 2 });
    });

    it('returns the bottom-left corner\'s position when close', () => {
      comp.calculateDistance = sinon.fake.returns(1);

      const result = comp.determineClydeTarget();
      assert.deepEqual(result, { x: 0, y: 30 });
    });
  });

  describe('getTarget', () => {
    const pacmanPos = { x: 1, y: 1 };

    it('returns the ghost-house\'s door for eyes mode', () => {
      const result = comp.getTarget(undefined, undefined, undefined, 'eyes');
      assert.deepEqual(result, { x: 13.5, y: 10 });
    });

    it('returns Pacman\'s position for scared mode', () => {
      const result = comp.getTarget(undefined, undefined, pacmanPos, 'scared');
      assert.deepEqual(result, pacmanPos);
    });

    it('returns corners for scatter mode', () => {
      let result = comp.getTarget('blinky', undefined, pacmanPos, 'scatter');
      assert.deepEqual(result, { x: 27, y: 0 });

      comp.cruiseElroy = true;
      result = comp.getTarget('blinky', undefined, pacmanPos, 'scatter');
      assert.deepEqual(result, pacmanPos);

      result = comp.getTarget('pinky', undefined, pacmanPos, 'scatter');
      assert.deepEqual(result, { x: 0, y: 0 });

      result = comp.getTarget('inky', undefined, pacmanPos, 'scatter');
      assert.deepEqual(result, { x: 27, y: 30 });

      result = comp.getTarget('clyde', undefined, pacmanPos, 'scatter');
      assert.deepEqual(result, { x: 0, y: 30 });

      result = comp.getTarget(undefined, undefined, pacmanPos, 'scatter');
      assert.deepEqual(result, { x: 0, y: 0 });
    });

    it('returns various targets for chase mode', () => {
      let result = comp.getTarget('blinky', undefined, pacmanPos, 'chase');
      assert.deepEqual(result, pacmanPos);

      comp.determinePinkyTarget = sinon.fake();
      result = comp.getTarget('pinky', undefined, pacmanPos, 'chase');
      assert(comp.determinePinkyTarget.calledWith(pacmanPos));

      comp.determineInkyTarget = sinon.fake();
      result = comp.getTarget('inky', undefined, pacmanPos, 'chase');
      assert(comp.determineInkyTarget.calledWith(pacmanPos));

      comp.determineClydeTarget = sinon.fake();
      result = comp.getTarget('clyde', { x: 1, y: 1 }, pacmanPos, 'chase');
      assert(comp.determineClydeTarget.calledWith({ x: 1, y: 1 }, pacmanPos));

      result = comp.getTarget(undefined, undefined, pacmanPos, 'chase');
      assert.deepEqual(result, pacmanPos);
    });
  });

  describe('determineBestMove', () => {
    let possibleMoves;
    let pacmanPos;

    beforeEach(() => {
      possibleMoves = {
        up: { x: 1, y: 0 },
        down: { x: 1, y: 2 },
        left: { x: 0, y: 1 },
        right: { x: 2, y: 1 },
      };
      pacmanPos = { x: 3, y: 1 };
      comp.getTarget = sinon.fake.returns(pacmanPos);
    });

    it('returns the greatest distance from Pacman when scared', () => {
      const result = comp.determineBestMove(
        'blinky', possibleMoves, undefined, pacmanPos, 'scared',
      );
      assert.strictEqual(result, 'left');
    });

    it('returns the shortest distance to the target otherwise', () => {
      const result = comp.determineBestMove(
        'blinky', possibleMoves, undefined, pacmanPos, 'chase',
      );
      assert.strictEqual(result, 'right');
    });

    it('returns UNDEFINED if there are no possible moves', () => {
      const result = comp.determineBestMove(
        'blinky', {}, undefined, pacmanPos, 'chase',
      );
      assert.strictEqual(result, undefined);
    });
  });

  describe('determineDirection', () => {
    it('returns the new direction if there is only one possible move', () => {
      comp.determinePossibleMoves = sinon.fake.returns({ up: '' });

      const direction = comp.determineDirection();
      assert.strictEqual(direction, 'up');
    });

    it('calls determineBestMove if there are multiple possible moves', () => {
      comp.determinePossibleMoves = sinon.fake.returns({ up: '', down: '' });
      const bestSpy = comp.determineBestMove = sinon.fake.returns('down');

      const direction = comp.determineDirection();
      assert(bestSpy.called);
      assert.strictEqual(direction, 'down');
    });

    it('returns the ghost\'s default direction if there are no moves', () => {
      comp.determinePossibleMoves = sinon.fake.returns({});

      const direction = comp.determineDirection(
        undefined, undefined, undefined, 'right',
      );
      assert.strictEqual(direction, 'right');
    });
  });

  describe('handleSnappedMovement', () => {
    it('calls determineDirection to decide where to turn', () => {
      comp.characterUtil.determineGridPosition = sinon.fake();
      const directionSpy = comp.determineDirection = sinon.fake();
      comp.characterUtil.getPropertyToChange = sinon.fake.returns('top');
      comp.characterUtil.getVelocity = sinon.fake.returns(10);

      const newPosition = comp.handleSnappedMovement(50);
      assert(directionSpy.called);
      assert.deepEqual(newPosition, { top: 500, left: 0 });
    });
  });

  describe('enteringGhostHouse', () => {
    it('returns TRUE for eyes mode at the correct coordinates', () => {
      const entering = comp.enteringGhostHouse('eyes', { x: 13.5, y: 11 });
      assert(entering);
    });

    it('returns FALSE otherwise', () => {
      const entering = comp.enteringGhostHouse('chase', { x: 13.5, y: 11 });
      assert(!entering);
    });
  });

  describe('enteredGhostHouse', () => {
    it('returns TRUE for eyes mode at the correct coordinates', () => {
      const entered = comp.enteredGhostHouse('eyes', { x: 13.5, y: 14 });
      assert(entered);
    });

    it('returns FALSE otherwise', () => {
      const entered = comp.enteredGhostHouse('chase', { x: 13.5, y: 14 });
      assert(!entered);
    });
  });

  describe('leavingGhostHouse', () => {
    it('returns TRUE for chase mode at the correct coordinates', () => {
      const leaving = comp.leavingGhostHouse('chase', { x: 13.5, y: 10.9 });
      assert(leaving);
    });

    it('returns FALSE otherwise', () => {
      const leaving = comp.leavingGhostHouse('eyes', { x: 13.5, y: 10.9 });
      assert(!leaving);
    });
  });

  describe('handleGhostHouse', () => {
    it('snaps x to 13.5 and sends ghost down when entering', () => {
      comp.enteringGhostHouse = sinon.fake.returns(true);
      comp.characterUtil.snapToGrid = sinon.fake();

      const result = comp.handleGhostHouse({ x: 0, y: 0 });
      assert.strictEqual(comp.direction, 'down');
      assert.deepEqual(result, { x: 13.5, y: 0 });
      assert(comp.characterUtil.snapToGrid.called);
    });

    it('snaps y to 14 and sends ghost up once entered', () => {
      comp.enteredGhostHouse = sinon.fake.returns(true);
      comp.characterUtil.snapToGrid = sinon.fake();
      window.dispatchEvent = sinon.fake();
      global.Event = sinon.fake();

      const result = comp.handleGhostHouse({ x: 0, y: 0 });
      assert.strictEqual(comp.direction, 'up');
      assert.deepEqual(result, { x: 0, y: 14 });
      assert(comp.characterUtil.snapToGrid.called);
      assert.strictEqual(comp.mode, comp.defaultMode);
      assert(window.dispatchEvent.calledWith(new Event('restoreGhost')));
    });

    it('snaps y to 11 and sends ghost left once exited', () => {
      comp.leavingGhostHouse = sinon.fake.returns(true);
      comp.characterUtil.snapToGrid = sinon.fake();

      const result = comp.handleGhostHouse({ x: 0, y: 0 });
      assert.strictEqual(comp.direction, 'left');
      assert.deepEqual(result, { x: 0, y: 11 });
      assert(comp.characterUtil.snapToGrid.called);
    });
  });

  describe('handleIdleMovement', () => {
    let elapsedMs; let position; let
      velocity;

    beforeEach(() => {
      elapsedMs = 100;
      position = { x: undefined, y: undefined };
      velocity = 200;
      comp.characterUtil.getPropertyToChange = sinon.fake();
      comp.characterUtil.getVelocity = sinon.fake();
    });

    it('bounces the ghost up and down while idling', () => {
      comp.idleMode = 'idle';

      position.y = 13.5;
      comp.handleIdleMovement(elapsedMs, position, velocity);
      assert.strictEqual(comp.direction, 'down');

      position.y = 14.5;
      comp.handleIdleMovement(elapsedMs, position, velocity);
      assert.strictEqual(comp.direction, 'up');
    });

    it('vacates the ghost when idleMode is LEAVING', () => {
      global.window = {
        dispatchEvent: sinon.fake(),
      };
      global.Event = sinon.fake();

      comp.idleMode = 'leaving';
      position = { x: 13.5, y: 10.9 };
      let result = comp.handleIdleMovement(elapsedMs, position, velocity);
      assert.strictEqual(comp.idleMode, undefined);
      assert.strictEqual(result.top, comp.scaledTileSize * 10.5);
      assert.strictEqual(comp.direction, 'left');
      assert(window.dispatchEvent.calledWith(new Event('releaseGhost')));

      comp.idleMode = 'leaving';
      position = { x: 13.41, y: 10 };
      result = comp.handleIdleMovement(elapsedMs, position, velocity);
      assert.strictEqual(result.left, comp.scaledTileSize * 13);
      assert.strictEqual(comp.direction, 'up');

      position = { x: 11, y: 14 };
      result = comp.handleIdleMovement(elapsedMs, position, velocity);
      assert.strictEqual(result.top, comp.scaledTileSize * 13.5);
      assert.strictEqual(comp.direction, 'right');

      position = { x: 15, y: 14 };
      result = comp.handleIdleMovement(elapsedMs, position, velocity);
      assert.strictEqual(result.top, comp.scaledTileSize * 13.5);
      assert.strictEqual(comp.direction, 'left');

      position = { x: 1, y: 1 };
      comp.handleIdleMovement(elapsedMs, position, velocity);
    });
  });

  describe('endIdleMode', () => {
    it('sets idleMode to LEAVING', () => {
      comp.idleMode = 'idle';

      comp.endIdleMode();
      assert.strictEqual(comp.idleMode, 'leaving');
    });
  });

  describe('handleUnsnappedMovement', () => {
    beforeEach(() => {
      sinon.stub(comp, 'handleGhostHouse').callsFake(input => input);
    });

    it('returns the desired new position', () => {
      const desired = {
        newPosition: { top: 25, left: 50 },
      };
      comp.characterUtil.determineNewPositions = sinon.fake.returns(desired);
      comp.characterUtil.changingGridPosition = sinon.fake.returns(false);

      const newPosition = comp.handleUnsnappedMovement();
      assert.deepEqual(newPosition, desired.newPosition);
    });

    it('returns a snapped position if changing tiles', () => {
      const snappedPosition = { top: 125, left: 150 };
      comp.characterUtil.determineNewPositions = sinon.fake.returns({
        newGridPosition: '',
      });
      comp.characterUtil.changingGridPosition = sinon.fake.returns(true);
      comp.characterUtil.snapToGrid = sinon.fake.returns(snappedPosition);

      const newPosition = comp.handleUnsnappedMovement();
      assert.deepEqual(newPosition, snappedPosition);
    });
  });

  describe('handleMovement', () => {
    beforeEach(() => {
      comp.characterUtil.determineGridPosition = sinon.fake();
      comp.determineVelocity = sinon.fake();
      comp.handleIdleMovement = sinon.fake();
      comp.handleSnappedMovement = sinon.fake();
      comp.handleUnsnappedMovement = sinon.fake();
      comp.characterUtil.handleWarp = sinon.fake();
      comp.checkCollision = sinon.fake();
    });

    it('calls handleWarp and checkCollision', () => {
      comp.handleMovement(100);
      assert(comp.characterUtil.handleWarp.called);
      assert(comp.checkCollision.called);
    });

    it('calls the correct movement handlers', () => {
      comp.idleMode = true;
      comp.handleMovement(100);
      assert(comp.handleIdleMovement.called);

      comp.idleMode = false;
      comp.position = {};
      comp.characterUtil.snapToGrid = sinon.fake.returns(comp.position);
      comp.handleMovement(100);
      assert(comp.handleSnappedMovement.called);

      comp.position = undefined;
      comp.handleMovement(100);
      assert(comp.handleUnsnappedMovement.called);
    });
  });

  describe('changeMode', () => {
    it('updates the defaultMode', () => {
      comp.defaultMode = 'chase';
      comp.mode = 'chase';
      comp.isInGhostHouse = sinon.fake.returns(false);
      comp.characterUtil.getOppositeDirection = sinon.fake.returns('down');

      comp.changeMode('scatter');
      assert.strictEqual(comp.defaultMode, 'scatter');
      assert.strictEqual(comp.mode, 'scatter');
      assert.strictEqual(comp.direction, 'down');
    });

    it('won\'t turn the ghost around when in the Ghost House', () => {
      comp.isInGhostHouse = sinon.fake.returns(true);
      comp.characterUtil.getOppositeDirection = sinon.fake();

      comp.changeMode('scatter');
      assert(!comp.characterUtil.getOppositeDirection.called);
    });

    it('won\'t update mode under certain conditions', () => {
      comp.mode = 'scared';
      comp.changeMode('scatter');
      assert.strictEqual(comp.mode, 'scared');

      comp.mode = 'chase';
      comp.cruiseElroy = true;
      comp.changeMode('scatter');
      assert.strictEqual(comp.mode, 'chase');
    });
  });

  describe('toggleScaredColor', () => {
    it('toggles between blue and white, calls setSpriteSheet', () => {
      comp.scaredColor = 'blue';
      comp.setSpriteSheet = sinon.fake();

      comp.toggleScaredColor();
      assert.strictEqual(comp.scaredColor, 'white');
      assert(comp.setSpriteSheet.calledOnce);

      comp.toggleScaredColor();
      assert.strictEqual(comp.scaredColor, 'blue');
      assert(comp.setSpriteSheet.calledTwice);
    });
  });

  describe('becomeScared', () => {
    it('starts the ghost\'s scared behavior', () => {
      comp.name = 'blinky';
      comp.mode = '';
      comp.isInGhostHouse = sinon.fake.returns(false);
      comp.characterUtil.getOppositeDirection = sinon.fake.returns('down');
      comp.setSpriteSheet = sinon.fake();

      comp.becomeScared();
      assert.strictEqual(comp.mode, 'scared');
      assert(comp.characterUtil.getOppositeDirection.called);
      assert(comp.setSpriteSheet.calledWith(
        'blinky', 'down', 'scared',
      ));
    });

    it('only u-turns if the ghost is not in the Ghost House', () => {
      comp.mode = '';
      comp.isInGhostHouse = sinon.fake.returns(true);
      comp.characterUtil.getOppositeDirection = sinon.fake();

      comp.becomeScared();
      assert(!comp.characterUtil.getOppositeDirection.called);
    });

    it('does nothing if in EYES mode', () => {
      comp.setSpriteSheet = sinon.fake();

      comp.mode = 'eyes';
      comp.becomeScared();
      assert(!comp.setSpriteSheet.called);
    });
  });

  describe('endScared', () => {
    it('sets the mode to CHASE and calls setSpriteSheet', () => {
      comp.mode = 'scared';
      comp.setSpriteSheet = sinon.fake();

      comp.endScared();
      assert.strictEqual(comp.mode, comp.defaultMode);
      assert(comp.setSpriteSheet.called);
    });
  });

  describe('speedUp', () => {
    it('increases the default speed', () => {
      comp.defaultSpeed = comp.slowSpeed;

      comp.speedUp();
      assert.strictEqual(comp.defaultSpeed, comp.mediumSpeed);

      comp.speedUp();
      assert.strictEqual(comp.defaultSpeed, comp.fastSpeed);
    });

    it('does nothing if the ghost is at top speed', () => {
      comp.defaultSpeed = comp.fastSpeed;

      comp.speedUp();
      assert.strictEqual(comp.defaultSpeed, comp.fastSpeed);
    });
  });

  describe('resetDefaultSpeed', () => {
    it('resets the defaultSpeed and calls setSpriteSheet', () => {
      comp.defaultSpeed = comp.fastSpeed;
      comp.setSpriteSheet = sinon.fake();

      comp.resetDefaultSpeed();
      assert.strictEqual(comp.defaultSpeed, comp.slowSpeed);
      assert(comp.setSpriteSheet.called);
    });
  });

  describe('pause', () => {
    it('updates the paused param', () => {
      comp.pause(true);
      assert(comp.paused);

      comp.pause(false);
      assert(!comp.paused);
    });
  });

  describe('checkCollision', () => {
    it('switches to eyes mode after Pacman eats the ghost', () => {
      global.window = {
        dispatchEvent: sinon.fake(),
      };
      global.CustomEvent = sinon.fake();
      comp.mode = 'scared';

      comp.checkCollision({ x: 0, y: 0 }, { x: 0.9, y: 0 });
      assert.strictEqual(comp.mode, 'eyes');
      assert(global.window.dispatchEvent.calledWith(
        new CustomEvent('eatGhost', { detail: { ghost: comp } }),
      ));
    });

    it('emits the deathSequence event when <1 tile away from Pacman', () => {
      global.window = {
        dispatchEvent: sinon.fake(),
      };
      global.Event = sinon.fake();
      comp.mode = 'chase';

      comp.checkCollision({ x: 0, y: 0 }, { x: 1, y: 0 });
      assert(!global.window.dispatchEvent.called);

      comp.checkCollision({ x: 0, y: 0 }, { x: 0.9, y: 0 });
      assert(global.window.dispatchEvent.calledWith(
        new Event('deathSequence'),
      ));
    });
  });

  describe('determineVelocity', () => {
    it('returns eyeSpeed for eyes mode', () => {
      const result = comp.determineVelocity({}, 'eyes');
      assert.strictEqual(result, comp.eyeSpeed);
    });

    it('returns ZERO when the ghost is paused', () => {
      comp.paused = true;
      const result = comp.determineVelocity({}, 'chase');
      assert.strictEqual(result, 0);
    });

    it('returns tunnelSpeed when in the tunnel', () => {
      comp.isInTunnel = sinon.fake.returns(true);
      const result = comp.determineVelocity({}, 'scared');
      assert.strictEqual(result, comp.transitionSpeed);
    });

    it('returns scaredSpeed for scared mode', () => {
      const result = comp.determineVelocity({}, 'scared');
      assert.strictEqual(result, comp.scaredSpeed);
    });

    it('returns defaultSpeed otherwise', () => {
      const result = comp.determineVelocity({}, 'chase');
      assert.strictEqual(result, comp.slowSpeed);
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
      comp.characterUtil.calculateNewDrawValue = drawValueSpy;
      comp.characterUtil.checkForStutter = stutterSpy;
      comp.characterUtil.advanceSpriteSheet = spriteSpy;

      comp.draw(1);
      assert(drawValueSpy.calledTwice);
      assert(stutterSpy.called);
      assert(spriteSpy.called);
    });

    it('won\'t call checkForStutter if display is FALSE', () => {
      const stutterSpy = sinon.fake();
      comp.characterUtil.checkForStutter = stutterSpy;
      comp.display = false;

      comp.draw(1);
      assert(!stutterSpy.called);
    });
  });

  describe('update', () => {
    it('updates oldPosition', () => {
      comp.oldPosition = undefined;
      comp.position = {};

      comp.update();
      assert.deepEqual(comp.oldPosition, comp.position);
    });

    it('updates various properties when moving', () => {
      comp.msSinceLastSprite = 0;
      comp.moving = true;
      comp.handleMovement = sinon.fake();
      comp.setSpriteSheet = sinon.fake();

      comp.update(100);
      assert(comp.handleMovement.calledWith(100));
      assert(comp.setSpriteSheet.called);
      assert.strictEqual(comp.msSinceLastSprite, 100);
    });
  });
});
