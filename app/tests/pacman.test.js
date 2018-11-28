const assert = require('assert');
const Pacman = require('../scripts/characters/pacman');

const scaledTileSize = 8;

global.document = {
    getElementById: () => {
        return {
            style: {}
        };
    }
}

global.window = {
    addEventListener: () => {
        return true;
    }
};

let pacman;

beforeEach(() => {
    pacman = new Pacman(scaledTileSize);
});

describe('pacman', () => {
    describe('setStyleMeasurements', () => {
        it('should set pacman\'s measurement, height, width, and backgroundSize properties', () => {
            pacman.animationTarget.style = {};
            pacman.setStyleMeasurements(scaledTileSize);
            assert.equal(pacman.measurement, 16);
            assert.deepEqual(pacman.animationTarget.style, {
                height: '16px',
                width: '16px',
                backgroundSize: '64px'
            });
        });

        it('should always set pacman\'s measurement to the scaledTileSize times two', () => {
            pacman.setStyleMeasurements(1);
            assert.equal(pacman.measurement, 2);

            pacman.setStyleMeasurements(8);
            assert.equal(pacman.measurement, 16);

            pacman.setStyleMeasurements(1000);
            assert.equal(pacman.measurement, 2000);
        });

        it('should always set pacman\'s backgroundSize to the scaledTileSize times eight', () => {
            pacman.setStyleMeasurements(1);
            assert.equal(pacman.animationTarget.style.backgroundSize, '8px');

            pacman.setStyleMeasurements(8);
            assert.equal(pacman.animationTarget.style.backgroundSize, '64px');

            pacman.setStyleMeasurements(1000);
            assert.equal(pacman.animationTarget.style.backgroundSize, '8000px');
        });
    });

    describe('setSpriteAnimationStats', () => {
        it('should set various stats for pacman\'s sprite animation', () => {
            pacman.setSpriteAnimationStats();

            assert.equal(pacman.msBetweenSprites, 100);
            assert.equal(pacman.msSinceLastSprite, 0);
            assert.equal(pacman.spriteFrames, 4);
            assert.equal(pacman.backgroundOffsetPixels, 0);
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
            assert.equal(pacman.calculateVelocityPerMs(8), 0.088);
            assert.equal(pacman.calculateVelocityPerMs(64), 0.704);
            assert.equal(pacman.calculateVelocityPerMs(200), 2.2);
        });
    });
});