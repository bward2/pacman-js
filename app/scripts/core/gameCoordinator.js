class GameCoordinator {
    constructor() {
        this.maxFps = 60;
        this.tileSize = 8;
        this.scale = 8;
        this.scaledTileSize = this.tileSize * this.scale;

        this.entityList = [
            this.pacman = new Pacman(this.scaledTileSize)
        ];

        this.gameEngine = new GameEngine(this.maxFps, this.entityList);
        this.gameEngine.start();

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
        ];

        this.drawMaze();
    }

    drawMaze() {
        const mazeDiv = document.getElementById('maze');

        this.mazeArray.forEach(row => {
            const rowDiv = document.createElement('div');
            rowDiv.classList.add('maze-row');
            row[0].split('').forEach(block => {
                const mazeBlock = document.createElement('div');
                mazeBlock.style.width = '10px';
                mazeBlock.style.height = '10px';
                mazeBlock.style.background = block === 'X' ? 'black' : 'white';
                rowDiv.appendChild(mazeBlock);
            });
            mazeDiv.appendChild(rowDiv);
        });
    }
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = GameCoordinator;
}