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
            assert.equal(characterUtil.checkForStutter(oldPosition, { top: 0, left: 0 }), 'visible');
            assert.equal(characterUtil.checkForStutter(oldPosition, { top: 0, left: 5 }), 'visible');
            assert.equal(characterUtil.checkForStutter(oldPosition, { top: 5, left: 0 }), 'visible');
            assert.equal(characterUtil.checkForStutter(oldPosition, { top: 5, left: 5 }), 'visible');
        });

        it('should return HIDDEN if the character has moved more than five tiles in any direction', ()=> {
            assert.equal(characterUtil.checkForStutter(oldPosition, { top: 0, left: 6 }), 'hidden');
            assert.equal(characterUtil.checkForStutter(oldPosition, { top: 0, left: -6 }), 'hidden');
            assert.equal(characterUtil.checkForStutter(oldPosition, { top: 6, left: 0 }), 'hidden');
            assert.equal(characterUtil.checkForStutter(oldPosition, { top: -6, left: 0 }), 'hidden');
        });

        it('should return VISIBLE by default if either param is missing', ()=> {
            assert.equal(characterUtil.checkForStutter(), 'visible');
        });
    });

    describe('getPropertyToChange', ()=> {
        it('should return TOP if the character is moving UP or DOWN', ()=> {
            assert.equal(characterUtil.getPropertyToChange('up'), 'top');
            assert.equal(characterUtil.getPropertyToChange('down'), 'top');
        });

        it('should return LEFT if the character is moving LEFT or RIGHT', ()=> {
            assert.equal(characterUtil.getPropertyToChange('left'), 'left');
            assert.equal(characterUtil.getPropertyToChange('right'), 'left');
        });

        it('should return LEFT by default', ()=> {
            assert.equal(characterUtil.getPropertyToChange(), 'left');
        });
    });
});