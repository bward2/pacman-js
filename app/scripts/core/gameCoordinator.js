class GameCoordinator {
    constructor() {
        this.gameEngine = new GameEngine();

        this.mazeArray = [
            ['XXXXXXXXXXXXXXXXXXXXXXXXXXXX'],
            ['X            XX            X'],
            ['X XXXX XXXXX XX XXXXX XXXX X'],
            ['X X  X X   X XX X   X X  X X'],
            ['X XXXX XXXXX XX XXXXX XXXX X'],
            ['X                          X'],
            ['X XXXX XX XXXXXXXX XX XXXX X'],
            ['X XXXX XX XXXXXXXX XX XXXX X'],
            ['X      XX    XX    XX      X'],
            ['XXXXXX XXXXX XX XXXXX XXXXXX'],
            ['     X XXXXX XX XXXXX X     '],
            ['     X XX          XX X     '],
            ['     X XX XXXXXXXX XX X     '],
            ['XXXXXX XX X      X XX XXXXXX'],
            ['          X      X          '],
            ['XXXXXX XX X      X XX XXXXXX'],
            ['     X XX XXXXXXXX XX X     '],
            ['     X XX          XX X     '],
            ['     X XX XXXXXXXX XX X     '],
            ['XXXXXX XX XXXXXXXX XX XXXXXX'],
            ['X            XX            X'],
            ['X XXXX XXXXX XX XXXXX XXXX X'],
            ['X XXXX XXXXX XX XXXXX XXXX X'],
            ['X   XX                XX   X'],
            ['XXX XX XX XXXXXXXX XX XX XXX'],
            ['XXX XX XX XXXXXXXX XX XX XXX'],
            ['X      XX    XX    XX      X'],
            ['X XXXXXXXXXX XX XXXXXXXXXX X'],
            ['X XXXXXXXXXX XX XXXXXXXXXX X'],
            ['X                          X'],
            ['XXXXXXXXXXXXXXXXXXXXXXXXXXXX']
        ]
    }
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = GameCoordinator;
}