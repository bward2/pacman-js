class Pickup {
  constructor(type, scaledTileSize, column, row, pacman, mazeDiv) {
    this.type = type;
    this.pacman = pacman;
    this.mazeDiv = mazeDiv;

    this.setStyleMeasurements(type, scaledTileSize, column, row);
  }

  /**
   * Sets various style measurements for the pickup depending on its type
   * @param {('pacdot'|'powerPellet'|'fruit')} type - The classification of pickup
   * @param {number} scaledTileSize
   * @param {number} column
   * @param {number} row
   */
  setStyleMeasurements(type, scaledTileSize, column, row) {
    if (type === 'pacdot') {
      this.size = scaledTileSize * 0.25;
      this.x = (column * scaledTileSize) + ((scaledTileSize / 8) * 3);
      this.y = (row * scaledTileSize) + ((scaledTileSize / 8) * 3);
    } else {
      this.size = scaledTileSize;
      this.x = (column * scaledTileSize);
      this.y = (row * scaledTileSize);
    }

    this.animationTarget = document.createElement('div');
    this.animationTarget.style.position = 'absolute';
    this.animationTarget.style.backgroundSize = `${this.size}px`;
    this.animationTarget.style.backgroundImage = 'url(app/style/graphics/'
      + `spriteSheets/pickups/${type}.svg`;
    this.animationTarget.style.height = `${this.size}px`;
    this.animationTarget.style.width = `${this.size}px`;
    this.animationTarget.style.top = `${this.y}px`;
    this.animationTarget.style.left = `${this.x}px`;
    this.mazeDiv.appendChild(this.animationTarget);
  }

  /**
   * Returns true if the Pickup rectangle is contained within Pacman's rectangle
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
      dotX > pacmanX
      && dotY > pacmanY
      && (dotX + dotSize) < (pacmanX + pacmanSize)
      && (dotY + dotSize) < (pacmanY + pacmanSize)
    );
  }

  /**
   * If the Pickup is still visible, it checks to see if it is colliding with Pacman.
   * It will turn itself invisible and cease collision-detection after the first
   * collision with Pacman.
   */
  update() {
    if (this.animationTarget.style.visibility !== 'hidden') {
      if (this.checkForCollision(
        this.x, this.y, this.size, this.pacman.position.left,
        this.pacman.position.top, this.pacman.measurement,
      )) {
        this.animationTarget.style.visibility = 'hidden';
        if (this.type === 'powerPellet') {
          window.dispatchEvent(new Event('powerUp'));
        }
      }
    }
  }
}

// removeIf(production)
module.exports = Pickup;
// endRemoveIf(production)
