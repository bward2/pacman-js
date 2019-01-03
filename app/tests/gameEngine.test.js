const assert = require('assert');
const sinon = require('sinon');
const GameEngine = require('../scripts/core/gameEngine');

let gameEngine;

beforeEach(()=> {
    global.document = {
        getElementById: ()=> { return; }
    };

    global.window = {
        addEventListener: ()=> { return; }
    };

    gameEngine = new GameEngine();
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
});