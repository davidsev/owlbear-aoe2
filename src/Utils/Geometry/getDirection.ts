import { Vector2 } from '@owlbear-rodeo/sdk';
import { Point } from '@davidsev/owlbear-utils';

/** Get a normalized direction vector, in one of the 8 compass points.
 *  In OBR right and down are positive.
 */
export function getDirection8 (vector: Vector2): Point | null {
    if (vector.x == 0 && vector.y == 0)
        return null;
    const angle = Math.atan2(vector.y, vector.x);

    if (Math.abs(angle) < Math.PI * 0.125)
        return new Point(1, 0);
    if (Math.abs(angle) > Math.PI * 0.875)
        return new Point(-1, 0);
    if (angle < 0) {
        if (Math.abs(angle) < Math.PI * 0.375)
            return new Point(1, -1);
        if (Math.abs(angle) > Math.PI * 0.625)
            return new Point(-1, -1);
        return new Point(0, -1);
    } else {
        if (Math.abs(angle) < Math.PI * 0.375)
            return new Point(1, 1);
        if (Math.abs(angle) > Math.PI * 0.625)
            return new Point(-1, 1);
        return new Point(0, 1);
    }
}

/** Get a normalized direction vector, in one of the 4 compass points.
 *  In OBR right and down are positive.
 */
export function getDirection4 (vector: Vector2): Point | null {
    if (vector.x == 0 && vector.y == 0)
        return null;
    const angle = Math.atan2(vector.y, vector.x);

    if (Math.abs(angle) < Math.PI * 0.25)
        return new Point(1, 0);
    if (Math.abs(angle) > Math.PI * 0.75)
        return new Point(-1, 0);
    if (angle < 0)
        return new Point(0, -1);
    return new Point(0, 1);
}
