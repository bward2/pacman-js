const assert = require('assert');
const Pacman = require('../scripts/characters/pacman');

const pacman = new Pacman();

describe('pacman', () => {
    describe('startAnimation', ()=> {
        it('should kick off the animationInterval', ()=> {
            assert.equal(pacman.animationInterval, undefined);
            pacman.startAnimation();
            assert.notEqual(pacman.animationInterval, undefined);
        });
    });
});