const assert = require('assert');
const sinon = require('sinon');
const GameEngine = require('../scripts/core/gameEngine');

let gameEngine;
const maxFps = 120;

beforeEach(()=> {
    global.document = {
        getElementById: ()=> {
            return {};
        }
    };

    global.window = {
        addEventListener: ()=> { return; }
    };

    global.requestAnimationFrame = (callback)=> {
        callback(1000);
    }

    gameEngine = new GameEngine(maxFps);
});

describe('gameEngine', ()=> {
    describe('changePausedState', ()=> {
        let stopSpy, startSpy;

        beforeEach(()=> {
            stopSpy = sinon.fake();
            startSpy = sinon.fake();

            gameEngine.stop = stopSpy;
            gameEngine.start = startSpy;
        });

        it('should pause the game if it is running', ()=> {
            gameEngine.changePausedState(true);
            assert(stopSpy.called);
        });

        it('should resume the game if it is paused', ()=> {
            gameEngine.changePausedState(false);
            assert(startSpy.called);
        });
    });

    describe('updateFpsDisplay', ()=> {
        it('should update the FPS display if more than one second has passed since the last update', ()=> {
            gameEngine.framesThisSecond = maxFps;

            gameEngine.updateFpsDisplay(1001);
            assert.strictEqual(gameEngine.fps, maxFps);
            assert.strictEqual(gameEngine.lastFpsUpdate, 1001);
            assert.strictEqual(gameEngine.framesThisSecond, 1);
            assert.strictEqual(gameEngine.fpsDisplay.textContent, '120 FPS');
        });

        it('should calculate the FPS display as the average of the last second and current second\'s FPS', ()=> {
            gameEngine.framesThisSecond = 60;

            gameEngine.updateFpsDisplay(1001);
            assert.strictEqual(gameEngine.fps, 90);
            assert.strictEqual(gameEngine.lastFpsUpdate, 1001);
            assert.strictEqual(gameEngine.framesThisSecond, 1);
            assert.strictEqual(gameEngine.fpsDisplay.textContent, '90 FPS');
        });

        it('should not update the FPS until more than one second has passed', ()=> {
            gameEngine.framesThisSecond = 60;

            gameEngine.updateFpsDisplay(1000);
            assert.strictEqual(gameEngine.fps, 120);
            assert.strictEqual(gameEngine.lastFpsUpdate, 0);
            assert.strictEqual(gameEngine.framesThisSecond, 61);
            assert.strictEqual(gameEngine.fpsDisplay.textContent, '120 FPS');
        });
    });

    describe('draw', ()=> {
        it('should call the DRAW function and pass in the interp value for every member of the given entity list', ()=> {
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
    });

    describe('update', ()=> {
        it('should call the UPDATE function and pass in the elapsedMs value for every member of the given entity list', ()=> {
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
    });

    describe('panic', ()=> {
        it('resets the elapsedMs value to zero', ()=> {
            gameEngine.elapsedMs = 100;
            gameEngine.panic();
            assert.strictEqual(gameEngine.elapsedMs, 0);
        });
    });

    describe('start', ()=> {
        it('calls the mainLoop function if the engine is not currently running', ()=> {
            const mainLoopSpy = sinon.fake();
            const drawSpy = sinon.fake();
            gameEngine.mainLoop = mainLoopSpy;
            gameEngine.draw = drawSpy;

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

        it('does not call the mainLoop function once the engine is already running', ()=> {
            const mainLoopSpy = sinon.fake();
            gameEngine.mainLoop = mainLoopSpy;

            gameEngine.started = true;
            gameEngine.start();
            assert(mainLoopSpy.notCalled);
        });
    });

    describe('stop', ()=> {
        it('stops the engine and cancels the current animation frame', ()=> {
            const cancelSpy = sinon.fake();
            global.cancelAnimationFrame = cancelSpy;

            gameEngine.running = true;
            gameEngine.started = true;
            gameEngine.stop();
            assert(!gameEngine.running);
            assert(!gameEngine.started);
            assert(cancelSpy.called);
        });
    });

    describe('processFrames', ()=> {
        it('calls the update function once per timestep passed since the last update', ()=> {
            const updateSpy = sinon.fake();
            gameEngine.update = updateSpy;

            gameEngine.elapsedMs = 3;
            gameEngine.timestep = 1;
            gameEngine.processFrames();
            assert(updateSpy.calledThrice);
        });

        it('calls the panic function and stops calling update if more than a second\'s worth of frames have elapsed', ()=> {
            const updateSpy = sinon.fake();
            const panicSpy = sinon.fake();
            gameEngine.update = updateSpy;
            gameEngine.panic = panicSpy;

            gameEngine.elapsedMs = (gameEngine.maxFps * gameEngine.timestep) + 1;
            gameEngine.processFrames();
            assert.strictEqual(updateSpy.callCount, gameEngine.maxFps);
            assert(panicSpy.called);
        });
    });

    describe('engineCycle', ()=> {
        it('will not call updateFpsDisplay, processFrames, or draw if less than one timestep has passed since the last update', ()=> {
            const mainLoopSpy = sinon.fake();
            const updateFpsDisplaySpy = sinon.fake();
            const processFramesSpy = sinon.fake();
            const drawSpy = sinon.fake();
            gameEngine.mainLoop = mainLoopSpy;
            gameEngine.updateFpsDisplay = updateFpsDisplaySpy;
            gameEngine.processFrames = processFramesSpy;
            gameEngine.draw = drawSpy;
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

        it('will call updateFpsDisplay, processFrames, or draw if more than one timestep has passed since the last update', ()=> {
            const mainLoopSpy = sinon.fake();
            const updateFpsDisplaySpy = sinon.fake();
            const processFramesSpy = sinon.fake();
            const drawSpy = sinon.fake();
            gameEngine.mainLoop = mainLoopSpy;
            gameEngine.updateFpsDisplay = updateFpsDisplaySpy;
            gameEngine.processFrames = processFramesSpy;
            gameEngine.draw = drawSpy;
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

    describe('mainLoop', ()=> {
        it('calls the engineCycle function with a timestamp', ()=> {
            const engineCycleSpy = sinon.fake();
            gameEngine.engineCycle = engineCycleSpy;

            gameEngine.mainLoop(1000);
            assert(engineCycleSpy.calledWith(1000));
        });
    });
});