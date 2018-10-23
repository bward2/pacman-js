class Pacman {
    constructor(scaledTileSize, maxFps) {
        this.animationTarget = document.getElementById("pacman");
        this.measurement = scaledTileSize * 2;
        this.offsetPixels = 0;
        this.velocityPerMillisecond = this.calculateVelocityPerMillisecond(scaledTileSize, maxFps);
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

    calculateVelocityPerMillisecond(scaledTileSize, maxFps) {
        // In the original game, Pacman moved at 11 tiles per second.
        let velocityPerSecond = scaledTileSize * 11;
        let velocityPerFrame = velocityPerSecond / maxFps;
        let expectedElapsedMilliseconds = 1000/maxFps;

        return velocityPerFrame / expectedElapsedMilliseconds;
    }

    calculateNewDrawValue(interp) {
        return this.oldPosition.left + (this.position.left - this.oldPosition.left) * interp;
    }

    draw(interp){
        this.animationTarget.style.left = `${this.calculateNewDrawValue(interp)}px`;

        // this.animationTarget.style.backgroundPosition = `-${this.offsetPixels}px 0px`;
        
        // if (this.offsetPixels < (this.slideWidth * 3)) {
        //     this.offsetPixels = this.offsetPixels + this.slideWidth;
        // } else {
        //     this.offsetPixels = 0;
        // }
    }
    
    update(elapsedMilliseconds){
        this.oldPosition = Object.assign({}, this.position);
        this.position.left += this.velocityPerMillisecond * elapsedMilliseconds;
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