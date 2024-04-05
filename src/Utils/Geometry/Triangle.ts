import { Vector2 } from '@owlbear-rodeo/sdk';
import { Cell, LineSegment, Point } from '@davidsev/owlbear-utils';
import { calculateLineIntersections } from './calculateLineIntersections';
import { sortPointsClockwise } from './sortPointsClockwise';
import { calculateArea } from './calculateArea';

export class Triangle implements Iterable<Point> {

    public readonly p1: Point;
    public readonly p2: Point;
    public readonly p3: Point;

    public constructor (p1: Vector2, p2: Vector2, p3: Vector2) {
        this.p1 = new Point(p1);
        this.p2 = new Point(p2);
        this.p3 = new Point(p3);
    }

    public [Symbol.iterator] (): Iterator<Point> {
        return [this.p1, this.p2, this.p3][Symbol.iterator]();
    }

    public get points (): Point[] {
        return [this.p1, this.p2, this.p3];
    }

    public get center (): Point {
        return this.p1.add(this.p2).add(this.p3).scale(1 / 3);
    }

    public get lines (): LineSegment[] {
        return [
            new LineSegment(this.p1, this.p2),
            new LineSegment(this.p2, this.p3),
            new LineSegment(this.p3, this.p1),
        ];
    }

    public intersectsCellPercentage (cell: Cell): number {
        // Work out the polygon that intersects the two.
        const newPolygon: Point[] = [];

        // Find any points of the triangle that are inside the cell.
        for (const point of this) {
            if (cell.containsPoint(point))
                newPolygon.push(point);
        }

        // Ditto for points of the cell that are inside the triangle.
        for (const point of cell.corners) {
            if (this.containsPoint(point))
                newPolygon.push(point);
        }

        // And find any points where the lines intersect.
        for (const triangleLine of this.lines) {
            for (const cellLine of cell.edges) {
                newPolygon.push(...calculateLineIntersections(triangleLine, cellLine));
            }
        }

        // Then sort our points to be in order, and remove dupes.
        const sortedPoints = sortPointsClockwise(newPolygon);
        const uniqueSortedPoints = [...new Map(sortedPoints.map(point => [point.toString(), point])).values()];

        // If there's not enough / any overlap, then no intersection.
        if (uniqueSortedPoints.length < 3) {
            return 0;
        }

        // Otherwise we need the area of the polygon.
        const polygonArea = calculateArea(uniqueSortedPoints);

        // Compare to the area of the cell.
        return polygonArea / calculateArea(cell.corners) * 100;
    }

    // Formula from https://stackoverflow.com/questions/13300904/determine-whether-point-lies-inside-triangle/13301035#13301035
    public containsPoint (point: Vector2): boolean {
        const alpha = ((this.p2.y - this.p3.y) * (point.x - this.p3.x) + (this.p3.x - this.p2.x) * (point.y - this.p3.y)) /
            ((this.p2.y - this.p3.y) * (this.p1.x - this.p3.x) + (this.p3.x - this.p2.x) * (this.p1.y - this.p3.y));
        const beta = ((this.p3.y - this.p1.y) * (point.x - this.p3.x) + (this.p1.x - this.p3.x) * (point.y - this.p3.y)) /
            ((this.p2.y - this.p3.y) * (this.p1.x - this.p3.x) + (this.p3.x - this.p2.x) * (this.p1.y - this.p3.y));
        const gamma = 1.0 - alpha - beta;

        return alpha > 0 && beta > 0 && gamma > 0;
    }

    public toString (): string {
        return `Triangle(${this.p1}, ${this.p2}, ${this.p3})`;
    }
}
