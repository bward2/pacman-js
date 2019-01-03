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