class Pacman {
    constructor(scaledTileSize, mazeArray) {
        this.scaledTileSize = scaledTileSize;
        this.mazeArray = mazeArray;
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
        this.directions = {
            up: 'up',
            down: 'down',
            left: 'left',
            right: 'right'
        }
        this.desiredDirection = this.directions.left;
        this.direction = this.directions.left;
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

    getPropertyToChange(direction) {
        switch(direction) {
            case this.directions.up:
            case this.directions.down:
                return 'top';
            default:
                return 'left';
        }
    }

    getVelocity(direction, velocityPerMs) {
        switch(direction) {
            case this.directions.up:
            case this.directions.left:
                return velocityPerMs * -1;
            default:
                return velocityPerMs;
        }
    }

    changeDirection(e) {
        if(this.movementKeys[e.keyCode]) {
            this.desiredDirection = this.directions[this.movementKeys[e.keyCode]];
            this.pacmanArrow.style.backgroundImage = `url(app/style/graphics/spriteSheets/characters/pacman/arrow_${this.desiredDirection}.svg)`;
            this.moving = true;
        }
    }

    calculateNewDrawValue(interp, prop) {
        return this.oldPosition[prop] + (this.position[prop] - this.oldPosition[prop]) * interp;
    }

    updatePacmanArrowPosition(position, scaledTileSize) {
        this.pacmanArrow.style.top = `${position.top - scaledTileSize}px`;
        this.pacmanArrow.style.left = `${position.left - scaledTileSize}px`;
    }

    determineGridPosition(currentPosition) {
        return {
            x : (currentPosition.left / this.scaledTileSize) + 0.5,
            y : (currentPosition.top / this.scaledTileSize) + 0.5
        };
    }

    turningAround(direction, desiredDirection) {
        switch(direction) {
            case this.directions.up:
                return desiredDirection === this.directions.down;
            case this.directions.down:
                return desiredDirection === this.directions.up;
            case this.directions.left:
                return desiredDirection === this.directions.right;
            default:
                return desiredDirection === this.directions.left;
        }
    }

    determineRoundingFunction(direction) {
        switch(direction) {
            case this.directions.up:
            case this.directions.left:
                return Math.floor;
            default:
                return Math.ceil;
        } 
    }

    changingGridPosition(oldPosition, newPosition) {
        return (
            Math.floor(oldPosition.x) !== Math.floor(newPosition.x) ||
            Math.floor(oldPosition.y) !== Math.floor(newPosition.y)
        );
    }

    checkForWallCollision(desiredNewGridPosition, mazeArray, direction) {
        let roundingFunction = this.determineRoundingFunction(direction);

        let desiredX = roundingFunction(desiredNewGridPosition.x);
        let desiredY = roundingFunction(desiredNewGridPosition.y);
        let newGridValue;

        if (Array.isArray(mazeArray[desiredY])) {
            newGridValue = mazeArray[desiredY][0].charAt(desiredX);
        }
        
        return (newGridValue === 'X');
    }

    snapToGrid(position, direction, scaledTileSize) {
        let newPosition = Object.assign({}, position);
        let roundingFunction = this.determineRoundingFunction(direction);

        switch(direction) {
            case this.directions.up:
            case this.directions.down:
                newPosition.y = roundingFunction(newPosition.y);
                break;
            default:
                newPosition.x = roundingFunction(newPosition.x);
                break;
        }

        return {
            top: (newPosition.y - 0.5) * scaledTileSize,
            left: (newPosition.x - 0.5) * scaledTileSize
        };
    }

    draw(interp){
        this.animationTarget.style['top'] = `${this.calculateNewDrawValue(interp, 'top')}px`;
        this.animationTarget.style['left'] = `${this.calculateNewDrawValue(interp, 'left')}px`;

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
            let gridPosition = this.determineGridPosition(this.position);

            let desiredNewPosition = Object.assign({}, this.position);
            desiredNewPosition[this.getPropertyToChange(this.desiredDirection)] += this.getVelocity(this.desiredDirection, this.velocityPerMs) * elapsedMs;
            let desiredNewGridPosition = this.determineGridPosition(desiredNewPosition, this.mazeArray);

            let alternateNewPosition = Object.assign({}, this.position);
            alternateNewPosition[this.getPropertyToChange(this.direction)] += this.getVelocity(this.direction, this.velocityPerMs) * elapsedMs;
            let alternateNewGridPosition = this.determineGridPosition(alternateNewPosition, this.mazeArray);

            if (this.direction === this.desiredDirection) {
                if (this.checkForWallCollision(desiredNewGridPosition, this.mazeArray, this.desiredDirection)) {
                    this.position = this.snapToGrid(gridPosition, this.desiredDirection, this.scaledTileSize);
                    this.moving = false;
                } else {
                    this.position = desiredNewPosition;
                }
            } else {
                if (JSON.stringify(this.position) === JSON.stringify(this.snapToGrid(gridPosition, this.direction, this.scaledTileSize))) {
                    if (this.checkForWallCollision(desiredNewGridPosition, this.mazeArray, this.desiredDirection)) {
                        if (this.checkForWallCollision(alternateNewGridPosition, this.mazeArray, this.direction)) {
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
                    if (this.changingGridPosition(gridPosition, alternateNewGridPosition)) {
                        if (this.turningAround(this.direction, this.desiredDirection)) {
                            this.direction = this.desiredDirection;
                            this.setSpriteSheet(this.direction);
                            this.position = desiredNewPosition;
                        } else {
                            let snappedPosition = this.snapToGrid(gridPosition, this.direction, this.scaledTileSize);
                            let positionAroundCorner = Object.assign({}, snappedPosition);
                            positionAroundCorner[this.getPropertyToChange(this.desiredDirection)] += this.getVelocity(this.desiredDirection, this.velocityPerMs) * elapsedMs;
                            let gridPositionAroundCorner = this.determineGridPosition(positionAroundCorner, this.mazeArray);
    
                            if (this.checkForWallCollision(gridPositionAroundCorner, this.mazeArray, this.desiredDirection)) {
                                if (this.checkForWallCollision(alternateNewGridPosition, this.mazeArray, this.direction)) {
                                    this.position = this.snapToGrid(gridPosition, this.direction, this.scaledTileSize);
                                    this.moving = false;
                                } else {
                                    this.position = alternateNewPosition;
                                }
                            } else {
                                this.position = this.snapToGrid(gridPosition, this.direction, this.scaledTileSize);
                            }
                        }
                    } else {
                        if (this.checkForWallCollision(alternateNewGridPosition, this.mazeArray, this.direction)) {
                            this.position = this.snapToGrid(gridPosition, this.direction, this.scaledTileSize);
                        } else {
                            this.position = alternateNewPosition;
                        }
                    }
                }
            }

            this.msSinceLastSprite += elapsedMs;
        }
    }
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = Pacman;
}