class GameCoordinator {
  constructor() {
    this.mazeDiv = document.getElementById('maze');
    this.mazeCover = document.getElementById('maze-cover');

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

    this.eventInProgress = false;

    this.mazeArray = [
      ['XXXXXXXXXXXXXXXXXXXXXXXXXXXX'],
      ['XooooooooooooXXooooooooooooX'],
      ['XoXXXXoXXXXXoXXoXXXXXoXXXXoX'],
      ['X XXXXoXXXXXoXXoXXXXXoXXXX X'],
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
      ['X ooXXooooooo  oooooooXXoo X'],
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
          entityList.push(new Pacdot(
            this.scaledTileSize, columnIndex, rowIndex,
            this.pacman, this.mazeDiv,
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
  }

  /**
   * Calls various class functions depending upon the pressed key
   * @param {Event} e - The keydown event to evaluate
   */
  handleKeyDown(e) {
    if (!this.eventInProgress) {
      // ESC key
      if (e.keyCode === 27) {
        this.gameEngine.changePausedState(this.gameEngine.running);
      } else if (this.movementKeys[e.keyCode]) {
        if (this.gameEngine.running) {
          this.pacman.changeDirection(this.movementKeys[e.keyCode]);
        }
      }
    }
  }

  /**
   * Animates Pacman's death, subtracts a life, and resets character positions if the player
   * has remaining lives.
   */
  deathSequence() {
    this.eventInProgress = true;
    this.pacman.moving = false;
    this.blinky.moving = false;
    setTimeout(() => {
      this.blinky.display = false;
      this.pacman.prepDeathAnimation();
      setTimeout(() => {
        this.mazeCover.style.visibility = 'visible';
        setTimeout(() => {
          this.eventInProgress = false;
          this.mazeCover.style.visibility = 'hidden';
          this.pacman.reset();
          this.blinky.reset();
        }, 400);
      }, 2000);
    }, 750);
  }
}

// removeIf(production)
module.exports = GameCoordinator;
// endRemoveIf(production)
