import { BaseShape } from './BaseShape';
import { Cell, grid, Point, SnapTo } from '@davidsev/owlbear-utils';
import { Command, PathCommand } from '@owlbear-rodeo/sdk/lib/types/items/Path';
import { StartPoint } from '../Metadata/room';
import { Square } from '../Utils/Geometry/Square';

export class CubeTemplateShape extends BaseShape {

    constructor (
        public readonly startPoints: StartPoint[],
        public readonly overlapThreshold: number,
        public readonly sizeSnapping: number,
    ) {
        super();
    }

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

    public get roundedDistance (): number {
        const snapTo = this.sizeSnapping * grid.dpi;
        if (snapTo === 0)
            return this.distance;
        return Math.round(this.distance / snapTo) * snapTo;
    }

    private get roundedEnd (): Point {
        const vector = this.end.sub(this.start);
        return this.roundedStart.add(vector.scale((this.roundedDistance * 1.414) / this.distance));
    }

    private get square (): Square {
        return new Square(this.roundedStart, this.roundedEnd);
    }

    public getLabelPosition (): Point {
        return this.square.center;
    }

    public getOutline (): PathCommand[] {
        const triangle = this.square;
        return [
            [Command.MOVE, triangle.p1.x, triangle.p1.y],
            [Command.LINE, triangle.p2.x, triangle.p2.y],
            [Command.LINE, triangle.p3.x, triangle.p3.y],
            [Command.LINE, triangle.p4.x, triangle.p4.y],
            [Command.CLOSE],
        ];
    }

    public getCells (): Cell[] {
        const cells: Cell[] = [];
        const square = this.square;

        const searchArea = grid.iterateCellsBoundingPoints(square.points.map(point => grid.getCell(point)));
        for (const cell of searchArea) {
            if (square.intersectsCellPercentage(cell) > this.overlapThreshold * 100)
                cells.push(cell);
        }
        return cells;
    }
}
