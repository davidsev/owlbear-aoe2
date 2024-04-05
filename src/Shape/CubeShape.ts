import { BaseShape } from './BaseShape';
import { Cell, grid, Point, SnapTo } from '@davidsev/owlbear-utils';
import { Command, PathCommand } from '@owlbear-rodeo/sdk/lib/types/items/Path';

export class CubeShape extends BaseShape {

    private get roundedStart (): Point {
        return grid.snapTo(this.start, SnapTo.CORNER);
    }

    private get roundedEnd (): Point {
        const roundedEnd = grid.snapTo(this.end, SnapTo.CORNER);
        let diff = this.roundedStart.sub(roundedEnd);
        const rawDiff = this.start.sub(this.end);

        // Make it into a square by increasing the x or y to match the other.
        if (Math.abs(diff.x) > Math.abs(diff.y)) {
            diff = new Point(diff.x, Math.abs(diff.x) * Math.sign(rawDiff.y));
        } else if (Math.abs(diff.y) > Math.abs(diff.x)) {
            diff = new Point(Math.abs(diff.y) * Math.sign(rawDiff.x), diff.y);
        }

        return this.roundedStart.sub(diff);
    }

    get distance (): number {
        return this.roundedStart.distanceTo(this.roundedEnd);
    }

    public getLabelPosition (): Point {
        const diff = this.roundedEnd.sub(this.roundedStart);
        return this.roundedStart.add(diff.scale(0.5));
    }

    public getOutline (): PathCommand[] {
        const start = this.roundedStart;
        const end = this.roundedEnd;
        return [
            [Command.MOVE, start.x, start.y],
            [Command.LINE, end.x, start.y],
            [Command.LINE, end.x, end.y],
            [Command.LINE, start.x, end.y],
            [Command.LINE, start.x, start.y],
        ];
    }

    public getCells (): Cell[] {
        const start = this.roundedStart;
        const end = this.roundedEnd;
        const boundingSquare = [
            grid.getCell({ x: start.x, y: start.y }),
            grid.getCell({ x: end.x, y: start.y }),
            grid.getCell({ x: end.x, y: end.y }),
            grid.getCell({ x: start.x, y: end.y }),
        ];

        // Check every square.
        const cells: Cell[] = [];
        for (const cell of grid.iterateCellsBoundingPoints(boundingSquare)) {
            if (true) {
                cells.push(cell);
            }
        }

        return cells;
    }
}
