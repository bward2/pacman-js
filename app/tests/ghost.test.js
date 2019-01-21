const assert = require('assert');
const sinon = require('sinon');
const Ghost = require('../scripts/characters/ghost');
const CharacterUtil = require('../scripts/utilities/characterUtil');

const scaledTileSize = 8;
const mazeArray = [
    ['X','X','X'],
    ['X',' ',' '],
    ['X',' ','X'],
];

let pacman;
let ghost;

beforeEach(()=> {
    global.document = {
        getElementById: () => {
            return {
                style: {}
            };
        }
    };

    pacman = {
        velocityPerMs: 1,
        moving: true,
        position: {
            top: 100,
            left: 100
        }
    };

    ghost = new Ghost(scaledTileSize, undefined, pacman, undefined, new CharacterUtil());
});

describe('ghost', ()=> {
    describe('setMovementStats', ()=> {
        it('should set the ghost\'s various speeds, velocity, direction, and movement', ()=> {
            ghost.setMovementStats(pacman);
            assert.strictEqual(ghost.slowSpeed, 0.75);
            assert.strictEqual(ghost.mediumSpeed, 0.90);
            assert.strictEqual(ghost.fastSpeed, 1.05);
            assert.strictEqual(ghost.chasedSpeed, 0.5);
            assert.strictEqual(ghost.tunnelSpeed, 0.5);
            assert.strictEqual(ghost.eyeSpeed, 3);
            assert.strictEqual(ghost.velocityPerMs, 0.75);
            assert.strictEqual(ghost.direction, 'left');
            assert.strictEqual(ghost.moving, false);
        });
    });
    
    describe('setSpriteAnimationStats', ()=> {
        it('should set various stats for the ghost\'s sprite animation', () => {
            ghost.setSpriteAnimationStats();
    
            assert.strictEqual(ghost.msBetweenSprites, 250);
            assert.strictEqual(ghost.msSinceLastSprite, 0);
            assert.strictEqual(ghost.spriteFrames, 2);
            assert.strictEqual(ghost.backgroundOffsetPixels, 0);
        });
    });
    
    describe('setStyleMeasurements', ()=> {
        it('should set the ghost\'s measurement, height, width, and backgroundSize properties', ()=> {
            ghost.animationTarget.style = {};
            ghost.setStyleMeasurements(scaledTileSize, 2);
            assert.strictEqual(ghost.measurement, 16);
            assert.deepEqual(ghost.animationTarget.style, {
                height: '16px',
                width: '16px',
                backgroundSize: '32px'
            });
        });
    });

    describe('setDefaultPosition', ()=> {
        it('should set the correct position for blinky', ()=> {
            ghost.setDefaultPosition(scaledTileSize, 'blinky');
            assert.deepEqual(ghost.position, { top: 84, left: 104 });
            assert.deepEqual(ghost.oldPosition, { top: 84, left: 104 });
            assert.strictEqual(ghost.animationTarget.style.top, '84px');
            assert.strictEqual(ghost.animationTarget.style.left, '104px');
        });

        it('should set the correct default position if the name is missing', ()=> {
            ghost.setDefaultPosition(scaledTileSize, undefined);
            assert.deepEqual(ghost.position, { top: 0, left: 0 });
            assert.deepEqual(ghost.oldPosition, { top: 0, left: 0 });
            assert.strictEqual(ghost.animationTarget.style.top, '0px');
            assert.strictEqual(ghost.animationTarget.style.left, '0px');
        });
    });

    describe('setSpriteSheet', ()=> {
        it('should set the correct spritesheet for any given direction', ()=> {
            ghost.setSpriteSheet('blinky', 'up');
            assert.strictEqual(ghost.animationTarget.style.backgroundImage, 'url(app/style/graphics/spriteSheets/characters/ghosts/blinky/blinky_up.svg)');
            ghost.setSpriteSheet('blinky', 'down');
            assert.strictEqual(ghost.animationTarget.style.backgroundImage, 'url(app/style/graphics/spriteSheets/characters/ghosts/blinky/blinky_down.svg)');
            ghost.setSpriteSheet('blinky', 'left');
            assert.strictEqual(ghost.animationTarget.style.backgroundImage, 'url(app/style/graphics/spriteSheets/characters/ghosts/blinky/blinky_left.svg)');
            ghost.setSpriteSheet('blinky', 'right');
            assert.strictEqual(ghost.animationTarget.style.backgroundImage, 'url(app/style/graphics/spriteSheets/characters/ghosts/blinky/blinky_right.svg)');
        });
    });

    describe('isInTunnel', ()=> {
        it('should return TRUE if the ghost is in either the left or right warp tunnel', ()=> {
            assert(ghost.isInTunnel({ x:0, y:14 }));
            assert(ghost.isInTunnel({ x:30, y:14 }));
        });

        it('should return FALSE if the ghost is away from the warp tunnels', ()=> {
            assert(!ghost.isInTunnel({ x:15, y:14 }));
            assert(!ghost.isInTunnel({ x:0, y:0 }));
        });
    });

    describe('getTile', ()=> {
        it('should return a tile if the given coordinates are free', ()=> {
            const tile = ghost.getTile(mazeArray, 1, 1);
            assert.deepEqual(tile, { x:1, y:1 });
        });

        it('should return FALSE if the given coordinates are a wall', ()=> {
            const tile = ghost.getTile(mazeArray, 0, 0);
            assert.strictEqual(tile, false);
        });

        it('should return FALSE if the given coordinates are not on the Maze Array', ()=> {
            const tile = ghost.getTile(mazeArray, -1, -1);
            assert.strictEqual(tile, false);
        });
    });

    describe('determinePossibleMoves', ()=> {
        it('should return a list of moves given valid coordinates on the Maze Array', ()=> {
            const possibleMoves = ghost.determinePossibleMoves({ x:1, y:1 }, 'right', mazeArray);
            assert.deepEqual(possibleMoves, {
                down: { x: 1, y: 2 },
                right: { x: 2, y: 1 }
            });
        });

        it('should not allow the ghost to turn around at a crossroads', ()=> {
            const possibleMoves = ghost.determinePossibleMoves({ x:1, y:1 }, 'up', mazeArray);
            assert.deepEqual(possibleMoves, {
                right: { x: 2, y: 1 }
            });
        });

        it('should return an empty object if no moves are available', ()=> {
            const possibleMoves = ghost.determinePossibleMoves({ x:-1, y:-1 }, 'up', mazeArray);
            assert.deepEqual(possibleMoves, {});
        });
    });

    describe('calculateDistance', ()=> {
        it('should use the Pythagorean Theorem to measure the distance between a given postion and Pacman', ()=> {
            const distance = ghost.calculateDistance({ x:0, y:0 }, { x:3, y:4 });
            assert.strictEqual(distance, 5);
        });

        it('should return zero if the two given positions are identical', ()=> {
            const distance = ghost.calculateDistance({ x:0, y:0 }, { x:0, y:0 });
            assert.strictEqual(distance, 0);
        });
    });

    describe('blinkyBestMove', ()=> {
        it('should return the move which moves Blinky the closest to Pacman', ()=> {
            const possibleMoves = {
                up: { x:1, y:0},
                down: { x:1, y:2},
                left: { x:0, y:1},
                right: { x:2, y:1},
            };

            const bestMove = ghost.blinkyBestMove(possibleMoves, { x:3, y:1 });
            assert.strictEqual(bestMove, 'right');
        });

        it('should return UNDEFINED if there are no possible moves', ()=> {
            const bestMove = ghost.blinkyBestMove({}, { x:3, y:1 });
            assert.strictEqual(bestMove, undefined);
        });
    });

    describe('determineBestMove', ()=> {
        it('calls the correct functions given a ghost name', ()=> {
            const blinkySpy = ghost.blinkyBestMove = sinon.fake();

            ghost.determineBestMove('blinky');
            assert(blinkySpy.called);
        });

        it('returns the ghost\'s current direciton by default if no ghost name is given', ()=> {
            ghost.direction = 'up';
            const bestMove = ghost.determineBestMove();
            assert.strictEqual(bestMove, 'up');
        });
    });

    describe('determineDirection', ()=> {
        it('returns the new direction if there is only one possible move', ()=> {
            ghost.determinePossibleMoves = sinon.fake.returns({ up:'' });

            const direction = ghost.determineDirection();
            assert.strictEqual(direction, 'up');
        });

        it('calls determineBestMove if there are multiple possible moves', ()=> {
            ghost.determinePossibleMoves = sinon.fake.returns({ up:'', down:'' });
            const bestSpy = ghost.determineBestMove = sinon.fake.returns('down');

            const direciton = ghost.determineDirection();
            assert(bestSpy.called);
            assert.strictEqual(direciton, 'down');
        });

        it('returns the ghost\'s default direction if there are no possible moves', ()=> {
            ghost.determinePossibleMoves = sinon.fake.returns({});

            const direciton = ghost.determineDirection(undefined, undefined, undefined, 'right');
            assert.strictEqual(direciton, 'right');
        });
    });

    describe('handleSnappedMovement', ()=> {
        it('calls determineDirection to decide where to turn, sets the spritesheet, and returns a new position', ()=> {
            ghost.characterUtil.determineGridPosition = sinon.fake();
            const direcitonSpy = ghost.determineDirection = sinon.fake();
            const spriteSpy = ghost.setSpriteSheet = sinon.fake();
            ghost.characterUtil.getPropertyToChange = sinon.fake.returns('top');
            ghost.characterUtil.getVelocity = sinon.fake.returns(10);

            const newPosition = ghost.handleSnappedMovement(50);
            assert(direcitonSpy.called);
            assert(spriteSpy.called);
            assert.deepEqual(newPosition, { top: 500, left: 0 });
        });
    });

    describe('handleUnsnappedMovement', ()=> {
        it('returns the desired new position if the ghost is not changing tiles on the grid', ()=> {
            const desired = {
                newPosition: { top: 25, left: 50 }
            };
            ghost.characterUtil.determineNewPositions = sinon.fake.returns(desired);
            ghost.characterUtil.changingGridPosition = sinon.fake.returns(false);

            const newPosition = ghost.handleUnsnappedMovement();
            assert.deepEqual(newPosition, desired.newPosition)
        });

        it('returns a snapped position if the ghost is attempting to change tiles on the grid', ()=> {
            const snappedPosition = { top:125, left:150 };
            ghost.characterUtil.determineNewPositions = sinon.fake.returns({
                newGridPosition:''
            });
            ghost.characterUtil.changingGridPosition = sinon.fake.returns(true);
            ghost.characterUtil.snapToGrid = sinon.fake.returns(snappedPosition);

            const newPosition = ghost.handleUnsnappedMovement();
            assert.deepEqual(newPosition, snappedPosition);
        });
    });

    describe('draw', ()=> {
        it('should update various css properties and animate the ghost\'s spritesheet', ()=> {
            const drawValueSpy = ghost.characterUtil.calculateNewDrawValue = sinon.fake.returns(100);
            const stutterSpy = ghost.characterUtil.checkForStutter = sinon.fake.returns('visible');
            const spriteSpy = ghost.characterUtil.advanceSpriteSheet = sinon.fake();

            ghost.draw(1);
            assert.strictEqual(ghost.animationTarget.style.top, '100px');
            assert.strictEqual(ghost.animationTarget.style.left, '100px');
            assert.strictEqual(ghost.animationTarget.style.visibility, 'visible');
            assert(drawValueSpy.calledTwice);
            assert(stutterSpy.called);
            assert(spriteSpy.called);
        });
    });
});