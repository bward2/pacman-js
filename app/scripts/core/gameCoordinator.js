class GameCoordinator {
  constructor() {
    this.mazeDiv = document.getElementById('maze');
    this.mazeImg = document.getElementById('maze-img');
    this.mazeCover = document.getElementById('maze-cover');
    this.mazeContainer = document.getElementById('maze-container');

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
    this.allowPause = false;
    this.cutscene = true;

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

    this.scaredGhosts = [];
    this.eyeGhosts = 0;

    this.pickups = [
      this.fruit,
    ];

    const gameStartButton = document.getElementById('game-start');
    gameStartButton.addEventListener('click', this.startButtonClick.bind(this));

    const head = document.getElementsByTagName('head')[0];
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'build/app.css';

    link.onload = this.preloadAssets.bind(this);

    head.appendChild(link);
  }

  /**
   * Reveals the game underneath the loading covers and starts gameplay
   */
  startButtonClick() {
    const gameStartButton = document.getElementById('game-start');
    const leftCover = document.getElementById('left-cover');
    const rightCover = document.getElementById('right-cover');

    leftCover.style.left = '-50%';
    rightCover.style.right = '-50%';
    gameStartButton.style.opacity = 0;
    gameStartButton.disabled = true;

    setTimeout(() => {
      gameStartButton.style.visibility = 'hidden';
    }, 1000);

    this.init();
  }

  /**
   * Load all assets into a hidden Div to pre-load them into memory.
   * There is probably a better way to read all of these file names.
   */
  preloadAssets() {
    return new Promise((resolve) => {
      const loadingContainer = document.getElementById('loading-container');
      const loadingPacman = document.getElementById('loading-pacman');
      const loadingDotMask = document.getElementById('loading-dot-mask');

      const imgBase = 'app/style/graphics/spriteSheets/';
      const imgSources = [
        // Pacman
        `${imgBase}characters/pacman/arrow_down.svg`,
        `${imgBase}characters/pacman/arrow_left.svg`,
        `${imgBase}characters/pacman/arrow_right.svg`,
        `${imgBase}characters/pacman/arrow_up.svg`,
        `${imgBase}characters/pacman/pacman_death.svg`,
        `${imgBase}characters/pacman/pacman_down.svg`,
        `${imgBase}characters/pacman/pacman_left.svg`,
        `${imgBase}characters/pacman/pacman_right.svg`,
        `${imgBase}characters/pacman/pacman_up.svg`,

        // Blinky
        `${imgBase}characters/ghosts/blinky/blinky_down_angry.svg`,
        `${imgBase}characters/ghosts/blinky/blinky_down_annoyed.svg`,
        `${imgBase}characters/ghosts/blinky/blinky_down.svg`,
        `${imgBase}characters/ghosts/blinky/blinky_left_angry.svg`,
        `${imgBase}characters/ghosts/blinky/blinky_left_annoyed.svg`,
        `${imgBase}characters/ghosts/blinky/blinky_left.svg`,
        `${imgBase}characters/ghosts/blinky/blinky_right_angry.svg`,
        `${imgBase}characters/ghosts/blinky/blinky_right_annoyed.svg`,
        `${imgBase}characters/ghosts/blinky/blinky_right.svg`,
        `${imgBase}characters/ghosts/blinky/blinky_up_angry.svg`,
        `${imgBase}characters/ghosts/blinky/blinky_up_annoyed.svg`,
        `${imgBase}characters/ghosts/blinky/blinky_up.svg`,

        // Clyde
        `${imgBase}characters/ghosts/clyde/clyde_down.svg`,
        `${imgBase}characters/ghosts/clyde/clyde_left.svg`,
        `${imgBase}characters/ghosts/clyde/clyde_right.svg`,
        `${imgBase}characters/ghosts/clyde/clyde_up.svg`,

        // Inky
        `${imgBase}characters/ghosts/inky/inky_down.svg`,
        `${imgBase}characters/ghosts/inky/inky_left.svg`,
        `${imgBase}characters/ghosts/inky/inky_right.svg`,
        `${imgBase}characters/ghosts/inky/inky_up.svg`,

        // Pinky
        `${imgBase}characters/ghosts/pinky/pinky_down.svg`,
        `${imgBase}characters/ghosts/pinky/pinky_left.svg`,
        `${imgBase}characters/ghosts/pinky/pinky_right.svg`,
        `${imgBase}characters/ghosts/pinky/pinky_up.svg`,

        // Ghosts Common
        `${imgBase}characters/ghosts/eyes_down.svg`,
        `${imgBase}characters/ghosts/eyes_left.svg`,
        `${imgBase}characters/ghosts/eyes_right.svg`,
        `${imgBase}characters/ghosts/eyes_up.svg`,
        `${imgBase}characters/ghosts/scared_blue.svg`,
        `${imgBase}characters/ghosts/scared_white.svg`,

        // Dots
        `${imgBase}pickups/pacdot.svg`,
        `${imgBase}pickups/powerPellet.svg`,

        // Fruit
        `${imgBase}pickups/apple.svg`,
        `${imgBase}pickups/bell.svg`,
        `${imgBase}pickups/cherry.svg`,
        `${imgBase}pickups/galaxian.svg`,
        `${imgBase}pickups/key.svg`,
        `${imgBase}pickups/melon.svg`,
        `${imgBase}pickups/orange.svg`,
        `${imgBase}pickups/strawberry.svg`,

        // Text
        `${imgBase}text/ready.svg`,

        // Points
        `${imgBase}text/100.svg`,
        `${imgBase}text/200.svg`,
        `${imgBase}text/300.svg`,
        `${imgBase}text/400.svg`,
        `${imgBase}text/500.svg`,
        `${imgBase}text/700.svg`,
        `${imgBase}text/800.svg`,
        `${imgBase}text/1000.svg`,
        `${imgBase}text/1600.svg`,
        `${imgBase}text/2000.svg`,
        `${imgBase}text/3000.svg`,
        `${imgBase}text/5000.svg`,

        // Maze
        `${imgBase}maze/maze_blue.svg`,
      ];

      const audioBase = 'app/style/audio/';
      const audioSources = [
        `${audioBase}game_start.mp3`,
        `${audioBase}pause.mp3`,
        `${audioBase}siren_1.mp3`,
        `${audioBase}siren_2.mp3`,
        `${audioBase}siren_3.mp3`,
        `${audioBase}power_up.mp3`,
        `${audioBase}eyes.mp3`,
        `${audioBase}eat_ghost.mp3`,
        `${audioBase}death.mp3`,
        `${audioBase}fruit.mp3`,
        `${audioBase}dot_1.mp3`,
        `${audioBase}dot_2.mp3`,
      ];

      const totalSources = imgSources.length + audioSources.length;
      this.remainingSources = totalSources;

      loadingPacman.style.left = '0';
      loadingDotMask.style.width = '0';

      Promise.all([
        this.createElements(
          imgSources, 'img', totalSources, this,
        ),
        this.createElements(
          audioSources, 'audio', totalSources, this,
        ),
      ]).then(() => {
        loadingContainer.style.opacity = 0;
        resolve();

        setTimeout(() => {
          loadingContainer.remove();
          const gameStartButton = document.getElementById('game-start');
          gameStartButton.style.opacity = 1;
          gameStartButton.style.visibility = 'visible';
        }, 1500);
      });
    });
  }

  /**
   * Iterates through a list of sources and updates the loading bar as the assets load in
   * @param {String[]} sources
   * @param {('img'|'audio')} type
   * @param {Number} totalSources
   * @param {Object} gameCoord
   * @returns {Promise}
   */
  createElements(sources, type, totalSources, gameCoord) {
    const loadingContainer = document.getElementById('loading-container');
    const preloadDiv = document.getElementById('preload-div');
    const loadingPacman = document.getElementById('loading-pacman');
    const containerWidth = loadingContainer.scrollWidth
      - loadingPacman.scrollWidth;
    const loadingDotMask = document.getElementById('loading-dot-mask');

    const gameCoordRef = gameCoord;

    return new Promise((resolve) => {
      let loadedSources = 0;

      sources.forEach((source) => {
        const element = (type === 'img')
          ? new Image() : new Audio();
        preloadDiv.appendChild(element);

        const elementReady = () => {
          gameCoordRef.remainingSources -= 1;
          loadedSources += 1;
          const percent = 1 - (gameCoordRef.remainingSources / totalSources);
          loadingPacman.style.left = `${percent * containerWidth}px`;
          loadingDotMask.style.width = loadingPacman.style.left;

          if (loadedSources === sources.length) {
            resolve();
          }
        };

        if (type === 'img') {
          element.onload = elementReady;
        } else {
          element.addEventListener('canplaythrough', elementReady);
        }

        element.src = source;
      });
    });
  }

  /**
   * Calls necessary setup functions to start the game
   */
  init() {
    this.registerEventListeners();
    this.drawMaze(this.mazeArray, this.entityList);
    setInterval(() => {
      this.collisionDetectionLoop();
    }, 500);

    this.gameEngine = new GameEngine(this.maxFps, this.entityList);
    this.gameEngine.start();

    this.soundManager = new SoundManager();

    this.startGameplay(true);
  }

  /**
   * Adds HTML elements to draw on the webpage by iterating through the 2D maze array
   * @param {Array} mazeArray - 2D array representing the game board
   * @param {Array} entityList - List of entities to be used throughout the game
   */
  drawMaze(mazeArray, entityList) {
    this.mazeDiv.style.height = `${this.scaledTileSize * 31}px`;
    this.mazeDiv.style.width = `${this.scaledTileSize * 28}px`;

    mazeArray.forEach((row, rowIndex) => {
      row.forEach((block, columnIndex) => {
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
      });
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
    if (initialStart) {
      this.soundManager.play('game_start');
    }

    this.scaredGhosts = [];
    this.eyeGhosts = 0;
    this.allowPacmanMovement = false;

    const left = this.scaledTileSize * 11;
    const top = this.scaledTileSize * 16.5;
    const duration = initialStart ? 4500 : 2000;
    const width = this.scaledTileSize * 6;
    const height = this.scaledTileSize * 2;

    this.displayText({ left, top }, 'ready', duration, width, height);

    new Timer(() => {
      this.allowPause = true;
      this.cutscene = false;
      this.soundManager.setAmbience(this.determineSiren(this.remainingDots));

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
    this.mazeContainer.addEventListener(
      'touchstart', this.handleTouch.bind(this),
    );
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('awardPoints', this.awardPoints.bind(this));
    window.addEventListener('deathSequence', this.deathSequence.bind(this));
    window.addEventListener('dotEaten', this.dotEaten.bind(this));
    window.addEventListener('powerUp', this.powerUp.bind(this));
    window.addEventListener('eatGhost', this.eatGhost.bind(this));
    window.addEventListener('restoreGhost', this.restoreGhost.bind(this));
    window.addEventListener('addTimer', this.addTimer.bind(this));
    window.addEventListener('removeTimer', this.removeTimer.bind(this));
    window.addEventListener('releaseGhost', this.releaseGhost.bind(this));
  }

  handleTouch(e) {
    const x = e.changedTouches[0].clientX;
    const y = e.changedTouches[0].clientY;
    const h = Math.max(
      document.documentElement.clientHeight, window.innerHeight || 0,
    );
    const w = Math.max(
      document.documentElement.clientWidth, window.innerWidth || 0,
    );

    const blah1 = ((x / w) + (y / h)) < 1 ? 1 : 0;
    const blah2 = (x / w) > (y / h) ? 1 : 0;

    const directions = [
      ['down', 'right'],
      ['left', 'up'],
    ];

    if (this.allowKeyPresses && this.gameEngine.running) {
      this.pacman.changeDirection(
        directions[blah1][blah2], this.allowPacmanMovement,
      );
    }
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
        if (!this.cutscene) {
          this.allowPause = true;
        }
      }, 500);

      this.gameEngine.changePausedState(this.gameEngine.running);
      this.soundManager.play('pause');

      if (this.gameEngine.started) {
        this.soundManager.resumeAmbience();
        this.activeTimers.forEach((timer) => {
          timer.resume();
        });
      } else {
        this.soundManager.stopAmbience();
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
      this.soundManager.play('fruit');
    }
  }

  /**
   * Animates Pacman's death, subtracts a life, and resets character positions if
   * the player has remaining lives.
   */
  deathSequence() {
    this.allowPause = false;
    this.cutscene = true;
    this.soundManager.stopAmbience();
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
      this.soundManager.play('death');
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

    this.soundManager.playDotSound();

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

    if (this.scaredGhosts.length === 0 && this.eyeGhosts === 0) {
      this.soundManager.setAmbience(this.determineSiren(this.remainingDots));
    }
  }


  /**
   * Determines the correct siren ambience
   * @param {Number} remainingDots
   * @returns {String}
   */
  determineSiren(remainingDots) {
    let sirenNum;

    if (remainingDots > 40) {
      sirenNum = 1;
    } else if (remainingDots > 20) {
      sirenNum = 2;
    } else {
      sirenNum = 3;
    }

    return `siren_${sirenNum}`;
  }

  /**
   * Resets the gameboard and prepares the next level
   */
  advanceLevel() {
    this.allowPause = false;
    this.cutscene = true;
    this.allowKeyPresses = false;
    this.soundManager.stopAmbience();

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
      if (this.eyeGhosts === 0) {
        this.soundManager.setAmbience(this.determineSiren(this.remainingDots));
      }
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
    this.soundManager.setAmbience('power_up');
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
    this.soundManager.play('eat_ghost');

    this.scaredGhosts = this.scaredGhosts.filter(
      ghost => ghost.name !== e.detail.ghost.name,
    );
    this.eyeGhosts += 1;

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
      this.soundManager.setAmbience('eyes');

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
   * Decrements the count of "eye" ghosts and updates the ambience
   */
  restoreGhost() {
    this.eyeGhosts -= 1;

    if (this.eyeGhosts === 0) {
      const sound = this.scaredGhosts.length > 0
        ? 'power_up' : this.determineSiren(this.remainingDots);
      this.soundManager.setAmbience(sound);
    }
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
