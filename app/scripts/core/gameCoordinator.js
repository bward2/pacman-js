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

    this.fruitPoints = {
      1: 100,
      2: 300,
      3: 500,
      4: 700,
      5: 1000,
      6: 2000,
      7: 3000,
      8: 5000,
    };

    this.allowKeyPresses = true;
    this.allowPacmanMovement = false;
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
        this.level, new CharacterUtil(),
      ),
      this.pinky = new Ghost(
        this.scaledTileSize, this.mazeArray, this.pacman, 'pinky',
        this.level, new CharacterUtil(),
      ),
      this.inky = new Ghost(
        this.scaledTileSize, this.mazeArray, this.pacman, 'inky',
        this.level, new CharacterUtil(), this.blinky,
      ),
      this.clyde = new Ghost(
        this.scaledTileSize, this.mazeArray, this.pacman, 'clyde',
        this.level, new CharacterUtil(),
      ),
      this.fruit = new Pickup(
        'fruit', this.scaledTileSize, 13.5, 17, this.pacman,
        this.mazeDiv, 100,
      ),
    ];

    this.ghosts = [
      this.blinky,
      this.pinky,
      this.inky,
      this.clyde,
    ];

    this.pickups = [
      this.fruit,
    ];

    this.preloadImages();
  }

  /**
   * Load all SVG's into a hidden Div to pre-load them into memory.
   * There is probably a better way to read all of these file names.
   */
  preloadImages() {
    const loadingContainer = document.getElementById('loading-container');
    const loadingPacman = document.getElementById('loading-pacman');
    const containerWidth = loadingContainer.scrollWidth
      - loadingPacman.scrollWidth;
    const loadingDotMask = document.getElementById('loading-dot-mask');
    const preloadDiv = document.getElementById('preload-div');
    const leftCover = document.getElementById('left-cover');
    const rightCover = document.getElementById('right-cover');

    const base = 'app/style/graphics/spriteSheets/';
    const sources = [
      // Pacman
      `${base}characters/pacman/arrow_down.svg`,
      `${base}characters/pacman/arrow_left.svg`,
      `${base}characters/pacman/arrow_right.svg`,
      `${base}characters/pacman/arrow_up.svg`,
      `${base}characters/pacman/pacman_death.svg`,
      `${base}characters/pacman/pacman_down.svg`,
      `${base}characters/pacman/pacman_left.svg`,
      `${base}characters/pacman/pacman_right.svg`,
      `${base}characters/pacman/pacman_up.svg`,

      // Blinky
      `${base}characters/ghosts/blinky/blinky_down_angry.svg`,
      `${base}characters/ghosts/blinky/blinky_down_annoyed.svg`,
      `${base}characters/ghosts/blinky/blinky_down.svg`,
      `${base}characters/ghosts/blinky/blinky_left_angry.svg`,
      `${base}characters/ghosts/blinky/blinky_left_annoyed.svg`,
      `${base}characters/ghosts/blinky/blinky_left.svg`,
      `${base}characters/ghosts/blinky/blinky_right_angry.svg`,
      `${base}characters/ghosts/blinky/blinky_right_annoyed.svg`,
      `${base}characters/ghosts/blinky/blinky_right.svg`,
      `${base}characters/ghosts/blinky/blinky_up_angry.svg`,
      `${base}characters/ghosts/blinky/blinky_up_annoyed.svg`,
      `${base}characters/ghosts/blinky/blinky_up.svg`,

      // Clyde
      `${base}characters/ghosts/clyde/clyde_down.svg`,
      `${base}characters/ghosts/clyde/clyde_left.svg`,
      `${base}characters/ghosts/clyde/clyde_right.svg`,
      `${base}characters/ghosts/clyde/clyde_up.svg`,

      // Inky
      `${base}characters/ghosts/inky/inky_down.svg`,
      `${base}characters/ghosts/inky/inky_left.svg`,
      `${base}characters/ghosts/inky/inky_right.svg`,
      `${base}characters/ghosts/inky/inky_up.svg`,

      // Pinky
      `${base}characters/ghosts/pinky/pinky_down.svg`,
      `${base}characters/ghosts/pinky/pinky_left.svg`,
      `${base}characters/ghosts/pinky/pinky_right.svg`,
      `${base}characters/ghosts/pinky/pinky_up.svg`,

      // Ghosts Common
      `${base}characters/ghosts/eyes_down.svg`,
      `${base}characters/ghosts/eyes_left.svg`,
      `${base}characters/ghosts/eyes_right.svg`,
      `${base}characters/ghosts/eyes_up.svg`,
      `${base}characters/ghosts/scared_blue.svg`,
      `${base}characters/ghosts/scared_white.svg`,

      // Dots
      `${base}pickups/pacdot.svg`,
      `${base}pickups/powerPellet.svg`,

      // Fruit
      `${base}pickups/apple.svg`,
      `${base}pickups/bell.svg`,
      `${base}pickups/cherry.svg`,
      `${base}pickups/galaxian.svg`,
      `${base}pickups/key.svg`,
      `${base}pickups/melon.svg`,
      `${base}pickups/orange.svg`,
      `${base}pickups/strawberry.svg`,

      // Text
      `${base}text/ready.svg`,

      // Points
      `${base}text/100.svg`,
      `${base}text/200.svg`,
      `${base}text/300.svg`,
      `${base}text/400.svg`,
      `${base}text/500.svg`,
      `${base}text/700.svg`,
      `${base}text/800.svg`,
      `${base}text/1000.svg`,
      `${base}text/1600.svg`,
      `${base}text/2000.svg`,
      `${base}text/3000.svg`,
      `${base}text/5000.svg`,
    ];

    let remainingSources = sources.length;

    sources.forEach((source) => {
      const image = new Image();
      preloadDiv.appendChild(image);

      image.onload = (() => {
        remainingSources -= 1;
        const percentLoaded = ((sources.length - remainingSources)
          / sources.length);
        loadingPacman.style.left = `${percentLoaded * containerWidth}px`;
        loadingDotMask.style.width = loadingPacman.style.left;

        if (remainingSources === 0) {
          loadingContainer.style.opacity = 0;
          leftCover.style.left = '-50%';
          rightCover.style.right = '-50%';
          this.init();
        }
      });

      image.src = source;
    });
  }

  // Calls necessary setup functions to start the game
  init() {
    this.registerEventListeners();
    this.drawMaze(this.mazeArray, this.entityList);
    setInterval(() => {
      this.collisionDetectionLoop();
    }, 500);

    this.gameEngine = new GameEngine(this.maxFps, this.entityList);
    this.gameEngine.start();

    this.startGameplay(true);
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
   * Displays "Ready!" and allows Pacman to move after a breif delay
   * @param {Boolean} initialStart - Special condition for the game's beginning
   */
  startGameplay(initialStart) {
    this.allowPacmanMovement = false;

    const left = this.scaledTileSize * 11;
    const top = this.scaledTileSize * 16.5;
    const duration = initialStart ? 4000 : 2000;
    const width = this.scaledTileSize * 6;
    const height = this.scaledTileSize * 2;

    this.displayText({ left, top }, 'ready', duration, width, height);

    new Timer(() => {
      this.allowPacmanMovement = true;
      this.pacman.moving = true;

      this.ghosts.forEach((ghost) => {
        const ghostRef = ghost;
        ghostRef.moving = true;
      });

      this.ghostCycle('scatter');

      this.idleGhosts = [
        this.pinky,
        this.inky,
        this.clyde,
      ];
      this.releaseGhost();
    }, duration);
  }

  /**
   * Cycles the ghosts between 'chase' and 'scatter' mode
   * @param {('chase'|'scatter')} mode
   */
  ghostCycle(mode) {
    const delay = (mode === 'scatter') ? 7000 : 20000;
    const nextMode = (mode === 'scatter') ? 'chase' : 'scatter';

    this.ghostCycleTimer = new Timer(() => {
      this.ghosts.forEach((ghost) => {
        ghost.changeMode(nextMode);
      });

      this.ghostCycle(nextMode);
    }, delay);
  }

  /**
   * Releases a ghost from the Ghost House after a delay
   */
  releaseGhost() {
    if (this.idleGhosts.length > 0) {
      const delay = Math.max((8 - this.level) * 1000, 0);

      this.endIdleTimer = new Timer(() => {
        this.idleGhosts[0].endIdleMode();
        this.idleGhosts.shift();
      }, delay);
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
    window.addEventListener('releaseGhost', this.releaseGhost.bind(this));
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

    if (e.detail.type === 'fruit') {
      const left = e.detail.points >= 1000
        ? this.scaledTileSize * 12.5
        : this.scaledTileSize * 13;
      const top = this.scaledTileSize * 16.5;
      const width = e.detail.points >= 1000
        ? this.scaledTileSize * 3
        : this.scaledTileSize * 2;
      const height = this.scaledTileSize * 2;

      this.displayText({ left, top }, e.detail.points, 2000, width, height);
    }
  }

  /**
   * Animates Pacman's death, subtracts a life, and resets character positions if
   * the player has remaining lives.
   */
  deathSequence() {
    this.removeTimer({ detail: { timer: this.fruitTimer } });
    this.removeTimer({ detail: { timer: this.ghostCycleTimer } });
    this.removeTimer({ detail: { timer: this.endIdleTimer } });
    this.removeTimer({ detail: { timer: this.ghostFlashTimer } });

    this.allowKeyPresses = false;
    this.pacman.moving = false;
    this.ghosts.forEach((ghost) => {
      const ghostRef = ghost;
      ghostRef.moving = false;
    });

    new Timer(() => {
      this.ghosts.forEach((ghost) => {
        const ghostRef = ghost;
        ghostRef.display = false;
      });
      this.pacman.prepDeathAnimation();
      new Timer(() => {
        this.mazeCover.style.visibility = 'visible';
        new Timer(() => {
          this.allowKeyPresses = true;
          this.mazeCover.style.visibility = 'hidden';
          this.pacman.reset();
          this.ghosts.forEach((ghost) => {
            ghost.reset();
          });
          this.fruit.hideFruit();

          this.startGameplay();
        }, 500);
      }, 2250);
    }, 750);
  }

  /**
   * Handle events related to the number of remaining dots
   */
  dotEaten() {
    this.remainingDots -= 1;

    if (this.remainingDots === 174 || this.remainingDots === 74) {
      this.createFruit();
    }

    if (this.remainingDots === 40 || this.remainingDots === 20) {
      this.speedUpBlinky();
    }

    if (this.remainingDots === 0) {
      this.advanceLevel();
    }
  }

  /**
   * Creates a bonus fruit for ten seconds
   */
  createFruit() {
    this.removeTimer({ detail: { timer: this.fruitTimer } });
    this.fruit.showFruit(this.fruitPoints[this.level] || 5000);
    this.fruitTimer = new Timer(() => {
      this.fruit.hideFruit();
    }, 10000);
  }

  /**
   * Speeds up Blinky and raises the background noise pitch
   */
  speedUpBlinky() {
    this.blinky.speedUp();
  }

  advanceLevel() {
    this.allowKeyPresses = false;

    this.entityList.forEach((entity) => {
      const entityRef = entity;
      entityRef.moving = false;
    });

    this.removeTimer({ detail: { timer: this.fruitTimer } });
    this.removeTimer({ detail: { timer: this.ghostCycleTimer } });
    this.removeTimer({ detail: { timer: this.endIdleTimer } });
    this.removeTimer({ detail: { timer: this.ghostFlashTimer } });

    new Timer(() => {
      this.mazeCover.style.visibility = 'visible';

      new Timer(() => {
        this.mazeCover.style.visibility = 'hidden';
        this.level += 1;
        this.allowKeyPresses = true;

        this.entityList.forEach((entity) => {
          const entityRef = entity;

          if (entityRef.level) {
            entityRef.level = this.level;
          }
          entityRef.reset();
          if (entityRef instanceof Ghost) {
            entityRef.resetDefaultSpeed();
          }
          if (entityRef instanceof Pickup && entityRef.type !== 'fruit') {
            this.remainingDots += 1;
          }
        });

        this.startGameplay();
      }, 500);
    }, 2000);
  }

  /**
   * Flashes ghosts blue and white to indicate the end of the powerup
   * @param {Number} flashes - Total number of elapsed flashes
   * @param {Number} maxFlashes - Total flashes to show
   */
  flashGhosts(flashes, maxFlashes) {
    if (flashes === maxFlashes) {
      this.scaredGhosts.forEach((ghost) => {
        ghost.endScared();
      });
      this.scaredGhosts = [];
    } else if (this.scaredGhosts.length > 0) {
      this.scaredGhosts.forEach((ghost) => {
        ghost.toggleScaredColor();
      });

      this.ghostFlashTimer = new Timer(() => {
        this.flashGhosts(flashes + 1, maxFlashes);
      }, 250);
    }
  }

  /**
   * Upon eating a power pellet, sets the ghosts to 'scared' mode
   */
  powerUp() {
    this.removeTimer({ detail: { timer: this.ghostFlashTimer } });

    this.ghostCombo = 0;
    this.scaredGhosts = [];

    this.ghosts.forEach((ghost) => {
      if (ghost.mode !== 'eyes') {
        this.scaredGhosts.push(ghost);
      }
    });

    this.scaredGhosts.forEach((ghost) => {
      ghost.becomeScared();
    });

    this.ghostFlashTimer = new Timer(() => {
      this.flashGhosts(0, 9);
    }, 6000);
  }

  /**
   * Determines the quantity of points to give based on the current combo
   */
  determineComboPoints() {
    return (100 * (2 ** this.ghostCombo));
  }

  /**
   * Upon eating a ghost, award points and temporarily pause movement
   * @param {CustomEvent} e - Contains a target ghost object
   */
  eatGhost(e) {
    const pauseDuration = 1000;
    const { position, measurement } = e.detail.ghost;

    this.pauseTimer({ detail: { timer: this.ghostFlashTimer } });

    this.scaredGhosts = this.scaredGhosts.filter(
      ghost => ghost.name !== e.detail.ghost.name,
    );

    this.ghostCombo += 1;
    const comboPoints = this.determineComboPoints();

    this.points += comboPoints;
    this.displayText(
      position, comboPoints, pauseDuration, measurement,
    );

    this.allowPacmanMovement = false;
    this.pacman.display = false;
    this.pacman.moving = false;
    e.detail.ghost.display = false;
    e.detail.ghost.moving = false;

    this.ghosts.forEach((ghost) => {
      const ghostRef = ghost;
      ghostRef.animate = false;
      ghostRef.pause(true);
    });

    new Timer(() => {
      this.resumeTimer({ detail: { timer: this.ghostFlashTimer } });
      this.allowPacmanMovement = true;
      this.pacman.display = true;
      this.pacman.moving = true;
      e.detail.ghost.display = true;
      e.detail.ghost.moving = true;
      this.ghosts.forEach((ghost) => {
        const ghostRef = ghost;
        ghostRef.animate = true;
        ghostRef.pause(false);
      });
    }, pauseDuration);
  }

  /**
   * Creates a temporary div to display points on screen
   * @param {({ left: number, top: number })} position - CSS coordinates to display the points at
   * @param {Number} amount - Amount of points to display
   * @param {Number} duration - Milliseconds to display the points before disappearing
   * @param {Number} width - Image width
   * @param {Number} height - Image height
   */
  displayText(position, amount, duration, width, height) {
    const pointsDiv = document.createElement('div');

    pointsDiv.style.position = 'absolute';
    pointsDiv.style.backgroundSize = `${width}px`;
    pointsDiv.style.backgroundImage = 'url(app/style/graphics/'
      + `spriteSheets/text/${amount}.svg`;
    pointsDiv.style.width = `${width}px`;
    pointsDiv.style.height = `${height || width}px`;
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
   * Checks if a Timer with a matching ID exists
   * @param {({ detail: { timer: Object }})} e
   * @returns {Boolean}
   */
  timerExists(e) {
    return !!(e.detail.timer || {}).timerId;
  }

  /**
   * Pauses a timer
   * @param {({ detail: { timer: Object }})} e
   */
  pauseTimer(e) {
    if (this.timerExists(e)) {
      e.detail.timer.pause(true);
    }
  }

  /**
   * Resumes a timer
   * @param {({ detail: { timer: Object }})} e
   */
  resumeTimer(e) {
    if (this.timerExists(e)) {
      e.detail.timer.resume(true);
    }
  }

  /**
   * Removes a Timer from activeTimers
   * @param {({ detail: { timer: Object }})} e
   */
  removeTimer(e) {
    if (this.timerExists(e)) {
      window.clearTimeout(e.detail.timer.timerId);
      this.activeTimers = this.activeTimers.filter(
        timer => timer.timerId !== e.detail.timer.timerId,
      );
    }
  }
}

// removeIf(production)
module.exports = GameCoordinator;
// endRemoveIf(production)
