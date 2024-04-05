import { Point } from '@davidsev/owlbear-utils';
import { Vector2 } from '@owlbear-rodeo/sdk';

export function calculateCenter (points: Vector2[]): Point {
    let x = 0;
    let y = 0;

    for (const point of points) {
        x += point.x;
        y += point.y;
    }
    return new Point({
        x: x / points.length,
        y: y / points.length,
    });
}
