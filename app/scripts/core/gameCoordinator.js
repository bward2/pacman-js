class GameCoordinator {
  constructor() {
    this.mazeDiv = document.getElementById('maze');
    this.mazeCover = document.getElementById('maze-cover');

    this.animate = true;
    this.maxFps = 120;
    this.tileSize = 8;
    this.scale = 3;
    this.scaledTileSize = this.tileSize * this.scale;
    this.activeTimers = [];

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
    this.allowPause = true;

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

    this.ghosts = [
      this.blinky,
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
    window.addEventListener('addTimer', this.addTimer.bind(this));
    window.addEventListener('removeTimer', this.removeTimer.bind(this));
  }

  /**
   * Calls various class functions depending upon the pressed key
   * @param {Event} e - The keydown event to evaluate
   */
  handleKeyDown(e) {
    // ESC key
    if (e.keyCode === 27) {
      this.handlePauseKey();
    } else if (this.movementKeys[e.keyCode] && this.allowKeyPresses) {
      if (this.gameEngine.running) {
        this.pacman.changeDirection(
          this.movementKeys[e.keyCode], this.allowPacmanMovement,
        );
      }
    }
  }

  handlePauseKey() {
    if (this.allowPause) {
      this.allowPause = false;

      setTimeout(() => {
        this.allowPause = true;
      }, 500);

      this.gameEngine.changePausedState(this.gameEngine.running);

      if (this.gameEngine.started) {
        this.activeTimers.forEach((timer) => {
          timer.resume();
        });
      } else {
        this.activeTimers.forEach((timer) => {
          timer.pause();
        });
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
    new Timer(() => {
      this.blinky.display = false;
      this.pacman.prepDeathAnimation();
      new Timer(() => {
        this.mazeCover.style.visibility = 'visible';
        new Timer(() => {
          this.allowKeyPresses = true;
          this.mazeCover.style.visibility = 'hidden';
          this.pacman.reset();
          this.blinky.reset();
        }, 500);
      }, 2250);
    }, 750);
  }

  flashGhosts(flashes, maxFlashes) {
    if (this.flashingGhosts) {
      if (flashes === maxFlashes) {
        this.flashingGhosts = false;
        this.scaredGhosts.forEach((ghost) => {
          ghost.endScared();
        });
        this.scaredGhosts = [];
      } else {
        if (this.scaredGhosts.length > 0) {
          this.scaredGhosts.forEach((ghost) => {
            ghost.toggleScaredColor();
          });
        }

        new Timer(() => {
          this.flashGhosts(flashes + 1, maxFlashes);
        }, 250);
      }
    }
  }

  /**
   * Upon eating a power pellet, sets the ghosts to 'scared' mode
   */
  powerUp() {
    if (this.timerExists(this.powerupTimer)) {
      this.removeTimer({ detail: { id: this.powerupTimer } });
    }

    this.flashingGhosts = false;
    this.scaredGhosts = [];

    this.ghosts.forEach((ghost) => {
      if (ghost.mode !== 'eyes') {
        this.scaredGhosts.push(ghost);
      }
    });

    this.scaredGhosts.forEach((ghost) => {
      ghost.becomeScared();
    });

    this.powerupTimer = new Timer(() => {
      this.flashingGhosts = true;
      this.flashGhosts(0, 9);
    }, 6000).timerId;
  }

  /**
   * Upon eating a ghost, award points and temporarily pause movement
   * @param {CustomEvent} e - Contains a target ghost object
   */
  eatGhost(e) {
    const pauseDuration = 1000;
    const { position, measurement } = e.detail.ghost;
    this.scaredGhosts = this.scaredGhosts.filter(
      ghost => ghost.name !== e.detail.ghost.name,
    );

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

    new Timer(() => {
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
   * Creates a temporary div to display points on screen
   * @param {({ left: number, top: number })} position - CSS coordinates to display the points at
   * @param {Number} amount - Amount of points to display
   * @param {Number} duration - Milliseconds to display the points before disappearing
   * @param {Number} measurement - Size of the points picture
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

    new Timer(() => {
      this.mazeDiv.removeChild(pointsDiv);
    }, duration);
  }

  addTimer(e) {
    this.activeTimers.push(e.detail.timer);
  }

  timerExists(id) {
    const result = this.activeTimers.filter(
      timer => timer.timerId === id,
    );

    return (result.length === 1);
  }

  removeTimer(e) {
    window.clearTimeout(e.detail.id);
    this.activeTimers = this.activeTimers.filter(
      timer => timer.timerId !== e.detail.id,
    );
  }
}

// removeIf(production)
module.exports = GameCoordinator;
// endRemoveIf(production)
