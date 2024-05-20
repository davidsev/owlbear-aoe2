import { BaseShape, cached } from './BaseShape';
import { Cell, grid, Point, SnapTo } from '@davidsev/owlbear-utils';
import { Command, PathCommand } from '@owlbear-rodeo/sdk/lib/types/items/Path';
import { Triangle } from '../Utils/Geometry/Shape/Triangle';
import { SquareDirection, StartPoint } from '../Metadata/room';
import { getDirection4, getDirection8 } from '../Utils/Geometry/getDirection';

export class ConeTemplateShape extends BaseShape {

    constructor (
        public readonly widthRads: number,
        public readonly startPoints: StartPoint[],
        public readonly overlapThreshold: number,
        public readonly sizeSnapping: number,
        public readonly directionSnapping: SquareDirection,
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

        // If the direction isn't locked, then just fix the length and we're done.
        if (this.directionSnapping === SquareDirection.ALL)
            return this.roundedStart.add(vector.scale(this.roundedDistance / this.distance));

        // Otherwise we need to snap to the nearest valid direction.
        const direction = this.directionSnapping === SquareDirection.FOUR ? getDirection4(vector) : getDirection8(vector);
        if (!direction)
            return this.roundedStart;

        // Work out how far to move in the direction.  If it's diagonal, then we need to not move the full distance.
        let move = new Point(this.roundedDistance * direction.x, this.roundedDistance * direction.y);
        if (direction.x !== 0 && direction.y !== 0)
            move = move.scale(1.414 / 2);

        return this.roundedStart.add(move);
    }

    @cached()
    private get triangle (): Triangle {
        const vector = this.roundedEnd.sub(this.roundedStart).scale(Math.tan(this.widthRads / 2));
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
