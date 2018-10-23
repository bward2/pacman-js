class GameEngine {
    constructor() {
        this.fpsDisplay = document.getElementById('fpsDisplay');
        this.elapsedMs = 0;
        this.lastFrameTimeMs = 0;
        this.maxFps = 60;
        this.timestep = 1000 / this.maxFps;
        this.fps = this.maxFps;
        this.framesThisSecond = 0;
        this.lastFpsUpdate = 0;
        this.frameId = 0;
        this.running = false;
        this.started = false;

        this.tileSize = 8;
        this.scale = 6;
        this.scaledTileSize = this.tileSize * this.scale;

        this.pacman = new Pacman(this.scaledTileSize, this.maxFps);

        //Start/Stop with ESC key
        window.addEventListener('keyup', (e) => {
            if (e.keyCode === 27) {
                this.changePausedState();
            }
        });
    }

    changePausedState() {
        if (this.running) {
            this.stop();
        } else {
            this.start();
        }
    }

    updateFpsDisplay(timestamp) {
        if (timestamp > this.lastFpsUpdate + 1000) {
            this.fps = 0.50 * this.framesThisSecond + (1 - 0.50) * this.fps;
     
            this.lastFpsUpdate = timestamp;
            this.framesThisSecond = 0;
        }
        this.framesThisSecond++;
        this.fpsDisplay.textContent = Math.round(this.fps) + ' FPS';
    }

    draw(interp) {
        this.pacman.draw(interp);
    }

    update(elapsedMs) {
        this.pacman.update(elapsedMs);
    }

    panic() {
        this.elapsedMs = 0; // discard the unsimulated time
        console.log('Panic!');
    }

    start() {
        if (!this.started) { // don't request multiple frames
            this.started = true;
            // Dummy frame to get our timestamps and initial drawing right.
            // Track the frame ID so we can cancel it if we stop quickly.
            this.frameId = requestAnimationFrame((timestamp) => {
                this.draw(1); // initial draw
                this.running = true;
                // reset some time tracking variables
                this.lastFrameTimeMs = timestamp;
                this.lastFpsUpdate = timestamp;
                this.framesThisSecond = 0;
                // actually start the main loop
                this.frameId = requestAnimationFrame((timestamp) => {
                    this.mainLoop(timestamp);
                });
            });
        }
    }

    stop() {
        this.running = false;
        this.started = false;
        cancelAnimationFrame(this.frameId);
    }

    mainLoop(timestamp) {
        // Throttle the frame rate.    
        if (timestamp < this.lastFrameTimeMs + (1000 / this.maxFps)) {
            this.frameId = requestAnimationFrame((timestamp) => {
                this.mainLoop(timestamp)
            });
            return;
        }

        // Track the accumulated time that hasn't been simulated yet
        this.elapsedMs += timestamp - this.lastFrameTimeMs;
        this.lastFrameTimeMs = timestamp;

        this.updateFpsDisplay(timestamp);

        var numUpdateSteps = 0;
        // Simulate the total elapsed time in fixed-size chunks
        while (this.elapsedMs >= this.timestep) {
            this.update(this.timestep);
            this.elapsedMs -= this.timestep;
            // Sanity check
            if (++numUpdateSteps >= 240) {
                this.panic(); // fix things
                break; // bail out
            }
        }
        this.draw(this.elapsedMs / this.timestep); // pass the interpolation percentage
        this.frameId = requestAnimationFrame((timestamp) => {
            this.mainLoop(timestamp);
        });
    }
}
