class GameEngine {
    constructor(maxFps, entityList) {
        this.fpsDisplay = document.getElementById('fpsDisplay');
        this.elapsedMs = 0;
        this.lastFrameTimeMs = 0;
        this.entityList = entityList;
        this.maxFps = maxFps;
        this.timestep = 1000 / this.maxFps;
        this.fps = this.maxFps;
        this.framesThisSecond = 0;
        this.lastFpsUpdate = 0;
        this.frameId = 0;
        this.running = false;
        this.started = false;

        window.addEventListener('keyup', (e) => {
            // ESC key
            if (e.keyCode === 27) {
                this.changePausedState(this.running);
            }
        });
    }

    /**
     * Toggles the paused/running status of the game
     * @param {Boolean} running - Whether the game is currently in motion
     */
    changePausedState(running) {
        if (running) {
            this.stop();
        } else {
            this.start();
        }
    }

    /**
     * Updates the on-screen FPS counter once per second
     * @param {number} timestamp - The amount of time, in milliseconds, which have passed since starting the game engine
     */
    updateFpsDisplay(timestamp) {
        if (timestamp > this.lastFpsUpdate + 1000) {
            this.fps = (this.framesThisSecond + this.fps) / 2;
            this.lastFpsUpdate = timestamp;
            this.framesThisSecond = 0;
        }
        this.framesThisSecond++;
        this.fpsDisplay.textContent = Math.round(this.fps) + ' FPS';
    }

    /**
     * Calls the draw function for every member of the entityList
     * @param {number} interp - The percentage of accuracy between the desired and actual amount of time between updates
     * @param {Array} entityList - List of entities (Pacman, Ghosts, etc.) to be used throughout the game 
     */
    draw(interp, entityList) {
        for (let entity in entityList) {
            if (typeof entityList[entity].draw === 'function') {
                entityList[entity].draw(interp);
            }
        }
    }

    /**
     * Calls the update function for every member of the entityList
     * @param {number} elapsedMs - The amount of MS that have passed since the last update
     * @param {Array} entityList - List of entities (Pacman, Ghosts, etc.) to be used throughout the game
     */
    update(elapsedMs, entityList) {
        for (let entity in entityList) {
            if (typeof entityList[entity].update === 'function') {
                entityList[entity].update(elapsedMs);
            }
        }
    }

    /**
     * In the event that a ton of unsimulated frames pile up, discard all of these frames to prevent crashing the game
     */
    panic() {
        this.elapsedMs = 0;
    }

    /**
     * Draws an initial frame, resets a few tracking variables related to animation, and calls the mainLoop function to start the engine
     */
    start() {
        if (!this.started) {
            this.started = true;

            this.frameId = requestAnimationFrame((timestamp) => {
                this.draw(1);
                this.running = true;
                this.lastFrameTimeMs = timestamp;
                this.lastFpsUpdate = timestamp;
                this.framesThisSecond = 0;

                this.frameId = requestAnimationFrame((timestamp) => {
                    this.mainLoop(timestamp);
                });
            });
        }
    }

    /**
     * Stops the engine and cancels the current animation frame
     */
    stop() {
        this.running = false;
        this.started = false;
        cancelAnimationFrame(this.frameId);
    }

    /**
     * The loop which will process all necessary frames to update the game's entities prior to animating them
     */
    processFrames() {
        var numUpdateSteps = 0;
        while (this.elapsedMs >= this.timestep) {
            this.update(this.timestep, this.entityList);
            this.elapsedMs -= this.timestep;
            if (++numUpdateSteps >= this.maxFps) {
                this.panic();
                break;
            }
        }
    }

    /**
     * The endless, recursive function which will call the update and draw functions for each entity in the game multiple times per second
     * @param {number} timestamp - The amount of time, in milliseconds, which have passed since starting the game engine 
     */
    mainLoop(timestamp) {   
        if (timestamp < this.lastFrameTimeMs + (1000 / this.maxFps)) {
            this.frameId = requestAnimationFrame((timestamp) => {
                this.mainLoop(timestamp)
            });
            return;
        }

        this.elapsedMs += timestamp - this.lastFrameTimeMs;
        this.lastFrameTimeMs = timestamp;
        this.updateFpsDisplay(timestamp);
        this.processFrames();

        this.draw(this.elapsedMs / this.timestep, this.entityList);
        this.frameId = requestAnimationFrame((timestamp) => {
            this.mainLoop(timestamp);
        });
    }
}

//removeIf(production)
module.exports = GameEngine;
//endRemoveIf(production)