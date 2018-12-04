class Ghost {
    constructor(scaledTileSize, mazeArray, pacman, name) {
        this.scaledTileSize = scaledTileSize;
        this.mazeArray = mazeArray;
        this.pacman = pacman;
        this.name = name;
        this.animationTarget = document.getElementById(name);

        this.setMovementStats(pacman);
        this.setSpriteAnimationStats();
        this.setStyleMeasurements(scaledTileSize, this.spriteFrames);
        this.setDefaultPosition(scaledTileSize, name);
        this.setSpriteSheet(this.name, this.direction);
    }

    setMovementStats(pacman) {
        this.directions = {
            up: 'up',
            down: 'down',
            left: 'left',
            right: 'right'
        }

        const pacmanSpeed = pacman.velocityPerMs;

        this.slowSpeed = pacmanSpeed * 0.75;
        this.mediumSpeed = pacmanSpeed * 0.90;
        this.fastSpeed = pacmanSpeed * 1.05;

        this.chasedSpeed = pacmanSpeed * 0.5;
        this.tunnelSpeed = pacmanSpeed * 0.5;
        this.eyeSpeed = pacmanSpeed * 3;

        this.velocityPerMs = this.slowSpeed;
        this.direction = this.directions.left;
    }

    setSpriteAnimationStats() {
        this.msBetweenSprites = 250;
        this.msSinceLastSprite = 0;
        this.spriteFrames = 2;
        this.backgroundOffsetPixels = 0;
    }

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

    draw(interp) {
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

    update(elapsedMs) {
        this.msSinceLastSprite += elapsedMs;
    }
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = Ghost;
}