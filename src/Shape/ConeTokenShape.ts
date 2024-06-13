import { BaseShape, cached } from './BaseShape';
import { Cell, grid, Point, SnapTo, Square } from '@davidsev/owlbear-utils';
import { Command, PathCommand } from '@owlbear-rodeo/sdk/lib/types/items/Path';
import { getDirection4, getDirection8 } from '../Utils/Geometry/getDirection';
import { Triangle } from '../Utils/Geometry/Shape/Triangle';

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
    private get triangle (): Triangle {
        const vector = this.roundedEnd.sub(this.roundedStart).scale(Math.tan(Math.tan(53.1 * Math.PI / 360)));
        return new Triangle(
            this.roundedStart,
            this.roundedEnd.add(new Point(vector.y, -vector.x)),
            this.roundedEnd.add(new Point(-vector.y, vector.x)),
        );
    }

    @cached()
    public get labelPosition (): Point {
        const triangle = this.triangle;
        return triangle.center;
    }

    @cached()
    public get outline (): PathCommand[] {
        const triangle = this.triangle;
        return [
            [Command.MOVE, triangle.p1.x, triangle.p1.y],
            [Command.LINE, triangle.p2.x, triangle.p2.y],
            [Command.LINE, triangle.p3.x, triangle.p3.y],
            [Command.CLOSE],
        ];
    }

    @cached()
    public get cells (): Cell[] {
        const axis = this.directionToDraw;
        if (!axis)
            return [];

        let cellsToCheck = this.getGridSquares(axis);
        const triangle = this.triangle;

        // Function to measure how close "good" a square is.
        // We primarily use how much of the cell is within the triangle, with a secondary check on how close the center is.
        const scoreCell = (cell: Cell) => {
            return (100 - triangle.intersectsCellPercentage(cell)) * 1000 + triangle.center.distanceTo(cell.center);
        };

        // For each row, find the cells closest to the line.
        const cells: Cell[] = [];
        for (const [rowIndex, row] of cellsToCheck.entries()) {
            const bestSquares = this.maxNofArray(row, scoreCell, rowIndex + 1);
            cells.push(...bestSquares);
        }

        return cells;
    }

    // Work out which axis to be centered on.
    // If it's diagonal, we want to be centered on the nearest axis, and will reduce the number of tokens as we move away.
    // If it's not diagonal, we want to be centered on the furthest axis, and will increase the number of tokens as we move away.
    @cached()
    private get directionToDraw (): axis | null {
        const direction4 = getDirection4(this.end.sub(this.start));
        const direction8 = getDirection8(this.end.sub(this.start));

        if (!direction4 || !direction8)
            return null;

        // Check the 4 directions.
        if (direction8.x == 0) {
            if (direction8.y == -1) return '-y';
            if (direction8.y == +1) return '+y';
        }
        if (direction8.y == 0) {
            if (direction8.x == -1) return '-x';
            if (direction8.x == +1) return '+x';
        }
        // Diagonal directions.
        if (direction8.equals({ x: +1, y: -1 }) && direction4.y == -1) return '+x';
        if (direction8.equals({ x: +1, y: -1 }) && direction4.x == +1) return '-y';
        if (direction8.equals({ x: -1, y: -1 }) && direction4.y == -1) return '-x';
        if (direction8.equals({ x: -1, y: -1 }) && direction4.x == -1) return '-y';
        if (direction8.equals({ x: +1, y: +1 }) && direction4.y == +1) return '+x';
        if (direction8.equals({ x: +1, y: +1 }) && direction4.x == +1) return '+y';
        if (direction8.equals({ x: -1, y: +1 }) && direction4.y == +1) return '-x';
        if (direction8.equals({ x: -1, y: +1 }) && direction4.x == -1) return '+y';

        throw new Error(`Axis is null: direction: ${direction4}, line: ${this.end.sub(this.start)}`);
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

        // We currently have the line nearest the axis in row one, which will get one token.
        // If it's diagonal we want it the other way around.
        const direction8 = getDirection8(this.end.sub(this.start));
        if (direction8?.x !== 0 && direction8?.y !== 0)
            cells = cells.reverse();

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
}
