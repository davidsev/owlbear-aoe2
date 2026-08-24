import { BaseShape, cached } from './BaseShape';
import { BaseHex, type Cell, grid, HHex, type HHexGrid, type Point, SnapTo, VHex, type VHexGrid } from '@davidsev/owlbear-utils';
import type { PathCommand } from '@owlbear-rodeo/sdk/lib/types/items/Path';
import { calculateCenter } from '../Utils/Geometry/calculateCenter';

export class ConeHexShape extends BaseShape {

    /** The current grid, narrowed to the two hex types this shape supports. */
    private get hexGrid (): VHexGrid | HHexGrid {
        const snapshot = grid.snapshot;
        if (snapshot.type !== 'HEX_VERTICAL' && snapshot.type !== 'HEX_HORIZONTAL')
            throw new Error(`Grid type "${snapshot.type}" not supported by ConeHexShape`);
        return snapshot;
    }

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
        const [q, r] = this.hexGrid.xy_to_axial(direction.x, direction.y);
        const s = -q - r;
        const abs_q = Math.abs(q);
        const abs_r = Math.abs(r);
        const abs_s = Math.abs(s);
        const max = Math.max(abs_q, abs_r, abs_s);

        if (max === abs_q)
            return q > 0 ? '+q' : '-q';
        if (max === abs_r)
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
        const [q, r] = startCell.axialCoords;

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
        const hexGrid = this.hexGrid;
        const fromAxial = (q: number, r: number): VHex | HHex =>
            hexGrid.type === 'HEX_VERTICAL' ? VHex.fromAxial(q, r, hexGrid) : HHex.fromAxial(q, r, hexGrid);
        if (direction === '+q')
            return cellCoords.map(([a, b]) => fromAxial(q + a, r + b));
        if (direction === '-q')
            return cellCoords.map(([a, b]) => fromAxial(q - a, r - b));
        if (direction === '+r')
            return cellCoords.map(([a, b]) => fromAxial(q + b, r + a));
        if (direction === '-r')
            return cellCoords.map(([a, b]) => fromAxial(q - b, r - a));
        if (direction === '+s')
            return cellCoords.map(([, b, c]) => fromAxial(q - c + 1, r + b));
        if (direction === '-s')
            return cellCoords.map(([, b, c]) => fromAxial(q + c - 1, r - b));

        return [];
    }
}
