class Pacman {
    constructor() {
        this.animationTarget = document.getElementById("pacman");
        this.slideWidth = 128;
        this.offsetPixels = 0;
    }
    
    animate(){
        this.animationTarget.style.backgroundPosition = `-${this.offsetPixels}px 0px`;
        
        if (this.offsetPixels < (this.slideWidth * 3)) {
            this.offsetPixels = this.offsetPixels + this.slideWidth;
        } else {
            this.offsetPixels = 0;
        }
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