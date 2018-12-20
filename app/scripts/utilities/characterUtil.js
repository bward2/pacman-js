class CharacterUtil {
    checkForStutter(position, oldPosition) {
        let stutter = false;
        const threshold = 5;

        if (Math.abs(position['top'] - oldPosition['top']) > threshold || Math.abs(position['left'] - oldPosition['left']) > threshold) {
            stutter = true;
        }

        return stutter ? 'hidden' : 'visible';
    }

    getPropertyToChange(direction, directions) {
        switch(direction) {
            case directions.up:
            case directions.down:
                return 'top';
            default:
                return 'left';
        }
    }

    getVelocity(direction, directions, velocityPerMs) {
        switch(direction) {
            case directions.up:
            case directions.left:
                return velocityPerMs * -1;
            default:
                return velocityPerMs;
        }
    }
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = CharacterUtil;
}