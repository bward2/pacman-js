const assert = require('assert');
const sinon = require('sinon');
const GameCoordinator = require('../scripts/core/gameCoordinator');

let comp;
const mazeArray = [
  ['X', 'X', 'X'],
  ['X', 'o', 'O'],
  ['X', ' ', 'X'],
];
let clock;

describe('gameCoordinator', () => {
  beforeEach(() => {
    global.Pacman = class {};
    global.CharacterUtil = class {};
    global.Ghost = class {
      reset() {}

      changeMode() {}

      endIdleMode() {}

      pause() {}
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

    global.SoundManager = class {
      play() {}

      setAmbience() {}

      playDotSound() {}

      resumeAmbience() {}

      stopAmbience() {}
    };

    global.document = {
      getElementsByTagName: () => ([
        { appendChild: () => { } },
      ]),
      getElementById: () => ({
        appendChild: () => { },
        removeChild: () => { },
        addEventListener: () => { },
      }),
      createElement: () => ({
        classList: {
          add: () => { },
        },
        appendChild: () => { },
        style: {},
      }),
    };

    global.Image = class {};
    global.Audio = class {
      addEventListener() { }
    };

    clock = sinon.useFakeTimers();
    comp = new GameCoordinator();
    comp.soundManager = new SoundManager();
  });

  afterEach(() => {
    clock.restore();
  });

  describe('startButtonClick', () => {
    it('calls init', () => {
      global.document.getElementById = sinon.fake.returns({
        style: {},
      });
      comp.init = sinon.fake();

      comp.startButtonClick();
      assert(comp.init.called);
    });
  });

  describe('preloadAssets', () => {
    it('calls createElements for images and audio', () => {
      const spy = sinon.fake();
      global.document.getElementById = sinon.fake.returns({
        style: {},
        scrollWidth: 500,
        remove: spy,
      });
      comp.createElements = sinon.fake.resolves();

      comp.preloadAssets().then(() => {
        assert(comp.createElements.calledTwice);
        clock.tick(1500);
        assert(spy.called);
      });
    });
  });

  describe('createElements', () => {
    it('creates elements given a list of sources', () => {
      const spy = sinon.fake();
      global.document.getElementById = sinon.fake.returns({
        appendChild: spy,
        style: {},
        scrollWidth: 500,
      });
      Object.defineProperties(global.Image.prototype, {
        src: {
          set() {
            this.onload();
          },
        },
      });

      comp.createElements(['src1', 'src2'], 'img', 100, comp).then(() => {
        assert(spy.called);
      });

      comp.createElements(['src'], 'audio', 100, comp).then(() => {
        assert(spy.called);
      });
    });
  });

  describe('init', () => {
    it('calls necessary setup functions to start the game', () => {
      comp.registerEventListeners = sinon.fake();
      comp.drawMaze = sinon.fake();
      comp.collisionDetectionLoop = sinon.fake();
      comp.startGameplay = sinon.fake();
      global.SoundManager = class { };

      comp.init();
      assert(comp.registerEventListeners.called);
      assert(comp.drawMaze.calledWith(comp.mazeArray, comp.entityList));
      assert(!comp.collisionDetectionLoop.called);
      assert(comp.startGameplay.calledWith(true));

      clock.tick(500);
      assert(comp.collisionDetectionLoop.called);
    });
  });

  describe('drawMaze', () => {
    it('creates the maze and adds entities for a given maze array', () => {
      const entityList = [];
      comp.mazeDiv.style = {};

      comp.drawMaze(mazeArray, entityList);
      assert.strictEqual(
        comp.mazeDiv.style.height, `${comp.scaledTileSize * 31}px`,
      );
      assert.strictEqual(
        comp.mazeDiv.style.width, `${comp.scaledTileSize * 28}px`,
      );
      assert.strictEqual(entityList.length, 2);
    });
  });

  describe('collisionDetectionLoop', () => {
    it('calls checkPacmanProximity for each pickup', () => {
      comp.pacman.position = { left: 0, top: 0 };
      comp.pacman.velocityPerMs = 1;
      const spy = sinon.fake();
      comp.pickups = [{ checkPacmanProximity: spy }];

      comp.collisionDetectionLoop();
      assert(spy.called);
    });

    it('does nothing if Pacman\'s position is undefined', () => {
      comp.pacman.position = undefined;
      comp.collisionDetectionLoop();
    });
  });

  describe('startGameplay', () => {
    it('calls displayText, then kicks off movement', () => {
      comp.displayText = sinon.fake();
      const ambientSpy = sinon.fake();
      comp.soundManager = {
        setAmbience: ambientSpy,
      };

      comp.startGameplay();
      assert(comp.displayText.calledWith(
        {
          left: comp.scaledTileSize * 11,
          top: comp.scaledTileSize * 16.5,
        },
        'ready',
        2000,
        comp.scaledTileSize * 6,
        comp.scaledTileSize * 2,
      ));

      clock.tick(2000);
      assert(comp.allowPacmanMovement);
      assert(comp.pacman.moving);
      assert(comp.soundManager.setAmbience.calledWith(
        comp.determineSiren(comp.remainingDots),
      ));
    });

    it('waits longer for the initialStart', () => {
      comp.displayText = sinon.fake();
      const playSpy = sinon.fake();
      const ambientSpy = sinon.fake();
      comp.soundManager = {
        play: playSpy,
        setAmbience: ambientSpy,
      };

      comp.startGameplay(true);
      assert(playSpy.calledWith('game_start'));
      assert(comp.displayText.calledWith(
        {
          left: comp.scaledTileSize * 11,
          top: comp.scaledTileSize * 16.5,
        },
        'ready',
        4500,
        comp.scaledTileSize * 6,
        comp.scaledTileSize * 2,
      ));

      clock.tick(4500);
      assert(comp.allowPacmanMovement);
      assert(comp.pacman.moving);
      assert(comp.soundManager.setAmbience.calledWith(
        comp.determineSiren(comp.remainingDots),
      ));
    });
  });

  describe('ghostCycle', () => {
    it('changes ghosts to Chase mode after seven seconds', () => {
      comp.ghosts = [{ changeMode: sinon.fake() }];

      comp.ghostCycle('scatter');
      clock.tick(7000);
      assert(comp.ghosts[0].changeMode.calledWith('chase'));
    });
  });

  describe('releaseGhost', () => {
    it('releases a ghost after a delay', () => {
      const spy = sinon.fake();
      comp.idleGhosts = [{ endIdleMode: spy }];
      comp.level = 1;

      comp.releaseGhost();
      clock.tick(7000);
    });

    it('does nothing unless there is an idle ghost to release', () => {
      comp.idleGhosts = [];
      comp.releaseGhost();
    });
  });

  describe('registerEventListeners', () => {
    it('registers listeners for various game events', () => {
      global.window = {
        addEventListener: sinon.fake(),
      };

      comp.registerEventListeners();
      assert(global.window.addEventListener.calledWith('keydown'));
      assert(global.window.addEventListener.calledWith('awardPoints'));
      assert(global.window.addEventListener.calledWith('deathSequence'));
      assert(global.window.addEventListener.calledWith('dotEaten'));
      assert(global.window.addEventListener.calledWith('powerUp'));
      assert(global.window.addEventListener.calledWith('eatGhost'));
      assert(global.window.addEventListener.calledWith('addTimer'));
      assert(global.window.addEventListener.calledWith('removeTimer'));
      assert(global.window.addEventListener.calledWith('releaseGhost'));
    });
  });

  describe('handleKeyDown', () => {
    beforeEach(() => {
      comp.gameEngine = {};
    });

    it('calls handlePauseKey when esc is pressed', () => {
      comp.handlePauseKey = sinon.fake();

      comp.handleKeyDown({ keyCode: 27 });
      assert(comp.handlePauseKey.called);
    });

    it('calls Pacman\'s changeDirection when a move key is pressed', () => {
      comp.gameEngine.running = true;
      const changeSpy = sinon.fake();
      comp.pacman.changeDirection = changeSpy;

      // W Key
      comp.handleKeyDown({ keyCode: 87 });
      assert.strictEqual(changeSpy.callCount, 1);

      // A Key
      comp.handleKeyDown({ keyCode: 65 });
      assert.strictEqual(changeSpy.callCount, 2);

      // S Key
      comp.handleKeyDown({ keyCode: 83 });
      assert.strictEqual(changeSpy.callCount, 3);

      // D Key
      comp.handleKeyDown({ keyCode: 68 });
      assert.strictEqual(changeSpy.callCount, 4);

      // Up Arrow
      comp.handleKeyDown({ keyCode: 38 });
      assert.strictEqual(changeSpy.callCount, 5);

      // Down Arrow
      comp.handleKeyDown({ keyCode: 40 });
      assert.strictEqual(changeSpy.callCount, 6);

      // Left Arrow
      comp.handleKeyDown({ keyCode: 37 });
      assert.strictEqual(changeSpy.callCount, 7);

      // Right Arrow
      comp.handleKeyDown({ keyCode: 39 });
      assert.strictEqual(changeSpy.callCount, 8);
    });

    it('won\'t call changeDirection unless the gameEngine is running', () => {
      comp.gameEngine.running = false;
      const changeSpy = sinon.fake();
      comp.pacman.changeDirection = changeSpy;

      comp.handleKeyDown({ keyCode: 87 });
      assert(!changeSpy.called);
    });

    it('won\'t call changeDirection if allowKeyPresses is FALSE', () => {
      comp.allowKeyPresses = false;
      comp.handlePauseKey = sinon.fake();
      comp.pacman.changeDirection = sinon.fake();

      comp.handleKeyDown({ keyCode: 27 });
      assert(comp.handlePauseKey.called);
      comp.handleKeyDown({ keyCode: 87 });
      assert(!comp.pacman.changeDirection.called);
    });

    it('won\'t call anything if an unrecognized key is pressed', () => {
      comp.gameEngine.changePausedState = sinon.fake();
      comp.pacman.changeDirection = sinon.fake();

      // P Key
      comp.handleKeyDown({ keyCode: 80 });
      assert(!comp.gameEngine.changePausedState.called);
      assert(!comp.pacman.changeDirection.called);
    });
  });

  describe('handlePauseKey', () => {
    beforeEach(() => {
      comp.gameEngine = {
        changePausedState: sinon.fake(),
      };
      comp.activeTimers = [{}];
      comp.allowPause = true;
      comp.cutscene = false;
    });

    it('calls changePausedState', () => {
      comp.activeTimers = [];
      comp.handlePauseKey();
      assert(comp.gameEngine.changePausedState.called);
    });

    it('resumes all timers after starting the engine', () => {
      comp.gameEngine.started = true;
      comp.activeTimers[0].resume = sinon.fake();
      comp.handlePauseKey();
      assert(comp.activeTimers[0].resume.called);
    });

    it('resumes all timers after starting the engine', () => {
      comp.gameEngine.pause = true;
      comp.activeTimers[0].pause = sinon.fake();
      comp.handlePauseKey();
      assert(comp.activeTimers[0].pause.called);
    });

    it('waits before allowing another pause key press', () => {
      comp.activeTimers[0].pause = sinon.fake();
      assert(comp.allowPause);
      comp.handlePauseKey();
      assert(!comp.allowPause);
      clock.tick(500);
      assert(comp.allowPause);
    });

    it('won\'t call changePausedState unless allowPause is TRUE', () => {
      comp.allowPause = false;
      comp.handlePauseKey();
      assert(!comp.gameEngine.changePausedState.called);
    });

    it('won\'t set allowPause to TRUE if a cutscene is playing', () => {
      comp.activeTimers[0].pause = sinon.fake();
      comp.handlePauseKey();
      comp.cutscene = true;
      assert(!comp.allowPause);
      clock.tick(500);
      assert(!comp.allowPause);
    });
  });

  describe('awardPoints', () => {
    it('adds to the total number of points', () => {
      comp.points = 0;
      comp.awardPoints(
        { detail: { points: 50 } },
      );
      assert.strictEqual(comp.points, 50);
    });

    it('calls displayText when a fruit is eaten', () => {
      comp.points = 0;
      comp.displayText = sinon.fake();

      comp.awardPoints(
        { detail: { points: 50, type: 'fruit' } },
      );
      assert.strictEqual(comp.points, 50);
      assert(comp.displayText.calledWith(
        {
          left: comp.scaledTileSize * 13,
          top: comp.scaledTileSize * 16.5,
        },
        50,
        2000,
        comp.scaledTileSize * 2,
        comp.scaledTileSize * 2,
      ));
    });

    it('displays a wider image when fruit worth four figures is eaten', () => {
      comp.points = 0;
      comp.displayText = sinon.fake();

      comp.awardPoints(
        { detail: { points: 1000, type: 'fruit' } },
      );
      assert.strictEqual(comp.points, 1000);
      assert(comp.displayText.calledWith(
        {
          left: comp.scaledTileSize * 12.5,
          top: comp.scaledTileSize * 16.5,
        },
        1000,
        2000,
        comp.scaledTileSize * 3,
        comp.scaledTileSize * 2,
      ));
    });
  });

  describe('deathSequence', () => {
    it('kills Pacman, subtracts a life, and resets the characters', () => {
      comp.allowKeyPresses = true;
      comp.blinky.display = true;
      comp.pacman.moving = true;
      comp.blinky.moving = true;
      comp.mazeCover.style = {
        visibility: 'hidden',
      };
      comp.pacman.prepDeathAnimation = sinon.fake();
      comp.pacman.reset = sinon.fake();
      comp.blinky.reset = sinon.fake();
      comp.fruit.hideFruit = sinon.fake();

      comp.deathSequence();
      assert(!comp.allowKeyPresses);
      assert(!comp.pacman.moving);
      assert(!comp.blinky.moving);

      clock.tick(750);
      assert(!comp.blinky.display);
      assert(comp.pacman.prepDeathAnimation.called);

      clock.tick(2250);
      assert.strictEqual(comp.mazeCover.style.visibility,
        'visible');

      clock.tick(500);
      assert(comp.allowKeyPresses);
      assert.strictEqual(comp.mazeCover.style.visibility,
        'hidden');
      assert(comp.pacman.reset.called);
      assert(comp.blinky.reset.called);
      assert(comp.fruit.hideFruit.called);
    });

    it('cancels the fruitTimer if needed', () => {
      comp.timerExists = sinon.fake.returns(true);
      comp.removeTimer = sinon.fake();

      comp.deathSequence();
      assert(comp.removeTimer.called);
    });
  });

  describe('dotEaten', () => {
    it('subtracts 1 from remainingDots', () => {
      comp.remainingDots = 10;
      comp.dotEaten();
      assert.strictEqual(comp.remainingDots, 9);
    });

    it('creates a fruit at 174 and 74 remaining dots', () => {
      comp.createFruit = sinon.fake();

      comp.remainingDots = 175;
      comp.dotEaten();
      assert(comp.createFruit.calledOnce);

      comp.remainingDots = 75;
      comp.dotEaten();
      assert(comp.createFruit.calledTwice);
    });

    it('speeds up Blinky at 40 and 20 dots', () => {
      comp.speedUpBlinky = sinon.fake();

      comp.remainingDots = 41;
      comp.dotEaten();
      assert(comp.speedUpBlinky.calledOnce);

      comp.remainingDots = 21;
      comp.dotEaten();
      assert(comp.speedUpBlinky.calledTwice);
    });

    it('calls advanceLevel at 0 dots', () => {
      comp.advanceLevel = sinon.fake();

      comp.remainingDots = 1;
      comp.dotEaten();
      assert(comp.advanceLevel.called);
    });
  });

  describe('createFruit', () => {
    it('creates a bonus fruit for ten seconds', () => {
      comp.fruit.showFruit = sinon.fake();
      comp.fruit.hideFruit = sinon.fake();

      comp.createFruit();
      assert(comp.fruit.showFruit.called);

      clock.tick(10000);
      assert(comp.fruit.hideFruit.called);
    });

    it('cancels the fruitTimer if needed', () => {
      comp.timerExists = sinon.fake.returns(true);
      comp.removeTimer = sinon.fake();
      comp.fruit.showFruit = sinon.fake();

      comp.createFruit();
      assert(comp.removeTimer.called);
    });

    it('calls showFruit for 5000 points for unrecognized levels', () => {
      comp.level = Infinity;
      comp.fruit.showFruit = sinon.fake();

      comp.createFruit();
      assert(comp.fruit.showFruit.calledWith(5000));
    });
  });

  describe('speedUpBlinky', () => {
    beforeEach(() => {
      comp.blinky.speedUp = sinon.fake();
    });

    it('calls the speedUp function for Blinky', () => {
      comp.speedUpBlinky();
      assert(comp.blinky.speedUp.called);
    });

    it('calls setAmbience if there are no scared or eye ghosts', () => {
      comp.scaredGhosts = [];
      comp.eyeGhosts = 0;
      comp.soundManager.setAmbience = sinon.fake();
      comp.determineSiren = sinon.fake();

      comp.speedUpBlinky();
      assert(comp.soundManager.setAmbience.calledWith(
        comp.determineSiren(comp.remainingDots),
      ));
    });

    it('does not call setAmbience otherwise', () => {
      comp.scaredGhosts = [];
      comp.eyeGhosts = 1;
      comp.soundManager.setAmbience = sinon.fake();
      comp.determineSiren = sinon.fake();

      comp.speedUpBlinky();
      assert(!comp.soundManager.setAmbience.called);
    });
  });

  describe('determineSiren', () => {
    it('determines the correct siren ambience', () => {
      assert.strictEqual(comp.determineSiren(100), 'siren_1');
      assert.strictEqual(comp.determineSiren(30), 'siren_2');
      assert.strictEqual(comp.determineSiren(10), 'siren_3');
    });
  });

  describe('advanceLevel', () => {
    it('runs the sequence for advancing to the next level', () => {
      const ghost = new Ghost();
      ghost.reset = sinon.fake();
      ghost.resetDefaultSpeed = sinon.fake();
      ghost.name = 'blinky';
      ghost.level = 1;
      const fruit = new Pickup();
      const pacdot = new Pickup();
      fruit.reset = sinon.fake();
      fruit.type = 'fruit';
      pacdot.reset = sinon.fake();
      comp.entityList = [
        ghost,
        fruit,
        pacdot,
      ];
      comp.mazeCover = { style: {} };
      comp.remainingDots = 0;
      comp.removeTimer = sinon.fake();

      comp.advanceLevel();
      assert(!comp.allowKeyPresses);
      assert(comp.removeTimer.calledWith(
        { detail: { timer: comp.ghostTimer } },
      ));

      clock.tick(2000);
      assert.strictEqual(comp.mazeCover.style.visibility, 'visible');

      clock.tick(500);
      assert.strictEqual(comp.mazeCover.style.visibility, 'hidden');
      assert.strictEqual(comp.level, 2);
      assert(comp.allowKeyPresses);
      assert.strictEqual(ghost.level, comp.level);
      assert(ghost.resetDefaultSpeed.called);
      assert.strictEqual(comp.remainingDots, 1);
    });
  });

  describe('flashGhosts', () => {
    it('calls itself recursively a number of times', () => {
      comp.scaredGhosts = [{
        toggleScaredColor: sinon.fake(),
        endScared: sinon.fake(),
      }];
      sinon.spy(comp, 'flashGhosts');
      comp.soundManager.setAmbience = sinon.fake();
      comp.determineSiren = sinon.fake();
      comp.eyeGhosts = 0;

      comp.flashGhosts(0, 9);
      clock.tick(10000);
      assert.strictEqual(comp.flashGhosts.callCount, 10);
      assert(comp.soundManager.setAmbience.calledWith(
        comp.determineSiren(comp.remainingDots),
      ));
    });

    it('will not set ambience if there are eye ghosts', () => {
      comp.scaredGhosts = [{
        toggleScaredColor: sinon.fake(),
        endScared: sinon.fake(),
      }];
      sinon.spy(comp, 'flashGhosts');
      comp.soundManager.setAmbience = sinon.fake();
      comp.eyeGhosts = 1;

      comp.flashGhosts(0, 9);
      clock.tick(10000);
      assert.strictEqual(comp.flashGhosts.callCount, 10);
      assert(!comp.soundManager.setAmbience.called);
    });

    it('stops calls if there are no more scared ghosts', () => {
      comp.flashingGhosts = true;
      comp.scaredGhosts = [];
      sinon.spy(comp, 'flashGhosts');

      comp.flashGhosts(0, 9);
      clock.tick(10000);
      assert.strictEqual(comp.flashGhosts.callCount, 1);
    });
  });

  describe('powerUp', () => {
    it('establishes scaredGhosts and calls flashGhosts', () => {
      comp.timerExists = sinon.fake.returns(true);
      comp.removeTimer = sinon.fake();
      comp.ghosts = [{ becomeScared: sinon.fake() }];
      comp.flashGhosts = sinon.fake();

      comp.powerUp();
      clock.tick(6000);
      assert(comp.removeTimer.called);
      assert(comp.scaredGhosts[0].becomeScared.called);
      assert(comp.flashGhosts.calledWith(0, 9));
    });

    it('won\'t push EYES mode ghosts to the scaredGhosts array', () => {
      comp.timerExists = sinon.fake.returns(false);
      comp.removeTimer = sinon.fake();
      comp.ghosts = [
        { becomeScared: sinon.fake(), mode: 'eyes' },
        { becomeScared: sinon.fake(), mode: 'chase' },
      ];
      comp.flashGhosts = sinon.fake();

      comp.powerUp();
      assert.strictEqual(comp.scaredGhosts.length, 1);
    });
  });

  describe('determineComboPoints', () => {
    it('returns the correct points based on combo', () => {
      comp.ghostCombo = 1;
      assert.strictEqual(comp.determineComboPoints(), 200);
      comp.ghostCombo = 2;
      assert.strictEqual(comp.determineComboPoints(), 400);
      comp.ghostCombo = 3;
      assert.strictEqual(comp.determineComboPoints(), 800);
      comp.ghostCombo = 4;
      assert.strictEqual(comp.determineComboPoints(), 1600);
    });
  });

  describe('eatGhost', () => {
    it('awards points and temporarily pauses movement', () => {
      comp.allowPacmanMovement = true;
      comp.displayText = sinon.fake();
      const ghost = {
        display: true,
        name: 'blinky',
        pause: sinon.fake(),
      };
      const e = {
        detail: {
          ghost,
        },
      };
      comp.scaredGhosts = [ghost];
      comp.determineComboPoints = sinon.fake();

      comp.eatGhost(e);
      assert(!comp.allowPacmanMovement);
      assert(!e.detail.ghost.display);
      assert(!comp.pacman.moving);
      assert(!comp.blinky.moving);
      assert(comp.displayText.called);
      assert(comp.determineComboPoints.called);

      clock.tick(1000);
      assert(comp.allowPacmanMovement);
      assert(e.detail.ghost.display);
      assert(comp.pacman.moving);
    });
  });

  describe('restoreGhost', () => {
    beforeEach(() => {
      comp.determineSiren = sinon.fake();
      comp.soundManager.setAmbience = sinon.fake();
    });

    it('only calls setAmbience when there are zero eye ghosts', () => {
      comp.eyeGhosts = 2;
      comp.restoreGhost();
      assert(!comp.soundManager.setAmbience.called);
    });

    it('subtracts from eyeGhost and calls setAmbience', () => {
      comp.eyeGhosts = 1;

      comp.restoreGhost();
      assert.strictEqual(comp.eyeGhosts, 0);
      assert(comp.soundManager.setAmbience.calledWith(
        comp.determineSiren(comp.remainingDots),
      ));

      comp.eyeGhosts = 1;
      comp.scaredGhosts = [1, 2, 3];
      comp.restoreGhost();
      assert(comp.soundManager.setAmbience.calledWith('power_up'));
    });
  });

  describe('displayText', () => {
    it('creates a temporary div and removes it with a set delay', () => {
      comp.mazeDiv = {
        appendChild: sinon.fake(),
        removeChild: sinon.fake(),
      };

      comp.displayText(
        { left: 10, top: 25 }, 200, 1000, 48,
      );
      assert(comp.mazeDiv.appendChild.called);

      clock.tick(1000);
      assert(comp.mazeDiv.removeChild.called);
    });
  });

  describe('addTimer', () => {
    it('adds a timer object to the list of active timers', () => {
      comp.activeTimers = [];
      comp.addTimer({
        detail: 'newTimer',
      });
      assert.strictEqual(comp.activeTimers.length, 1);
    });
  });

  describe('timerExists', () => {
    it('checks if a given timerId exists', () => {
      assert(comp.timerExists({ detail: { timer: { timerId: 1 } } }));
      assert(!comp.timerExists({ detail: { timer: { timerId: undefined } } }));
    });
  });

  describe('pauseTimer', () => {
    it('pauses an existing timer', () => {
      const spy = sinon.fake();

      comp.timerExists = sinon.fake.returns(false);
      comp.pauseTimer({ detail: { timer: { pause: spy } } });
      assert(!spy.calledWith(true));

      comp.timerExists = sinon.fake.returns(true);
      comp.pauseTimer({ detail: { timer: { pause: spy } } });
      assert(spy.calledWith(true));
    });
  });

  describe('resumeTimer', () => {
    it('resumes an existing timer', () => {
      const spy = sinon.fake();

      comp.timerExists = sinon.fake.returns(false);
      comp.resumeTimer({ detail: { timer: { resume: spy } } });
      assert(!spy.calledWith(true));

      comp.timerExists = sinon.fake.returns(true);
      comp.resumeTimer({ detail: { timer: { resume: spy } } });
      assert(spy.calledWith(true));
    });
  });

  describe('removeTimer', () => {
    it('removes a timer from the active timers list based on timerId', () => {
      global.window.clearTimeout = sinon.fake();
      comp.activeTimers = [
        { timerId: 1 },
        { timerId: 2 },
      ];
      comp.removeTimer({
        detail: { timer: { timerId: 1 } },
      });
      assert(global.window.clearTimeout.calledWith(1));
      assert.strictEqual(comp.activeTimers.length, 1);
    });

    it('checks if a timer exists before removing it', () => {
      comp.timerExists = sinon.fake.returns(false);

      comp.removeTimer({
        detail: { id: 1 },
      });
      assert(comp.timerExists.called);
    });
  });
});
