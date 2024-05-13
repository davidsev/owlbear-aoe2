import { Vector2 } from '@owlbear-rodeo/sdk';
import { Cell, LineSegment, Point } from '@davidsev/owlbear-utils';
import { calculateLineIntersections } from '../calculateLineIntersections';
import { sortPointsClockwise } from '../sortPointsClockwise';
import { calculateArea } from '../calculateArea';
import { roomMetadata } from '../../../Metadata/room';
import { IntersectionDebugger } from '../../IntersectionDebugger';
import { calculateCenter } from '../calculateCenter';

export abstract class Polygon implements Iterable<Point> {

    public constructor (
        public readonly points: Point[],
    ) {
    }

    public [Symbol.iterator] (): Iterator<Point> {
        return this.points[Symbol.iterator]();
    }

    public get center (): Point {
        return calculateCenter(this.points);
    }

    public get lines (): LineSegment[] {
        const lines: LineSegment[] = [];
        for (let i = 0; i < this.points.length; i++) {
            lines.push(new LineSegment(this.points[i], this.points[(i + 1) % this.points.length]));
        }
        return lines;
    }

    public intersectsCellPercentage (cell: Cell): number {
        const debugMode = roomMetadata.data.debugIntersection && cell.containsPoint(new Point(0, 0));
        const debug = debugMode ? IntersectionDebugger.getInstance() : null;
        debug?.clear();

        // Work out the shape that intersects the two.
        const intersectionShape: Point[] = [];

        // Find any for points of the cell that are inside the polygon.
        for (const point of cell.corners) {
            if (this.containsPoint(point))
                intersectionShape.push(point);
        }

        // If the cell is completely inside the polygon, then 100%.
        if (intersectionShape.length == cell.corners.length) {
            return 100;
        }

        // Find any points of the polygon that are inside the cell.
        for (const point of this) {
            if (cell.containsPoint(point))
                intersectionShape.push(point);
        }

        // And find any points where the lines intersect.
        for (const polygonLine of this.lines) {
            for (const cellLine of cell.edges) {
                intersectionShape.push(...calculateLineIntersections(polygonLine, cellLine));
            }
        }

        debug?.cross(...intersectionShape);

        // Then sort our points to be in order, and remove dupes.
        const sortedPoints = sortPointsClockwise(intersectionShape);
        const uniqueSortedPoints = [...new Map(sortedPoints.map(point => [point.toString(), point])).values()];

        // If there's not enough / any overlap, then no intersection.
        if (uniqueSortedPoints.length < 3) {
            return 0;
        }

        // Otherwise we need the area of the intersection area.
        const polygonArea = calculateArea(uniqueSortedPoints, debug);

        // Compare to the area of the cell.
        return polygonArea / calculateArea(cell.corners) * 100;
    }

    public abstract containsPoint (point: Vector2): boolean;

    public abstract toString (): string;
}
