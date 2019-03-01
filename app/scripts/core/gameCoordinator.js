class GameCoordinator {
  constructor() {
    this.mazeDiv = document.getElementById('maze');
    this.mazeCover = document.getElementById('maze-cover');

    this.animate = true;
    this.maxFps = 120;
    this.tileSize = 8;
    this.scale = 3;
    this.scaledTileSize = this.tileSize * this.scale;

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
      39: 'right',
    };

    this.allowKeyPresses = true;
    this.allowPacmanMovement = true;

    this.mazeArray = [
      ['XXXXXXXXXXXXXXXXXXXXXXXXXXXX'],
      ['XooooooooooooXXooooooooooooX'],
      ['XoXXXXoXXXXXoXXoXXXXXoXXXXoX'],
      ['XOXXXXoXXXXXoXXoXXXXXoXXXXOX'],
      ['XoXXXXoXXXXXoXXoXXXXXoXXXXoX'],
      ['XooooooooooooooooooooooooooX'],
      ['XoXXXXoXXoXXXXXXXXoXXoXXXXoX'],
      ['XoXXXXoXXoXXXXXXXXoXXoXXXXoX'],
      ['XooooooXXooooXXooooXXooooooX'],
      ['XXXXXXoXXXXX XX XXXXXoXXXXXX'],
      ['XXXXXXoXXXXX XX XXXXXoXXXXXX'],
      ['XXXXXXoXX          XXoXXXXXX'],
      ['XXXXXXoXX XXXXXXXX XXoXXXXXX'],
      ['XXXXXXoXX X      X XXoXXXXXX'],
      ['      o   X      X   o      '],
      ['XXXXXXoXX X      X XXoXXXXXX'],
      ['XXXXXXoXX XXXXXXXX XXoXXXXXX'],
      ['XXXXXXoXX          XXoXXXXXX'],
      ['XXXXXXoXX XXXXXXXX XXoXXXXXX'],
      ['XXXXXXoXX XXXXXXXX XXoXXXXXX'],
      ['XooooooooooooXXooooooooooooX'],
      ['XoXXXXoXXXXXoXXoXXXXXoXXXXoX'],
      ['XoXXXXoXXXXXoXXoXXXXXoXXXXoX'],
      ['XOooXXooooooo  oooooooXXooOX'],
      ['XXXoXXoXXoXXXXXXXXoXXoXXoXXX'],
      ['XXXoXXoXXoXXXXXXXXoXXoXXoXXX'],
      ['XooooooXXooooXXooooXXooooooX'],
      ['XoXXXXXXXXXXoXXoXXXXXXXXXXoX'],
      ['XoXXXXXXXXXXoXXoXXXXXXXXXXoX'],
      ['XooooooooooooooooooooooooooX'],
      ['XXXXXXXXXXXXXXXXXXXXXXXXXXXX'],
    ];

    this.mazeArray.forEach((row, rowIndex) => {
      this.mazeArray[rowIndex] = row[0].split('');
    });

    this.entityList = [
      this.pacman = new Pacman(
        this.scaledTileSize, this.mazeArray, new CharacterUtil(),
      ),
      this.blinky = new Ghost(
        this.scaledTileSize, this.mazeArray, this.pacman, 'blinky',
        new CharacterUtil(),
      ),
    ];

    this.registerEventListeners();

    this.drawMaze(this.mazeArray, this.entityList);

    this.gameEngine = new GameEngine(this.maxFps, this.entityList);
    this.gameEngine.start();
  }

  /**
   * Adds HTML elements to draw on the webpage by iterating through the 2D maze array
   * @param {Array} mazeArray - 2D array representing the game board
   * @param {Array} entityList - List of entities to be used throughout the game
   */
  drawMaze(mazeArray, entityList) {
    mazeArray.forEach((row, rowIndex) => {
      const rowDiv = document.createElement('div');
      rowDiv.classList.add('maze-row');
      row.forEach((block, columnIndex) => {
        const mazeBlock = document.createElement('div');
        mazeBlock.style.width = `${this.scaledTileSize}px`;
        mazeBlock.style.height = `${this.scaledTileSize}px`;
        mazeBlock.style.background = block === 'X' ? 'black' : 'gray';

        if (block === 'o') {
          entityList.push(new Pickup(
            'pacdot', this.scaledTileSize, columnIndex,
            rowIndex, this.pacman, this.mazeDiv,
          ));
        } else if (block === 'O') {
          entityList.push(new Pickup(
            'powerPellet', this.scaledTileSize, columnIndex,
            rowIndex, this.pacman, this.mazeDiv,
          ));
        }

        rowDiv.appendChild(mazeBlock);
      });
      this.mazeDiv.appendChild(rowDiv);
    });
  }

  /**
   * Register listeners for various game sequences
   */
  registerEventListeners() {
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('deathSequence', this.deathSequence.bind(this));
    window.addEventListener('powerUp', this.powerUp.bind(this));
    window.addEventListener('eatGhost', this.eatGhost.bind(this));
  }

  /**
   * Calls various class functions depending upon the pressed key
   * @param {Event} e - The keydown event to evaluate
   */
  handleKeyDown(e) {
    if (this.allowKeyPresses) {
      // ESC key
      if (e.keyCode === 27) {
        this.gameEngine.changePausedState(this.gameEngine.running);
      } else if (this.movementKeys[e.keyCode]) {
        if (this.gameEngine.running) {
          this.pacman.changeDirection(
            this.movementKeys[e.keyCode], this.allowPacmanMovement,
          );
        }
      }
    }
  }

  /**
   * Animates Pacman's death, subtracts a life, and resets character positions if the player
   * has remaining lives.
   */
  deathSequence() {
    this.allowKeyPresses = false;
    this.pacman.moving = false;
    this.blinky.moving = false;
    setTimeout(() => {
      this.blinky.display = false;
      this.pacman.prepDeathAnimation();
      setTimeout(() => {
        this.mazeCover.style.visibility = 'visible';
        setTimeout(() => {
          this.allowKeyPresses = true;
          this.mazeCover.style.visibility = 'hidden';
          this.pacman.reset();
          this.blinky.reset();
        }, 500);
      }, 2250);
    }, 750);
  }

  /**
   * Upon eating a power pellet, sets the ghosts to 'scared' mode
   */
  powerUp() {
    this.blinky.becomeScared();
  }

  /**
   * Upon eating a ghost, award points and temporarily pause movement
   * @param {CustomEvent} e - Contains a target ghost object
   */
  eatGhost(e) {
    const pauseDuration = 1000;
    const { position, measurement } = e.detail.ghost;

    this.displayPoints(
      position, 200, pauseDuration, measurement,
    );

    this.allowPacmanMovement = false;
    this.pacman.display = false;
    e.detail.ghost.display = false;
    this.entityList.forEach((entity) => {
      const entityRef = entity;
      entityRef.moving = false;
      entityRef.animate = false;
    });

    setTimeout(() => {
      this.allowPacmanMovement = true;
      this.pacman.display = true;
      e.detail.ghost.display = true;
      this.entityList.forEach((entity) => {
        const entityRef = entity;
        entityRef.moving = true;
        entityRef.animate = true;
      });
    }, pauseDuration);
  }

  /**
   *
   * @param {*} position
   * @param {*} amount
   * @param {*} duration
   * @param {*} size
   */
  displayPoints(position, amount, duration, measurement) {
    const pointsDiv = document.createElement('div');

    pointsDiv.style.position = 'absolute';
    pointsDiv.style.backgroundSize = `${measurement}px`;
    pointsDiv.style.backgroundImage = 'url(app/style/graphics/'
      + `spriteSheets/points/${amount}.svg`;
    pointsDiv.style.height = `${measurement}px`;
    pointsDiv.style.width = `${measurement}px`;
    pointsDiv.style.top = `${position.top}px`;
    pointsDiv.style.left = `${position.left}px`;

    this.mazeDiv.appendChild(pointsDiv);

    setTimeout(() => {
      this.mazeDiv.removeChild(pointsDiv);
    }, duration);
  }
}

// removeIf(production)
module.exports = GameCoordinator;
// endRemoveIf(production)
