const assert = require('assert');
const sinon = require('sinon');
const GameEngine = require('../scripts/core/gameEngine');

let gameEngine;
const maxFps = 120;

beforeEach(() => {
  global.document = {
    getElementById: () => ({}),
  };

  global.window = {
    addEventListener: () => { },
  };

  global.requestAnimationFrame = (callback) => {
    callback(1000);
  };

  gameEngine = new GameEngine(maxFps);
});

describe('gameEngine', () => {
  describe('changePausedState', () => {
    it('pauses the game if it is running', () => {
      const stopSpy = gameEngine.stop = sinon.fake();
      gameEngine.changePausedState(true);
      assert(stopSpy.called);
    });

    it('resumes the game if it is paused', () => {
      const startSpy = gameEngine.start = sinon.fake();
      gameEngine.changePausedState(false);
      assert(startSpy.called);
    });
  });

  describe('updateFpsDisplay', () => {
    it('updates the FPS display if more than one second has passed', () => {
      gameEngine.framesThisSecond = maxFps;

      gameEngine.updateFpsDisplay(1001);
      assert.strictEqual(gameEngine.fps, maxFps);
      assert.strictEqual(gameEngine.lastFpsUpdate, 1001);
      assert.strictEqual(gameEngine.framesThisSecond, 1);
      assert.strictEqual(gameEngine.fpsDisplay.textContent, '120 FPS');
    });

    it('calculates the FPS display as an average', () => {
      gameEngine.framesThisSecond = 60;

      gameEngine.updateFpsDisplay(1001);
      assert.strictEqual(gameEngine.fps, 90);
      assert.strictEqual(gameEngine.lastFpsUpdate, 1001);
      assert.strictEqual(gameEngine.framesThisSecond, 1);
      assert.strictEqual(gameEngine.fpsDisplay.textContent, '90 FPS');
    });

    it('doesn\'t update the FPS until a second has passed', () => {
      gameEngine.framesThisSecond = 60;

      gameEngine.updateFpsDisplay(1000);
      assert.strictEqual(gameEngine.fps, 120);
      assert.strictEqual(gameEngine.lastFpsUpdate, 0);
      assert.strictEqual(gameEngine.framesThisSecond, 61);
      assert.strictEqual(gameEngine.fpsDisplay.textContent, '120 FPS');
    });
  });

  describe('draw', () => {
    it('calls the DRAW function for each entity', () => {
      const drawSpy1 = sinon.fake();
      const drawSpy2 = sinon.fake();
      const entityList = [
        { draw: drawSpy1 },
        { draw: drawSpy2 },
      ];

      gameEngine.draw(50, entityList);
      assert(drawSpy1.calledWith(50));
      assert(drawSpy2.calledWith(50));
    });

    it('won\'t crash if the DRAW property is not a function', () => {
      const entityList = [
        { draw: 123 },
        {},
      ];

      gameEngine.draw(50, entityList);
    });
  });

  describe('update', () => {
    it('calls the UPDATE function for each entity', () => {
      const updateSpy1 = sinon.fake();
      const updateSpy2 = sinon.fake();
      const entityList = [
        { update: updateSpy1 },
        { update: updateSpy2 },
      ];

      gameEngine.update(100, entityList);
      assert(updateSpy1.calledWith(100));
      assert(updateSpy2.calledWith(100));
    });

    it('won\'t crash if the UPDATE property is not a function', () => {
      const entityList = [
        { update: 123 },
        {},
      ];

      gameEngine.update(50, entityList);
    });
  });

  describe('panic', () => {
    it('resets the elapsedMs value to zero', () => {
      gameEngine.elapsedMs = 100;
      gameEngine.panic();
      assert.strictEqual(gameEngine.elapsedMs, 0);
    });
  });

  describe('start', () => {
    it('calls the mainLoop function to start the engine', () => {
      const mainLoopSpy = gameEngine.mainLoop = sinon.fake();
      const drawSpy = gameEngine.draw = sinon.fake();

      gameEngine.started = false;
      gameEngine.start();
      assert(gameEngine.started);
      assert(drawSpy.called);
      assert(gameEngine.running);
      assert.strictEqual(gameEngine.lastFrameTimeMs, 1000);
      assert.strictEqual(gameEngine.lastFpsUpdate, 1000);
      assert.strictEqual(gameEngine.framesThisSecond, 0);
      assert(mainLoopSpy.called);
    });

    it('doesn\'t call the mainLoop again once the engine starts', () => {
      const mainLoopSpy = gameEngine.mainLoop = sinon.fake();

      gameEngine.started = true;
      gameEngine.start();
      assert(mainLoopSpy.notCalled);
    });
  });

  describe('stop', () => {
    it('stops the engine and cancels the current animation frame', () => {
      const cancelSpy = global.cancelAnimationFrame = sinon.fake();

      gameEngine.running = true;
      gameEngine.started = true;
      gameEngine.stop();
      assert(!gameEngine.running);
      assert(!gameEngine.started);
      assert(cancelSpy.called);
    });
  });

  describe('processFrames', () => {
    it('calls the update function once per queued timestep', () => {
      const updateSpy = gameEngine.update = sinon.fake();

      gameEngine.elapsedMs = 3;
      gameEngine.timestep = 1;
      gameEngine.processFrames();
      assert(updateSpy.calledThrice);
    });

    it('calls the panic function if blocked for over a second', () => {
      const updateSpy = gameEngine.update = sinon.fake();
      const panicSpy = gameEngine.panic = sinon.fake();

      gameEngine.elapsedMs = (gameEngine.maxFps * gameEngine.timestep) + 1;
      gameEngine.processFrames();
      assert.strictEqual(updateSpy.callCount, gameEngine.maxFps);
      assert(panicSpy.called);
    });
  });

  describe('engineCycle', () => {
    it('won\'t call functions until a timestep passes', () => {
      const mainLoopSpy = gameEngine.mainLoop = sinon.fake();
      const updateFpsDisplaySpy = gameEngine.updateFpsDisplay = sinon.fake();
      const processFramesSpy = gameEngine.processFrames = sinon.fake();
      const drawSpy = gameEngine.draw = sinon.fake();
      gameEngine.elapsedMs = 10000;
      gameEngine.lastFrameTimeMs = 9000;

      gameEngine.engineCycle(0);
      assert(mainLoopSpy.called);
      assert(!updateFpsDisplaySpy.called);
      assert(!processFramesSpy.called);
      assert(!drawSpy.called);
      assert.strictEqual(gameEngine.elapsedMs, 10000);
      assert.strictEqual(gameEngine.lastFrameTimeMs, 9000);
    });

    it('calls functions after a timestep passes', () => {
      const mainLoopSpy = gameEngine.mainLoop = sinon.fake();
      const updateFpsDisplaySpy = gameEngine.updateFpsDisplay = sinon.fake();
      const processFramesSpy = gameEngine.processFrames = sinon.fake();
      const drawSpy = gameEngine.draw = sinon.fake();
      gameEngine.elapsedMs = 10000;
      gameEngine.lastFrameTimeMs = 9000;

      gameEngine.engineCycle(11000);
      assert(mainLoopSpy.called);
      assert(updateFpsDisplaySpy.called);
      assert(processFramesSpy.called);
      assert(drawSpy.called);
      assert.strictEqual(gameEngine.elapsedMs, 12000);
      assert.strictEqual(gameEngine.lastFrameTimeMs, 11000);
    });
  });

  describe('mainLoop', () => {
    it('calls the engineCycle function with a timestamp', () => {
      const engineCycleSpy = gameEngine.engineCycle = sinon.fake();

      gameEngine.mainLoop(1000);
      assert(engineCycleSpy.calledWith(1000));
    });
  });
});
