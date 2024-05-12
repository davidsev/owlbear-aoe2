import { Vector2 } from '@owlbear-rodeo/sdk';

export function dot (lhs: Vector2, rhs: Vector2): number {
    return lhs.x * rhs.x + lhs.y * rhs.y;
}

export function cross (lhs: Vector2, rhs: Vector2): number {
    return lhs.x * rhs.y - lhs.y * rhs.x;
}
