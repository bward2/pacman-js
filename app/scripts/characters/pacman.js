class Pacman {
    constructor(scaledTileSize, maxFps) {
        this.animationTarget = document.getElementById("pacman");
        this.measurement = scaledTileSize * 2;
        this.msBetweenSprites = 1000/10;
        this.msSinceLastSprite = 0;
        this.spriteFrames = 4;
        this.backgroundOffsetPixels = 0;
        this.offsetPixels = 0;
        this.velocityPerMs = this.calculateVelocityPerMs(scaledTileSize, maxFps);
        this.position = {
            up: 0,
            down: 0,
            left: 0,
            right: 0
        };
        this.oldPosition = Object.assign({}, this.position);

        this.animationTarget.style.height = `${this.measurement}px`;
        this.animationTarget.style.width = `${this.measurement}px`;
        this.animationTarget.style.backgroundSize = `${this.measurement * 4}px`;
    }

    calculateVelocityPerMs(scaledTileSize, maxFps) {
        // In the original game, Pacman moved at 11 tiles per second.
        let velocityPerSecond = scaledTileSize * 11;
        let velocityPerFrame = velocityPerSecond / maxFps;
        let expectedElapsedMs = 1000/maxFps;

        return velocityPerFrame / expectedElapsedMs;
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
    
    stopAnimation(){
        
    }
    
    startAnimation(){
        this.animationInterval = setInterval(() => {
            this.animate();
        }, 100);
    }
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = Pacman;
}