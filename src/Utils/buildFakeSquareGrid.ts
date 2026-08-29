import { type BaseAxonometricGrid, SquareGrid } from '@davidsev/owlbear-utils';

/**
 * Build a square grid with the same dpi and scale as the given axonometric grid.
 *
 * In "grid space" (xy_to_uv scaled up by dpi) each axonometric cell is an axis-aligned dpi-sized
 * square, and cell centers / corners land exactly on this grid's centers / corners.  That lets the
 * square-grid shapes run unchanged in grid space, with AxonometricShapeAdapter mapping in and out.
 */
export function buildFakeSquareGrid(grid: BaseAxonometricGrid): SquareGrid {
    return new SquareGrid(
        {
            type: 'SQUARE',
            dpi: grid.dpi,
            style: grid.style,
            measurement: grid.measurement,
            scale: grid.scale,
        },
        grid.gridScale,
    );
}
