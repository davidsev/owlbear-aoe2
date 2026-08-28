import { BaseShape, cached } from './BaseShape';
import { type Cell, HHex, type HHexGrid, type Point, SnapTo, VHex, type VHexGrid } from '@davidsev/owlbear-utils';
import type { PathCommand } from '@owlbear-rodeo/sdk/lib/types/items/Path';
import { calculateCenter } from '../Utils/Geometry/calculateCenter';

export class ConeHexShape extends BaseShape<VHexGrid | HHexGrid> {
    @cached()
    public get roundedDistance(): number {
        const start = this.grid.snapTo(this.start, SnapTo.CENTER);
        const end = this.grid.snapTo(this.end, SnapTo.CENTER);
        const distance = start.distanceTo(end);
        return (Math.round(distance / this.grid.dpi) + 1) * this.grid.dpi;
    }

    @cached()
    public get labelPosition(): Point {
        return calculateCenter(this.cells.map(cell => cell.center));
    }

    @cached()
    public get outline(): PathCommand[] {
        return [];
    }

    @cached()
    private get direction(): '-q' | '+q' | '-r' | '+r' | '-s' | '+s' {
        const direction = this.end.sub(this.start);
        const [q, r] = this.grid.xy_to_axial(direction.x, direction.y);
        const s = -q - r;
        const abs_q = Math.abs(q);
        const abs_r = Math.abs(r);
        const abs_s = Math.abs(s);
        const max = Math.max(abs_q, abs_r, abs_s);

        if (max === abs_q) return q > 0 ? '+q' : '-q';
        if (max === abs_r) return r > 0 ? '+r' : '-r';
        return s > 0 ? '+s' : '-s';
    }

    @cached()
    public get cells(): Cell[] {
        // See which triangle we are in
        const direction = this.direction;

        // Get the axial coordinates of the start cell
        const [q, r] = this.startCell.axialCoords;

        // Calculate the distance in cells
        const distance = this.roundedDistance / this.grid.dpi;

        // Iterate each row, and work out the cells in that row.
        // For now build a triangle, and map it to q r in the right direction later.
        const cellCoords: [a: number, b: number, c: number][] = [];
        for (let row = 1; row <= distance; row++) {
            for (let col = 0; col < row; col++) {
                cellCoords.push([row - 1, -col, row - col]);
            }
        }

        // Map the triangle back onto the grid
        const hexGrid = this.grid;
        const fromAxial = (q: number, r: number): VHex | HHex =>
            hexGrid.type === 'HEX_VERTICAL' ? VHex.fromAxial(q, r, hexGrid) : HHex.fromAxial(q, r, hexGrid);
        if (direction === '+q') return cellCoords.map(([a, b]) => fromAxial(q + a, r + b));
        if (direction === '-q') return cellCoords.map(([a, b]) => fromAxial(q - a, r - b));
        if (direction === '+r') return cellCoords.map(([a, b]) => fromAxial(q + b, r + a));
        if (direction === '-r') return cellCoords.map(([a, b]) => fromAxial(q - b, r - a));
        if (direction === '+s') return cellCoords.map(([, b, c]) => fromAxial(q - c + 1, r + b));
        if (direction === '-s') return cellCoords.map(([, b, c]) => fromAxial(q + c - 1, r - b));

        return [];
    }
}
