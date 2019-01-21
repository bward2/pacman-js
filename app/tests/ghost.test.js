const assert = require('assert');
const sinon = require('sinon');
const Ghost = require('../scripts/characters/ghost');
const CharacterUtil = require('../scripts/utilities/characterUtil');

const scaledTileSize = 8;

let pacman;
let ghost;

beforeEach(()=> {
    global.document = {
        getElementById: () => {
            return {
                style: {}
            };
        }
    };

    pacman = {
        velocityPerMs: 1,
        moving: true,
        position: {
            top: 100,
            left: 100
        }
    };

    ghost = new Ghost(scaledTileSize, undefined, pacman, undefined, new CharacterUtil());
});

describe('ghost', ()=> {
    describe('setMovementStats', ()=> {
        it('should set the ghost\'s various speeds, velocity, direction, and movement', ()=> {
            ghost.setMovementStats(pacman);
            assert.strictEqual(ghost.slowSpeed, 0.75);
            assert.strictEqual(ghost.mediumSpeed, 0.90);
            assert.strictEqual(ghost.fastSpeed, 1.05);
            assert.strictEqual(ghost.chasedSpeed, 0.5);
            assert.strictEqual(ghost.tunnelSpeed, 0.5);
            assert.strictEqual(ghost.eyeSpeed, 3);
            assert.strictEqual(ghost.velocityPerMs, 0.75);
            assert.strictEqual(ghost.direction, 'left');
            assert.strictEqual(ghost.moving, false);
        });
    });
    
    describe('setSpriteAnimationStats', ()=> {
        it('should set various stats for the ghost\'s sprite animation', () => {
            ghost.setSpriteAnimationStats();
    
            assert.strictEqual(ghost.msBetweenSprites, 250);
            assert.strictEqual(ghost.msSinceLastSprite, 0);
            assert.strictEqual(ghost.spriteFrames, 2);
            assert.strictEqual(ghost.backgroundOffsetPixels, 0);
        });
    });
    
    describe('setStyleMeasurements', ()=> {
        it('should set the ghost\'s measurement, height, width, and backgroundSize properties', ()=> {
            ghost.animationTarget.style = {};
            ghost.setStyleMeasurements(scaledTileSize, 2);
            assert.strictEqual(ghost.measurement, 16);
            assert.deepEqual(ghost.animationTarget.style, {
                height: '16px',
                width: '16px',
                backgroundSize: '32px'
            });
        });
    });

    describe('setDefaultPosition', ()=> {
        it('should set the correct position for blinky', ()=> {
            ghost.setDefaultPosition(scaledTileSize, 'blinky');
            assert.deepEqual(ghost.position, { top: 84, left: 104 });
            assert.deepEqual(ghost.oldPosition, { top: 84, left: 104 });
            assert.strictEqual(ghost.animationTarget.style.top, '84px');
            assert.strictEqual(ghost.animationTarget.style.left, '104px');
        });

        it('should set the correct default position if the name is missing', ()=> {
            ghost.setDefaultPosition(scaledTileSize, undefined);
            assert.deepEqual(ghost.position, { top: 0, left: 0 });
            assert.deepEqual(ghost.oldPosition, { top: 0, left: 0 });
            assert.strictEqual(ghost.animationTarget.style.top, '0px');
            assert.strictEqual(ghost.animationTarget.style.left, '0px');
        });
    });

    describe('setSpriteSheet', ()=> {
        it('should set the correct spritesheet for any given direction', ()=> {
            ghost.setSpriteSheet('blinky', 'up');
            assert.strictEqual(ghost.animationTarget.style.backgroundImage, 'url(app/style/graphics/spriteSheets/characters/ghosts/blinky/blinky_up.svg)');
            ghost.setSpriteSheet('blinky', 'down');
            assert.strictEqual(ghost.animationTarget.style.backgroundImage, 'url(app/style/graphics/spriteSheets/characters/ghosts/blinky/blinky_down.svg)');
            ghost.setSpriteSheet('blinky', 'left');
            assert.strictEqual(ghost.animationTarget.style.backgroundImage, 'url(app/style/graphics/spriteSheets/characters/ghosts/blinky/blinky_left.svg)');
            ghost.setSpriteSheet('blinky', 'right');
            assert.strictEqual(ghost.animationTarget.style.backgroundImage, 'url(app/style/graphics/spriteSheets/characters/ghosts/blinky/blinky_right.svg)');
        });
    });

    describe('isInTunnel', ()=> {
        it('should return TRUE if the ghost is in either the left or right warp tunnel', ()=> {
            assert(ghost.isInTunnel({ x:0, y:14 }));
            assert(ghost.isInTunnel({ x:30, y:14 }));
        });

        it('should return FALSE if the ghost is away from the warp tunnels', ()=> {
            assert(!ghost.isInTunnel({ x:15, y:14 }));
            assert(!ghost.isInTunnel({ x:0, y:0 }));
        });
    });
});