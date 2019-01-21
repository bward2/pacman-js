const assert = require('assert');
const CharacterUtil = require('../scripts/utilities/characterUtil');

let characterUtil;
const oldPosition = { top: 0, left: 0 };
const position = { top: 10, left: 100 };
const mazeArray = [
    ['X','X','X'],
    ['X',' ',' '],
    ['X',' ','X'],
];
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
            assert(characterUtil.turningAround('up', 'down'));
            assert(characterUtil.turningAround('down', 'up'));
            assert(characterUtil.turningAround('left', 'right'));
            assert(characterUtil.turningAround('right', 'left'));
        });

        it('should return FALSE if a character is continuing straight or turning to the side', ()=> {
            assert(!characterUtil.turningAround('up', 'up'));
            assert(!characterUtil.turningAround('up', 'left'));
            assert(!characterUtil.turningAround('up', 'right'));
        });
    });

    describe('getOppositeDirection', ()=> {
        it('should return the opposite of any given direction', ()=> {
            assert.strictEqual(characterUtil.getOppositeDirection('up'), 'down');
            assert.strictEqual(characterUtil.getOppositeDirection('down'), 'up');
            assert.strictEqual(characterUtil.getOppositeDirection('left'), 'right');
            assert.strictEqual(characterUtil.getOppositeDirection('right'), 'left');
        });
    });

    describe('determineRoundingFunction', ()=> {
        it('should return MATH.FLOOR if the character\s direction is UP or LEFT', ()=> {
            assert.strictEqual(characterUtil.determineRoundingFunction('up'), Math.floor);
            assert.strictEqual(characterUtil.determineRoundingFunction('left'), Math.floor);
        });

        it('should return MATH.CEIL if the character\s direction is DOWN or RIGHT', ()=> {
            assert.strictEqual(characterUtil.determineRoundingFunction('down'), Math.ceil);
            assert.strictEqual(characterUtil.determineRoundingFunction('right'), Math.ceil);
        });
    });

    describe('changingGridPosition', ()=> {
        it('should return TRUE if the character is about to move to a new grid position on the maze', ()=> {
            assert(characterUtil.changingGridPosition({x:0, y:0}, {x:0, y:1}));
            assert(characterUtil.changingGridPosition({x:0, y:0}, {x:1, y:0}));
            assert(characterUtil.changingGridPosition({x:0, y:0}, {x:1, y:1}));
        });

        it('should return FALSE if the character will remain on the same maze tile', ()=> {
            assert(!characterUtil.changingGridPosition({x:0, y:0}, {x:0, y:0}));
            assert(!characterUtil.changingGridPosition({x:0, y:0}, {x:0.1, y:0.9}));
        });
    });

    describe('checkForWallCollision', ()=> {
        it('should return TRUE if the character is about to run into a wall', ()=> {
            assert(characterUtil.checkForWallCollision({x:0, y:1}, mazeArray, 'left'));
            assert(characterUtil.checkForWallCollision({x:1, y:0}, mazeArray, 'up'));
        });

        it('should return FALSE if the character is running to an unobstructed tile', ()=> {
            assert(!characterUtil.checkForWallCollision({x:2, y:1}, mazeArray, 'right'));
            assert(!characterUtil.checkForWallCollision({x:1, y:2}, mazeArray, 'down'));
            assert(!characterUtil.checkForWallCollision({x:1, y:1}, mazeArray, 'left'));
            assert(!characterUtil.checkForWallCollision({x:1, y:1}, mazeArray, 'up'));
        });

        it('should return FALSE if the character is moving to a tile outside of the maze', ()=> {
            assert(!characterUtil.checkForWallCollision({x:-1, y:-1}, mazeArray, 'right'));
            assert(!characterUtil.checkForWallCollision({x:Infinity, y:Infinity}, mazeArray, 'right'));
        });
    });

    describe('determineNewPositions', ()=> {
        it('should return an object containing a position and gridPosition given valid input', ()=> {
            const newPositions = characterUtil.determineNewPositions({ top: 500, left: 500 }, 'up', 5, 20, scaledTileSize);
            assert.deepEqual(newPositions, {
                newPosition: { top: 400, left: 500 },
                newGridPosition: { x: 63, y: 50.5 }
            });
        });
    });

    describe('snapToGrid', ()=> {
        const unsnappedPosition = { x: 1.5, y: 1.5 };

        it('should return a snapped value when traveling in any direction', ()=> {
            assert.deepEqual(characterUtil.snapToGrid(unsnappedPosition, 'up', scaledTileSize), { top: 4, left: 8 });
            assert.deepEqual(characterUtil.snapToGrid(unsnappedPosition, 'down', scaledTileSize), { top: 12, left: 8 });
            assert.deepEqual(characterUtil.snapToGrid(unsnappedPosition, 'left', scaledTileSize), { top: 8, left: 4 });
            assert.deepEqual(characterUtil.snapToGrid(unsnappedPosition, 'right', scaledTileSize), { top: 8, left: 12 });
        });
    });

    describe('handleWarp', ()=> {
        it('should warp the character if they travel too far to the left or right', ()=> {
            assert.deepEqual(characterUtil.handleWarp({top:0, left:-100}, scaledTileSize, mazeArray), {top:0, left:18});
            assert.deepEqual(characterUtil.handleWarp({top:0, left:100}, scaledTileSize, mazeArray), {top:0, left:-10});
        });

        it('should not warp the character if they are within the left-right boundaries of the maze', ()=> {
            assert.deepEqual(characterUtil.handleWarp({top:0, left:0}, scaledTileSize, mazeArray), {top:0, left:0});
        });
    });

    describe('advanceSpriteSheet', ()=> {
        let character;

        beforeEach(()=> {
            character = {
                msSinceLastSprite: 15,
                msBetweenSprites: 10,
                moving: true,
                animationTarget: {
                    style: {}
                },
                backgroundOffsetPixels: 50,
                measurement: 25,
                spriteFrames: 5
            };
        });

        it('should advance animation by one frame if enough time has passed', ()=> {
            characterUtil.advanceSpriteSheet(character);
            assert.strictEqual(character.msSinceLastSprite, 0);
            assert.strictEqual(character.animationTarget.style.backgroundPosition, '-50px 0px');
            assert.strictEqual(character.backgroundOffsetPixels, 75);
        });

        it('should return to the first frame in the spritesheet if the end of the spritesheet is reached', ()=> {
            character.backgroundOffsetPixels = 250;

            characterUtil.advanceSpriteSheet(character);
            assert.strictEqual(character.msSinceLastSprite, 0);
            assert.strictEqual(character.animationTarget.style.backgroundPosition, '-250px 0px');
            assert.strictEqual(character.backgroundOffsetPixels, 0);
        });

        it('should not advance animation if insufficient time has passed between sprites', ()=> {
            character.msSinceLastSprite = 5;

            characterUtil.advanceSpriteSheet(character);
            assert.strictEqual(character.msSinceLastSprite, 5);
        });

        it('should not advance animation if the character is not moving', ()=> {
            character.moving = false;

            characterUtil.advanceSpriteSheet(character);
            assert.strictEqual(character.msSinceLastSprite, 15);
        });
    });
});