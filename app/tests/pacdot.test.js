const assert = require('assert');
const Pacdot = require('../scripts/pickups/pacdot');

let pacdot;

beforeEach(()=> {
    global.document = {
        createElement: ()=> {
            return {
                classList: {
                    add: ()=> { return; }
                },
                style: {}
            };
        }
    };

    const pacman = {
        position: {
            top: 10,
            left: 10
        },
        measurement: 16
    };

    const mazeDiv = {
        appendChild: ()=> { return; }
    }

    pacdot = new Pacdot(8, 1, 1, pacman, mazeDiv);
});

describe('pacdot', ()=> {
    describe('checkForCollision', ()=> {
        it('should return TRUE if the Pacdot is contained within Pacman\'s dimensions', ()=> {
            assert.strictEqual(pacdot.checkForCollision(1, 1, 1, 0, 0, 10), true);
        });

        it('should return FALSE if the Pacdot is not touching the Pacman object', ()=> {
            assert.strictEqual(pacdot.checkForCollision(0, 0, 1, 10, 10, 10), false);
        });

        it('should return FALSE if the Pacdot is only partially overlapping Pacman', ()=> {
            assert.strictEqual(pacdot.checkForCollision(0, 0, 5, 1, 1, 10), false);
        });
    });
});