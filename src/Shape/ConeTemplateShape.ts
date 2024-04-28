import { BaseShape } from './BaseShape';
import { Cell, grid, Point, SnapTo } from '@davidsev/owlbear-utils';
import { Command, PathCommand } from '@owlbear-rodeo/sdk/lib/types/items/Path';
import { Triangle } from '../Utils/Geometry/Triangle';
import { StartPoint } from '../Metadata/room';

export class ConeTemplateShape extends BaseShape {

    constructor (
        public readonly widthRads: number,
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
        return this.roundedStart.add(vector.scale(this.roundedDistance / this.distance));
    }

    private get triangle (): Triangle {
        const vector = this.roundedEnd.sub(this.roundedStart).scale(Math.tan(this.widthRads / 2));
        return new Triangle(
            this.roundedStart,
            this.roundedEnd.add(new Point(vector.y, -vector.x)),
            this.roundedEnd.add(new Point(-vector.y, vector.x)),
        );
    }

    public getLabelPosition (): Point {
        const triangle = this.triangle;
        return triangle.center;
    }

    public getOutline (): PathCommand[] {
        const triangle = this.triangle;
        return [
            [Command.MOVE, triangle.p1.x, triangle.p1.y],
            [Command.LINE, triangle.p2.x, triangle.p2.y],
            [Command.LINE, triangle.p3.x, triangle.p3.y],
            [Command.CLOSE],
        ];
    }

    public getCells (): Cell[] {
        const cells: Cell[] = [];
        const triangle = this.triangle;

        const searchArea = grid.iterateCellsBoundingPoints(triangle.points.map(point => grid.getCell(point)));
        for (const cell of searchArea) {
            if (triangle.intersectsCellPercentage(cell) > this.overlapThreshold * 100)
                cells.push(cell);
        }
        return cells;
    }
}
