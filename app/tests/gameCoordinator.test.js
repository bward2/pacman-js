const assert = require('assert');
const sinon = require('sinon');
const GameCoordinator = require('../scripts/core/gameCoordinator');

let gameCoordinator;

beforeEach(()=> {
    global.Pacman = class {};
    global.CharacterUtil = class {};
    global.Ghost = class {};
    global.Pacdot = class {};
    global.GameEngine = class {
        start() { return; }
    };

    global.document = {
        getElementById: ()=> {
            return {
                appendChild: ()=> { return; }
            };
         },
        createElement: ()=> {
            return {
                classList: {
                    add: ()=> { return; }
                },
                appendChild: ()=> { return; },
                style: {}
            };
        }
    };

    gameCoordinator = new GameCoordinator();
});

