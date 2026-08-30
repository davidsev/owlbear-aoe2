import assert from 'node:assert/strict';
import { suite, test } from 'node:test';
import { Point, SnapTo, SquareGrid } from '@davidsev/owlbear-utils';
import { ConePathfinderShape } from './ConePathfinderShape';

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

function cellKeys(shape: ConePathfinderShape): string[] {
    return shape.cells.map(cell => `${cell.center.x},${cell.center.y}`);
}

suite('ConePathfinderShape', () => {
    test('returns no cells when start and end are the same point', () => {
        const grid = makeGrid(100);
        const shape = new ConePathfinderShape(grid);
        shape.start = new Point(0, 0);
        shape.end = new Point(0, 0);
        assert.deepEqual(shape.cells, []);
    });

    test('returns no cells when the drag distance is under one grid cell', () => {
        const grid = makeGrid(100);
        const shape = new ConePathfinderShape(grid);
        shape.start = new Point(0, 0);
        shape.end = new Point(grid.dpi * 0.3, 0);
        assert.equal(shape.roundedDistance, 0);
        assert.deepEqual(shape.cells, []);
    });

    test('produces cells for a valid 15ft (3-cell) cone', () => {
        const grid = makeGrid(100);
        const shape = new ConePathfinderShape(grid);
        shape.start = new Point(0, 0);
        shape.end = new Point(3 * grid.dpi, 0);
        assert.equal(shape.roundedDistance, 3 * grid.dpi);
        assert.ok(shape.cells.length > 0, 'expected a non-empty cell set for a valid 15ft cone');
    });

    test('places the exact 15ft (7-cell) template cells for an east-facing cone', () => {
        const grid = makeGrid(100);
        const shape = new ConePathfinderShape(grid);
        shape.start = new Point(0, 0);
        shape.end = new Point(3 * grid.dpi, 0);

        const actual = cellKeys(shape).sort();
        const expected = ['150,-50', '150,150', '150,50', '250,-50', '250,150', '250,50', '50,50'].sort();
        assert.deepEqual(actual, expected);
    });

    test('places the exact 15ft (7-cell) template cells for a north-facing cone', () => {
        const grid = makeGrid(100);
        const shape = new ConePathfinderShape(grid);
        shape.start = new Point(0, 0);
        shape.end = new Point(0, -3 * grid.dpi);

        const actual = cellKeys(shape).sort();
        const expected = ['-50,-150', '-50,-50', '150,-150', '150,-50', '50,-150', '50,-50', '50,50'].sort();
        assert.deepEqual(actual, expected);
    });

    test('places the exact 15ft (6-cell) diagonal template cells for a northeast-facing cone', () => {
        const grid = makeGrid(100);
        const shape = new ConePathfinderShape(grid);
        shape.start = new Point(0, 0);
        shape.end = new Point((3 * grid.dpi * Math.SQRT2) / 2, (-3 * grid.dpi * Math.SQRT2) / 2);

        const actual = cellKeys(shape).sort();
        const expected = ['150,-150', '150,-50', '250,-50', '50,-150', '50,-250', '50,-50'].sort();
        assert.deepEqual(actual, expected);
    });

    test('a 60ft cone has strictly more cells than a 15ft cone in the same direction', () => {
        const grid = makeGrid(100);

        const shape15 = new ConePathfinderShape(grid);
        shape15.start = new Point(0, 0);
        shape15.end = new Point(3 * grid.dpi, 0);

        const shape60 = new ConePathfinderShape(grid);
        shape60.start = new Point(0, 0);
        shape60.end = new Point(12 * grid.dpi, 0);

        assert.ok(
            shape60.cells.length > shape15.cells.length,
            `expected 60ft cone (${shape60.cells.length} cells) to have more cells than 15ft cone (${shape15.cells.length} cells)`,
        );
    });

    test('returns cells with distinct centers', () => {
        const grid = makeGrid(100);
        const shape = new ConePathfinderShape(grid);
        shape.start = new Point(0, 0);
        shape.end = new Point(12 * grid.dpi, 0);

        const keys = cellKeys(shape);
        assert.equal(new Set(keys).size, keys.length, 'expected all cell centers to be distinct');
    });

    test('changing only the direction changes which cells are returned', () => {
        const grid = makeGrid(100);

        const shapeEast = new ConePathfinderShape(grid);
        shapeEast.start = new Point(0, 0);
        shapeEast.end = new Point(6 * grid.dpi, 0);

        const shapeSouth = new ConePathfinderShape(grid);
        shapeSouth.start = new Point(0, 0);
        shapeSouth.end = new Point(0, 6 * grid.dpi);

        const shapeSoutheast = new ConePathfinderShape(grid);
        shapeSoutheast.start = new Point(0, 0);
        shapeSoutheast.end = new Point(6 * grid.dpi, 6 * grid.dpi);

        // All three drags should snap to the same cone size (30ft / 6 cells under Chebyshev
        // measurement), so direction is the only thing varying between them.
        assert.equal(shapeEast.roundedDistance, 6 * grid.dpi);
        assert.equal(shapeSouth.roundedDistance, 6 * grid.dpi);
        assert.equal(shapeSoutheast.roundedDistance, 6 * grid.dpi);

        const eastKeys = [...cellKeys(shapeEast)].sort();
        const southKeys = [...cellKeys(shapeSouth)].sort();
        const southeastKeys = [...cellKeys(shapeSoutheast)].sort();

        assert.notDeepEqual(eastKeys, southKeys, 'east and south cones should not cover identical cells');
        assert.notDeepEqual(eastKeys, southeastKeys, 'east and southeast cones should not cover identical cells');
        assert.notDeepEqual(southKeys, southeastKeys, 'south and southeast cones should not cover identical cells');
    });

    test('keeps every cell center within a generous bound of the corner-snapped start', () => {
        const grid = makeGrid(100);
        const shape = new ConePathfinderShape(grid);
        shape.start = new Point(0, 0);
        shape.end = new Point(12 * grid.dpi, 0);

        const cornerStart = grid.snapTo(shape.start, SnapTo.CORNER);
        const bound = shape.roundedDistance * 1.5;

        for (const cell of shape.cells) {
            const distance = cell.center.distanceTo(cornerStart);
            assert.ok(
                distance <= bound,
                `expected cell center ${cell.center.toString()} to be within ${bound} of corner-snapped start ${cornerStart.toString()}, got ${distance}`,
            );
        }
    });

    test('snaps a raw distance near 4 cells down to the 3-cell (15ft) size', () => {
        const grid = makeGrid(100);
        const shape = new ConePathfinderShape(grid);
        shape.start = new Point(0, 0);
        shape.end = new Point(4 * grid.dpi, 0);
        assert.equal(shape.roundedDistance, 3 * grid.dpi);
    });

    test('snaps a raw distance near 7 cells up to the 6-cell (30ft) size', () => {
        const grid = makeGrid(100);
        const shape = new ConePathfinderShape(grid);
        shape.start = new Point(0, 0);
        shape.end = new Point(7 * grid.dpi, 0);
        assert.equal(shape.roundedDistance, 6 * grid.dpi);
    });

    test('snaps a raw distance near 10 cells up to the 12-cell (60ft) size', () => {
        const grid = makeGrid(100);
        const shape = new ConePathfinderShape(grid);
        shape.start = new Point(0, 0);
        shape.end = new Point(10 * grid.dpi, 0);
        assert.equal(shape.roundedDistance, 12 * grid.dpi);
    });

    test('gives a roundedDistance of 0 for a sub-one-cell drag', () => {
        const grid = makeGrid(100);
        const shape = new ConePathfinderShape(grid);
        shape.start = new Point(0, 0);
        shape.end = new Point(grid.dpi * 0.5, 0);
        assert.equal(shape.roundedDistance, 0);
    });

    test('labelPosition equals start exactly when start and end are the same point', () => {
        const grid = makeGrid(100);
        const shape = new ConePathfinderShape(grid);
        const start = new Point(50, 50);
        shape.start = start;
        shape.end = start;
        assert.ok(shape.labelPosition.equals(start));
    });

    test('labelPosition moves away from start when there is a direction', () => {
        const grid = makeGrid(100);
        const shape = new ConePathfinderShape(grid);
        shape.start = new Point(0, 0);
        shape.end = new Point(6 * grid.dpi, 0);
        assert.ok(!shape.labelPosition.equals(shape.start));
    });

    test('outline is always empty for a valid cone', () => {
        const grid = makeGrid(100);
        const shape = new ConePathfinderShape(grid);
        shape.start = new Point(0, 0);
        shape.end = new Point(3 * grid.dpi, 0);
        assert.deepEqual(shape.outline, []);
    });

    test('outline is always empty when there is no valid cone', () => {
        const grid = makeGrid(100);
        const shape = new ConePathfinderShape(grid);
        shape.start = new Point(0, 0);
        shape.end = new Point(0, 0);
        assert.deepEqual(shape.outline, []);
    });
});
