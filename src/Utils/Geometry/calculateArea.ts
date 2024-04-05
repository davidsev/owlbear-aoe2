import { Vector2 } from '@owlbear-rodeo/sdk';
import { LineSegment } from '@davidsev/owlbear-utils';
import { calculateCenter } from './calculateCenter';

export function calculateArea (points: Vector2[]): number {

    // Less than 3 points, then 0
    if (points.length < 3) {
        return 0;
    }

    const lines = [
        new LineSegment(points[0], points[1]),
        new LineSegment(points[1], points[2]),
        new LineSegment(points[2], points[0]),
    ];

    // If it's a triangle, use Heron's formula https://www.mathsisfun.com/geometry/herons-formula.html
    // (We can't do b*h/2 because it's not axis aligned)
    if (points.length === 3) {
        const a = lines[0].length;
        const b = lines[1].length;
        const c = lines[2].length;

        const s = (a + b + c) / 2;
        const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));
        // Check if the points are all a straight line.
        if (isNaN(area)) {
            return 0;
        }
        return area;
    }

    // Otherwise it's not a triangle, so we need to split it into triangles and add the areas.
    let polygonArea = 0.0;
    const center = calculateCenter(points);
    for (const line of lines) {
        polygonArea += calculateArea([center, line.p1, line.p2]);
    }

    return polygonArea;
}
