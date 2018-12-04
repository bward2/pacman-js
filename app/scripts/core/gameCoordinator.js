class GameCoordinator {
    constructor() {
        this.maxFps = 120;
        this.tileSize = 8;
        this.scale = 3;
        this.scaledTileSize = this.tileSize * this.scale;

        this.mazeArray = [
            ['XXXXXXXXXXXXXXXXXXXXXXXXXXXX'],
            ['XooooooooooooXXooooooooooooX'],
            ['XoXXXXoXXXXXoXXoXXXXXoXXXXoX'],
            ['X XXXXoXXXXXoXXoXXXXXoXXXX X'],
            ['XoXXXXoXXXXXoXXoXXXXXoXXXXoX'],
            ['XooooooooooooooooooooooooooX'],
            ['XoXXXXoXXoXXXXXXXXoXXoXXXXoX'],
            ['XoXXXXoXXoXXXXXXXXoXXoXXXXoX'],
            ['XooooooXXooooXXooooXXooooooX'],
            ['XXXXXXoXXXXX XX XXXXXoXXXXXX'],
            ['XXXXXXoXXXXX XX XXXXXoXXXXXX'],
            ['XXXXXXoXX          XXoXXXXXX'],
            ['XXXXXXoXX XXXXXXXX XXoXXXXXX'],
            ['XXXXXXoXX X      X XXoXXXXXX'],
            ['      o   X      X   o      '],
            ['XXXXXXoXX X      X XXoXXXXXX'],
            ['XXXXXXoXX XXXXXXXX XXoXXXXXX'],
            ['XXXXXXoXX          XXoXXXXXX'],
            ['XXXXXXoXX XXXXXXXX XXoXXXXXX'],
            ['XXXXXXoXX XXXXXXXX XXoXXXXXX'],
            ['XooooooooooooXXooooooooooooX'],
            ['XoXXXXoXXXXXoXXoXXXXXoXXXXoX'],
            ['XoXXXXoXXXXXoXXoXXXXXoXXXXoX'],
            ['X ooXXooooooo  oooooooXXoo X'],
            ['XXXoXXoXXoXXXXXXXXoXXoXXoXXX'],
            ['XXXoXXoXXoXXXXXXXXoXXoXXoXXX'],
            ['XooooooXXooooXXooooXXooooooX'],
            ['XoXXXXXXXXXXoXXoXXXXXXXXXXoX'],
            ['XoXXXXXXXXXXoXXoXXXXXXXXXXoX'],
            ['XooooooooooooooooooooooooooX'],
            ['XXXXXXXXXXXXXXXXXXXXXXXXXXXX']
        ];

        this.entityList = [
            this.pacman = new Pacman(this.scaledTileSize, this.mazeArray),
            this.clyde = new Ghost(this.scaledTileSize, this.mazeArray, this.pacman, 'clyde')
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