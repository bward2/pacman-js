const assert = require('assert');
const CharacterUtil = require('../scripts/utilities/characterUtil');

let characterUtil;
const oldPosition = { top: 0, left: 0 };
const position = { top: 10, left: 100 };
const scaledTileSize = 8;

beforeEach(() => {
    characterUtil = new CharacterUtil();
});

describe('characterUtil', () => {
    describe('checkForStutter', ()=> {
        it('should return VISIBLE if the character has moved five tiles or less in any direction', ()=> {
            assert.strictEqual(characterUtil.checkForStutter(oldPosition, { top: 0, left: 0 }), 'visible');
            assert.strictEqual(characterUtil.checkForStutter(oldPosition, { top: 0, left: 5 }), 'visible');
            assert.strictEqual(characterUtil.checkForStutter(oldPosition, { top: 5, left: 0 }), 'visible');
            assert.strictEqual(characterUtil.checkForStutter(oldPosition, { top: 5, left: 5 }), 'visible');
        });

        it('should return HIDDEN if the character has moved more than five tiles in any direction', ()=> {
            assert.strictEqual(characterUtil.checkForStutter(oldPosition, { top: 0, left: 6 }), 'hidden');
            assert.strictEqual(characterUtil.checkForStutter(oldPosition, { top: 0, left: -6 }), 'hidden');
            assert.strictEqual(characterUtil.checkForStutter(oldPosition, { top: 6, left: 0 }), 'hidden');
            assert.strictEqual(characterUtil.checkForStutter(oldPosition, { top: -6, left: 0 }), 'hidden');
        });

        it('should return VISIBLE by default if either param is missing', ()=> {
            assert.strictEqual(characterUtil.checkForStutter(), 'visible');
        });
    });

    describe('getPropertyToChange', ()=> {
        it('should return TOP if the character is moving UP or DOWN', ()=> {
            assert.strictEqual(characterUtil.getPropertyToChange('up'), 'top');
            assert.strictEqual(characterUtil.getPropertyToChange('down'), 'top');
        });

        it('should return LEFT if the character is moving LEFT or RIGHT', ()=> {
            assert.strictEqual(characterUtil.getPropertyToChange('left'), 'left');
            assert.strictEqual(characterUtil.getPropertyToChange('right'), 'left');
        });

        it('should return LEFT by default', ()=> {
            assert.strictEqual(characterUtil.getPropertyToChange(), 'left');
        });
    });

    describe('getVelocity', ()=> {
        it('should return a positive number if the character\'s direction is DOWN or RIGHT', ()=> {
            assert.strictEqual(characterUtil.getVelocity('down', 100), 100);
            assert.strictEqual(characterUtil.getVelocity('right', 100), 100);
        });

        it('should return a negative number if the character\'s direction is UP or LEFT', ()=> {
            assert.strictEqual(characterUtil.getVelocity('up', 100), -100);
            assert.strictEqual(characterUtil.getVelocity('left', 100), -100);
        });
    });

    describe('calculateNewDrawValue', ()=> {
        it('should calculate a new value given all parameters', ()=> {
            assert.strictEqual(characterUtil.calculateNewDrawValue(1, 'top', oldPosition, position), 10);
            assert.strictEqual(characterUtil.calculateNewDrawValue(1, 'left', oldPosition, position), 100);
        });

        it('should factor in interp when calculating the new value', ()=> {
            assert.strictEqual(characterUtil.calculateNewDrawValue(0.5, 'top', oldPosition, position), 5);
            assert.strictEqual(characterUtil.calculateNewDrawValue(0.5, 'left', oldPosition, position), 50);
        });
    });

    describe('determineGridPosition', ()=> {
        it('should return an x-y object given a valid position', ()=> {
            assert.deepEqual(characterUtil.determineGridPosition(oldPosition, scaledTileSize), { x: 0.5, y: 0.5 });
            assert.deepEqual(characterUtil.determineGridPosition(position, scaledTileSize), { x: 13, y: 1.75 });
        });
    });

    describe('turningAround', ()=> {
        it('should return TRUE if a character\'s direction and desired direction are opposites', ()=> {
            assert.strictEqual(characterUtil.turningAround('up', 'down'), true);
            assert.strictEqual(characterUtil.turningAround('down', 'up'), true);
            assert.strictEqual(characterUtil.turningAround('left', 'right'), true);
            assert.strictEqual(characterUtil.turningAround('right', 'left'), true);
        });

        it('should return FALSE if a character is continuing straight or turning to the side', ()=> {
            assert.strictEqual(characterUtil.turningAround('up', 'up'), false);
            assert.strictEqual(characterUtil.turningAround('up', 'left'), false);
            assert.strictEqual(characterUtil.turningAround('up', 'right'), false);
        });
    });
});