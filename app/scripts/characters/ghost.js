class Ghost {
    constructor(scaledTileSize, mazeArray, pacman, name, characterUtil) {
        this.scaledTileSize = scaledTileSize;
        this.mazeArray = mazeArray;
        this.pacman = pacman;
        this.name = name;
        this.characterUtil = characterUtil;
        this.animationTarget = document.getElementById(name);

        this.setMovementStats(pacman);
        this.setSpriteAnimationStats();
        this.setStyleMeasurements(scaledTileSize, this.spriteFrames);
        this.setDefaultPosition(scaledTileSize, name);
        this.setSpriteSheet(this.name, this.direction);
    }

    /**
     * Sets various properties related to the ghost's movement
     * @param {Object} pacman - The character whose velocity will be used to set the ghost's various speeds
     */
    setMovementStats(pacman) {
        const pacmanSpeed = pacman.velocityPerMs;

        this.slowSpeed = pacmanSpeed * 0.75;
        this.mediumSpeed = pacmanSpeed * 0.90;
        this.fastSpeed = pacmanSpeed * 1.05;

        this.chasedSpeed = pacmanSpeed * 0.5;
        this.tunnelSpeed = pacmanSpeed * 0.5;
        this.eyeSpeed = pacmanSpeed * 3;

        this.velocityPerMs = this.slowSpeed;
        this.direction = this.characterUtil.directions.left;
        this.moving = false;
    }

    /**
     * Sets values pertaining to the ghost's spritesheet animation
     */
    setSpriteAnimationStats() {
        this.msBetweenSprites = 250;
        this.msSinceLastSprite = 0;
        this.spriteFrames = 2;
        this.backgroundOffsetPixels = 0;
    }

    /**
     * Sets css property values for the ghost
     * @param {number} scaledTileSize - The dimensions of a single tile
     * @param {number} spriteFrames - The number of frames in the ghost's spritesheet
     */
    setStyleMeasurements(scaledTileSize, spriteFrames) {
        // The ghosts are the size of 2x2 game tiles.
        this.measurement = scaledTileSize * 2;

        this.animationTarget.style.height = `${this.measurement}px`;
        this.animationTarget.style.width = `${this.measurement}px`;
        this.animationTarget.style.backgroundSize = `${this.measurement * spriteFrames}px`;
    }

    setDefaultPosition(scaledTileSize, name) {
        switch(name) {
            case 'blinky':
                this.position = {
                    top: scaledTileSize * 10.5,
                    left: scaledTileSize * 13
                };
                break;
            default:
                break;
        }
        this.oldPosition = Object.assign({}, this.position);
        this.animationTarget.style.top = `${this.position.top}px`;
        this.animationTarget.style.left = `${this.position.left}px`;
    }

    setSpriteSheet(name, direction) {
        this.animationTarget.style.backgroundImage = `url(app/style/graphics/spriteSheets/characters/ghosts/${name}/${name}_${direction}.svg)`;
    }

    isInTunnel(gridPosition) {
        return (gridPosition.y === 14 && (gridPosition.x < 6 || gridPosition.x > 21));
    }

    getTile(mazeArray, y, x) {
        let tile = false;

        if (mazeArray[y] && mazeArray[y][x] && mazeArray[y][x] !== 'X') {
            tile = {
                x: x,
                y: y
            };
        }

        return tile;
    }

    determinePossibleMoves(gridPosition, direction, mazeArray) {
        const x = gridPosition.x;
        const y = gridPosition.y;

        const possibleMoves = {
            up: this.getTile(mazeArray, y - 1, x),
            down: this.getTile(mazeArray, y + 1, x),
            left: this.getTile(mazeArray, y, x - 1),
            right: this.getTile(mazeArray, y, x + 1),
        };

        possibleMoves[this.characterUtil.getOppositeDirection(direction)] = false;

        for (let tile in possibleMoves) {
            if (possibleMoves[tile] === false) {
                delete possibleMoves[tile];
            }
        }
        
        return possibleMoves;
    }

    calculateDistance(position, pacman) {
        return Math.sqrt(Math.pow(position['x'] - pacman['x'], 2) + Math.pow(position['y'] - pacman['y'], 2));
    }

    blinkyBestMove(possibleMoves, pacmanGridPosition) {
        let shortestDistance = Infinity;
        let bestMove;

        for (let move in possibleMoves) {
            let distance = this.calculateDistance(possibleMoves[move], pacmanGridPosition);
            if (distance < shortestDistance) {
                shortestDistance = distance;
                bestMove = move;
            }
        }

        return bestMove;
    }

    determineBestMove(name, possibleMoves, pacmanGridPosition) {
        switch(name) {
            case 'blinky':
                return this.blinkyBestMove(possibleMoves, pacmanGridPosition);
            default:
                // TODO: Other ghosts
                return 'left';
        }
    }

    determineDirection(name, gridPosition, pacmanGridPosition, direction, mazeArray) {
        let newDirection = direction;
        const possibleMoves = this.determinePossibleMoves(gridPosition, direction, mazeArray);

        if (Object.keys(possibleMoves).length === 1) {
            newDirection = Object.keys(possibleMoves)[0];
        } else if (Object.keys(possibleMoves).length > 1) {
            newDirection = this.determineBestMove(name, possibleMoves, pacmanGridPosition);
        }

        return newDirection;
    }

    draw(interp) {
        this.animationTarget.style['top'] = `${this.characterUtil.calculateNewDrawValue(interp, 'top', this.oldPosition, this.position)}px`;
        this.animationTarget.style['left'] = `${this.characterUtil.calculateNewDrawValue(interp, 'left', this.oldPosition, this.position)}px`;

        this.animationTarget.style['visibility'] = this.characterUtil.checkForStutter(this.position, this.oldPosition);

        this.characterUtil.advanceSpriteSheet(this);
    }

    update(elapsedMs) {
        this.oldPosition = Object.assign({}, this.position);

        if(this.pacman.moving) {
            this.moving = true;
        }

        if (this.moving) {
            const gridPosition = this.characterUtil.determineGridPosition(this.position, this.scaledTileSize);
            const velocity = this.isInTunnel(gridPosition) ? this.tunnelSpeed : this.velocityPerMs;

            if (JSON.stringify(this.position) === JSON.stringify(this.characterUtil.snapToGrid(gridPosition, this.direction, this.scaledTileSize))) {
                const pacmanGridPosition = this.characterUtil.determineGridPosition(this.pacman.position, this.scaledTileSize);
                this.direction = this.determineDirection(this.name, gridPosition, pacmanGridPosition, this.direction, this.mazeArray);
                this.setSpriteSheet(this.name, this.direction);

                this.position[this.characterUtil.getPropertyToChange(this.direction)] += this.characterUtil.getVelocity(this.direction, velocity) * elapsedMs;
            } else {
                const newPosition = Object.assign({}, this.position);
                newPosition[this.characterUtil.getPropertyToChange(this.direction)] += this.characterUtil.getVelocity(this.direction, velocity) * elapsedMs;
                const newGridPosition = this.characterUtil.determineGridPosition(newPosition, this.scaledTileSize);
    
                if (this.characterUtil.changingGridPosition(gridPosition, newGridPosition)) {
                    this.position = this.characterUtil.snapToGrid(gridPosition, this.direction, this.scaledTileSize);
                } else {
                    this.position = newPosition;
                }
            }

            this.position = this.characterUtil.handleWarp(this.position, this.scaledTileSize, this.mazeArray);

            this.msSinceLastSprite += elapsedMs;
        }
    }
}

//removeIf(production)
module.exports = Ghost;
//endRemoveIf(production)