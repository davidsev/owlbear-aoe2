import { BaseShape } from './BaseShape';
import { Cell, grid, Point, SnapTo, Square } from '@davidsev/owlbear-utils';
import { PathCommand } from '@owlbear-rodeo/sdk/lib/types/items/Path';

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

    constructor () {
        super();
    }

    public get roundedDistance (): number {
        const distance = this.distance;

        if (distance < grid.dpi)
            return 0;

        let currentError = Infinity;
        let currentDistance = 0;

        for (const d of Object.keys(Shapes)) {
            const error = Math.abs(distance - parseInt(d, 10) * grid.dpi / ASSUMED_SQUARE_FEET);
            if (error < currentError) {
                currentError = error;
                currentDistance = parseInt(d);
            }
        }

        return currentDistance * grid.dpi / ASSUMED_SQUARE_FEET;
    }

    public getLabelPosition (): Point {
        const direction = this.getDirection();
        if (!direction)
            return this.start;
        return grid.snapTo(this.start, SnapTo.CORNER).add({
            x: direction.x * this.roundedDistance / 2,
            y: direction.y * this.roundedDistance / 2,
        });
    }

    public getOutline (): PathCommand[] {
        return [];
    }

    public getCells (): Cell[] {
        // Work out if it's diagonal or not, and which direction.
        const direction = this.getDirection();
        if (!direction)
            return [];
        const isDiagonal = direction.x != 0 && direction.y != 0;

        // Decide which shape template to use.
        const distance = this.roundedDistance / grid.dpi * ASSUMED_SQUARE_FEET;
        if (!this.isValidSize(distance))
            return [];
        const shape = Shapes[distance][isDiagonal ? 'Diagonal' : 'Orthogonal'];

        // work over the cells.
        if (isDiagonal) {
            // How much to change the coords to move to the next cell.
            const xMove = direction.x * grid.dpi;
            const yMove = direction.y * grid.dpi;

            // The center of the starting cell
            const rootX = grid.snapTo(this.start, SnapTo.CORNER).x + xMove / 2;
            const rootY = grid.snapTo(this.start, SnapTo.CORNER).y + yMove / 2;

            const cells: Cell[] = [];
            // Loop all the cells in the shape, calculate the matching cell, and add it.
            for (const [templateY, row] of shape.entries()) {
                for (const [templateX, value] of row.entries()) {
                    if (value) {
                        const x = rootX + templateX * xMove;
                        const y = rootY + templateY * yMove;
                        cells.push(Square.fromCoords({ x, y }));
                    }
                }
            }
            return cells;
        } else { // Orthogonal
            if (direction.x == 0) {
                // The center of the starting cell.  We need to move half the cone width to the "left" of the direction we're going.
                const rootX = distance == 15 ?
                    grid.snapTo(this.start, SnapTo.CENTER).x - grid.dpi
                    : grid.snapTo(this.start, SnapTo.CORNER).x - (grid.dpi * (shape[0].length / 2));
                const rootY = grid.snapTo(this.start, SnapTo.CENTER).y + direction.y;

                // How much to change the coords to move to the next cell.
                const xMove = grid.dpi;
                const yMove = direction.y * grid.dpi;

                const cells: Cell[] = [];
                // Loop all the cells in the shape, calculate the matching cell, and add it.
                for (const [templateY, row] of shape.entries()) {
                    for (const [templateX, value] of row.entries()) {
                        if (value) {
                            const x = rootX + templateX * xMove;
                            const y = rootY + templateY * yMove;
                            cells.push(Square.fromCoords({ x, y }));
                        }
                    }
                }
                return cells;
            } else {
                // The center of the starting cell.  We need to move half the cone width to the "left" of the direction we're going.
                const rootX = grid.snapTo(this.start, SnapTo.CENTER).x + direction.x;
                const rootY = distance == 15 ?
                    grid.snapTo(this.start, SnapTo.CENTER).y - grid.dpi
                    : grid.snapTo(this.start, SnapTo.CORNER).y - (grid.dpi * (shape[0].length / 2));

                // How much to change the coords to move to the next cell.
                const xMove = direction.x * grid.dpi;
                const yMove = grid.dpi;

                const cells: Cell[] = [];
                // Loop all the cells in the shape, calculate the matching cell, and add it.
                for (const [templateX, row] of shape.entries()) {
                    for (const [templateY, value] of row.entries()) {
                        if (value) {
                            const x = rootX + templateX * xMove;
                            const y = rootY + templateY * yMove;
                            cells.push(Square.fromCoords({ x, y }));
                        }
                    }
                }
                return cells;
            }
        }
    }

    private isValidSize (distance: number): distance is keyof typeof Shapes {
        return distance in Shapes;
    }

    // Get a normalized direction vector.
    // In OBR right and down are positive.
    private getDirection (): Point | null {
        const rawDirection = this.end.sub(this.start);
        if (rawDirection.x == 0 && rawDirection.y == 0)
            return null;
        const angle = Math.atan2(rawDirection.y, rawDirection.x);

        if (Math.abs(angle) < Math.PI * 0.125)
            return new Point(1, 0);
        if (Math.abs(angle) > Math.PI * 0.875)
            return new Point(-1, 0);
        if (angle < 0) {
            if (Math.abs(angle) < Math.PI * 0.375)
                return new Point(1, -1);
            if (Math.abs(angle) > Math.PI * 0.625)
                return new Point(-1, -1);
            return new Point(0, -1);
        } else {
            if (Math.abs(angle) < Math.PI * 0.375)
                return new Point(1, 1);
            if (Math.abs(angle) > Math.PI * 0.625)
                return new Point(-1, 1);
            return new Point(0, 1);
        }
    }
}
