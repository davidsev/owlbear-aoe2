import { BaseShape, cached } from './BaseShape';
import { Cell, grid, Point, SnapTo } from '@davidsev/owlbear-utils';
import { Command, PathCommand } from '@owlbear-rodeo/sdk/lib/types/items/Path';
import { StartPoint } from '../Metadata/room';

export class CircleShape extends BaseShape {

    constructor (
        public readonly startPoints: StartPoint[],
        public readonly sizeSnapping: number,
    ) {
        super();
    }

    @cached()
    private get roundedStart (): Point {
        if (!this.startPoints.length)
            return this.start;

        const allowedSnapPoints: SnapTo[] = [];
        if (this.startPoints.includes(StartPoint.CORNER))
            allowedSnapPoints.push(SnapTo.CORNER);
        if (this.startPoints.includes(StartPoint.CENTER))
            allowedSnapPoints.push(SnapTo.CENTER);
        if (this.startPoints.includes(StartPoint.EDGE))
            allowedSnapPoints.push(SnapTo.EDGE);
        return grid.snapTo(this.start, allowedSnapPoints.reduce((a, b) => a | b));
    }

    @cached()
    public get roundedDistance (): number {
        const snapTo = this.sizeSnapping * grid.dpi;
        if (snapTo === 0)
            return this.distance;
        return Math.round(this.distance / snapTo) * snapTo;
    }

    @cached()
    private get roundedEnd (): Point {
        const vector = this.end.sub(this.start);
        return this.roundedStart.add(vector.scale(this.roundedDistance / this.distance));
    }

    @cached()
    public get labelPosition (): Point {
        return this.roundedStart;
    }

    @cached()
    public get outline (): PathCommand[] {
        return [
            [Command.MOVE, this.roundedStart.x, this.roundedStart.y + this.roundedDistance],
            [Command.CONIC, this.roundedStart.x + this.roundedDistance, this.roundedStart.y + this.roundedDistance, this.roundedStart.x + this.roundedDistance, this.roundedStart.y, Math.PI / 4],
            [Command.CONIC, this.roundedStart.x + this.roundedDistance, this.roundedStart.y - this.roundedDistance, this.roundedStart.x, this.roundedStart.y - this.roundedDistance, Math.PI / 4],
            [Command.CONIC, this.roundedStart.x - this.roundedDistance, this.roundedStart.y - this.roundedDistance, this.roundedStart.x - this.roundedDistance, this.roundedStart.y, Math.PI / 4],
            [Command.CONIC, this.roundedStart.x - this.roundedDistance, this.roundedStart.y + this.roundedDistance, this.roundedStart.x, this.roundedStart.y + this.roundedDistance, Math.PI / 4],
        ];
    }

    @cached()
    public get cells (): Cell[] {
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
