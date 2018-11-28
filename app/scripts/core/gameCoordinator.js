class GameCoordinator {
    constructor() {
        this.maxFps = 120;
        this.tileSize = 8;
        this.scale = 3;
        this.scaledTileSize = this.tileSize * this.scale;

        this.mazeArray = [
            ['XXXXXXXXXXXXXXXXXXXXXXXXXXXX'],
            ['X            XX            X'],
            ['X XXXX XXXXX XX XXXXX XXXX X'],
            ['X XXXX XXXXX XX XXXXX XXXX X'],
            ['X XXXX XXXXX XX XXXXX XXXX X'],
            ['X                          X'],
            ['X XXXX XX XXXXXXXX XX XXXX X'],
            ['X XXXX XX XXXXXXXX XX XXXX X'],
            ['X      XX    XX    XX      X'],
            ['XXXXXX XXXXX XX XXXXX XXXXXX'],
            ['XXXXXX XXXXX XX XXXXX XXXXXX'],
            ['XXXXXX XX          XX XXXXXX'],
            ['XXXXXX XX XXXXXXXX XX XXXXXX'],
            ['XXXXXX XX X      X XX XXXXXX'],
            ['          X      X          '],
            ['XXXXXX XX X      X XX XXXXXX'],
            ['XXXXXX XX XXXXXXXX XX XXXXXX'],
            ['XXXXXX XX          XX XXXXXX'],
            ['XXXXXX XX XXXXXXXX XX XXXXXX'],
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

        this.entityList = [
            this.pacman = new Pacman(this.scaledTileSize, this.mazeArray)
        ];

        this.drawMaze();

        this.gameEngine = new GameEngine(this.maxFps, this.entityList);
        this.gameEngine.start();
    }

    drawMaze() {
        const mazeDiv = document.getElementById('maze');

        this.mazeArray.forEach((row, rowIndex) => {
            const rowDiv = document.createElement('div');
            rowDiv.classList.add('maze-row');
            row[0].split('').forEach((block, columnIndex) => {
                const mazeBlock = document.createElement('div');
                mazeBlock.style.width = `${this.scaledTileSize}px`;
                mazeBlock.style.height = `${this.scaledTileSize}px`;
                mazeBlock.style.background = block === 'X' ? 'black' : 'gray';

                if (block === 'o') {
                    this.entityList.push(new Pacdot(this.scaledTileSize, columnIndex, rowIndex, this.pacman, mazeDiv));
                }

                rowDiv.appendChild(mazeBlock);
            });
            mazeDiv.appendChild(rowDiv);
        });
    }
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = GameCoordinator;
}