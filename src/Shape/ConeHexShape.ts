import { BaseShape, cached } from './BaseShape';
import { Cell, grid, HHex, Point, SnapTo, VHex } from '@davidsev/owlbear-utils';
import { PathCommand } from '@owlbear-rodeo/sdk/lib/types/items/Path';
import { calculateCenter } from '../Utils/Geometry/calculateCenter';
import { BaseHex } from '@davidsev/owlbear-utils/js/Grid/Cell/BaseHex';
import { xy_to_axial_h, xy_to_axial_v } from '@davidsev/owlbear-utils/js/Grid/HexFunctions';

export class ConeHexShape extends BaseShape {

    @cached()
    public get roundedDistance (): number {
        const start = grid.snapTo(this.start, SnapTo.CENTER);
        const end = grid.snapTo(this.end, SnapTo.CENTER);
        const distance = start.distanceTo(end);
        return (Math.round(distance / grid.dpi) + 1) * grid.dpi;
    }

    @cached()
    public get labelPosition (): Point {
        return calculateCenter(this.cells.map(cell => cell.center));
    }

    @cached()
    public get outline (): PathCommand[] {
        return [];
    }

    @cached()
    private get direction (): '-q' | '+q' | '-r' | '+r' | '-s' | '+s' {
        const direction = this.end.sub(this.start);
        const [q, r] = grid.type == 'HEX_VERTICAL'
            ? xy_to_axial_v(direction.x, direction.y)
            : xy_to_axial_h(direction.x, direction.y);
        const s = -q - r;
        const abs_q = Math.abs(q);
        const abs_r = Math.abs(r);
        const abs_s = Math.abs(s);
        const max = Math.max(abs_q, abs_r, abs_s);

        if (max == abs_q)
            return q > 0 ? '+q' : '-q';
        if (max == abs_r)
            return r > 0 ? '+r' : '-r';
        return s > 0 ? '+s' : '-s';
    }

    @cached()
    public get cells (): Cell[] {
        const startCell = this.startCell;
        if (!(startCell instanceof BaseHex))
            return [];

        // See which triangle we are in
        const direction = this.direction;

        // Get the axial coordinates of the start cell
        const [q, r, s] = startCell.axialCoords;

        // Calculate the distance in cells
        const distance = this.roundedDistance / grid.dpi;

        // Iterate each row, and work out the cells in that row.
        // For now build a triangle, and map it to q r in the right direction later.
        const cellCoords: [a: number, b: number, c: number][] = [];
        for (let row = 1; row <= distance; row++) {
            for (let col = 0; col < row; col++) {
                cellCoords.push([row - 1, -col, row - col]);
            }
        }

        // Map the triangle back onto the grid
        const cellClass = grid.type == 'HEX_VERTICAL' ? VHex : HHex;
        if (direction == '+q')
            return cellCoords.map(([a, b, c]) => cellClass.fromAxial(q + a, r + b));
        if (direction == '-q')
            return cellCoords.map(([a, b, c]) => cellClass.fromAxial(q - a, r - b));
        if (direction == '+r')
            return cellCoords.map(([a, b, c]) => cellClass.fromAxial(q + b, r + a));
        if (direction == '-r')
            return cellCoords.map(([a, b, c]) => cellClass.fromAxial(q - b, r - a));
        if (direction == '+s')
            return cellCoords.map(([a, b, c]) => cellClass.fromAxial(q - c + 1, r + b));
        if (direction == '-s')
            return cellCoords.map(([a, b, c]) => cellClass.fromAxial(q + c - 1, r - b));

        return [];
    }
}
