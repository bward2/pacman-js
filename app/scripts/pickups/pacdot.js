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

    draw() {

    }

    update() {

    }
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = Pacdot;
}