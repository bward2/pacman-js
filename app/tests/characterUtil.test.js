const assert = require('assert');
const CharacterUtil = require('../scripts/utilities/characterUtil');

let characterUtil;

beforeEach(() => {
    characterUtil = new CharacterUtil();
});

describe('characterUtil', () => {
    describe('checkForStutter', ()=> {
        const oldPosition = { top: 0, left: 0 };

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
        it('should return a positive number if the character\'s direction is down or right', ()=> {
            assert.strictEqual(characterUtil.getVelocity('down', 100), 100);
            assert.strictEqual(characterUtil.getVelocity('right', 100), 100);
        });

        it('should return a negative number if the character\'s direction is up or left', ()=> {
            assert.strictEqual(characterUtil.getVelocity('up', 100), -100);
            assert.strictEqual(characterUtil.getVelocity('left', 100), -100);
        });
    });
});