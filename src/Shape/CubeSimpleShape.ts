import { Cell, grid, Point, SnapTo } from '@davidsev/owlbear-utils';
import { PathCommand } from '@owlbear-rodeo/sdk';
import { BaseShape } from './BaseShape';
import { getDiagonalDirection4 } from '../Utils/Geometry/getDirection';

export class CubeSimpleShape extends BaseShape {

    private get roundedStart (): Point {
        return grid.snapTo(this.start, SnapTo.CORNER);
    }

    public get roundedDistance (): number {
        const vector = this.end.sub(this.start);
        const dist = Math.max(Math.abs(vector.x), Math.abs(vector.y));
        return Math.round(dist / grid.dpi) * grid.dpi;
    }

    private get roundedEnd (): Point {
        const vector = this.end.sub(this.start);
        const direction = getDiagonalDirection4(vector);
        if (!direction)
            return this.roundedStart;
        const move = new Point(this.roundedDistance * direction.x, this.roundedDistance * direction.y);
        return this.roundedStart.add(move);
    }

    public getLabelPosition (): Point {
        return new Point(
            (this.roundedStart.x + this.roundedEnd.x) / 2,
            (this.roundedStart.y + this.roundedEnd.y) / 2,
        );
    }

    public getOutline (): PathCommand[] {
        return [];
    }

    public getCells (): Cell[] {
        const direction = getDiagonalDirection4(this.end.sub(this.start));
        if (!direction)
            return [];

        const squares = Math.round(this.roundedDistance / grid.dpi);
        const start = this.roundedStart.add(direction);
        const cells: Cell[] = [];
        for (let x = 0; x < squares; x++) {
            for (let y = 0; y < squares; y++) {
                cells.push(grid.getCell(start.add({
                    x: x * grid.dpi * direction.x,
                    y: y * grid.dpi * direction.y,
                })));
            }
        }

        return cells;
    }
}
