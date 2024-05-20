import { BaseShape, cached } from './BaseShape';
import { Cell, grid, LineSegment, Point, SnapTo, Square } from '@davidsev/owlbear-utils';
import { PathCommand } from '@owlbear-rodeo/sdk/lib/types/items/Path';
import { getDirection4 } from '../Utils/Geometry/getDirection';

type axis = '+x' | '-x' | '+y' | '-y';

export class ConeTokenShape extends BaseShape {

    @cached()
    private get roundedStart (): Point {
        return grid.snapTo(this.start, SnapTo.CORNER);
    }

    @cached()
    public get roundedDistance (): number {
        return Math.round(this.distance / grid.dpi) * grid.dpi;
    }

    @cached()
    private get roundedEnd (): Point {
        const vector = this.end.sub(this.start);
        return this.roundedStart.add(vector.scale(this.roundedDistance / this.distance));
    }

    @cached()
    public get labelPosition (): Point {
        return new Point(
            (this.roundedStart.x + this.roundedEnd.x) / 2,
            (this.roundedStart.y + this.roundedEnd.y) / 2,
        );
    }

    public get outline (): PathCommand[] {
        return [];
    }

    @cached()
    public get cells (): Cell[] {
        const axis = this.directionToDraw;
        if (!axis)
            return [];

        let cellsToCheck = this.getGridSquares(axis);

        // Function to measure how close a cell is to the center-line.
        // We need an extended version of the line as the calculation only works if the line is longer than the cone.
        const line = this.extendedCenterline;
        const distanceFunction = (square: Cell) => {
            const x0 = square.center.x;
            const y0 = square.center.y;
            const x1 = line.p1.x;
            const y1 = line.p1.y;
            const x2 = line.p2.x;
            const y2 = line.p2.y;
            return Math.abs((y2 - y1) * x0 - (x2 - x1) * y0 + x2 * y1 - y2 * x1) / Math.sqrt((y2 - y1) ** 2 + (x2 - x1) ** 2);
        };

        // For each row, find the cells closest to the line.
        const cells: Cell[] = [];
        for (const [rowIndex, row] of cellsToCheck.entries()) {
            const bestSquares = this.maxNofArray(row, distanceFunction, rowIndex + 1);
            cells.push(...bestSquares);
        }

        return cells;
    }

    // Work out which axis to be centered on.
    // If it's diagonal, we want to be centered on the nearest axis, and will reduce the number of tokens as we move away.
    // If it's not diagonal, we want to be centered on the furthest axis, and will increase the number of tokens as we move away.
    @cached()
    private get directionToDraw (): axis | null {
        const direction = getDirection4(this.end.sub(this.start));

        if (!direction)
            return null;

        if (direction.x == 0) {
            if (direction.y == -1) return '-y';
            if (direction.y == +1) return '+y';
        }
        if (direction.y == 0) {
            if (direction.x == -1) return '-x';
            if (direction.x == +1) return '+x';
        }

        throw new Error(`Axis is null: direction: ${direction}, line: ${this.end.sub(this.start)}`);
    }

    // Build a grid of squares to check, in rows.  The first row is nearest the axis.
    private getGridSquares (axis: axis): Cell[][] {
        let cells: Cell[][] = [];
        if (axis == '+x') {
            for (let x = this.roundedStart.x; x < this.roundedStart.x + this.roundedDistance; x += grid.dpi) {
                let row: Cell[] = [];
                for (let y = this.roundedStart.y - this.roundedDistance * 1.5; y < this.roundedStart.y + this.roundedDistance * 1.5; y += grid.dpi)
                    row.push(Square.fromCoords({ x, y }));
                cells.push(row);
            }
        } else if (axis == '-x') {
            for (let x = this.roundedStart.x - grid.dpi; x >= this.roundedStart.x - this.roundedDistance; x -= grid.dpi) {
                let row: Cell[] = [];
                for (let y = this.roundedStart.y - this.roundedDistance * 1.5; y < this.roundedStart.y + this.roundedDistance * 1.5; y += grid.dpi)
                    row.push(Square.fromCoords({ x, y }));
                cells.push(row);
            }
        } else if (axis == '+y') {
            for (let y = this.roundedStart.y; y < this.roundedStart.y + this.roundedDistance; y += grid.dpi) {
                let row: Cell[] = [];
                for (let x = this.roundedStart.x - this.roundedDistance * 1.5; x < this.roundedStart.x + this.roundedDistance * 1.5; x += grid.dpi)
                    row.push(Square.fromCoords({ x, y }));
                cells.push(row);
            }
        } else if (axis == '-y') {
            for (let y = this.roundedStart.y - grid.dpi; y >= this.roundedStart.y - this.roundedDistance; y -= grid.dpi) {
                let row: Cell[] = [];
                for (let x = this.roundedStart.x - this.roundedDistance * 1.5; x < this.roundedStart.x + this.roundedDistance * 1.5; x += grid.dpi)
                    row.push(Square.fromCoords({ x, y }));
                cells.push(row);
            }
        }

        return cells;
    }

    /** Get the highest N values from an array. */
    private maxNofArray<T> (items: T[], getValue: (item: T) => number, count: number = 1): T[] {

        // Get the value of each item.
        const values = new Map<T, number>();
        for (const item of items)
            values.set(item, getValue(item));

        // Sort the items by their value.
        const sortedValues = [...values.entries()].sort((a, b) => a[1] - b[1]);

        // Return the top n items.
        return sortedValues.slice(0, count).map(x => x[0]);
    }

    get extendedCenterline (): LineSegment {
        const vector = this.roundedEnd.sub(this.roundedStart);
        return new LineSegment(this.roundedStart.sub(vector), this.roundedEnd.add(vector));
    }
}
