class Pacman {
    constructor(scaledTileSize, maxFps) {
        this.animationTarget = document.getElementById("pacman");

        this.setStyleMeasurements(scaledTileSize);
        this.setSpriteAnimationStats();
        this.setDefaultPosition();
        this.velocityPerMs = this.calculateVelocityPerMs(scaledTileSize);
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

    setDefaultPosition() {
        this.position = {
            up: 0,
            down: 0,
            left: 0,
            right: 0
        };
        this.oldPosition = Object.assign({}, this.position);
    }

    calculateVelocityPerMs(scaledTileSize) {
        // In the original game, Pacman moved at 11 tiles per second.
        let velocityPerSecond = scaledTileSize * 11;
        return velocityPerSecond / 1000;
    }

    calculateNewDrawValue(interp) {
        return this.oldPosition.left + (this.position.left - this.oldPosition.left) * interp;
    }

    draw(interp){
        this.animationTarget.style.left = `${this.calculateNewDrawValue(interp)}px`;

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
        this.oldPosition = Object.assign({}, this.position);
        this.position.left += this.velocityPerMs * elapsedMs;

        this.msSinceLastSprite += elapsedMs;
    }
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = Pacman;
}