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

  ghost = new Ghost(scaledTileSize, undefined, pacman, undefined, 1,
    new CharacterUtil());
});

describe('ghost', () => {
  describe('setMovementStats', () => {
    it('sets the ghost\'s various movement stats', () => {
      ghost.setMovementStats(pacman, undefined, 1);
      assert.strictEqual(ghost.slowSpeed, 0.76);
      assert.strictEqual(ghost.mediumSpeed, 0.885);
      assert.strictEqual(ghost.fastSpeed, 1.01);
      assert.strictEqual(ghost.scaredSpeed, 0.5);
      assert.strictEqual(ghost.transitionSpeed, 0.4);
      assert.strictEqual(ghost.eyeSpeed, 2);
      assert.strictEqual(ghost.velocityPerMs, 0.76);
      assert.strictEqual(ghost.defaultDirection, 'left');
      assert.strictEqual(ghost.direction, 'left');
      assert.strictEqual(ghost.moving, false);
    });

    it('sets Blinky\'s defaultDirection to LEFT', () => {
      ghost.setMovementStats(pacman, 'blinky');
      assert.strictEqual(ghost.defaultDirection, 'left');
      assert.strictEqual(ghost.direction, 'left');
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
      assert.deepEqual(ghost.defaultPosition, { top: 84, left: 104 });
      assert.deepEqual(ghost.position, { top: 84, left: 104 });
      assert.deepEqual(ghost.oldPosition, { top: 84, left: 104 });
      assert.strictEqual(ghost.animationTarget.style.top, '84px');
      assert.strictEqual(ghost.animationTarget.style.left, '104px');
    });

    it('sets the correct default position if the name is missing', () => {
      ghost.setDefaultPosition(scaledTileSize, undefined);
      assert.deepEqual(ghost.defaultPosition, { top: 0, left: 0 });
      assert.deepEqual(ghost.position, { top: 0, left: 0 });
      assert.deepEqual(ghost.oldPosition, { top: 0, left: 0 });
      assert.strictEqual(ghost.animationTarget.style.top, '0px');
      assert.strictEqual(ghost.animationTarget.style.left, '0px');
    });
  });

  describe('setSpriteSheet', () => {
    it('sets the correct spritesheet if the ghost is scared', () => {
      ghost.mode = 'scared';
      ghost.scaredColor = 'blue';
      ghost.setSpriteSheet(undefined, undefined, 'scared');
      assert.strictEqual(
        ghost.animationTarget.style.backgroundImage,
        'url(app/style/graphics/spriteSheets/characters/ghosts/'
        + 'scared_blue.svg)',
      );

      ghost.scaredColor = 'white';
      ghost.setSpriteSheet(undefined, undefined, 'scared');
      assert.strictEqual(
        ghost.animationTarget.style.backgroundImage,
        'url(app/style/graphics/spriteSheets/characters/ghosts/'
        + 'scared_white.svg)',
      );
    });

    it('sets the correct spritesheets for eyes mode', () => {
      const url = 'url(app/style/graphics/spriteSheets/characters/ghosts/';

      ghost.setSpriteSheet('blinky', 'up', 'eyes');
      assert.strictEqual(
        ghost.animationTarget.style.backgroundImage, `${url}eyes_up.svg)`,
      );

      ghost.setSpriteSheet('blinky', 'down', 'eyes');
      assert.strictEqual(
        ghost.animationTarget.style.backgroundImage, `${url}eyes_down.svg)`,
      );

      ghost.setSpriteSheet('blinky', 'left', 'eyes');
      assert.strictEqual(
        ghost.animationTarget.style.backgroundImage, `${url}eyes_left.svg)`,
      );

      ghost.setSpriteSheet('blinky', 'right', 'eyes');
      assert.strictEqual(
        ghost.animationTarget.style.backgroundImage, `${url}eyes_right.svg)`,
      );
    });

    it('sets the correct spritesheet for any given direction', () => {
      const url = 'url(app/style/graphics/spriteSheets/characters/ghosts/';

      ghost.setSpriteSheet('blinky', 'up');
      assert.strictEqual(
        ghost.animationTarget.style.backgroundImage,
        `${url}blinky/blinky_up.svg)`,
      );
      ghost.setSpriteSheet('blinky', 'down');
      assert.strictEqual(
        ghost.animationTarget.style.backgroundImage,
        `${url}blinky/blinky_down.svg)`,
      );
      ghost.setSpriteSheet('blinky', 'left');
      assert.strictEqual(
        ghost.animationTarget.style.backgroundImage,
        `${url}blinky/blinky_left.svg)`,
      );
      ghost.setSpriteSheet('blinky', 'right');
      assert.strictEqual(
        ghost.animationTarget.style.backgroundImage,
        `${url}blinky/blinky_right.svg)`,
      );
    });

    it('adds emotion if the ghost is moving quickly', () => {
      const url = 'url(app/style/graphics/spriteSheets/characters/ghosts/';

      ghost.defaultSpeed = ghost.mediumSpeed;
      ghost.setSpriteSheet('blinky', 'up', 'chase');
      assert.strictEqual(
        ghost.animationTarget.style.backgroundImage,
        `${url}blinky/blinky_up_annoyed.svg)`,
      );

      ghost.defaultSpeed = ghost.fastSpeed;
      ghost.setSpriteSheet('blinky', 'up', 'chase');
      assert.strictEqual(
        ghost.animationTarget.style.backgroundImage,
        `${url}blinky/blinky_up_angry.svg)`,
      );
    });
  });

  describe('reset', () => {
    it('resets the character to its default state', () => {
      ghost.name = 'blinky';
      ghost.position = '';
      ghost.direciton = '';
      ghost.animationTarget.style.backgroundImage = '';
      ghost.backgroundOffsetPixels = '';
      ghost.animationTarget.style.backgroundPosition = '';

      ghost.reset();
      assert.deepEqual(ghost.position, ghost.defaultPosition);
      assert.strictEqual(ghost.direction, ghost.defaultDirection);
      assert.strictEqual(ghost.animationTarget.style.backgroundImage,
        'url(app/style/graphics/spriteSheets/characters/ghosts/blinky'
        + '/blinky_left.svg)');
      assert.strictEqual(ghost.backgroundOffsetPixels, 0);
      assert.strictEqual(ghost.animationTarget.style.backgroundPosition,
        '0px 0px');
    });
  });

  describe('isInTunnel', () => {
    it('returns TRUE if the ghost is in either warp tunnel', () => {
      assert(ghost.isInTunnel({ x: 0, y: 14 }));
      assert(ghost.isInTunnel({ x: 30, y: 14 }));
    });

    it('returns FALSE otherwise', () => {
      assert(!ghost.isInTunnel({ x: 15, y: 14 }));
      assert(!ghost.isInTunnel({ x: 0, y: 0 }));
    });
  });

  describe('isInGhostHouse', () => {
    it('returns TRUE if the ghost is in the Ghost House', () => {
      assert(ghost.isInGhostHouse({ x: 10, y: 15 }));
    });

    it('returns FALSE otherwise', () => {
      assert(!ghost.isInGhostHouse({ x: 0, y: 0 }));
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

  describe('getTarget', () => {
    const pacmanPos = { x: 1, y: 1 };

    it('returns the ghost-house\'s door for eyes mode', () => {
      const result = ghost.getTarget(undefined, undefined, 'eyes');
      assert.deepEqual(result, { x: 13.5, y: 10 });
    });

    it('returns Pacman\'s position for scared mode', () => {
      const result = ghost.getTarget(undefined, pacmanPos, 'scared');
      assert.deepEqual(result, pacmanPos);
    });

    it('returns the top-right corner for scatter mode', () => {
      const result = ghost.getTarget('blinky', pacmanPos, 'scatter');
      assert.deepEqual(result, { x: 27, y: 0 });
    });

    it('returns Pacman\'s position for Cruise Elroy in scatter', () => {
      ghost.cruiseElroy = true;
      const result = ghost.getTarget('blinky', pacmanPos, 'scatter');
      assert.deepEqual(result, pacmanPos);
    });

    it('returns the top-left corner by default for scatter', () => {
      ghost.getTarget(undefined, pacmanPos, 'scatter');
    });

    it('returns Pacman\'s position for Blinky', () => {
      const result = ghost.getTarget('blinky', pacmanPos, 'chase');
      assert.deepEqual(result, pacmanPos);
    });

    it('returns Pacman\'s position by default for chase', () => {
      const result = ghost.getTarget(undefined, pacmanPos, 'chase');
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
      ghost.getTarget = sinon.fake.returns(pacmanPos);
    });

    it('returns the greatest distance from Pacman when scared', () => {
      const result = ghost.determineBestMove(
        'blinky', possibleMoves, pacmanPos, 'scared',
      );
      assert.strictEqual(result, 'left');
    });

    it('returns the shortest distance to the target otherwise', () => {
      const result = ghost.determineBestMove(
        'blinky', possibleMoves, pacmanPos, 'chase',
      );
      assert.strictEqual(result, 'right');
    });

    it('returns UNDEFINED if there are no possible moves', () => {
      const result = ghost.determineBestMove(
        'blinky', {}, pacmanPos, 'chase',
      );
      assert.strictEqual(result, undefined);
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

  describe('enteringGhostHouse', () => {
    it('returns TRUE for eyes mode at the correct coordinates', () => {
      const entering = ghost.enteringGhostHouse('eyes', { x: 13.5, y: 11 });
      assert(entering);
    });

    it('returns FALSE otherwise', () => {
      const entering = ghost.enteringGhostHouse('chase', { x: 13.5, y: 11 });
      assert(!entering);
    });
  });

  describe('enteredGhostHouse', () => {
    it('returns TRUE for eyes mode at the correct coordinates', () => {
      const entered = ghost.enteredGhostHouse('eyes', { x: 13.5, y: 14 });
      assert(entered);
    });

    it('returns FALSE otherwise', () => {
      const entered = ghost.enteredGhostHouse('chase', { x: 13.5, y: 14 });
      assert(!entered);
    });
  });

  describe('leavingGhostHouse', () => {
    it('returns TRUE for chase mode at the correct coordinates', () => {
      const leaving = ghost.leavingGhostHouse('chase', { x: 13.5, y: 10.9 });
      assert(leaving);
    });

    it('returns FALSE otherwise', () => {
      const leaving = ghost.leavingGhostHouse('eyes', { x: 13.5, y: 10.9 });
      assert(!leaving);
    });
  });

  describe('handleGhostHouse', () => {
    it('snaps x to 13.5 and sends ghost down when entering', () => {
      ghost.enteringGhostHouse = sinon.fake.returns(true);
      ghost.characterUtil.snapToGrid = sinon.fake();

      const result = ghost.handleGhostHouse({ x: 0, y: 0 });
      assert.strictEqual(ghost.direction, 'down');
      assert.deepEqual(result, { x: 13.5, y: 0 });
      assert(ghost.characterUtil.snapToGrid.called);
    });

    it('snaps y to 14 and sends ghost up once entered', () => {
      ghost.enteredGhostHouse = sinon.fake.returns(true);
      ghost.characterUtil.snapToGrid = sinon.fake();

      const result = ghost.handleGhostHouse({ x: 0, y: 0 });
      assert.strictEqual(ghost.direction, 'up');
      assert.deepEqual(result, { x: 0, y: 14 });
      assert(ghost.characterUtil.snapToGrid.called);
      assert.strictEqual(ghost.mode, ghost.defaultMode);
    });

    it('snaps y to 11 and sends ghost left once exited', () => {
      ghost.leavingGhostHouse = sinon.fake.returns(true);
      ghost.characterUtil.snapToGrid = sinon.fake();

      const result = ghost.handleGhostHouse({ x: 0, y: 0 });
      assert.strictEqual(ghost.direction, 'left');
      assert.deepEqual(result, { x: 0, y: 11 });
      assert(ghost.characterUtil.snapToGrid.called);
    });
  });

  describe('handleUnsnappedMovement', () => {
    beforeEach(() => {
      sinon.stub(ghost, 'handleGhostHouse').callsFake(input => input);
    });

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

  describe('changeMode', () => {
    it('updates the defaultMode', () => {
      ghost.defaultMode = 'chase';
      ghost.mode = 'chase';
      ghost.isInGhostHouse = sinon.fake.returns(false);
      ghost.characterUtil.getOppositeDirection = sinon.fake.returns('down');

      ghost.changeMode('scatter');
      assert.strictEqual(ghost.defaultMode, 'scatter');
      assert.strictEqual(ghost.mode, 'scatter');
      assert.strictEqual(ghost.direction, 'down');
    });

    it('won\'t turn the ghost around when in the Ghost House', () => {
      ghost.isInGhostHouse = sinon.fake.returns(true);
      ghost.characterUtil.getOppositeDirection = sinon.fake();

      ghost.changeMode('scatter');
      assert(!ghost.characterUtil.getOppositeDirection.called);
    });

    it('won\'t update mode under certain conditions', () => {
      ghost.mode = 'scared';
      ghost.changeMode('scatter');
      assert.strictEqual(ghost.mode, 'scared');

      ghost.mode = 'chase';
      ghost.cruiseElroy = true;
      ghost.changeMode('scatter');
      assert.strictEqual(ghost.mode, 'chase');
    });
  });

  describe('toggleScaredColor', () => {
    it('toggles between blue and white, calls setSpriteSheet', () => {
      ghost.scaredColor = 'blue';
      ghost.setSpriteSheet = sinon.fake();

      ghost.toggleScaredColor();
      assert.strictEqual(ghost.scaredColor, 'white');
      assert(ghost.setSpriteSheet.calledOnce);

      ghost.toggleScaredColor();
      assert.strictEqual(ghost.scaredColor, 'blue');
      assert(ghost.setSpriteSheet.calledTwice);
    });
  });

  describe('becomeScared', () => {
    it('starts the ghost\'s scared behavior', () => {
      ghost.name = 'blinky';
      ghost.mode = '';
      ghost.isInGhostHouse = sinon.fake.returns(false);
      ghost.characterUtil.getOppositeDirection = sinon.fake.returns('down');
      ghost.setSpriteSheet = sinon.fake();

      ghost.becomeScared();
      assert.strictEqual(ghost.mode, 'scared');
      assert(ghost.characterUtil.getOppositeDirection.called);
      assert(ghost.setSpriteSheet.calledWith(
        'blinky', 'down', 'scared',
      ));
    });

    it('only u-turns if the ghost is not in the Ghost House', () => {
      ghost.mode = '';
      ghost.isInGhostHouse = sinon.fake.returns(true);
      ghost.characterUtil.getOppositeDirection = sinon.fake();

      ghost.becomeScared();
      assert(!ghost.characterUtil.getOppositeDirection.called);
    });

    it('does nothing if in EYES mode', () => {
      ghost.setSpriteSheet = sinon.fake();

      ghost.mode = 'eyes';
      ghost.becomeScared();
      assert(!ghost.setSpriteSheet.called);
    });
  });

  describe('endScared', () => {
    it('sets the mode to CHASE and calls setSpriteSheet', () => {
      ghost.mode = 'scared';
      ghost.setSpriteSheet = sinon.fake();

      ghost.endScared();
      assert.strictEqual(ghost.mode, ghost.defaultMode);
      assert(ghost.setSpriteSheet.called);
    });
  });

  describe('speedUp', () => {
    it('increases the default speed', () => {
      ghost.defaultSpeed = ghost.slowSpeed;

      ghost.speedUp();
      assert.strictEqual(ghost.defaultSpeed, ghost.mediumSpeed);

      ghost.speedUp();
      assert.strictEqual(ghost.defaultSpeed, ghost.fastSpeed);
    });

    it('does nothing if the ghost is at top speed', () => {
      ghost.defaultSpeed = ghost.fastSpeed;

      ghost.speedUp();
      assert.strictEqual(ghost.defaultSpeed, ghost.fastSpeed);
    });
  });

  describe('resetDefaultSpeed', () => {
    it('resets the defaultSpeed and calls setSpriteSheet', () => {
      ghost.defaultSpeed = ghost.fastSpeed;
      ghost.setSpriteSheet = sinon.fake();

      ghost.resetDefaultSpeed();
      assert.strictEqual(ghost.defaultSpeed, ghost.slowSpeed);
      assert(ghost.setSpriteSheet.called);
    });
  });

  describe('checkCollision', () => {
    it('switches to eyes mode after Pacman eats the ghost', () => {
      global.window = {
        dispatchEvent: sinon.fake(),
      };
      global.CustomEvent = sinon.fake();
      ghost.mode = 'scared';

      ghost.checkCollision({ x: 0, y: 0 }, { x: 0.9, y: 0 });
      assert.strictEqual(ghost.mode, 'eyes');
      assert(global.window.dispatchEvent.calledWith(
        new CustomEvent('eatGhost', { detail: { ghost } }),
      ));
    });

    it('emits the deathSequence event when <1 tile away from Pacman', () => {
      global.window = {
        dispatchEvent: sinon.fake(),
      };
      global.Event = sinon.fake();
      ghost.mode = 'chase';

      ghost.checkCollision({ x: 0, y: 0 }, { x: 1, y: 0 });
      assert(!global.window.dispatchEvent.called);

      ghost.checkCollision({ x: 0, y: 0 }, { x: 0.9, y: 0 });
      assert(global.window.dispatchEvent.calledWith(
        new Event('deathSequence'),
      ));
    });
  });

  describe('determineVelocity', () => {
    it('returns eyeSpeed for eyes mode', () => {
      const result = ghost.determineVelocity('blinky', {}, 'eyes');
      assert.strictEqual(result, ghost.eyeSpeed);
    });

    it('returns tunnelSpeed when in the tunnel', () => {
      ghost.isInTunnel = sinon.fake.returns(true);
      const result = ghost.determineVelocity('blinky', {}, 'scared');
      assert.strictEqual(result, ghost.transitionSpeed);
    });

    it('returns scaredSpeed for scared mode', () => {
      const result = ghost.determineVelocity('blinky', {}, 'scared');
      assert.strictEqual(result, ghost.scaredSpeed);
    });

    it('returns defaultSpeed otherwise', () => {
      const result = ghost.determineVelocity('clyde', {}, 'chase');
      assert.strictEqual(result, ghost.slowSpeed);
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

    it('won\'t call checkForStutter if display is FALSE', () => {
      const stutterSpy = sinon.fake();
      ghost.characterUtil.checkForStutter = stutterSpy;
      ghost.display = false;

      ghost.draw(1);
      assert(!stutterSpy.called);
    });
  });

  describe('update', () => {
    it('calls handleSnappedMovement if the ghost is snapped', () => {
      const snappedSpy = ghost.handleSnappedMovement = sinon.fake();
      ghost.characterUtil.determineGridPosition = sinon.fake();
      ghost.determineVelocity = sinon.fake();
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
      ghost.determineVelocity = sinon.fake();
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
