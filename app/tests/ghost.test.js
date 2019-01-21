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

    ghost = new Ghost(scaledTileSize, undefined, pacman, 'blinky', new CharacterUtil());
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
});