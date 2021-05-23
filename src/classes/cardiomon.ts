import lcg from 'tiny-rng';
import h2r from 'hsl-to-rgb-for-reals';

type HSLColor = {
    hue: number,
    sat: number,
    lig: number
};

export type JSONMon = {
    x_limit: number,
    c1: number[],
    c2: number[],
    c3: number[],
    cells: number[]
};

export class Cardiomon {
    rng: lcg;
    seed: number;
    level: number;
    x_limit: number;
    cells: number[][];
    c1: HSLColor;
    c2: HSLColor;
    c3: HSLColor;

    constructor(seed: number, level: number) {
        this.seed = seed;
        this.level = level;
        this.x_limit = (level + 3) * 2;
        this.rng = new lcg(0, seed);
        this.cells = [];
        this.c1 = {
            hue: this.rng.random(0, 359),
            sat: this.rng.random(0.5, 0.8, 1),
            lig: 0.8
        };
        this.c2 = {
            hue: this.rng.random(0, 359),
            sat: this.rng.random(0.5, 0.8, 1),
            lig: 0.8
        };
        this.c3 = {
            hue: this.c1.hue,
            sat: this.c1.sat - 0.3,
            lig: 0.8
        };

        this.do_cells();
    }

    do_cells = (): void => {
        const half = this.x_limit / 2;

        for (let i = 0; i < this.x_limit; i++) {
             this.cells[i] = [];
        }

        for (let y = 0; y < half; y++) {
            for (let x = 0; x < half; x++) {
                this.cells[x][y] = (x === 0 || x === this.cells.length - 1 || y === 0 || y === this.cells.length - 1) ? 0 : this.rng.random(0, 1);
                // symmetry
                this.cells[this.cells.length - 1 - x][y] = this.cells[x][y];
            }
        }

        for (let y = 0; y < this.x_limit; y++) {
            for (let x = 0; x < this.x_limit; x++) {
                if (this.is_border(this.cells, x, y)) {
                    this.cells[x][y] = 2;
                }
            }
        }
    }

    is_border = (cells: number[][], x: number, y: number): boolean => {
        if (cells[x][y] === 1) return false;
        // left
        if (x !== 0 && cells[x - 1][y] === 1) return true;
        //right
        if (x !== cells.length - 1 && cells[x + 1][y] === 1) return true;
        //up
        if (y !== 0 && cells[x][y - 1] === 1) return true;
        //down
        if (y !== cells.length - 1 && cells[x][y + 1] === 1) return true;
        return false;
    }

    to_json = (): JSONMon => {
        return {
            x_limit: this.x_limit,
            c1: h2r(this.c1.hue, this.c1.sat, this.c1.lig),
            c2: h2r(this.c2.hue, this.c2.sat, this.c2.lig),
            c3: h2r(this.c3.hue, this.c3.sat, this.c3.lig),
            cells: this.cells.reduce((a, b) => [...a, ...b])
        };
    }
}