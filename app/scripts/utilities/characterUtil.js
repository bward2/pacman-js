class CharacterUtil {
    constructor() {
        this.directions = {
            up: 'up',
            down: 'down',
            left: 'left',
            right: 'right'
        }
    }

    /**
     * Check if a given character has moved more than five in-game tiles during a frame.
     * If so, we want to temporarily hide the object to avoid 'animation stutter'.
     * @param {({top: number, left: number})} position - The character's position during the current frame
     * @param {({top: number, left: number})} oldPosition - The character's position during the previous frame
     * 
     * @returns {('hidden'|'visible')} - The new 'visibility' css property value for the character.
     */
    checkForStutter(position, oldPosition) {
        let stutter = false;
        const threshold = 5;

        if (position && oldPosition) {
            if (Math.abs(position['top'] - oldPosition['top']) > threshold || Math.abs(position['left'] - oldPosition['left']) > threshold) {
                stutter = true;
            }
        }

        return stutter ? 'hidden' : 'visible';
    }

    /**
     * Check which CSS property needs to be changed given the character's current direction
     * @param {('up'|'down'|'left'|'right')} direction - The direction the character is currently traveling in
     * 
     * @returns {('top'|'left')} - The CSS property to be changed
     */
    getPropertyToChange(direction) {
        switch(direction) {
            case this.directions.up:
            case this.directions.down:
                return 'top';
            default:
                return 'left';
        }
    }

    /**
     * Calculate the velocity for the character's next frame.
     * @param {('up'|'down'|'left'|'right')} direction - The direction the character is currently traveling in
     * @param {number} velocityPerMs - The distance the character should travel in a single millisecond
     * 
     * @returns {number} - New velocity. Since we are using css positioning, moving down or right is positive, while up or left is negative.
     */
    getVelocity(direction, velocityPerMs) {
        switch(direction) {
            case this.directions.up:
            case this.directions.left:
                return velocityPerMs * -1;
            default:
                return velocityPerMs;
        }
    }

    /**
     * Determine the next value which will be used to draw the character's position on screen
     * @param {number} interp - The percentage of the desired timestamp between frames
     * @param {('top'|'left')} prop - The css property to be changed
     * @param {({top: number, left: number})} oldPosition - The character's position during the previous frame
     * @param {({top: number, left: number})} position - The character's position during the current frame
     * 
     * @returns {number} - New value for css positioning
     */
    calculateNewDrawValue(interp, prop, oldPosition, position) {
        return oldPosition[prop] + (position[prop] - oldPosition[prop]) * interp;
    }

    determineGridPosition(currentPosition, scaledTileSize) {
        return {
            x : (currentPosition.left / scaledTileSize) + 0.5,
            y : (currentPosition.top / scaledTileSize) + 0.5
        };
    }

    turningAround(direction, desiredDirection) {
        switch(direction) {
            case this.directions.up:
                return desiredDirection === this.directions.down;
            case this.directions.down:
                return desiredDirection === this.directions.up;
            case this.directions.left:
                return desiredDirection === this.directions.right;
            default:
                return desiredDirection === this.directions.left;
        }
    }

    getOppositeDirection(direction) {
        switch(direction) {
            case this.directions.up:
                return this.directions.down;
            case this.directions.down:
                return this.directions.up;
            case this.directions.left:
                return this.directions.right;
            default:
                return this.directions.left;
        }
    }

    determineRoundingFunction(direction) {
        switch(direction) {
            case this.directions.up:
            case this.directions.left:
                return Math.floor;
            default:
                return Math.ceil;
        } 
    }

    changingGridPosition(oldPosition, newPosition) {
        return (
            Math.floor(oldPosition.x) !== Math.floor(newPosition.x) ||
            Math.floor(oldPosition.y) !== Math.floor(newPosition.y)
        );
    }

    checkForWallCollision(desiredNewGridPosition, mazeArray, direction) {
        let roundingFunction = this.determineRoundingFunction(direction, this.directions);

        let desiredX = roundingFunction(desiredNewGridPosition.x);
        let desiredY = roundingFunction(desiredNewGridPosition.y);
        let newGridValue;

        if (Array.isArray(mazeArray[desiredY])) {
            newGridValue = mazeArray[desiredY][desiredX];
        }
        
        return (newGridValue === 'X');
    }

    snapToGrid(position, direction, scaledTileSize) {
        let newPosition = Object.assign({}, position);
        let roundingFunction = this.determineRoundingFunction(direction, this.directions);

        switch(direction) {
            case this.directions.up:
            case this.directions.down:
                newPosition.y = roundingFunction(newPosition.y);
                break;
            default:
                newPosition.x = roundingFunction(newPosition.x);
                break;
        }

        return {
            top: (newPosition.y - 0.5) * scaledTileSize,
            left: (newPosition.x - 0.5) * scaledTileSize
        };
    }

    checkForWarp(position, gridPosition, scaledTileSize) {
        let newPosition = Object.assign({}, position);

        if (gridPosition.x < -0.75) {
            newPosition.left = (scaledTileSize * 27.25);
        } else if (gridPosition.x > 27.75) {
            newPosition.left = (scaledTileSize * -1.25);
        }

        return newPosition;
    }
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = CharacterUtil;
}