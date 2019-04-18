const assert = require('assert');
const sinon = require('sinon');
const GameCoordinator = require('../scripts/core/gameCoordinator');

let component;
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
    global.Ghost = class {
      changeMode() {}
    };
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
        removeChild: () => { },
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
    component = new GameCoordinator();
  });

  afterEach(() => {
    clock.restore();
  });

  describe('drawMaze', () => {
    it('creates the maze and adds entities for a given maze array', () => {
      const entityList = [];
      component.drawMaze(mazeArray, entityList);
      assert.strictEqual(entityList.length, 1);
    });
  });

  describe('collisionDetectionLoop', () => {
    beforeEach(() => {
      component.pacman.position = { left: 0, top: 0 };
      component.pacman.velocityPerMs = 1;
      component.pickups = [{ checkPacmanProximity: sinon.fake() }];
    });

    it('calls checkPacmanProximity for each pickup', () => {
      component.collisionDetectionLoop();
    });
  });

  describe('startGameplay', () => {
    it('calls displayText, then kicks off movement', () => {
      component.displayText = sinon.fake();

      component.startGameplay();
      assert(component.displayText.calledWith(
        {
          left: component.scaledTileSize * 11,
          top: component.scaledTileSize * 16.5,
        },
        'ready',
        2000,
        component.scaledTileSize * 6,
        component.scaledTileSize * 2,
      ));

      clock.tick(2000);
      assert(component.allowPacmanMovement);
      assert(component.pacman.moving);
    });

    it('waits longer for the initialStart', () => {
      component.displayText = sinon.fake();

      component.startGameplay(true);
      assert(component.displayText.calledWith(
        {
          left: component.scaledTileSize * 11,
          top: component.scaledTileSize * 16.5,
        },
        'ready',
        4000,
        component.scaledTileSize * 6,
        component.scaledTileSize * 2,
      ));

      clock.tick(4000);
      assert(component.allowPacmanMovement);
      assert(component.pacman.moving);
    });
  });

  describe('ghostCycle', () => {
    it('changes ghosts to Chase mode after seven seconds', () => {
      component.ghosts = [{ changeMode: sinon.fake() }];

      component.ghostCycle('scatter');
      clock.tick(7000);
      assert(component.ghosts[0].changeMode.calledWith('chase'));
    });
  });

  describe('registerEventListeners', () => {
    it('registers listeners for various game events', () => {
      global.window = {
        addEventListener: sinon.fake(),
      };

      component.registerEventListeners();
      assert(global.window.addEventListener.calledWith('keydown'));
      assert(global.window.addEventListener.calledWith('awardPoints'));
      assert(global.window.addEventListener.calledWith('deathSequence'));
      assert(global.window.addEventListener.calledWith('dotEaten'));
      assert(global.window.addEventListener.calledWith('powerUp'));
      assert(global.window.addEventListener.calledWith('eatGhost'));
      assert(global.window.addEventListener.calledWith('addTimer'));
      assert(global.window.addEventListener.calledWith('removeTimer'));
    });
  });

  describe('handleKeyDown', () => {
    it('calls handlePauseKey when esc is pressed', () => {
      component.handlePauseKey = sinon.fake();

      component.handleKeyDown({ keyCode: 27 });
      assert(component.handlePauseKey.called);
    });

    it('calls Pacman\'s changeDirection when a move key is pressed', () => {
      component.gameEngine.running = true;
      const changeSpy = sinon.fake();
      component.pacman.changeDirection = changeSpy;

      // W Key
      component.handleKeyDown({ keyCode: 87 });
      assert.strictEqual(changeSpy.callCount, 1);

      // A Key
      component.handleKeyDown({ keyCode: 65 });
      assert.strictEqual(changeSpy.callCount, 2);

      // S Key
      component.handleKeyDown({ keyCode: 83 });
      assert.strictEqual(changeSpy.callCount, 3);

      // D Key
      component.handleKeyDown({ keyCode: 68 });
      assert.strictEqual(changeSpy.callCount, 4);

      // Up Arrow
      component.handleKeyDown({ keyCode: 38 });
      assert.strictEqual(changeSpy.callCount, 5);

      // Down Arrow
      component.handleKeyDown({ keyCode: 40 });
      assert.strictEqual(changeSpy.callCount, 6);

      // Left Arrow
      component.handleKeyDown({ keyCode: 37 });
      assert.strictEqual(changeSpy.callCount, 7);

      // Right Arrow
      component.handleKeyDown({ keyCode: 39 });
      assert.strictEqual(changeSpy.callCount, 8);
    });

    it('won\'t call changeDirection unless the gameEngine is running', () => {
      component.gameEngine.running = false;
      const changeSpy = sinon.fake();
      component.pacman.changeDirection = changeSpy;

      component.handleKeyDown({ keyCode: 87 });
      assert(!changeSpy.called);
    });

    it('won\'t call changeDirection if allowKeyPresses is FALSE', () => {
      component.allowKeyPresses = false;
      component.gameEngine.changePausedState = sinon.fake();
      component.pacman.changeDirection = sinon.fake();

      component.handleKeyDown({ keyCode: 27 });
      assert(component.gameEngine.changePausedState.called);
      component.handleKeyDown({ keyCode: 87 });
      assert(!component.pacman.changeDirection.called);
    });

    it('won\'t call anything if an unrecognized key is pressed', () => {
      component.gameEngine.changePausedState = sinon.fake();
      component.pacman.changeDirection = sinon.fake();

      // P Key
      component.handleKeyDown({ keyCode: 80 });
      assert(!component.gameEngine.changePausedState.called);
      assert(!component.pacman.changeDirection.called);
    });
  });

  describe('handlePauseKey', () => {
    beforeEach(() => {
      component.gameEngine.changePausedState = sinon.fake();
      component.activeTimers = [{}];
    });

    it('calls changePausedState', () => {
      component.activeTimers = [];
      component.handlePauseKey();
      assert(component.gameEngine.changePausedState.called);
    });

    it('resumes all timers after starting the engine', () => {
      component.gameEngine.started = true;
      component.activeTimers[0].resume = sinon.fake();
      component.handlePauseKey();
      assert(component.activeTimers[0].resume.called);
    });

    it('resumes all timers after starting the engine', () => {
      component.gameEngine.pause = true;
      component.activeTimers[0].pause = sinon.fake();
      component.handlePauseKey();
      assert(component.activeTimers[0].pause.called);
    });

    it('waits before allowing another pause key press', () => {
      component.activeTimers[0].pause = sinon.fake();
      assert(component.allowPause);
      component.handlePauseKey();
      assert(!component.allowPause);
      clock.tick(500);
      assert(component.allowPause);
    });

    it('won\'t call changePausedState unless allowPause is TRUE', () => {
      component.allowPause = false;
      component.handlePauseKey();
      assert(!component.gameEngine.changePausedState.called);
    });
  });

  describe('awardPoints', () => {
    it('adds to the total number of points', () => {
      component.points = 0;
      component.awardPoints(
        { detail: { points: 50 } },
      );
      assert.strictEqual(component.points, 50);
    });

    it('calls displayText when a fruit is eaten', () => {
      component.points = 0;
      component.displayText = sinon.fake();

      component.awardPoints(
        { detail: { points: 50, type: 'fruit' } },
      );
      assert.strictEqual(component.points, 50);
      assert(component.displayText.calledWith(
        {
          left: component.scaledTileSize * 13,
          top: component.scaledTileSize * 16.5,
        },
        50,
        2000,
        component.scaledTileSize * 2,
        component.scaledTileSize * 2,
      ));
    });

    it('displays a wider image when fruit worth four figures is eaten', () => {
      component.points = 0;
      component.displayText = sinon.fake();

      component.awardPoints(
        { detail: { points: 1000, type: 'fruit' } },
      );
      assert.strictEqual(component.points, 1000);
      assert(component.displayText.calledWith(
        {
          left: component.scaledTileSize * 12.5,
          top: component.scaledTileSize * 16.5,
        },
        1000,
        2000,
        component.scaledTileSize * 3,
        component.scaledTileSize * 2,
      ));
    });
  });

  describe('deathSequence', () => {
    it('kills Pacman, subtracts a life, and resets the characters', () => {
      component.allowKeyPresses = true;
      component.blinky.display = true;
      component.pacman.moving = true;
      component.blinky.moving = true;
      component.mazeCover.style = {
        visibility: 'hidden',
      };
      component.pacman.prepDeathAnimation = sinon.fake();
      component.pacman.reset = sinon.fake();
      component.blinky.reset = sinon.fake();
      component.fruit.hideFruit = sinon.fake();

      component.deathSequence();
      assert(!component.allowKeyPresses);
      assert(!component.pacman.moving);
      assert(!component.blinky.moving);

      clock.tick(750);
      assert(!component.blinky.display);
      assert(component.pacman.prepDeathAnimation.called);

      clock.tick(2250);
      assert.strictEqual(component.mazeCover.style.visibility,
        'visible');

      clock.tick(500);
      assert(component.allowKeyPresses);
      assert.strictEqual(component.mazeCover.style.visibility,
        'hidden');
      assert(component.pacman.reset.called);
      assert(component.blinky.reset.called);
      assert(component.fruit.hideFruit.called);
    });

    it('cancels the fruitTimer if needed', () => {
      component.timerExists = sinon.fake.returns(true);
      component.removeTimer = sinon.fake();

      component.deathSequence();
      assert(component.removeTimer.called);
    });
  });

  describe('dotEaten', () => {
    it('subtracts 1 from remainingDots', () => {
      component.remainingDots = 10;
      component.dotEaten();
      assert.strictEqual(component.remainingDots, 9);
    });

    it('creates a fruit at 174 and 74 remaining dots', () => {
      component.createFruit = sinon.fake();

      component.remainingDots = 175;
      component.dotEaten();
      assert(component.createFruit.calledOnce);

      component.remainingDots = 75;
      component.dotEaten();
      assert(component.createFruit.calledTwice);
    });

    it('speeds up Blinky at 40 and 20 dots', () => {
      component.speedUpBlinky = sinon.fake();

      component.remainingDots = 41;
      component.dotEaten();
      assert(component.speedUpBlinky.calledOnce);

      component.remainingDots = 21;
      component.dotEaten();
      assert(component.speedUpBlinky.calledTwice);
    });

    it('calls advanceLevel at 0 dots', () => {
      component.advanceLevel = sinon.fake();

      component.remainingDots = 1;
      component.dotEaten();
      assert(component.advanceLevel.called);
    });
  });

  describe('createFruit', () => {
    it('creates a bonus fruit for ten seconds', () => {
      component.fruit.showFruit = sinon.fake();
      component.fruit.hideFruit = sinon.fake();

      component.createFruit();
      assert(component.fruit.showFruit.called);

      clock.tick(10000);
      assert(component.fruit.hideFruit.called);
    });

    it('cancels the fruitTimer if needed', () => {
      component.timerExists = sinon.fake.returns(true);
      component.removeTimer = sinon.fake();
      component.fruit.showFruit = sinon.fake();

      component.createFruit();
      assert(component.removeTimer.called);
    });

    it('calls showFruit for 5000 points for unrecognized levels', () => {
      component.level = Infinity;
      component.fruit.showFruit = sinon.fake();

      component.createFruit();
      assert(component.fruit.showFruit.calledWith(5000));
    });
  });

  describe('speedUpBlinky', () => {
    it('calls the speedUp function for Blinky', () => {
      component.blinky.speedUp = sinon.fake();

      component.speedUpBlinky();
      assert(component.blinky.speedUp.called);
    });
  });

  describe('advanceLevel', () => {
    it('runs the sequence for advancing to the next level', () => {
      const ghost = {
        reset: sinon.fake(),
        resetDefaultSpeed: sinon.fake(),
        name: 'blinky',
        level: 1,
      };
      const fruit = new Pickup();
      const pacdot = new Pickup();
      fruit.reset = sinon.fake();
      fruit.type = 'fruit';
      pacdot.reset = sinon.fake();
      component.entityList = [
        ghost,
        fruit,
        pacdot,
      ];
      component.mazeCover = { style: {} };
      component.remainingDots = 0;

      component.advanceLevel();
      assert(!component.allowKeyPresses);

      clock.tick(2000);
      assert.strictEqual(component.mazeCover.style.visibility, 'visible');

      clock.tick(500);
      assert.strictEqual(component.mazeCover.style.visibility, 'hidden');
      assert.strictEqual(component.level, 2);
      assert(component.allowKeyPresses);
      assert.strictEqual(ghost.level, component.level);
      assert(ghost.resetDefaultSpeed.called);
      assert.strictEqual(component.remainingDots, 1);
    });

    it('removes the ghostTimer if needed', () => {
      component.ghostTimer = 123;
      component.timerExists = sinon.fake.returns(true);
      component.removeTimer = sinon.fake();

      component.advanceLevel();
      assert(component.timerExists.calledWith(component.ghostTimer));
      assert(component.removeTimer.calledWith(
        { detail: { id: component.ghostTimer } },
      ));
    });
  });

  describe('flashGhosts', () => {
    it('calls itself recursively a number of times', () => {
      component.flashingGhosts = true;
      component.scaredGhosts = [{
        toggleScaredColor: sinon.fake(),
        endScared: sinon.fake(),
      }];
      sinon.spy(component, 'flashGhosts');

      component.flashGhosts(0, 9);
      clock.tick(10000);
      assert.strictEqual(component.flashGhosts.callCount, 10);
    });

    it('stops calls if there are no more scared ghosts', () => {
      component.flashingGhosts = true;
      component.scaredGhosts = [];
      sinon.spy(component, 'flashGhosts');

      component.flashGhosts(0, 9);
      clock.tick(10000);
      assert.strictEqual(component.flashGhosts.callCount, 1);
      assert(!component.flashingGhosts);
    });

    it('does nothing if flashingGhosts is FALSE', () => {
      component.flashingGhosts = false;
      sinon.spy(component, 'flashGhosts');

      component.flashGhosts(0, 9);
      clock.tick(10000);
      assert.strictEqual(component.flashGhosts.callCount, 1);
    });
  });

  describe('powerUp', () => {
    it('establishes scaredGhosts and calls flashGhosts', () => {
      component.timerExists = sinon.fake.returns(true);
      component.removeTimer = sinon.fake();
      component.ghosts = [{ becomeScared: sinon.fake() }];
      component.flashGhosts = sinon.fake();

      component.powerUp();
      clock.tick(6000);
      assert(component.removeTimer.called);
      assert(component.scaredGhosts[0].becomeScared.called);
      assert(component.flashingGhosts);
      assert(component.flashGhosts.calledWith(0, 9));
    });

    it('won\'t call removeTimer unless the powerupTimer is active', () => {
      component.timerExists = sinon.fake.returns(false);
      component.removeTimer = sinon.fake();
      component.ghosts = [{ becomeScared: sinon.fake() }];
      component.flashGhosts = sinon.fake();

      component.powerUp();
      assert(!component.removeTimer.called);
    });

    it('won\'t push EYES mode ghosts to the scaredGhosts array', () => {
      component.timerExists = sinon.fake.returns(false);
      component.removeTimer = sinon.fake();
      component.ghosts = [
        { becomeScared: sinon.fake(), mode: 'eyes' },
        { becomeScared: sinon.fake(), mode: 'chase' },
      ];
      component.flashGhosts = sinon.fake();

      component.powerUp();
      assert.strictEqual(component.scaredGhosts.length, 1);
    });
  });

  describe('eatGhost', () => {
    it('awards points and temporarily pauses movement', () => {
      component.allowPacmanMovement = true;
      component.displayText = sinon.fake();
      const e = {
        detail: {
          ghost: {
            display: true,
            name: 'blinky',
          },
        },
      };
      component.scaredGhosts = [{ name: 'blinky' }];

      component.eatGhost(e);
      assert(!component.allowPacmanMovement);
      assert(!e.detail.ghost.display);
      assert(!component.pacman.moving);
      assert(!component.blinky.moving);
      assert(component.displayText.called);

      clock.tick(1000);
      assert(component.allowPacmanMovement);
      assert(e.detail.ghost.display);
      assert(component.pacman.moving);
      assert(component.blinky.moving);
    });
  });

  describe('displayText', () => {
    it('creates a temporary div and removes it with a set delay', () => {
      component.mazeDiv = {
        appendChild: sinon.fake(),
        removeChild: sinon.fake(),
      };

      component.displayText(
        { left: 10, top: 25 }, 200, 1000, 48,
      );
      assert(component.mazeDiv.appendChild.called);

      clock.tick(1000);
      assert(component.mazeDiv.removeChild.called);
    });
  });

  describe('addTimer', () => {
    it('adds a timer object to the list of active timers', () => {
      component.activeTimers = [];
      component.addTimer({
        detail: 'newTimer',
      });
      assert.strictEqual(component.activeTimers.length, 1);
    });
  });

  describe('timerExists', () => {
    it('checks if a given timerId exists', () => {
      component.activeTimers = [
        { timerId: 1 },
        { timerId: 2 },
        { timerId: 3 },
      ];

      assert(component.timerExists(1));
      assert(component.timerExists(2));
      assert(component.timerExists(3));
      assert(!component.timerExists(4));
    });
  });

  describe('removeTimer', () => {
    it('removes a timer from the active timers list based on timerId', () => {
      global.window.clearTimeout = sinon.fake();
      component.activeTimers = [
        { timerId: 1 },
        { timerId: 2 },
      ];
      component.removeTimer({
        detail: { id: 1 },
      });
      assert(global.window.clearTimeout.calledWith(1));
      assert.strictEqual(component.activeTimers.length, 1);
    });
  });
});
