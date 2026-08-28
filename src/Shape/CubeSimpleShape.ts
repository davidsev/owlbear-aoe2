import { type Cell, Point, SnapTo } from '@davidsev/owlbear-utils';
import type { PathCommand } from '@owlbear-rodeo/sdk';
import { BaseShape, cached } from './BaseShape';
import { getDiagonalDirection4 } from '../Utils/Geometry/getDirection';

export class CubeSimpleShape extends BaseShape {
    @cached()
    private get roundedStart(): Point {
        return this.grid.snapTo(this.start, SnapTo.CORNER);
    }

    @cached()
    public get roundedDistance(): number {
        const vector = this.end.sub(this.start);
        const dist = Math.max(Math.abs(vector.x), Math.abs(vector.y));
        return Math.round(dist / this.grid.dpi) * this.grid.dpi;
    }

    @cached()
    private get roundedEnd(): Point {
        const vector = this.end.sub(this.start);
        const direction = getDiagonalDirection4(vector);
        if (!direction) return this.roundedStart;
        const move = new Point(this.roundedDistance * direction.x, this.roundedDistance * direction.y);
        return this.roundedStart.add(move);
    }

    @cached()
    public get labelPosition(): Point {
        return new Point((this.roundedStart.x + this.roundedEnd.x) / 2, (this.roundedStart.y + this.roundedEnd.y) / 2);
    }

    public get outline(): PathCommand[] {
        return [];
    }

    @cached()
    public get cells(): Cell[] {
        const direction = getDiagonalDirection4(this.end.sub(this.start));
        if (!direction) return [];

        const squares = Math.round(this.roundedDistance / this.grid.dpi);
        const start = this.roundedStart.add(direction);
        const cells: Cell[] = [];
        for (let x = 0; x < squares; x++) {
            for (let y = 0; y < squares; y++) {
                cells.push(
                    this.grid.getCell(
                        start.add({
                            x: x * this.grid.dpi * direction.x,
                            y: y * this.grid.dpi * direction.y,
                        }),
                    ),
                );
            }
        }

        return cells;
    }
}
