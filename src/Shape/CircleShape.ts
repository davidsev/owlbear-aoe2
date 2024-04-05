import { BaseShape } from './BaseShape';
import { Cell, grid, Point, SnapTo } from '@davidsev/owlbear-utils';
import { Command, PathCommand } from '@owlbear-rodeo/sdk/lib/types/items/Path';

export class CircleShape extends BaseShape {

    private get roundedStart (): Point {
        return grid.snapTo(this.start, SnapTo.CORNER);
    }

    private get roundedEnd (): Point {
        const vector = this.end.sub(this.start);
        return this.roundedStart.add(vector.scale(this.roundedDistance / this.distance));
    }

    public getLabelPosition (): Point {
        return this.roundedStart;
    }

    public getOutline (): PathCommand[] {
        return [
            [Command.MOVE, this.roundedStart.x, this.roundedStart.y + this.roundedDistance],
            [Command.CONIC, this.roundedStart.x + this.roundedDistance, this.roundedStart.y + this.roundedDistance, this.roundedStart.x + this.roundedDistance, this.roundedStart.y, Math.PI / 4],
            [Command.CONIC, this.roundedStart.x + this.roundedDistance, this.roundedStart.y - this.roundedDistance, this.roundedStart.x, this.roundedStart.y - this.roundedDistance, Math.PI / 4],
            [Command.CONIC, this.roundedStart.x - this.roundedDistance, this.roundedStart.y - this.roundedDistance, this.roundedStart.x - this.roundedDistance, this.roundedStart.y, Math.PI / 4],
            [Command.CONIC, this.roundedStart.x - this.roundedDistance, this.roundedStart.y + this.roundedDistance, this.roundedStart.x, this.roundedStart.y + this.roundedDistance, Math.PI / 4],
        ];
    }

    public getCells (): Cell[] {
        // Work out the bounding area of the circle.
        const boundingSquare = [
            grid.getCell(this.roundedStart.add({ x: -this.roundedDistance, y: -this.roundedDistance })),
            grid.getCell(this.roundedStart.add({ x: this.roundedDistance, y: -this.roundedDistance })),
            grid.getCell(this.roundedStart.add({ x: this.roundedDistance, y: this.roundedDistance })),
            grid.getCell(this.roundedStart.add({ x: -this.roundedDistance, y: this.roundedDistance })),
        ];

        // Check every square.
        const cells: Cell[] = [];
        for (const cell of grid.iterateCellsBoundingPoints(boundingSquare)) {
            if (this.roundedStart.distanceTo(cell.center) <= this.roundedDistance) {
                cells.push(cell);
            }
        }

        return cells;
    }
}
