import { Vector2 } from '@owlbear-rodeo/sdk';
import { Point } from '@davidsev/owlbear-utils';
import { Polygon } from './Polygon';

export class Triangle extends Polygon {

    public readonly p1: Point;
    public readonly p2: Point;
    public readonly p3: Point;

    public constructor (p1: Vector2, p2: Vector2, p3: Vector2) {
        super([new Point(p1), new Point(p2), new Point(p3)]);
        this.p1 = this.points[0];
        this.p2 = this.points[1];
        this.p3 = this.points[2];
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
