const assert = require('assert');
const CharacterUtil = require('../scripts/utilities/characterUtil');

let characterUtil;

beforeEach(() => {
    characterUtil = new CharacterUtil();
});

describe('characterUtil', () => {
    describe('checkForStutter', ()=> {
        const oldPosition = { top: 0, left: 0 };

        it('should return VISIBLE if the character has moved less than five tiles', ()=> {
            assert.equal(characterUtil.checkForStutter(oldPosition, { top: 1, left: 1 }), 'visible');
        });
    });
});