const assert = require('assert');
const sinon = require('sinon');
const Pacman = require('../scripts/characters/pacman');
const CharacterUtil = require('../scripts/utilities/characterUtil');

const scaledTileSize = 8;

let pacman;

beforeEach(() => {
  global.document = {
    getElementById: () => ({
      style: {},
    }),
  };

  global.window = {
    addEventListener: () => true,
  };

  pacman = new Pacman(scaledTileSize, undefined, new CharacterUtil());
});

describe('pacman', () => {
  describe('reset', () => {
    it('resets the character to its default state', () => {
      pacman.setMovementStats = sinon.fake();
      pacman.setSpriteAnimationStats = sinon.fake();
      pacman.setStyleMeasurements = sinon.fake();
      pacman.setDefaultPosition = sinon.fake();
      pacman.setSpriteSheet = sinon.fake();

      pacman.reset();
      assert(pacman.setMovementStats.calledWith(pacman.scaledTileSize));
      assert(pacman.setSpriteAnimationStats.called);
      assert(pacman.setStyleMeasurements.calledWith(
        pacman.scaledTileSize, pacman.spriteFrames,
      ));
      assert(pacman.setDefaultPosition.calledWith(pacman.scaledTileSize));
      assert(pacman.setSpriteSheet.calledWith(pacman.direction));
      assert.strictEqual(pacman.pacmanArrow.style.backgroundImage,
        'url(app/style/graphics/spriteSheets/characters/pacman/arrow_'
        + `${pacman.direction}.svg)`);
    });
  });

  describe('setStyleMeasurements', () => {
    it('sets pacman\'s measurement properties', () => {
      pacman.animationTarget.style = {};
      pacman.setStyleMeasurements(scaledTileSize, 4);
      assert.strictEqual(pacman.measurement, 16);
      assert.deepEqual(pacman.animationTarget.style, {
        height: '16px',
        width: '16px',
        backgroundSize: '64px',
      });
    });

    it('sets pacman\'s measurement to scaledTileSize times two', () => {
      pacman.setStyleMeasurements(1);
      assert.strictEqual(pacman.measurement, 2);

      pacman.setStyleMeasurements(8);
      assert.strictEqual(pacman.measurement, 16);

      pacman.setStyleMeasurements(1000);
      assert.strictEqual(pacman.measurement, 2000);
    });

    it('sets pacman\'s backgroundSize to scaledTileSize times eight', () => {
      pacman.setStyleMeasurements(1, 4);
      assert.strictEqual(pacman.animationTarget.style.backgroundSize, '8px');

      pacman.setStyleMeasurements(8, 4);
      assert.strictEqual(pacman.animationTarget.style.backgroundSize, '64px');

      pacman.setStyleMeasurements(1000, 4);
      assert.strictEqual(
        pacman.animationTarget.style.backgroundSize, '8000px',
      );
    });
  });

  describe('setSpriteAnimationStats', () => {
    it('sets various stats for pacman\'s sprite animation', () => {
      pacman.setSpriteAnimationStats();

      assert.strictEqual(pacman.msBetweenSprites, 50);
      assert.strictEqual(pacman.msSinceLastSprite, 0);
      assert.strictEqual(pacman.spriteFrames, 4);
      assert.strictEqual(pacman.backgroundOffsetPixels, 0);
    });
  });

  describe('setDefaultPosition', () => {
    it('sets the defaultPosition, position, and oldPositions', () => {
      pacman.setDefaultPosition(scaledTileSize);

      assert.deepEqual(pacman.defaultPosition, {
        left: 104,
        top: 180,
      });
      assert.deepEqual(pacman.position, pacman.defaultPosition);
      assert.deepEqual(pacman.position, pacman.oldPosition);
    });
  });

  describe('calculateVelocityPerMs', () => {
    it('returns the input multiplied by 11, then divided by 1000', () => {
      assert.strictEqual(pacman.calculateVelocityPerMs(8), 0.088);
      assert.strictEqual(pacman.calculateVelocityPerMs(64), 0.704);
      assert.strictEqual(pacman.calculateVelocityPerMs(200), 2.2);
    });
  });

  describe('setSpriteSheet', () => {
    const baseUrl = 'url(app/style/graphics/spriteSheets/characters/pacman/';

    it('sets the correct spritesheet for any given direction', () => {
      pacman.setSpriteSheet('up');
      assert.strictEqual(
        pacman.animationTarget.style.backgroundImage,
        `${baseUrl}pacman_up.svg)`,
      );
      pacman.setSpriteSheet('down');
      assert.strictEqual(
        pacman.animationTarget.style.backgroundImage,
        `${baseUrl}pacman_down.svg)`,
      );
      pacman.setSpriteSheet('left');
      assert.strictEqual(
        pacman.animationTarget.style.backgroundImage,
        `${baseUrl}pacman_left.svg)`,
      );
      pacman.setSpriteSheet('right');
      assert.strictEqual(
        pacman.animationTarget.style.backgroundImage,
        `${baseUrl}pacman_right.svg)`,
      );
    });
  });

  describe('prepDeathAnimation', () => {
    it('sets properties to prep the animation', () => {
      pacman.prepDeathAnimation();

      assert(!pacman.loopAnimation);
      assert.strictEqual(pacman.msBetweenSprites, 125);
      assert.strictEqual(pacman.spriteFrames, 12);
      assert(pacman.specialAnimation);
      assert.strictEqual(pacman.backgroundOffsetPixels, 0);
      assert.strictEqual(pacman.animationTarget.style.backgroundSize,
        `${pacman.measurement * pacman.spriteFrames}px`);
      assert.strictEqual(pacman.animationTarget.style.backgroundImage,
        'url(app/style/graphics/spriteSheets/characters/pacman/'
        + 'pacman_death.svg)');
      assert.strictEqual(pacman.animationTarget.style.backgroundPosition,
        '0px 0px');
      assert.strictEqual(pacman.pacmanArrow.style.backgroundImage, '');
    });
  });

  describe('changeDirection', () => {
    it('sets direction, sets the arrow, and sets moving to TRUE', () => {
      pacman.desiredDirection = 'up';
      pacman.pacmanArrow.style.backgroundImage = '';
      pacman.moving = false;

      pacman.changeDirection('down', true);
      assert.strictEqual(pacman.desiredDirection, 'down');
      assert.strictEqual(pacman.pacmanArrow.style.backgroundImage, 'url(app/'
      + 'style/graphics/spriteSheets/characters/pacman/arrow_down.svg)');
      assert(pacman.moving);
    });

    it('won\'t start Pacman moving if startMoving is FALSE', () => {
      pacman.desiredDirection = 'up';
      pacman.pacmanArrow.style.backgroundImage = '';
      pacman.moving = false;

      pacman.changeDirection('down', false);
      assert.strictEqual(pacman.desiredDirection, 'down');
      assert.strictEqual(pacman.pacmanArrow.style.backgroundImage, 'url(app/'
      + 'style/graphics/spriteSheets/characters/pacman/arrow_down.svg)');
      assert(!pacman.moving);
    });
  });

  describe('updatePacmanArrowPosition', () => {
    it('updates the css positioning of the Pacman Arrow', () => {
      assert.strictEqual(pacman.pacmanArrow.style.top, undefined);
      assert.strictEqual(pacman.pacmanArrow.style.left, undefined);

      pacman.updatePacmanArrowPosition(
        { top: 100, left: 100 },
        scaledTileSize,
      );
      assert.strictEqual(pacman.pacmanArrow.style.top, '92px');
      assert.strictEqual(pacman.pacmanArrow.style.left, '92px');
    });
  });

  describe('movement handlers', () => {
    let desiredPosition;
    let alternatePosition;
    let snappedPosition;

    beforeEach(() => {
      pacman.direction = 'left';
      pacman.desiredDirection = 'up';
      pacman.characterUtil.determineNewPositions = (position, direction) => {
        desiredPosition = { top: 10, left: 10 };
        alternatePosition = { top: 100, left: 100 };
        snappedPosition = { top: 50, left: 50 };

        if (direction === 'up') {
          return {
            newPosition: desiredPosition,
            newGridPosition: { x: 5, y: 5 },
          };
        }
        return {
          newPosition: alternatePosition,
          newGridPosition: { x: 50, y: 50 },
        };
      };
    });

    describe('handleSnappedMovement', () => {
      it('sets Pacman\'s direction if his desired position is clear', () => {
        const spriteSpy = pacman.setSpriteSheet = sinon.fake();
        pacman.characterUtil.checkForWallCollision = sinon.fake.returns(false);

        const newPosition = pacman.handleSnappedMovement();
        assert.strictEqual(pacman.direction, 'up');
        assert(spriteSpy.calledWith('up'));
        assert.deepEqual(newPosition, desiredPosition);
      });

      it('returns the alternate new position if needed', () => {
        let firstCall = true;
        pacman.characterUtil.checkForWallCollision = () => {
          if (firstCall) {
            firstCall = false;
            return true;
          }
          return false;
        };

        const newPosition = pacman.handleSnappedMovement();
        assert.deepEqual(newPosition, alternatePosition);
      });

      it('returns Pacman\'s current position if he can\'t move', () => {
        pacman.characterUtil.checkForWallCollision = sinon.fake.returns(true);
        pacman.moving = true;

        const newPosition = pacman.handleSnappedMovement();
        assert.strictEqual(pacman.moving, false);
        assert.deepEqual(newPosition, pacman.position);
      });
    });

    describe('handleUnsnappedMovement', () => {
      it('sets Pacman\'s direction if he is turning around', () => {
        const spriteSpy = pacman.setSpriteSheet = sinon.fake();
        pacman.characterUtil.turningAround = sinon.fake.returns(true);

        const newPosition = pacman.handleUnsnappedMovement();
        assert.strictEqual(pacman.direction, 'up');
        assert(spriteSpy.calledWith('up'));
        assert.deepEqual(newPosition, desiredPosition);
      });

      it('returns Pacman\'s current position, snapped to the grid', () => {
        pacman.characterUtil.turningAround = sinon.fake.returns(false);
        pacman.characterUtil.changingGridPosition = sinon.fake.returns(true);
        pacman.characterUtil.snapToGrid = sinon.fake.returns(snappedPosition);

        const newPosition = pacman.handleUnsnappedMovement();
        assert.deepEqual(newPosition, snappedPosition);
      });

      it('returns the alternate position', () => {
        pacman.characterUtil.turningAround = sinon.fake.returns(false);
        pacman.characterUtil.changingGridPosition = sinon.fake.returns(false);

        const newPosition = pacman.handleUnsnappedMovement();
        assert.deepEqual(newPosition, alternatePosition);
      });
    });
  });

  describe('draw', () => {
    it('updates css properties and animate Pacman\'s spritesheet', () => {
      const drawValueSpy = sinon.fake.returns(100);
      const stutterSpy = sinon.fake.returns('visible');
      const arrowSpy = sinon.fake();
      const spriteSpy = sinon.fake.returns({
        msSinceLastSprite: '',
        animationTarget: '',
        backgroundOffsetPixels: '',
      });
      pacman.characterUtil.calculateNewDrawValue = drawValueSpy;
      pacman.characterUtil.checkForStutter = stutterSpy;
      pacman.updatePacmanArrowPosition = arrowSpy;
      pacman.characterUtil.advanceSpriteSheet = spriteSpy;

      pacman.draw(1);
      assert(drawValueSpy.calledTwice);
      assert(stutterSpy.called);
      assert(arrowSpy.called);
      assert(spriteSpy.called);
    });

    it('hides Pacman if display is FALSE', () => {
      pacman.display = false;
      pacman.draw(1);
      assert.strictEqual(pacman.animationTarget.style.visibility, 'hidden');
    });
  });

  describe('update', () => {
    it('calls handleSnappedMovement if Pacman is snapped', () => {
      const snappedSpy = pacman.handleSnappedMovement = sinon.fake();
      pacman.characterUtil.determineGridPosition = sinon.fake();
      pacman.characterUtil.handleWarp = sinon.fake();
      pacman.characterUtil.snapToGrid = sinon.fake.returns(pacman.position);
      pacman.moving = true;

      pacman.update();
      assert(snappedSpy.called);
    });

    it('calls handleUnsnappedMovement if Pacman is unsapped', () => {
      const unsnappedSpy = pacman.handleUnsnappedMovement = sinon.fake();
      pacman.characterUtil.determineGridPosition = sinon.fake();
      pacman.characterUtil.handleWarp = sinon.fake();
      pacman.characterUtil.snapToGrid = sinon.fake.returns({});
      pacman.moving = true;

      pacman.update();
      assert(unsnappedSpy.called);
    });

    it('won\'t call movement handlers unless Pacman is moving', () => {
      const snappedSpy = pacman.handleSnappedMovement = sinon.fake();
      const unsnappedSpy = pacman.handleUnsnappedMovement = sinon.fake();
      pacman.moving = false;

      pacman.update();
      assert(!snappedSpy.called);
      assert(!unsnappedSpy.called);
    });
  });
});
