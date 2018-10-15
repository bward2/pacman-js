const assert = require('assert');
const pacman = require('../scripts/characters/pacman');

const myPacman = new pacman();

describe('pacman', () => {
    describe('startAnimation', ()=> {
        it('should kick off the animationInterval', ()=> {
            console.log(myPacman.test);
            assert.equal(myPacman.startAnimation(), 'abc');
        });
    });
});