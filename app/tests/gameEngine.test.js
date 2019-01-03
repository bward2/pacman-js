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
});