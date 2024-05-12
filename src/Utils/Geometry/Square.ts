import { Vector2 } from '@owlbear-rodeo/sdk';
import { Cell, LineSegment, Point } from '@davidsev/owlbear-utils';
import { calculateLineIntersections } from './calculateLineIntersections';
import { sortPointsClockwise } from './sortPointsClockwise';
import { calculateArea } from './calculateArea';
import { roomMetadata } from '../../Metadata/room';
import { IntersectionDebugger } from '../IntersectionDebugger';
import { dot } from './vectorFunctions';

export class Square implements Iterable<Point> {

    public readonly p1: Point;
    public readonly p2: Point;
    public readonly p3: Point;
    public readonly p4: Point;
    public readonly isAABB: boolean;

    public constructor (corner: Vector2, oppositeCorner: Vector2) {
        this.p1 = new Point(corner);
        this.p3 = new Point(oppositeCorner);

        const diagonal = this.center.sub(this.p1); // p1 -> center, rotate 90deg to get p2 and p4.
        this.p2 = this.center.add({ x: diagonal.y, y: -diagonal.x });
        this.p4 = this.center.add({ x: -diagonal.y, y: diagonal.x });

        this.isAABB = Math.abs(diagonal.x) == Math.abs(diagonal.y);
    }

    public [Symbol.iterator] (): Iterator<Point> {
        return this.points[Symbol.iterator]();
    }

    public get points (): Point[] {
        return [this.p1, this.p2, this.p3, this.p4];
    }

    public get center (): Point {
        return this.p1.add(this.p3).scale(0.5);
    }

    public get lines (): LineSegment[] {
        return [
            new LineSegment(this.p1, this.p2),
            new LineSegment(this.p2, this.p3),
            new LineSegment(this.p3, this.p4),
            new LineSegment(this.p4, this.p1),
        ];
    }

    public intersectsCellPercentage (cell: Cell): number {
        const debugMode = roomMetadata.data.debugIntersection && cell.containsPoint(new Point(0, 0));
        const debug = debugMode ? IntersectionDebugger.getInstance() : null;
        debug?.clear();

        // Work out the polygon that intersects the two.
        const newPolygon: Point[] = [];

        // Find any points of the cell that are inside the square.
        for (const point of cell.corners) {
            if (this.containsPoint(point))
                newPolygon.push(point);
        }

        // If all of the cell is inside the triangle, then 100%.
        if (newPolygon.length == cell.corners.length) {
            return 100;
        }

        // Find any points of the square that are inside the cell.
        for (const point of this) {
            if (cell.containsPoint(point))
                newPolygon.push(point);
        }

        // And find any points where the lines intersect.
        for (const squareLine of this.lines) {
            for (const cellLine of cell.edges) {
                newPolygon.push(...calculateLineIntersections(squareLine, cellLine));
            }
        }

        debug?.cross(...newPolygon);

        // Then sort our points to be in order, and remove dupes.
        const sortedPoints = sortPointsClockwise(newPolygon);
        const uniqueSortedPoints = [...new Map(sortedPoints.map(point => [point.toString(), point])).values()];

        // If there's not enough / any overlap, then no intersection.
        if (uniqueSortedPoints.length < 3) {
            return 0;
        }

        // Otherwise we need the area of the polygon.
        const polygonArea = calculateArea(uniqueSortedPoints, debug);

        // Compare to the area of the cell.
        return polygonArea / calculateArea(cell.corners) * 100;
    }

    // Formula from https://math.stackexchange.com/questions/190111/how-to-check-if-a-point-is-inside-a-rectangle
    public containsPoint (point: Vector2): boolean {
        if (this.isAABB) {
            return point.x >= this.p1.x && point.x <= this.p3.x && point.y >= this.p1.y && point.y <= this.p3.y;
        } else {
            const M = new Point(point);
            const AB = this.p2.sub(this.p1);
            const AM = M.sub(this.p1);
            const BC = this.p3.sub(this.p2);
            const BM = M.sub(this.p2);
            const ABAM = dot(AB, AM);
            const ABAB = dot(AB, AB);
            const BCBM = dot(BC, BM);
            const BCBC = dot(BC, BC);
            return 0 <= ABAM && ABAM <= ABAB && 0 <= BCBM && BCBM <= BCBC;
        }
    }

    public toString (): string {
        return `Square(${this.p1} -> ${this.p3})`;
    }
}
