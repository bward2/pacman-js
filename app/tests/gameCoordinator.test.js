const assert = require('assert');
const sinon = require('sinon');
const GameCoordinator = require('../scripts/core/gameCoordinator');

let gameCoordinator;
const mazeArray = [
    ['X','X','X'],
    ['X','o',' '],
    ['X',' ','X'],
];

describe('gameCoordinator', ()=> {
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

    describe('drawMaze', ()=> {
        it('creates the maze and adds entities for a given maze array', ()=> {
            let entityList = [];
            gameCoordinator.drawMaze(mazeArray, entityList);
            assert.strictEqual(entityList.length, 1);
        });
    });
});