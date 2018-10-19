class GameEngine {
    constructor() {
        this.box = document.getElementById('box');
        this.fpsDisplay = document.getElementById('fpsDisplay');
        this.boxPos = 10;
        this.boxVelocity = 0.08;
        this.delta = 0;
        this.limit = 300;
        this.lastFrameTimeMs = 0;
        this.maxFPS = 60;
        this.timestep = 1000 / 60;
        this.fps = 60;
        this.framesThisSecond = 0;
        this.lastFpsUpdate = 0;
        this.boxLastPos = 10;
        this.frameID = 0;
        this.running = false;
        this.started = false;

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

    draw(interp) {
        this.box.style.left = (this.boxLastPos + (this.boxPos - this.boxLastPos) * interp) + 'px'; // interpolate
        this.fpsDisplay.textContent = Math.round(this.fps) + ' FPS'; // display the FPS
    }

    update(delta) {
        this.boxLastPos = this.boxPos; // save the position from the last update
        this.boxPos += this.boxVelocity * delta; // velocity is now time-sensitive
        // Switch directions if we go too far
        if (this.boxPos >= this.limit || this.boxPos <= 0) this.boxVelocity = -this.boxVelocity;
    }

    panic() {
        this.delta = 0; // discard the unsimulated time
        console.log('Panic!');
    }

    start() {
        if (!this.started) { // don't request multiple frames
            this.started = true;
            // Dummy frame to get our timestamps and initial drawing right.
            // Track the frame ID so we can cancel it if we stop quickly.
            this.frameID = requestAnimationFrame((timestamp) => {
                this.draw(1); // initial draw
                this.running = true;
                // reset some time tracking variables
                this.lastFrameTimeMs = timestamp;
                this.lastFpsUpdate = timestamp;
                this.framesThisSecond = 0;
                // actually start the main loop
                this.frameID = requestAnimationFrame((timestamp) => {
                    this.mainLoop(timestamp);
                });
            });
        }
    }

    stop() {
        this.running = false;
        this.started = false;
        cancelAnimationFrame(this.frameID);
    }

    mainLoop(timestamp) {
        // Throttle the frame rate.    
        if (timestamp < this.lastFrameTimeMs + (1000 / this.maxFPS)) {
            this.frameID = requestAnimationFrame((timestamp) => {
                this.mainLoop(timestamp)
            });
            return;
        }

        // Track the accumulated time that hasn't been simulated yet
        this.delta += timestamp - this.lastFrameTimeMs;
        this.lastFrameTimeMs = timestamp;

        if (timestamp > this.lastFpsUpdate + 1000) {
            this.fps = 0.50 * this.framesThisSecond + (1 - 0.50) * this.fps;
     
            this.lastFpsUpdate = timestamp;
            this.framesThisSecond = 0;
        }
        this.framesThisSecond++;

        var numUpdateSteps = 0;
        // Simulate the total elapsed time in fixed-size chunks
        while (this.delta >= this.timestep) {
            this.update(this.timestep);
            this.delta -= this.timestep;
            // Sanity check
            if (++numUpdateSteps >= 240) {
                this.panic(); // fix things
                break; // bail out
            }
        }
        this.draw(this.delta / this.timestep); // pass the interpolation percentage
        this.frameID = requestAnimationFrame((timestamp) => {
            this.mainLoop(timestamp);
        });
    }
}
