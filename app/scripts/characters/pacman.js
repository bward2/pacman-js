class Pacman {
    constructor(scaledTileSize, mazeArray, characterUtil) {
        this.scaledTileSize = scaledTileSize;
        this.mazeArray = mazeArray;
        this.characterUtil = characterUtil;
        this.animationTarget = document.getElementById('pacman');
        this.pacmanArrow = document.getElementById('pacman-arrow');

        this.setMovementStats(scaledTileSize);
        this.setSpriteAnimationStats();
        this.setStyleMeasurements(scaledTileSize, this.spriteFrames);
        this.setDefaultPosition(scaledTileSize);
        this.setKeyListeners();

        this.setSpriteSheet(this.direction);
    }

    setMovementStats(scaledTileSize) {
        this.velocityPerMs = this.calculateVelocityPerMs(scaledTileSize);
        this.desiredDirection = this.characterUtil.directions.left;
        this.direction = this.characterUtil.directions.left;
        this.moving = false;
    }

    setSpriteAnimationStats() {
        this.msBetweenSprites = 50;
        this.msSinceLastSprite = 0;
        this.spriteFrames = 4;
        this.backgroundOffsetPixels = 0;
    }

    setStyleMeasurements(scaledTileSize, spriteFrames) {
        // Pacman is the size of 2x2 game tiles.
        this.measurement = scaledTileSize * 2;

        this.animationTarget.style.height = `${this.measurement}px`;
        this.animationTarget.style.width = `${this.measurement}px`;
        this.animationTarget.style.backgroundSize = `${this.measurement * spriteFrames}px`;

        this.pacmanArrow.style.height = `${this.measurement * 2}px`;
        this.pacmanArrow.style.width = `${this.measurement * 2}px`;
        this.pacmanArrow.style.backgroundSize = `${this.measurement * 2}px`;
    }

    setDefaultPosition(scaledTileSize) {
        this.position = {
            top: scaledTileSize * 22.5,
            left: scaledTileSize * 13
        };
        this.oldPosition = Object.assign({}, this.position);
        this.animationTarget.style.top = `${this.position.top}px`;
        this.animationTarget.style.left = `${this.position.left}px`;
    }

    setKeyListeners() {
        this.movementKeys = {
            // WASD
            87: 'up',
            83: 'down',
            65: 'left',
            68: 'right',
     
            // Arrow Keys
            38: 'up',
            40: 'down',
            37: 'left',
            39: 'right'
        };

        window.addEventListener('keydown', (e) => {
            this.changeDirection(e);
        });
    }

    calculateVelocityPerMs(scaledTileSize) {
        // In the original game, Pacman moved at 11 tiles per second.
        let velocityPerSecond = scaledTileSize * 11;
        return velocityPerSecond / 1000;
    }

    setSpriteSheet(direction) {
        this.animationTarget.style.backgroundImage = `url(app/style/graphics/spriteSheets/characters/pacman/pacman_${direction}.svg)`;
    }

    changeDirection(e) {
        if(this.movementKeys[e.keyCode]) {
            this.desiredDirection = this.characterUtil.directions[this.movementKeys[e.keyCode]];
            this.pacmanArrow.style.backgroundImage = `url(app/style/graphics/spriteSheets/characters/pacman/arrow_${this.desiredDirection}.svg)`;
            this.moving = true;
        }
    }

    updatePacmanArrowPosition(position, scaledTileSize) {
        this.pacmanArrow.style.top = `${position.top - scaledTileSize}px`;
        this.pacmanArrow.style.left = `${position.left - scaledTileSize}px`;
    }

    draw(interp){
        this.animationTarget.style['top'] = `${this.characterUtil.calculateNewDrawValue(interp, 'top', this.oldPosition, this.position)}px`;
        this.animationTarget.style['left'] = `${this.characterUtil.calculateNewDrawValue(interp, 'left', this.oldPosition, this.position)}px`;

        this.animationTarget.style['visibility'] = this.characterUtil.checkForStutter(this.position, this.oldPosition);

        this.updatePacmanArrowPosition(this.position, this.scaledTileSize);

        if (this.msSinceLastSprite > this.msBetweenSprites && this.moving) {
            this.msSinceLastSprite = 0;

            this.animationTarget.style.backgroundPosition = `-${this.backgroundOffsetPixels}px 0px`;
        
            if (this.backgroundOffsetPixels < (this.measurement * (this.spriteFrames - 1))) {
                this.backgroundOffsetPixels = this.backgroundOffsetPixels + this.measurement;
            } else {
                this.backgroundOffsetPixels = 0;
            }
        }
    }
    
    update(elapsedMs){
        this.oldPosition = Object.assign({}, this.position);

        if (this.moving) {
            const gridPosition = this.characterUtil.determineGridPosition(this.position, this.scaledTileSize);

            const desiredNewPosition = Object.assign({}, this.position);
            desiredNewPosition[this.characterUtil.getPropertyToChange(this.desiredDirection)] += this.characterUtil.getVelocity(this.desiredDirection, this.velocityPerMs) * elapsedMs;
            const desiredNewGridPosition = this.characterUtil.determineGridPosition(desiredNewPosition, this.scaledTileSize);

            const alternateNewPosition = Object.assign({}, this.position);
            alternateNewPosition[this.characterUtil.getPropertyToChange(this.direction)] += this.characterUtil.getVelocity(this.direction, this.velocityPerMs) * elapsedMs;
            const alternateNewGridPosition = this.characterUtil.determineGridPosition(alternateNewPosition, this.scaledTileSize);

            if (this.direction === this.desiredDirection) {
                if (this.characterUtil.checkForWallCollision(desiredNewGridPosition, this.mazeArray, this.desiredDirection)) {
                    this.position = this.characterUtil.snapToGrid(gridPosition, this.desiredDirection, this.scaledTileSize);
                    this.moving = false;
                } else {
                    this.position = desiredNewPosition;
                }
            } else {
                if (JSON.stringify(this.position) === JSON.stringify(this.characterUtil.snapToGrid(gridPosition, this.direction, this.scaledTileSize))) {
                    if (this.characterUtil.checkForWallCollision(desiredNewGridPosition, this.mazeArray, this.desiredDirection)) {
                        if (this.characterUtil.checkForWallCollision(alternateNewGridPosition, this.mazeArray, this.direction)) {
                            this.moving = false;
                        } else {
                            this.position = alternateNewPosition;
                        }
                    } else {
                        this.direction = this.desiredDirection;
                        this.setSpriteSheet(this.direction);
                        this.position = desiredNewPosition;
                    }
                } else {
                    if (this.characterUtil.changingGridPosition(gridPosition, alternateNewGridPosition)) {
                        if (this.characterUtil.turningAround(this.direction, this.desiredDirection)) {
                            this.direction = this.desiredDirection;
                            this.setSpriteSheet(this.direction);
                            this.position = desiredNewPosition;
                        } else {
                            const snappedPosition = this.characterUtil.snapToGrid(gridPosition, this.direction, this.scaledTileSize);
                            const positionAroundCorner = Object.assign({}, snappedPosition);
                            positionAroundCorner[this.characterUtil.getPropertyToChange(this.desiredDirection)] += this.characterUtil.getVelocity(this.desiredDirection, this.velocityPerMs) * elapsedMs;
                            const gridPositionAroundCorner = this.characterUtil.determineGridPosition(positionAroundCorner, this.scaledTileSize);
    
                            if (this.characterUtil.checkForWallCollision(gridPositionAroundCorner, this.mazeArray, this.desiredDirection)) {
                                if (this.characterUtil.checkForWallCollision(alternateNewGridPosition, this.mazeArray, this.direction)) {
                                    this.position = this.characterUtil.snapToGrid(gridPosition, this.direction, this.scaledTileSize);
                                    this.moving = false;
                                } else {
                                    this.position = alternateNewPosition;
                                }
                            } else {
                                this.position = this.characterUtil.snapToGrid(gridPosition, this.direction, this.scaledTileSize);
                            }
                        }
                    } else {
                        if (this.characterUtil.checkForWallCollision(alternateNewGridPosition, this.mazeArray, this.direction)) {
                            this.position = this.characterUtil.snapToGrid(gridPosition, this.direction, this.scaledTileSize);
                        } else {
                            this.position = alternateNewPosition;
                        }
                    }
                }
            }

            this.position = this.characterUtil.checkForWarp(this.position, this.characterUtil.determineGridPosition(this.position, this.scaledTileSize), this.scaledTileSize);

            this.msSinceLastSprite += elapsedMs;
        }
    }
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = Pacman;
}