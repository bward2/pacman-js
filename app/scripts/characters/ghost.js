class Ghost {
    constructor(scaledTileSize, mazeArray, pacman, name) {
        this.scaledTileSize = scaledTileSize;
        this.mazeArray = mazeArray;
        this.pacman = pacman;
        this.name = name;
        this.animationTarget = document.getElementById(name);

        this.setMovementStats(this.pacman);
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
    }
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = Ghost;
}