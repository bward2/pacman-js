const assert = require('assert');
const CharacterUtil = require('../scripts/utilities/characterUtil');

let characterUtil;
const oldPosition = { top: 0, left: 0 };
const position = { top: 10, left: 100 };
const mazeArray = [
  ['X', 'X', 'X'],
  ['X', ' ', ' '],
  ['X', ' ', 'X'],
];
const scaledTileSize = 8;

beforeEach(() => {
  characterUtil = new CharacterUtil();
});

describe('characterUtil', () => {
  describe('checkForStutter', () => {
    it('returns VISIBLE if the character moves less than five tiles', () => {
      assert.strictEqual(characterUtil.checkForStutter(
        oldPosition, { top: 0, left: 0 },
      ), 'visible');
      assert.strictEqual(characterUtil.checkForStutter(
        oldPosition, { top: 0, left: 5 },
      ), 'visible');
      assert.strictEqual(characterUtil.checkForStutter(
        oldPosition, { top: 5, left: 0 },
      ), 'visible');
      assert.strictEqual(characterUtil.checkForStutter(
        oldPosition, { top: 5, left: 5 },
      ), 'visible');
    });

    it('returns HIDDEN if the character moves more than five tiles', () => {
      assert.strictEqual(characterUtil.checkForStutter(
        oldPosition, { top: 0, left: 6 },
      ), 'hidden');
      assert.strictEqual(characterUtil.checkForStutter(
        oldPosition, { top: 0, left: -6 },
      ), 'hidden');
      assert.strictEqual(characterUtil.checkForStutter(
        oldPosition, { top: 6, left: 0 },
      ), 'hidden');
      assert.strictEqual(characterUtil.checkForStutter(
        oldPosition, { top: -6, left: 0 },
      ), 'hidden');
    });

    it('returns VISIBLE by default if either param is missing', () => {
      assert.strictEqual(characterUtil.checkForStutter(), 'visible');
    });
  });

  describe('getPropertyToChange', () => {
    it('returns TOP if the character is moving UP or DOWN', () => {
      assert.strictEqual(characterUtil.getPropertyToChange('up'), 'top');
      assert.strictEqual(characterUtil.getPropertyToChange('down'), 'top');
    });

    it('returns LEFT if the character is moving LEFT or RIGHT', () => {
      assert.strictEqual(characterUtil.getPropertyToChange('left'), 'left');
      assert.strictEqual(characterUtil.getPropertyToChange('right'), 'left');
    });

    it('returns LEFT by default', () => {
      assert.strictEqual(characterUtil.getPropertyToChange(), 'left');
    });
  });

  describe('getVelocity', () => {
    it('returns a positive number for DOWN or RIGHT', () => {
      assert.strictEqual(characterUtil.getVelocity('down', 100), 100);
      assert.strictEqual(characterUtil.getVelocity('right', 100), 100);
    });

    it('returns a negative number for UP or LEFT', () => {
      assert.strictEqual(characterUtil.getVelocity('up', 100), -100);
      assert.strictEqual(characterUtil.getVelocity('left', 100), -100);
    });
  });

  describe('calculateNewDrawValue', () => {
    it('calculates a new value given all parameters', () => {
      assert.strictEqual(characterUtil.calculateNewDrawValue(
        1, 'top', oldPosition, position,
      ), 10);
      assert.strictEqual(characterUtil.calculateNewDrawValue(
        1, 'left', oldPosition, position,
      ), 100);
    });

    it('factors in interp when calculating the new value', () => {
      assert.strictEqual(characterUtil.calculateNewDrawValue(
        0.5, 'top', oldPosition, position,
      ), 5);
      assert.strictEqual(characterUtil.calculateNewDrawValue(
        0.5, 'left', oldPosition, position,
      ), 50);
    });
  });

  describe('determineGridPosition', () => {
    it('returns an x-y object given a valid position', () => {
      assert.deepEqual(characterUtil.determineGridPosition(
        oldPosition, scaledTileSize,
      ), { x: 0.5, y: 0.5 });
      assert.deepEqual(characterUtil.determineGridPosition(
        position, scaledTileSize,
      ), { x: 13, y: 1.75 });
    });
  });

  describe('turningAround', () => {
    it('returns TRUE if direction and desired direction are opposites', () => {
      assert(characterUtil.turningAround('up', 'down'));
      assert(characterUtil.turningAround('down', 'up'));
      assert(characterUtil.turningAround('left', 'right'));
      assert(characterUtil.turningAround('right', 'left'));
    });

    it('returns FALSE if continuing straight or turning to the side', () => {
      assert(!characterUtil.turningAround('up', 'up'));
      assert(!characterUtil.turningAround('up', 'left'));
      assert(!characterUtil.turningAround('up', 'right'));
    });
  });

  describe('getOppositeDirection', () => {
    it('returns the opposite of any given direction', () => {
      assert.strictEqual(characterUtil.getOppositeDirection('up'), 'down');
      assert.strictEqual(characterUtil.getOppositeDirection('down'), 'up');
      assert.strictEqual(characterUtil.getOppositeDirection('left'), 'right');
      assert.strictEqual(characterUtil.getOppositeDirection('right'), 'left');
    });
  });

  describe('determineRoundingFunction', () => {
    it('returns MATH.FLOOR for UP or LEFT', () => {
      assert.strictEqual(
        characterUtil.determineRoundingFunction('up'), Math.floor,
      );
      assert.strictEqual(
        characterUtil.determineRoundingFunction('left'), Math.floor,
      );
    });

    it('returns MATH.CEIL for DOWN or RIGHT', () => {
      assert.strictEqual(
        characterUtil.determineRoundingFunction('down'), Math.ceil,
      );
      assert.strictEqual(
        characterUtil.determineRoundingFunction('right'), Math.ceil,
      );
    });
  });

  describe('changingGridPosition', () => {
    it('returns TRUE if changing grid positions', () => {
      assert(characterUtil.changingGridPosition(
        { x: 0, y: 0 }, { x: 0, y: 1 },
      ));
      assert(characterUtil.changingGridPosition(
        { x: 0, y: 0 }, { x: 1, y: 0 },
      ));
      assert(characterUtil.changingGridPosition(
        { x: 0, y: 0 }, { x: 1, y: 1 },
      ));
    });

    it('returns FALSE if not', () => {
      assert(!characterUtil.changingGridPosition(
        { x: 0, y: 0 }, { x: 0, y: 0 },
      ));
      assert(!characterUtil.changingGridPosition(
        { x: 0, y: 0 }, { x: 0.1, y: 0.9 },
      ));
    });
  });

  describe('checkForWallCollision', () => {
    it('returns TRUE if running into a wall', () => {
      assert(characterUtil.checkForWallCollision(
        { x: 0, y: 1 }, mazeArray, 'left',
      ));
      assert(characterUtil.checkForWallCollision(
        { x: 1, y: 0 }, mazeArray, 'up',
      ));
    });

    it('returns FALSE if running to a free tile', () => {
      assert(!characterUtil.checkForWallCollision(
        { x: 2, y: 1 }, mazeArray, 'right',
      ));
      assert(!characterUtil.checkForWallCollision(
        { x: 1, y: 2 }, mazeArray, 'down',
      ));
      assert(!characterUtil.checkForWallCollision(
        { x: 1, y: 1 }, mazeArray, 'left',
      ));
      assert(!characterUtil.checkForWallCollision(
        { x: 1, y: 1 }, mazeArray, 'up',
      ));
    });

    it('returns FALSE if moving outside the maze', () => {
      assert(!characterUtil.checkForWallCollision(
        { x: -1, y: -1 }, mazeArray, 'right',
      ));
      assert(!characterUtil.checkForWallCollision(
        { x: Infinity, y: Infinity }, mazeArray, 'right',
      ));
    });
  });

  describe('determineNewPositions', () => {
    it('returns an object containing a position and gridPosition', () => {
      const newPositions = characterUtil.determineNewPositions(
        { top: 500, left: 500 }, 'up', 5, 20, scaledTileSize,
      );
      assert.deepEqual(newPositions, {
        newPosition: { top: 400, left: 500 },
        newGridPosition: { x: 63, y: 50.5 },
      });
    });
  });

  describe('snapToGrid', () => {
    const unsnappedPosition = { x: 1.5, y: 1.5 };

    it('returns a snapped value when traveling in any direction', () => {
      assert.deepEqual(characterUtil.snapToGrid(
        unsnappedPosition, 'up', scaledTileSize,
      ), { top: 4, left: 8 });
      assert.deepEqual(characterUtil.snapToGrid(
        unsnappedPosition, 'down', scaledTileSize,
      ), { top: 12, left: 8 });
      assert.deepEqual(characterUtil.snapToGrid(
        unsnappedPosition, 'left', scaledTileSize,
      ), { top: 8, left: 4 });
      assert.deepEqual(characterUtil.snapToGrid(
        unsnappedPosition, 'right', scaledTileSize,
      ), { top: 8, left: 12 });
    });
  });

  describe('handleWarp', () => {
    it('warps if leaving the maze', () => {
      assert.deepEqual(characterUtil.handleWarp(
        { top: 0, left: -100 }, scaledTileSize, mazeArray,
      ), { top: 0, left: 18 });
      assert.deepEqual(characterUtil.handleWarp(
        { top: 0, left: 100 }, scaledTileSize, mazeArray,
      ), { top: 0, left: -10 });
    });

    it('doesn\'t warp otherwise', () => {
      assert.deepEqual(characterUtil.handleWarp(
        { top: 0, left: 0 }, scaledTileSize, mazeArray,
      ), { top: 0, left: 0 });
    });
  });

  describe('advanceSpriteSheet', () => {
    let character;

    beforeEach(() => {
      character = {
        animate: true,
        loopAnimation: true,
        msSinceLastSprite: 15,
        msBetweenSprites: 10,
        moving: true,
        animationTarget: {
          style: {},
        },
        backgroundOffsetPixels: 50,
        measurement: 25,
        spriteFrames: 5,
      };
    });

    it('advances animation by one frame if enough time has passed', () => {
      const updatedProperties = characterUtil.advanceSpriteSheet(character);
      assert.strictEqual(updatedProperties.msSinceLastSprite, 0);
      assert.strictEqual(
        updatedProperties.animationTarget.style.backgroundPosition, '-75px 0px',
      );
      assert.strictEqual(updatedProperties.backgroundOffsetPixels, 75);
    });

    it('returns to the first frame at the spritesheet\'s end', () => {
      character.backgroundOffsetPixels = 250;

      const updatedProperties = characterUtil.advanceSpriteSheet(character);
      assert.strictEqual(updatedProperties.msSinceLastSprite, 0);
      assert.strictEqual(
        updatedProperties.animationTarget.style.backgroundPosition,
        '-0px 0px',
      );
      assert.strictEqual(updatedProperties.backgroundOffsetPixels, 0);
    });

    it('waits for sufficient time between frames', () => {
      character.msSinceLastSprite = 5;

      characterUtil.advanceSpriteSheet(character);
      assert.strictEqual(character.msSinceLastSprite, 5);
    });

    it('only animates if the character is moving', () => {
      character.moving = false;

      characterUtil.advanceSpriteSheet(character);
      assert.strictEqual(character.msSinceLastSprite, 15);
    });

    it('only loops animation if loopAnimation is true', () => {
      character.loopAnimation = false;
      character.backgroundOffsetPixels = 250;

      const updatedProperties = characterUtil.advanceSpriteSheet(character);
      assert.strictEqual(updatedProperties.backgroundOffsetPixels, 250);
    });
  });
});
