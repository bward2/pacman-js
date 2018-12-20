class CharacterUtil {
    constructor() {}

    checkForStutter(position, oldPosition) {
        let stutter = false;
        const threshold = 5;

        if (Math.abs(position['top'] - oldPosition['top']) > threshold || Math.abs(position['left'] - oldPosition['left']) > threshold) {
            stutter = true;
        }

        return stutter ? 'hidden' : 'visible';
    }
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = CharacterUtil;
}