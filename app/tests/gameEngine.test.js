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
});