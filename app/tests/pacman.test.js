const assert = require('assert');
const Pacman = require('../scripts/characters/pacman');
const CharacterUtil = require('../scripts/utilities/characterUtil');

const scaledTileSize = 8;

let pacman;

beforeEach(() => {
    global.document = {
        getElementById: () => {
            return {
                style: {}
            };
        }
    };
    
    global.window = {
        addEventListener: () => {
            return true;
        }
    };

    pacman = new Pacman(scaledTileSize, undefined, new CharacterUtil());
});

describe('pacman', () => {
    describe('setStyleMeasurements', () => {
        it('should set pacman\'s measurement, height, width, and backgroundSize properties', () => {
            pacman.animationTarget.style = {};
            pacman.setStyleMeasurements(scaledTileSize, 4);
            assert.strictEqual(pacman.measurement, 16);
            assert.deepEqual(pacman.animationTarget.style, {
                height: '16px',
                width: '16px',
                backgroundSize: '64px'
            });
        });

        it('should always set pacman\'s measurement to the scaledTileSize times two', () => {
            pacman.setStyleMeasurements(1);
            assert.strictEqual(pacman.measurement, 2);

            pacman.setStyleMeasurements(8);
            assert.strictEqual(pacman.measurement, 16);

            pacman.setStyleMeasurements(1000);
            assert.strictEqual(pacman.measurement, 2000);
        });

        it('should always set pacman\'s backgroundSize to the scaledTileSize times eight', () => {
            pacman.setStyleMeasurements(1, 4);
            assert.strictEqual(pacman.animationTarget.style.backgroundSize, '8px');

            pacman.setStyleMeasurements(8, 4);
            assert.strictEqual(pacman.animationTarget.style.backgroundSize, '64px');

            pacman.setStyleMeasurements(1000, 4);
            assert.strictEqual(pacman.animationTarget.style.backgroundSize, '8000px');
        });
    });

    describe('setSpriteAnimationStats', () => {
        it('should set various stats for pacman\'s sprite animation', () => {
            pacman.setSpriteAnimationStats();

            assert.strictEqual(pacman.msBetweenSprites, 50);
            assert.strictEqual(pacman.msSinceLastSprite, 0);
            assert.strictEqual(pacman.spriteFrames, 4);
            assert.strictEqual(pacman.backgroundOffsetPixels, 0);
        });
    });

    describe('setDefaultPosition', () => {
        it('should set the position and oldPosition with top and left properties', () => {
            pacman.setDefaultPosition(scaledTileSize);

            assert.deepEqual(pacman.position, {
                left: 104,
                top: 180
            });
            assert.deepEqual(pacman.position, pacman.oldPosition);
        });
    });

    describe('calculateVelocityPerMs', () => {
        it('should return the input multiplied by 11, then divided by 1000', ()=> {
            assert.strictEqual(pacman.calculateVelocityPerMs(8), 0.088);
            assert.strictEqual(pacman.calculateVelocityPerMs(64), 0.704);
            assert.strictEqual(pacman.calculateVelocityPerMs(200), 2.2);
        });
    });

    describe('setSpriteSheet', ()=> {
        it('should set the correct spritesheet for any given direction', ()=> {
            pacman.setSpriteSheet('up');
            assert.strictEqual(pacman.animationTarget.style.backgroundImage, 'url(app/style/graphics/spriteSheets/characters/pacman/pacman_up.svg)');
            pacman.setSpriteSheet('down');
            assert.strictEqual(pacman.animationTarget.style.backgroundImage, 'url(app/style/graphics/spriteSheets/characters/pacman/pacman_down.svg)');
            pacman.setSpriteSheet('left');
            assert.strictEqual(pacman.animationTarget.style.backgroundImage, 'url(app/style/graphics/spriteSheets/characters/pacman/pacman_left.svg)');
            pacman.setSpriteSheet('right');
            assert.strictEqual(pacman.animationTarget.style.backgroundImage, 'url(app/style/graphics/spriteSheets/characters/pacman/pacman_right.svg)');
        });
    });
});