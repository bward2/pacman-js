class Timer {
  constructor(callback, delay) {
    this.callback = callback;
    this.remaining = delay;
    this.resume();
  }

  pause() {
    window.clearTimeout(this.timerId);
    this.remaining -= new Date() - this.start;
    this.oldTimerId = this.timerId;
  }

  resume() {
    this.start = new Date();
    this.timerId = window.setTimeout(() => {
      this.callback();
      window.dispatchEvent(new CustomEvent('removeTimer', {
        detail: {
          timer: this,
        },
      }));
    }, this.remaining);

    if (!this.oldTimerId) {
      window.dispatchEvent(new CustomEvent('addTimer', {
        detail: {
          timer: this,
        },
      }));
    }
  }
}

// removeIf(production)
module.exports = Timer;
// endRemoveIf(production)
