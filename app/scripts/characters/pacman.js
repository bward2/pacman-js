class Pacman {
    constructor(scaledTileSize, mazeArray) {
        this.scaledTileSize = scaledTileSize;
        this.mazeArray = mazeArray;
        this.animationTarget = document.getElementById("pacman");

        this.setMovementStats(scaledTileSize);
        this.setStyleMeasurements(scaledTileSize);
        this.setSpriteAnimationStats();
        this.setDefaultPosition(scaledTileSize);
        this.setKeyListeners();

        this.setSpriteSheet(this.direction);
    }

    setStyleMeasurements(scaledTileSize) {
        // Pacman is the size of 2x2 tiles.
        this.measurement = scaledTileSize * 2;

        this.animationTarget.style.height = `${this.measurement}px`;
        this.animationTarget.style.width = `${this.measurement}px`;
        this.animationTarget.style.backgroundSize = `${this.measurement * 4}px`;
    }

    setSpriteAnimationStats() {
        this.msBetweenSprites = 100;
        this.msSinceLastSprite = 0;
        this.spriteFrames = 4;
        this.backgroundOffsetPixels = 0;
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

    setMovementStats(scaledTileSize) {
        this.velocityPerMs = this.calculateVelocityPerMs(scaledTileSize);
        this.directions = {
            up: 'up',
            down: 'down',
            left: 'left',
            right: 'right'
        }
        this.direction = this.directions.right;
        this.moving = false;
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
            this.setSpriteSheet(this.direction);
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
            //TODO: Add a variable here for 'desiredDirection'
            this.direction = this.directions[this.movementKeys[e.keyCode]];
            this.moving = true;
        }
    }

    calculateNewDrawValue(interp, prop) {
        return this.oldPosition[prop] + (this.position[prop] - this.oldPosition[prop]) * interp;
    }

    determineGridPosition(currentPosition) {
        return {
            x : (currentPosition.left / this.scaledTileSize) + 0.5,
            y : (currentPosition.top / this.scaledTileSize) + 0.5
        };
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
        let prop = this.getPropertyToChange(this.direction);
        this.animationTarget.style[prop] = `${this.calculateNewDrawValue(interp, prop)}px`;

        if (this.msSinceLastSprite > this.msBetweenSprites) {
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
        if (this.moving) {
            this.oldPosition = Object.assign({}, this.position);
            let gridPosition = this.determineGridPosition(this.position);
            let desiredNewPosition = Object.assign({}, this.position);
            desiredNewPosition[this.getPropertyToChange(this.direction)] += this.getVelocity(this.direction, this.velocityPerMs) * elapsedMs;
            let desiredNewGridPosition = this.determineGridPosition(desiredNewPosition, this.mazeArray);
            if (this.checkForWallCollision(desiredNewGridPosition, this.mazeArray, this.direction)) {
                this.position = this.snapToGrid(gridPosition, this.direction, this.scaledTileSize);
                this.moving = false;
            } else {
                this.position = desiredNewPosition;
            };
    
            this.msSinceLastSprite += elapsedMs;
        }
    }
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = Pacman;
}