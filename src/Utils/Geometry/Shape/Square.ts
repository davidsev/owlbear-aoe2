import { Vector2 } from '@owlbear-rodeo/sdk';
import { Point } from '@davidsev/owlbear-utils';
import { dot } from '../vectorFunctions';
import { Polygon } from './Polygon';

export class Square extends Polygon {

    public readonly p1: Point;
    public readonly p2: Point;
    public readonly p3: Point;
    public readonly p4: Point;
    public readonly isAABB: boolean;

    public constructor (corner: Vector2, oppositeCorner: Vector2) {

        const p1 = new Point(corner);
        const p3 = new Point(oppositeCorner);

        // Calculate the other two points.
        const center = p1.add(p3).scale(0.5);
        const diagonal = center.sub(p1); // p1 -> center, rotate 90deg to get p2 and p4.
        const p2 = center.add({ x: diagonal.y, y: -diagonal.x });
        const p4 = center.add({ x: -diagonal.y, y: diagonal.x });

        super([p1, p2, p3, p4]);

        this.p1 = p1;
        this.p2 = p2;
        this.p3 = p3;
        this.p4 = p4;
        this.isAABB = Math.abs(diagonal.x) == Math.abs(diagonal.y);
    }

    // Formula from https://math.stackexchange.com/questions/190111/how-to-check-if-a-point-is-inside-a-rectangle
    public containsPoint (point: Vector2): boolean {
        if (this.isAABB) {
            const minX = Math.min(this.p1.x, this.p3.x);
            const maxX = Math.max(this.p1.x, this.p3.x);
            const minY = Math.min(this.p1.y, this.p3.y);
            const maxY = Math.max(this.p1.y, this.p3.y);
            return point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY;
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
