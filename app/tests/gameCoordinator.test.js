const assert = require('assert');
const sinon = require('sinon');
const GameCoordinator = require('../scripts/core/gameCoordinator');

let gameCoordinator;
const mazeArray = [
  ['X', 'X', 'X'],
  ['X', 'o', ' '],
  ['X', ' ', 'X'],
];

describe('gameCoordinator', () => {
  beforeEach(() => {
    global.Pacman = class {};
    global.CharacterUtil = class {};
    global.Ghost = class {};
    global.Pacdot = class {};
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

    gameCoordinator = new GameCoordinator();
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
      const listenerSpy = sinon.fake();
      global.window = {
        addEventListener: listenerSpy,
      };

      gameCoordinator.registerEventListeners();
      assert(listenerSpy.calledWith('keydown'));
      assert(listenerSpy.calledWith('deathSequence'));
    });
  });

  describe('handleKeyDown', () => {
    it('calls changePausedState when esc is pressed', () => {
      const pauseSpy = sinon.fake();
      gameCoordinator.gameEngine.changePausedState = pauseSpy;

      gameCoordinator.handleKeyDown({ keyCode: 27 });
      assert(pauseSpy.called);
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

    it('won\'t call anything if a game event is in progress', () => {
      gameCoordinator.eventInProgress = true;
      const pauseSpy = sinon.fake();
      gameCoordinator.gameEngine.changePausedState = pauseSpy;
      const changeSpy = sinon.fake();
      gameCoordinator.pacman.changeDirection = changeSpy;

      gameCoordinator.handleKeyDown({ keyCode: 27 });
      assert(!pauseSpy.called);
      gameCoordinator.handleKeyDown({ keyCode: 87 });
      assert(!changeSpy.called);
    });

    it('won\'t call anything if an unrecognized key is pressed', () => {
      const pauseSpy = sinon.fake();
      gameCoordinator.gameEngine.changePausedState = pauseSpy;
      const changeSpy = sinon.fake();
      gameCoordinator.pacman.changeDirection = changeSpy;

      // P Key
      gameCoordinator.handleKeyDown({ keyCode: 80 });
      assert(!pauseSpy.called);
      assert(!changeSpy.called);
    });
  });

  describe('deathSequence', () => {
    it('does stuff', () => {
      gameCoordinator.eventInProgress = false;
      gameCoordinator.pacman.moving = true;
      gameCoordinator.blinky.moving = true;

      gameCoordinator.deathSequence();
      assert(gameCoordinator.eventInProgress);
      assert(!gameCoordinator.pacman.moving);
      assert(!gameCoordinator.blinky.moving);
    });
  });
});
