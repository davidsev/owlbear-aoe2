import assert from 'node:assert/strict';
import { suite, test } from 'node:test';
import { SquareGrid } from '@davidsev/owlbear-utils';
import { Square } from './Square';
import { Triangle } from './Triangle';

function makeGrid(dpi: number): SquareGrid {
    return new SquareGrid(
        {
            type: 'SQUARE',
            dpi,
            style: { lineType: 'SOLID', lineOpacity: 1, lineColor: 'DARK', lineWidth: 1 },
            measurement: 'CHEBYSHEV',
            scale: '5ft',
        },
        { raw: '5ft', parsed: { multiplier: 5, unit: 'ft', digits: 0 } },
    );
}

suite('Polygon.intersectsCellPercentage', () => {
    const grid = makeGrid(100);
    // The cell centered on the grid's origin cell, spanning (0,0) to (100,100).
    const cell = grid.getCell({ x: 50, y: 50 });

    test('is 100% when the polygon fully covers the cell', () => {
        const polygon = new Square({ x: -50, y: -50 }, { x: 150, y: 150 });
        assert.equal(polygon.intersectsCellPercentage(cell), 100);
    });

    test('is 0% when the polygon does not touch the cell', () => {
        const polygon = new Square({ x: 500, y: 500 }, { x: 600, y: 600 });
        assert.equal(polygon.intersectsCellPercentage(cell), 0);
    });

    test('is ~50% when the polygon covers exactly half the cell', () => {
        // A same-size square shifted half a cell-width to the right overlaps exactly half the cell.
        const polygon = new Square({ x: 50, y: 0 }, { x: 150, y: 100 });
        assert.ok(Math.abs(polygon.intersectsCellPercentage(cell) - 50) < 1e-6);
    });

    test('is ~25% when the polygon covers a corner quadrant of the cell', () => {
        const polygon = new Square({ x: 0, y: 0 }, { x: 50, y: 50 });
        assert.ok(Math.abs(polygon.intersectsCellPercentage(cell) - 25) < 1e-6);
    });

    test('is ~50% when a diagonal cut leaves only one cell corner inside the polygon', () => {
        // This huge triangle clips the cell along the x+y=100 line, so only the (0,0)
        // corner of the cell is inside it, but the covered area is half the cell -
        // a plain "count contained corners / 4" approximation would say 25% here.
        const polygon = new Triangle({ x: 0, y: 100 }, { x: 100, y: 0 }, { x: -1000, y: -1000 });
        assert.ok(Math.abs(polygon.intersectsCellPercentage(cell) - 50) < 1e-6);
    });

    test('is ~50% when the polygon covers the cell but contains none of its corners', () => {
        // A diamond inscribed in the cell (vertices on the midpoints of its edges) covers
        // half the cell's area, but none of the cell's own corners are inside it - a plain
        // "count contained corners / 4" approximation would say 0% here.
        const polygon = new Square({ x: 50, y: 0 }, { x: 50, y: 100 });
        assert.ok(Math.abs(polygon.intersectsCellPercentage(cell) - 50) < 1e-6);
    });
});
