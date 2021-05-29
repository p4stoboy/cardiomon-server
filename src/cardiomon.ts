import lcg from 'tiny-rng';
import h2r from 'hsl-to-rgb-for-reals';

type HSLColor = {
    hue: number,
    sat: number,
    lig: number
};

export type JSONMon = {
    x_limit: number,
    level: number,
    seed: number,
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
            sat: 1,
            lig: this.rng.random(0.5, 0.8, 1)
        };
        this.c2 = {
            hue: this.rng.random(0, 359),
            sat: 1,
            lig: this.rng.random(0.5, 0.8, 1)
        };
        this.c3 = {
            hue: this.c1.hue,
            sat: 1,
            lig: this.c1.lig - 0.3
        };

        this.do_cells();
    }

    // seed draw coordinates / run symmetry / iterate to isolate cells & determine colour
    do_cells = (): void => {
        const half = this.x_limit / 2;

        for (let i = 0; i < this.x_limit; i++) {
            this.cells[i] = [];
        }

        for (let y = 0; y < half; y++) {
            for (let x = 0; x < this.x_limit; x++) {
                this.cells[x][y] = (x === 0 || y === 0 || x === this.x_limit - 1 || y === this.x_limit - 1) ? 0 : this.rng.random(0, 1);
                // symmetry
                this.cells[x][this.x_limit - 1 - y] = this.cells[x][y];
            }
        }

        for (let y = 0; y < this.x_limit; y++) {
            for (let x = 0; x < this.x_limit; x++) {
                if (this.cells[x][y] === 0 && this.is_border(this.cells, x, y, 1)) {
                    this.cells[x][y] = 2;
                }
            }
        }
        for (let y = 0; y < this.x_limit; y++) {
            for (let x = 0; x < this.x_limit; x++) {
                if (this.cells[x][y] === 1 && this.is_border(this.cells, x, y, 2) === 4) {
                    this.cells[x][y] = 3;
                }
            }
        }
    }

    // do cells neighbouring this cell contain value $check
    is_border = (cells: number[][], x: number, y: number, check: number): number => {
        let count = 0;
        // left
        if (x !== 0 && cells[x - 1][y] === check) count++;
        //right
        if (x !== cells.length - 1 && cells[x + 1][y] === check) count++;
        //up
        if (y !== 0 && cells[x][y - 1] === check) count++;
        //down
        if (y !== cells.length - 1 && cells[x][y + 1] === check) count++;
        return count;
    }

    // convert to json string with 1d cells array for use on particle
    to_json = (): JSONMon => {
        return {
            x_limit: this.x_limit,
            level: this.level,
            seed: this.seed,
            c1: h2r(this.c1.hue, this.c1.sat, this.c1.lig),
            c2: h2r(this.c2.hue, this.c2.sat, this.c2.lig),
            c3: h2r(this.c3.hue, this.c3.sat, this.c3.lig),
            cells: this.cells.reduce((a, b) => [...a, ...b])
        };
    }
}