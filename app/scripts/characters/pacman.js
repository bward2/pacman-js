class Pacman {
    constructor(scaledTileSize) {
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
            top: scaledTileSize * 22,
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
            this.direction = this.directions[this.movementKeys[e.keyCode]];
            this.moving = true;
        }
    }

    calculateNewDrawValue(interp, prop) {
        return this.oldPosition[prop] + (this.position[prop] - this.oldPosition[prop]) * interp;
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
            this.position[this.getPropertyToChange(this.direction)] += this.getVelocity(this.direction, this.velocityPerMs) * elapsedMs;
    
            this.msSinceLastSprite += elapsedMs;
        }
    }
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = Pacman;
}