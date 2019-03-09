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
    global.Timer = class {
      constructor(callback, delay) {
        setTimeout(callback, delay);
      }
    };
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
      assert(global.window.addEventListener.calledWith('addTimer'));
      assert(global.window.addEventListener.calledWith('removeTimer'));
    });
  });

  describe('handleKeyDown', () => {
    it('calls handlePauseKey when esc is pressed', () => {
      gameCoordinator.handlePauseKey = sinon.fake();

      gameCoordinator.handleKeyDown({ keyCode: 27 });
      assert(gameCoordinator.handlePauseKey.called);
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

    it('won\'t call changeDirection if allowKeyPresses is FALSE', () => {
      gameCoordinator.allowKeyPresses = false;
      gameCoordinator.gameEngine.changePausedState = sinon.fake();
      gameCoordinator.pacman.changeDirection = sinon.fake();

      gameCoordinator.handleKeyDown({ keyCode: 27 });
      assert(gameCoordinator.gameEngine.changePausedState.called);
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

  describe('handlePauseKey', () => {
    beforeEach(() => {
      gameCoordinator.gameEngine.changePausedState = sinon.fake();
      gameCoordinator.activeTimers = [{}];
    });

    it('calls changePausedState', () => {
      gameCoordinator.activeTimers = [];
      gameCoordinator.handlePauseKey();
      assert(gameCoordinator.gameEngine.changePausedState.called);
    });

    it('resumes all timers after starting the engine', () => {
      gameCoordinator.gameEngine.started = true;
      gameCoordinator.activeTimers[0].resume = sinon.fake();
      gameCoordinator.handlePauseKey();
      assert(gameCoordinator.activeTimers[0].resume.called);
    });

    it('resumes all timers after starting the engine', () => {
      gameCoordinator.gameEngine.pause = true;
      gameCoordinator.activeTimers[0].pause = sinon.fake();
      gameCoordinator.handlePauseKey();
      assert(gameCoordinator.activeTimers[0].pause.called);
    });

    it('waits before allowing another pause key press', () => {
      gameCoordinator.activeTimers[0].pause = sinon.fake();
      assert(gameCoordinator.allowPause);
      gameCoordinator.handlePauseKey();
      assert(!gameCoordinator.allowPause);
      clock.tick(500);
      assert(gameCoordinator.allowPause);
    });

    it('won\'t call changePausedState unless allowPause is TRUE', () => {
      gameCoordinator.allowPause = false;
      gameCoordinator.handlePauseKey();
      assert(!gameCoordinator.gameEngine.changePausedState.called);
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

  describe('flashGhosts', () => {
    it('calls itself recursively a number of times', () => {
      gameCoordinator.flashingGhosts = true;
      gameCoordinator.scaredGhosts = [{
        toggleScaredColor: sinon.fake(),
        endScared: sinon.fake(),
      }];
      sinon.spy(gameCoordinator, 'flashGhosts');

      gameCoordinator.flashGhosts(0, 9);
      clock.tick(10000);
      assert.strictEqual(gameCoordinator.flashGhosts.callCount, 10);
    });

    it('stops calls if there are no more scared ghosts', () => {
      gameCoordinator.flashingGhosts = true;
      gameCoordinator.scaredGhosts = [];
      sinon.spy(gameCoordinator, 'flashGhosts');

      gameCoordinator.flashGhosts(0, 9);
      clock.tick(10000);
      assert.strictEqual(gameCoordinator.flashGhosts.callCount, 1);
      assert(!gameCoordinator.flashingGhosts);
    });

    it('does nothing if flashingGhosts is FALSE', () => {
      gameCoordinator.flashingGhosts = false;
      sinon.spy(gameCoordinator, 'flashGhosts');

      gameCoordinator.flashGhosts(0, 9);
      clock.tick(10000);
      assert.strictEqual(gameCoordinator.flashGhosts.callCount, 1);
    });
  });

  describe('powerUp', () => {
    it('establishes scaredGhosts and calls flashGhosts', () => {
      gameCoordinator.timerExists = sinon.fake.returns(true);
      gameCoordinator.removeTimer = sinon.fake();
      gameCoordinator.ghosts = [{ becomeScared: sinon.fake() }];
      gameCoordinator.flashGhosts = sinon.fake();

      gameCoordinator.powerUp();
      clock.tick(6000);
      assert(gameCoordinator.removeTimer.called);
      assert(gameCoordinator.scaredGhosts[0].becomeScared.called);
      assert(gameCoordinator.flashingGhosts);
      assert(gameCoordinator.flashGhosts.calledWith(0, 9));
    });

    it('won\'t call removeTimer unless the powerupTimer is active', () => {
      gameCoordinator.timerExists = sinon.fake.returns(false);
      gameCoordinator.removeTimer = sinon.fake();
      gameCoordinator.ghosts = [{ becomeScared: sinon.fake() }];
      gameCoordinator.flashGhosts = sinon.fake();

      gameCoordinator.powerUp();
      assert(!gameCoordinator.removeTimer.called);
    });

    it('won\'t push EYES mode ghosts to the scaredGhosts array', () => {
      gameCoordinator.timerExists = sinon.fake.returns(false);
      gameCoordinator.removeTimer = sinon.fake();
      gameCoordinator.ghosts = [
        { becomeScared: sinon.fake(), mode: 'eyes' },
        { becomeScared: sinon.fake(), mode: 'chase' },
      ];
      gameCoordinator.flashGhosts = sinon.fake();

      gameCoordinator.powerUp();
      assert.strictEqual(gameCoordinator.scaredGhosts.length, 1);
    });
  });

  describe('eatGhost', () => {
    it('awards points and temporarily pauses movement', () => {
      gameCoordinator.allowPacmanMovement = true;
      gameCoordinator.displayPoints = sinon.fake();
      const e = {
        detail: {
          ghost: {
            display: true,
            name: 'blinky',
          },
        },
      };
      gameCoordinator.scaredGhosts = [{ name: 'blinky' }];

      gameCoordinator.eatGhost(e);
      assert(!gameCoordinator.allowPacmanMovement);
      assert(!e.detail.ghost.display);
      assert(!gameCoordinator.pacman.moving);
      assert(!gameCoordinator.blinky.moving);
      assert(gameCoordinator.displayPoints.called);

      clock.tick(1000);
      assert(gameCoordinator.allowPacmanMovement);
      assert(e.detail.ghost.display);
      assert(gameCoordinator.pacman.moving);
      assert(gameCoordinator.blinky.moving);
    });
  });

  describe('displayPoints', () => {
    it('creates a temporary div and removes it with a set delay', () => {
      gameCoordinator.mazeDiv = {
        appendChild: sinon.fake(),
        removeChild: sinon.fake(),
      };

      gameCoordinator.displayPoints(
        { left: 10, top: 25 }, 200, 1000, 48,
      );
      assert(gameCoordinator.mazeDiv.appendChild.called);

      clock.tick(1000);
      assert(gameCoordinator.mazeDiv.removeChild.called);
    });
  });

  describe('addTimer', () => {
    it('adds a timer object to the list of active timers', () => {
      gameCoordinator.activeTimers = [];
      gameCoordinator.addTimer({
        detail: 'newTimer',
      });
      assert.strictEqual(gameCoordinator.activeTimers.length, 1);
    });
  });

  describe('timerExists', () => {
    it('checks if a given timerId exists', () => {
      gameCoordinator.activeTimers = [
        { timerId: 1 },
        { timerId: 2 },
        { timerId: 3 },
      ];

      assert(gameCoordinator.timerExists(1));
      assert(gameCoordinator.timerExists(2));
      assert(gameCoordinator.timerExists(3));
      assert(!gameCoordinator.timerExists(4));
    });
  });

  describe('removeTimer', () => {
    it('removes a timer from the active timers list based on timerId', () => {
      global.window.clearTimeout = sinon.fake();
      gameCoordinator.activeTimers = [
        { timerId: 1 },
        { timerId: 2 },
      ];
      gameCoordinator.removeTimer({
        detail: { id: 1 },
      });
      assert(global.window.clearTimeout.calledWith(1));
      assert.strictEqual(gameCoordinator.activeTimers.length, 1);
    });
  });
});
