const assert = require('assert');
const sinon = require('sinon');
const Timer = require('../scripts/utilities/timer');

let timer;
let clock;

describe('timer', () => {
  beforeEach(() => {
    window.setTimeout = () => { };
    window.dispatchEvent = () => { };
    clock = sinon.useFakeTimers();

    timer = new Timer(undefined, 1000);
  });

  afterEach(() => {
    clock.restore();
  });

  describe('pause', () => {
    it('clears the timeout and adjusts remaining time', () => {
      timer.timerId = 2;
      timer.start = new Date();
      clock.tick(500);
      window.clearTimeout = sinon.fake();

      timer.pause();
      assert(window.clearTimeout.calledWith(timer.timerId));
      assert.strictEqual(timer.remaining, 500);
    });
  });

  describe('resume', () => {
    it('executes the callback on a delay and dispatches events', () => {
      window.setTimeout = setTimeout;
      timer.callback = sinon.fake();
      window.dispatchEvent = sinon.fake();

      timer.resume();
      assert.deepEqual(timer.start, new Date());
      assert(!timer.callback.called);
      assert(window.dispatchEvent.calledWith(new CustomEvent('addTimer', {
        detail: {
          timer,
        },
      })));

      clock.tick(1000);
      assert(timer.callback.called);
      assert(window.dispatchEvent.calledWith(new CustomEvent('removeTimer', {
        detail: {
          id: timer.timerId,
        },
      })));
    });
  });
});
