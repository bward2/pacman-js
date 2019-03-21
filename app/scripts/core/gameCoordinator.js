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
    this.points = 0;
    this.level = 1;
    this.remainingDots = 0;

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
      this.fruit = new Pickup(
        'fruit', this.scaledTileSize, 13.5, 17, this.pacman,
        this.mazeDiv, 100,
      ),
    ];

    this.ghosts = [
      this.blinky,
    ];

    this.pickups = [
      this.fruit,
    ];

    this.registerEventListeners();
    this.drawMaze(this.mazeArray, this.entityList);
    setInterval(() => {
      this.collisionDetectionLoop();
    }, 500);

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

        if (block === 'o' || block === 'O') {
          const type = (block === 'o') ? 'pacdot' : 'powerPellet';
          const points = (block === 'o') ? 10 : 50;
          const dot = new Pickup(
            type, this.scaledTileSize, columnIndex,
            rowIndex, this.pacman, this.mazeDiv, points,
          );

          entityList.push(dot);
          this.pickups.push(dot);
          this.remainingDots += 1;
        }

        rowDiv.appendChild(mazeBlock);
      });
      this.mazeDiv.appendChild(rowDiv);
    });
  }

  /**
   * Loop which periodically checks which pickups are nearby Pacman.
   * Pickups which are far away will not be considered for collision detection.
   */
  collisionDetectionLoop() {
    if (this.pacman.position) {
      const maxDistance = (this.pacman.velocityPerMs * 750);
      const pacmanCenter = {
        x: this.pacman.position.left + this.scaledTileSize,
        y: this.pacman.position.top + this.scaledTileSize,
      };

      this.pickups.forEach((pickup) => {
        // Set this flag to TRUE to see how two-phase collision detection works!
        const debugging = false;

        pickup.checkPacmanProximity(maxDistance, pacmanCenter, debugging);
      });
    }
  }

  /**
   * Register listeners for various game sequences
   */
  registerEventListeners() {
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('awardPoints', this.awardPoints.bind(this));
    window.addEventListener('deathSequence', this.deathSequence.bind(this));
    window.addEventListener('dotEaten', this.dotEaten.bind(this));
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

  /**
   * Handle behavior for the pause key
   */
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
   * Adds points to the player's total
   * @param {({ detail: { points: Number }})} e - Contains a quantity of points to add
   */
  awardPoints(e) {
    this.points += e.detail.points;
  }

  /**
   * Animates Pacman's death, subtracts a life, and resets character positions if the player
   * has remaining lives.
   */
  deathSequence() {
    if (this.timerExists(this.fruitTimer)) {
      this.removeTimer({ detail: { id: this.fruitTimer } });
    }

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
          this.fruit.hideFruit();
        }, 500);
      }, 2250);
    }, 750);
  }

  /**
   * Handle events related to the number of remaining dots
   */
  dotEaten() {
    this.remainingDots -= 1;

    if (this.remainingDots === 174) {
      this.createFruit();
    } else if (this.remainingDots === 74) {
      this.createFruit();
    }
  }

  /**
   * Creates a bonus fruit for ten seconds
   */
  createFruit() {
    if (this.timerExists(this.fruitTimer)) {
      this.removeTimer({ detail: { id: this.fruitTimer } });
    }

    this.fruit.showFruit(this.calcFruitPoints(this.level));

    this.fruitTimer = new Timer(() => {
      this.fruit.hideFruit();
    }, 10000).timerId;
  }

  /**
   * Determines the number of points a fruit should be worth based on level
   * @param {Number} level
   */
  calcFruitPoints(level) {
    let fruitPoints;

    switch (level) {
      case 1:
        fruitPoints = 100;
        break;
      default:
        fruitPoints = 100;
        break;
    }

    return fruitPoints;
  }

  /**
   * Flashes ghosts blue and white to indicate the end of the powerup
   * @param {Number} flashes - Total number of elapsed flashes
   * @param {Number} maxFlashes - Total flashes to show
   */
  flashGhosts(flashes, maxFlashes) {
    if (this.flashingGhosts) {
      if (flashes === maxFlashes) {
        this.flashingGhosts = false;
        this.scaredGhosts.forEach((ghost) => {
          ghost.endScared();
        });
        this.scaredGhosts = [];
      } else if (this.scaredGhosts.length > 0) {
        this.scaredGhosts.forEach((ghost) => {
          ghost.toggleScaredColor();
        });

        new Timer(() => {
          this.flashGhosts(flashes + 1, maxFlashes);
        }, 250);
      } else {
        this.flashingGhosts = false;
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

  /**
   * Pushes a Timer to the activeTimers array
   * @param {({ detail: { timer: Object }})} e
   */
  addTimer(e) {
    this.activeTimers.push(e.detail.timer);
  }

  /**
   * Checks if a Timer with a matching ID exists in the activeTimers array
   * @param {number} id
   * @returns {Boolean}
   */
  timerExists(id) {
    const result = this.activeTimers.filter(
      timer => timer.timerId === id,
    );

    return (result.length === 1);
  }

  /**
   * Removes a Timer from activeTimers based on ID
   * @param {({ detail: { id: Number }})} e
   */
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
