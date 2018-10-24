const assert = require('assert');
const Pacman = require('../scripts/characters/pacman');

const scaledTileSize = 8;
const maxFps = 60;

global.document = {
    getElementById: () => {
        return {
            style: {}
        };
    }
}

let pacman;

beforeEach(() => {
    pacman = new Pacman(scaledTileSize, maxFps);
});

describe('pacman', () => {
    describe('setStyleMeasurements', () => {
        it('should set pacman\'s measurement, height, width, and backgroundSize properties', () => {
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

    describe('calculateVelocityPerMs', () => {
        it('should return the correct pixel-velocity per ms for a given tilesize and fps', ()=> {
            assert.equal(pacman.calculateVelocityPerMs(scaledTileSize, maxFps), 0.08799999999999998);
        });
    });
});