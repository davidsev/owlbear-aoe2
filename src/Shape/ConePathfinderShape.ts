import { BaseShape, cached } from './BaseShape';
import { type Cell, type Point, SnapTo } from '@davidsev/owlbear-utils';
import type { PathCommand } from '@owlbear-rodeo/sdk/lib/types/items/Path';
import { getDirection8 } from '../Utils/Geometry/getDirection';

const Shapes = {
    15: {
        Orthogonal: [
            [0, 1, 0],
            [1, 1, 1],
            [1, 1, 1],
        ],
        Diagonal: [
            [1, 1, 1],
            [1, 1, 0],
            [1, 0, 0],
        ],
    },
    30: {
        Orthogonal: [
            [0, 0, 0, 1, 1, 0, 0, 0],
            [0, 0, 1, 1, 1, 1, 0, 0],
            [0, 1, 1, 1, 1, 1, 1, 0],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [0, 1, 1, 1, 1, 1, 1, 0],
            [0, 0, 0, 1, 1, 0, 0, 0],
        ],
        Diagonal: [
            [1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 0],
            [1, 1, 1, 1, 1, 0],
            [1, 1, 1, 1, 0, 0],
            [1, 1, 1, 0, 0, 0],
            [1, 0, 0, 0, 0, 0],
        ],
    },
    60: {
        Orthogonal: [
            [0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
            [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
            [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
            [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
            [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
            [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0],
        ],
        Diagonal: [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
            [1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
            [1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
            [1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
            [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        ],
    },
};

// 5 is the assumed number of feet in a square.
// Should maybe be grid.gridScale.parsed.multiplier, but I'm assuming if people are using a different grid scale then
// they'll keep the shapes the same number of squares.
const ASSUMED_SQUARE_FEET = 5;

export class ConePathfinderShape extends BaseShape {
    @cached()
    public get roundedDistance(): number {
        const distance = this.distance;

        if (distance < this.grid.dpi) return 0;

        let currentError = Infinity;
        let currentDistance = 0;

        for (const d of Object.keys(Shapes)) {
            const error = Math.abs(distance - (parseInt(d, 10) * this.grid.dpi) / ASSUMED_SQUARE_FEET);
            if (error < currentError) {
                currentError = error;
                currentDistance = parseInt(d, 10);
            }
        }

        return (currentDistance * this.grid.dpi) / ASSUMED_SQUARE_FEET;
    }

    @cached()
    public get labelPosition(): Point {
        const direction = getDirection8(this.end.sub(this.start));
        if (!direction) return this.start;
        return this.grid.snapTo(this.start, SnapTo.CORNER).add({
            x: (direction.x * this.roundedDistance) / 2,
            y: (direction.y * this.roundedDistance) / 2,
        });
    }

    public get outline(): PathCommand[] {
        return [];
    }

    @cached()
    public get cells(): Cell[] {
        // Work out if it's diagonal or not, and which direction.
        const direction = getDirection8(this.end.sub(this.start));
        if (!direction) return [];
        const isDiagonal = direction.x !== 0 && direction.y !== 0;

        // Decide which shape template to use.
        const distance = (this.roundedDistance / this.grid.dpi) * ASSUMED_SQUARE_FEET;
        if (!this.isValidSize(distance)) return [];
        const shape = Shapes[distance][isDiagonal ? 'Diagonal' : 'Orthogonal'];
        // Every template has at least one row, so this can't be undefined.
        const shapeWidth = (shape[0] as number[]).length;

        // work over the cells.
        if (isDiagonal) {
            // How much to change the coords to move to the next cell.
            const xMove = direction.x * this.grid.dpi;
            const yMove = direction.y * this.grid.dpi;

            // The center of the starting cell
            const rootX = this.grid.snapTo(this.start, SnapTo.CORNER).x + xMove / 2;
            const rootY = this.grid.snapTo(this.start, SnapTo.CORNER).y + yMove / 2;

            const cells: Cell[] = [];
            // Loop all the cells in the shape, calculate the matching cell, and add it.
            for (const [templateY, row] of shape.entries()) {
                for (const [templateX, value] of row.entries()) {
                    if (value) {
                        const x = rootX + templateX * xMove;
                        const y = rootY + templateY * yMove;
                        cells.push(this.grid.getCell({ x, y }));
                    }
                }
            }
            return cells;
        } else {
            // Orthogonal
            if (direction.x === 0) {
                // The center of the starting cell.  We need to move half the cone width to the "left" of the direction we're going.
                const rootX =
                    distance === 15
                        ? this.grid.snapTo(this.start, SnapTo.CENTER).x - this.grid.dpi
                        : this.grid.snapTo(this.start, SnapTo.CORNER).x - this.grid.dpi * (shapeWidth / 2);
                const rootY = this.grid.snapTo(this.start, SnapTo.CENTER).y + direction.y;

                // How much to change the coords to move to the next cell.
                const xMove = this.grid.dpi;
                const yMove = direction.y * this.grid.dpi;

                const cells: Cell[] = [];
                // Loop all the cells in the shape, calculate the matching cell, and add it.
                for (const [templateY, row] of shape.entries()) {
                    for (const [templateX, value] of row.entries()) {
                        if (value) {
                            const x = rootX + templateX * xMove;
                            const y = rootY + templateY * yMove;
                            cells.push(this.grid.getCell({ x, y }));
                        }
                    }
                }
                return cells;
            } else {
                // The center of the starting cell.  We need to move half the cone width to the "left" of the direction we're going.
                const rootX = this.grid.snapTo(this.start, SnapTo.CENTER).x + direction.x;
                const rootY =
                    distance === 15
                        ? this.grid.snapTo(this.start, SnapTo.CENTER).y - this.grid.dpi
                        : this.grid.snapTo(this.start, SnapTo.CORNER).y - this.grid.dpi * (shapeWidth / 2);

                // How much to change the coords to move to the next cell.
                const xMove = direction.x * this.grid.dpi;
                const yMove = this.grid.dpi;

                const cells: Cell[] = [];
                // Loop all the cells in the shape, calculate the matching cell, and add it.
                for (const [templateX, row] of shape.entries()) {
                    for (const [templateY, value] of row.entries()) {
                        if (value) {
                            const x = rootX + templateX * xMove;
                            const y = rootY + templateY * yMove;
                            cells.push(this.grid.getCell({ x, y }));
                        }
                    }
                }
                return cells;
            }
        }
    }

    private isValidSize(distance: number): distance is keyof typeof Shapes {
        return distance in Shapes;
    }
}
