const assert = require('assert');
const sinon = require('sinon');
const GameCoordinator = require('../scripts/core/gameCoordinator');

let gameCoordinator;
const mazeArray = [
  ['X', 'X', 'X'],
  ['X', 'o', ' '],
  ['X', ' ', 'X'],
];
let clock;

describe('gameCoordinator', () => {
  beforeEach(() => {
    global.Pacman = class {};
    global.CharacterUtil = class {};
    global.Ghost = class {};
    global.Pickup = class {};
    global.GameEngine = class {
      start() { }
    };

    global.document = {
      getElementById: () => ({
        appendChild: () => { },
      }),
      createElement: () => ({
        classList: {
          add: () => { },
        },
        appendChild: () => { },
        style: {},
      }),
    };

    clock = sinon.useFakeTimers();
    gameCoordinator = new GameCoordinator();
  });

  afterEach(() => {
    clock.restore();
  });

  describe('drawMaze', () => {
    it('creates the maze and adds entities for a given maze array', () => {
      const entityList = [];
      gameCoordinator.drawMaze(mazeArray, entityList);
      assert.strictEqual(entityList.length, 1);
    });
  });

  describe('registerEventListeners', () => {
    it('registers listeners for various game events', () => {
      global.window = {
        addEventListener: sinon.fake(),
      };

      gameCoordinator.registerEventListeners();
      assert(global.window.addEventListener.calledWith('keydown'));
      assert(global.window.addEventListener.calledWith('deathSequence'));
      assert(global.window.addEventListener.calledWith('powerUp'));
      assert(global.window.addEventListener.calledWith('eatGhost'));
    });
  });

  describe('handleKeyDown', () => {
    it('calls changePausedState when esc is pressed', () => {
      gameCoordinator.gameEngine.changePausedState = sinon.fake();

      gameCoordinator.handleKeyDown({ keyCode: 27 });
      assert(gameCoordinator.gameEngine.changePausedState.called);
    });

    it('calls Pacman\'s changeDirection when a move key is pressed', () => {
      gameCoordinator.gameEngine.running = true;
      const changeSpy = sinon.fake();
      gameCoordinator.pacman.changeDirection = changeSpy;

      // W Key
      gameCoordinator.handleKeyDown({ keyCode: 87 });
      assert.strictEqual(changeSpy.callCount, 1);

      // A Key
      gameCoordinator.handleKeyDown({ keyCode: 65 });
      assert.strictEqual(changeSpy.callCount, 2);

      // S Key
      gameCoordinator.handleKeyDown({ keyCode: 83 });
      assert.strictEqual(changeSpy.callCount, 3);

      // D Key
      gameCoordinator.handleKeyDown({ keyCode: 68 });
      assert.strictEqual(changeSpy.callCount, 4);

      // Up Arrow
      gameCoordinator.handleKeyDown({ keyCode: 38 });
      assert.strictEqual(changeSpy.callCount, 5);

      // Down Arrow
      gameCoordinator.handleKeyDown({ keyCode: 40 });
      assert.strictEqual(changeSpy.callCount, 6);

      // Left Arrow
      gameCoordinator.handleKeyDown({ keyCode: 37 });
      assert.strictEqual(changeSpy.callCount, 7);

      // Right Arrow
      gameCoordinator.handleKeyDown({ keyCode: 39 });
      assert.strictEqual(changeSpy.callCount, 8);
    });

    it('won\'t call changeDirection unless the gameEngine is running', () => {
      gameCoordinator.gameEngine.running = false;
      const changeSpy = sinon.fake();
      gameCoordinator.pacman.changeDirection = changeSpy;

      gameCoordinator.handleKeyDown({ keyCode: 87 });
      assert(!changeSpy.called);
    });

    it('won\'t call anything if allowKeyPresses is FALSE', () => {
      gameCoordinator.allowKeyPresses = false;
      gameCoordinator.gameEngine.changePausedState = sinon.fake();
      gameCoordinator.pacman.changeDirection = sinon.fake();

      gameCoordinator.handleKeyDown({ keyCode: 27 });
      assert(!gameCoordinator.gameEngine.changePausedState.called);
      gameCoordinator.handleKeyDown({ keyCode: 87 });
      assert(!gameCoordinator.pacman.changeDirection.called);
    });

    it('won\'t call anything if an unrecognized key is pressed', () => {
      gameCoordinator.gameEngine.changePausedState = sinon.fake();
      gameCoordinator.pacman.changeDirection = sinon.fake();

      // P Key
      gameCoordinator.handleKeyDown({ keyCode: 80 });
      assert(!gameCoordinator.gameEngine.changePausedState.called);
      assert(!gameCoordinator.pacman.changeDirection.called);
    });
  });

  describe('deathSequence', () => {
    it('kills Pacman, subtracts a life, and resets the characters', () => {
      gameCoordinator.allowKeyPresses = true;
      gameCoordinator.blinky.display = true;
      gameCoordinator.pacman.moving = true;
      gameCoordinator.blinky.moving = true;
      gameCoordinator.mazeCover.style = {
        visibility: 'hidden',
      };
      gameCoordinator.pacman.prepDeathAnimation = sinon.fake();
      gameCoordinator.pacman.reset = sinon.fake();
      gameCoordinator.blinky.reset = sinon.fake();

      gameCoordinator.deathSequence();
      assert(!gameCoordinator.allowKeyPresses);
      assert(!gameCoordinator.pacman.moving);
      assert(!gameCoordinator.blinky.moving);

      clock.tick(750);
      assert(!gameCoordinator.blinky.display);
      assert(gameCoordinator.pacman.prepDeathAnimation.called);

      clock.tick(2250);
      assert.strictEqual(gameCoordinator.mazeCover.style.visibility,
        'visible');

      clock.tick(500);
      assert(gameCoordinator.allowKeyPresses);
      assert.strictEqual(gameCoordinator.mazeCover.style.visibility,
        'hidden');
      assert(gameCoordinator.pacman.reset.called);
      assert(gameCoordinator.blinky.reset.called);
    });
  });

  describe('powerUp', () => {
    // TODO: Add tests here
    it('does stuff', () => {
      gameCoordinator.blinky.becomeScared = sinon.fake();
      gameCoordinator.powerUp();
      assert(gameCoordinator.blinky.becomeScared.called);
    });
  });

  describe('eatGhost', () => {
    it('awards points and temporarily pauses movement', () => {
      gameCoordinator.allowPacmanMovement = true;
      const e = {
        detail: {
          ghost: {
            display: true,
          },
        },
      };

      gameCoordinator.eatGhost(e);
      assert(!gameCoordinator.allowPacmanMovement);
      assert(!e.detail.ghost.display);
      assert(!gameCoordinator.pacman.moving);
      assert(!gameCoordinator.blinky.moving);

      clock.tick(1000);
      assert(gameCoordinator.allowPacmanMovement);
      assert(e.detail.ghost.display);
      assert(gameCoordinator.pacman.moving);
      assert(gameCoordinator.blinky.moving);
    });
  });
});
