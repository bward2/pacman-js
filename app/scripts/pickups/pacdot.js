class Pacdot {
    constructor(scaledTileSize, column, row, pacman, mazeDiv) {
        this.size = scaledTileSize * 0.25;
        this.x = (column * scaledTileSize) + ((scaledTileSize / 8) * 3);
        this.y = (row * scaledTileSize) + ((scaledTileSize / 8) * 3);
        this.pacman = pacman;

        this.animationTarget = document.createElement('div');
        this.animationTarget.classList.add('pacdot');
        this.animationTarget.style.height = `${this.size}px`;
        this.animationTarget.style.width = `${this.size}px`;
        this.animationTarget.style.top = `${this.y}px`;
        this.animationTarget.style.left = `${this.x}px`;
        mazeDiv.appendChild(this.animationTarget);
    }

    /**
     * Checks to see if the smaller Pacdot rectangle is completely contained within the larger Pacman rectangle
     * @param {number} dotX
     * @param {number} dotY
     * @param {number} dotSize
     * @param {number} pacmanX
     * @param {number} pacmanY
     * @param {number} pacmanSize
     * @returns {boolean}
     */
    checkForCollision(dotX, dotY, dotSize, pacmanX, pacmanY, pacmanSize) {
        return (
            dotX > pacmanX &&
            dotY > pacmanY &&
            (dotX + dotSize) < (pacmanX + pacmanSize) &&
            (dotY + dotSize) < (pacmanY + pacmanSize)
        );
    }

    /**
     * If the Pacdot is still visible, it checks to see if it is colliding with Pacman. It will turn itself invisible and cease
     * collision-detection after the first collision with Pacman.
     */
    update() {
        if (this.animationTarget.style.visibility !== 'hidden') {
            if (this.checkForCollision(this.x, this.y, this.size, this.pacman.position.left, this.pacman.position.top, this.pacman.measurement)) {
                this.animationTarget.style.visibility = 'hidden';
            }
        }
    }
}

//removeIf(production)
module.exports = Pacdot;
//endRemoveIf(production)