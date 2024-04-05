import { LineSegment, Point } from '@davidsev/owlbear-utils';
import { Vector2 } from '@owlbear-rodeo/sdk';

// algorithm from https://stackoverflow.com/questions/563198/how-do-you-detect-where-two-line-segments-intersect/565282#565282
export function calculateLineIntersections (line1: LineSegment, line2: LineSegment): Point[] {

    const p = line1.p1;
    const r = line1.p2.sub(line1.p1);
    const q = line2.p1;
    const s = line2.p2.sub(line2.p1);

    // r × s
    const r_s = cross(r, s);
    // (q − p) × r
    const q_p_r = cross(q.sub(p), r);

    // Check if the lines are co-linear.
    if (isZeroIsh(r_s) && isZeroIsh(q_p_r)) {
        // t0 = (q − p) · r / (r · r)
        const t0 = dot(q.sub(p), r) / dot(r, r);

        // t1 = (q + s − p) · r / (r · r) = t0 + s · r / (r · r)
        const t1 = t0 + dot(s, r) / dot(r, r);

        // Overlap:  t0 and t1 are the points on line1 where the intersections happen, return them both.
        if (t0 >= 0 && t0 <= 1 || t1 >= 0 && t1 <= 1) {
            return [
                new Point({
                    x: line1.p1.x + (line1.p2.x - line1.p1.x) * t0,
                    y: line1.p1.y + (line1.p2.y - line1.p1.y) * t0,
                }),
                new Point({
                    x: line1.p1.x + (line1.p2.x - line1.p1.x) * t1,
                    y: line1.p1.y + (line1.p2.y - line1.p1.y) * t1,
                }),
            ];
        }

        // Same line but non-overlapping segments, so no intersection
        return [];
    }

    // Parallel but separate, so no intersection
    if (isZeroIsh(r_s) && !isZeroIsh(q_p_r)) {
        return [];
    }

    // t = (q − p) × s / (r × s)
    const t = cross(q.sub(p), s) / cross(r, s);

    // u = (q − p) × r / (r × s)
    const u = cross(q.sub(p), r) / cross(r, s);

    // Intersection.  t is how far along line1 the intersection is, u is how far along line2.
    if (!isZeroIsh(r_s) && t >= 0 && t <= 1 && u >= 0 && u <= 1) {
        return [new Point({
            x: line1.p1.x + (line1.p2.x - line1.p1.x) * t,
            y: line1.p1.y + (line1.p2.y - line1.p1.y) * t,
        })];
    }

    return [];
}

function isZeroIsh (x: number) {
    return Math.abs(x) < 1 / 1000000;
}

function dot (lhs: Vector2, rhs: Vector2): number {
    return lhs.x * rhs.x + lhs.y * rhs.y;
}

function cross (lhs: Vector2, rhs: Vector2): number {
    return lhs.x * rhs.y - lhs.y * rhs.x;
}
