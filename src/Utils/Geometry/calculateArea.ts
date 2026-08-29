import type { Vector2 } from '@owlbear-rodeo/sdk';
import { LineSegment } from '@davidsev/owlbear-utils';
import { calculateCenter } from './calculateCenter';
import type { IntersectionDebugger } from '../IntersectionDebugger';

export function calculateArea(points: Vector2[], debug: IntersectionDebugger | null = null): number {
    // Less than 3 points, then 0
    if (points.length < 3) {
        return 0;
    }

    // If it's a triangle, use Heron's formula https://www.mathsisfun.com/geometry/herons-formula.html
    // (We can't do b*h/2 because it's not axis aligned)
    if (points.length === 3) {
        // We just checked the length, so we know there are exactly 3 points.
        const [p1, p2, p3] = points as [Vector2, Vector2, Vector2];

        const a = new LineSegment(p1, p2).length;
        const b = new LineSegment(p2, p3).length;
        const c = new LineSegment(p3, p1).length;

        const s = (a + b + c) / 2;
        const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));

        if (debug) {
            debug.line(p1, p2);
            debug.line(p2, p3);
            debug.line(p3, p1);
            debug.text(calculateCenter(points), area.toFixed(0));
        }

        // Check if the points are all a straight line.
        if (Number.isNaN(area)) {
            return 0;
        }
        return area;
    }

    // Otherwise it's not a triangle, so we need to split it into triangles and add the areas.
    let polygonArea = 0.0;
    // There are more than 3 points, so every index below is in range.
    const p1 = points[0] as Vector2;
    for (let i = 2; i < points.length; i++) {
        const p2 = points[i - 1] as Vector2;
        const p3 = points[i] as Vector2;
        polygonArea += calculateArea([p1, p2, p3], debug);
    }

    return polygonArea;
}
