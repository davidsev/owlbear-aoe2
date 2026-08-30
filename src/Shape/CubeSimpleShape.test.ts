import assert from 'node:assert/strict';
import { suite, test } from 'node:test';
import { Point, SquareGrid } from '@davidsev/owlbear-utils';
import { CubeSimpleShape } from './CubeSimpleShape';

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

/** Sorts (x, y) tuples for order-independent comparison. */
function sortPoints(points: { x: number; y: number }[]): [number, number][] {
    return points.map(p => [p.x, p.y] as [number, number]).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
}

suite('CubeSimpleShape', () => {
    test('rounds a fractional cell count down to the nearest whole cell', () => {
        const grid = makeGrid(100);
        const shape = new CubeSimpleShape(grid);
        shape.start = new Point(10, 10);
        // dx = 140 (1.4 cells), dy = 10 -> Chebyshev max is dx.
        shape.end = new Point(150, 20);

        assert.equal(shape.roundedDistance, 100);
        assert.equal(shape.cells.length, 1);
    });

    test('rounds a fractional cell count up to the nearest whole cell', () => {
        const grid = makeGrid(100);
        const shape = new CubeSimpleShape(grid);
        shape.start = new Point(10, 10);
        // dx = 160 (1.6 cells), dy = 10 -> Chebyshev max is dx.
        shape.end = new Point(170, 20);

        assert.equal(shape.roundedDistance, 200);
        assert.equal(shape.cells.length, 4);
    });

    test('keeps an exact whole-cell count unchanged', () => {
        const grid = makeGrid(100);
        const shape = new CubeSimpleShape(grid);
        shape.start = new Point(10, 10);
        shape.end = new Point(210, 20);

        assert.equal(shape.roundedDistance, 200);
        assert.equal(shape.cells.length, 4);
    });

    test('uses the Chebyshev (larger of dx/dy) displacement to size the cube, not dx or dy alone', () => {
        const grid = makeGrid(100);
        const shape = new CubeSimpleShape(grid);
        shape.start = new Point(10, 10);
        // dx = 50 (small), dy = 260 (2.6 cells) -> dy dominates.
        shape.end = new Point(60, 270);

        assert.equal(shape.roundedDistance, 300);
        assert.equal(shape.cells.length, 9);
    });

    test('rounds a very small drag down to zero cells and becomes invalid', () => {
        const grid = makeGrid(100);
        const shape = new CubeSimpleShape(grid);
        shape.start = new Point(10, 10);
        // dx = 30 (0.3 cells), dy = 10 -> rounds to 0.
        shape.end = new Point(40, 20);

        assert.equal(shape.roundedDistance, 0);
        assert.equal(shape.cells.length, 0);
        assert.equal(shape.isValid, false);
    });

    test('is invalid and covers zero cells when start equals end (default construction)', () => {
        const grid = makeGrid(100);
        const shape = new CubeSimpleShape(grid);

        assert.equal(shape.isValid, false);
        assert.equal(shape.cells.length, 0);
        assert.equal(shape.roundedDistance, 0);
    });

    test('is invalid and covers zero cells when start is explicitly set equal to end', () => {
        const grid = makeGrid(100);
        const shape = new CubeSimpleShape(grid);
        shape.start = new Point(35, 72);
        shape.end = new Point(35, 72);

        assert.equal(shape.isValid, false);
        assert.equal(shape.cells.length, 0);
    });

    test('is valid whenever the rounded side length is greater than zero', () => {
        const grid = makeGrid(100);
        const shape = new CubeSimpleShape(grid);
        shape.start = new Point(10, 10);
        shape.end = new Point(170, 20);

        assert.equal(shape.roundedDistance > 0, true);
        assert.equal(shape.isValid, true);
    });

    test('extends down-right from the corner nearest start when end is down-right of start', () => {
        const grid = makeGrid(100);
        const shape = new CubeSimpleShape(grid);
        // (20, 20) is inside cell (0,0)-(100,100), closer to corner (0, 0).
        shape.start = new Point(20, 20);
        // dx = +300, dy = +200 -> down-right; Chebyshev max = 300 -> 3 cells.
        shape.end = new Point(320, 220);

        assert.equal(shape.roundedDistance, 300);
        assert.equal(shape.cells.length, 9);

        const expected = [
            { x: 50, y: 50 },
            { x: 150, y: 50 },
            { x: 250, y: 50 },
            { x: 50, y: 150 },
            { x: 150, y: 150 },
            { x: 250, y: 150 },
            { x: 50, y: 250 },
            { x: 150, y: 250 },
            { x: 250, y: 250 },
        ];
        assert.deepEqual(sortPoints(shape.cells.map(c => c.center)), sortPoints(expected));

        assert.equal(shape.labelPosition.x, 150);
        assert.equal(shape.labelPosition.y, 150);
    });

    test('extends down-left from the corner nearest start when end is down-left of start', () => {
        const grid = makeGrid(100);
        const shape = new CubeSimpleShape(grid);
        // (80, 20) is inside cell (0,0)-(100,100), closer to corner (100, 0).
        shape.start = new Point(80, 20);
        // dx = -300, dy = +200 -> down-left; Chebyshev max = 300 -> 3 cells.
        shape.end = new Point(-220, 220);

        assert.equal(shape.roundedDistance, 300);
        assert.equal(shape.cells.length, 9);

        const expected = [
            { x: 50, y: 50 },
            { x: -50, y: 50 },
            { x: -150, y: 50 },
            { x: 50, y: 150 },
            { x: -50, y: 150 },
            { x: -150, y: 150 },
            { x: 50, y: 250 },
            { x: -50, y: 250 },
            { x: -150, y: 250 },
        ];
        assert.deepEqual(sortPoints(shape.cells.map(c => c.center)), sortPoints(expected));

        assert.equal(shape.labelPosition.x, -50);
        assert.equal(shape.labelPosition.y, 150);
    });

    test('extends up-right from the corner nearest start when end is up-right of start', () => {
        const grid = makeGrid(100);
        const shape = new CubeSimpleShape(grid);
        // (20, 80) is inside cell (0,0)-(100,100), closer to corner (0, 100).
        shape.start = new Point(20, 80);
        // dx = +300, dy = -200 -> up-right; Chebyshev max = 300 -> 3 cells.
        shape.end = new Point(320, -120);

        assert.equal(shape.roundedDistance, 300);
        assert.equal(shape.cells.length, 9);

        const expected = [
            { x: 50, y: 50 },
            { x: 150, y: 50 },
            { x: 250, y: 50 },
            { x: 50, y: -50 },
            { x: 150, y: -50 },
            { x: 250, y: -50 },
            { x: 50, y: -150 },
            { x: 150, y: -150 },
            { x: 250, y: -150 },
        ];
        assert.deepEqual(sortPoints(shape.cells.map(c => c.center)), sortPoints(expected));

        assert.equal(shape.labelPosition.x, 150);
        assert.equal(shape.labelPosition.y, -50);
    });

    test('extends up-left from the corner nearest start when end is up-left of start', () => {
        const grid = makeGrid(100);
        const shape = new CubeSimpleShape(grid);
        // (80, 80) is inside cell (0,0)-(100,100), closer to corner (100, 100).
        shape.start = new Point(80, 80);
        // dx = -300, dy = -200 -> up-left; Chebyshev max = 300 -> 3 cells.
        shape.end = new Point(-220, -120);

        assert.equal(shape.roundedDistance, 300);
        assert.equal(shape.cells.length, 9);

        const expected = [
            { x: 50, y: 50 },
            { x: -50, y: 50 },
            { x: -150, y: 50 },
            { x: 50, y: -50 },
            { x: -50, y: -50 },
            { x: -150, y: -50 },
            { x: 50, y: -150 },
            { x: -50, y: -150 },
            { x: -150, y: -150 },
        ];
        assert.deepEqual(sortPoints(shape.cells.map(c => c.center)), sortPoints(expected));

        assert.equal(shape.labelPosition.x, -50);
        assert.equal(shape.labelPosition.y, -50);
    });

    test('extends into a full square (not a duplicated line) when the drag is perfectly vertical', () => {
        const grid = makeGrid(100);
        const shape = new CubeSimpleShape(grid);
        // (20, 20) is inside cell (0,0)-(100,100), closer to corner (0, 0).
        shape.start = new Point(20, 20);
        // dx = 0, dy = +300 -> Chebyshev max = 300 -> 3 cells.
        shape.end = new Point(20, 320);

        assert.equal(shape.roundedDistance, 300);

        const expected = [
            { x: 50, y: 50 },
            { x: 150, y: 50 },
            { x: 250, y: 50 },
            { x: 50, y: 150 },
            { x: 150, y: 150 },
            { x: 250, y: 150 },
            { x: 50, y: 250 },
            { x: 150, y: 250 },
            { x: 250, y: 250 },
        ];
        assert.deepEqual(sortPoints(shape.cells.map(c => c.center)), sortPoints(expected));
        assert.equal(shape.cells.length, 9);
    });

    test('extends into a full square (not a duplicated line) when the drag is perfectly horizontal', () => {
        const grid = makeGrid(100);
        const shape = new CubeSimpleShape(grid);
        // (20, 20) is inside cell (0,0)-(100,100), closer to corner (0, 0).
        shape.start = new Point(20, 20);
        // dx = +300, dy = 0 -> Chebyshev max = 300 -> 3 cells.
        shape.end = new Point(320, 20);

        assert.equal(shape.roundedDistance, 300);

        const expected = [
            { x: 50, y: 50 },
            { x: 150, y: 50 },
            { x: 250, y: 50 },
            { x: 50, y: 150 },
            { x: 150, y: 150 },
            { x: 250, y: 150 },
            { x: 50, y: 250 },
            { x: 150, y: 250 },
            { x: 250, y: 250 },
        ];
        assert.deepEqual(sortPoints(shape.cells.map(c => c.center)), sortPoints(expected));
        assert.equal(shape.cells.length, 9);
    });

    test('scales correctly to a different grid dpi', () => {
        const grid = makeGrid(40);
        const shape = new CubeSimpleShape(grid);
        // (5, 5) is inside cell (0,0)-(40,40), closer to corner (0, 0).
        shape.start = new Point(5, 5);
        // dx = 75 (1.875 cells -> rounds to 2), dy = 5 -> Chebyshev max = dx.
        shape.end = new Point(80, 10);

        assert.equal(shape.roundedDistance, 80);
        assert.equal(shape.cells.length, 4);

        const expected = [
            { x: 20, y: 20 },
            { x: 60, y: 20 },
            { x: 20, y: 60 },
            { x: 60, y: 60 },
        ];
        assert.deepEqual(sortPoints(shape.cells.map(c => c.center)), sortPoints(expected));
    });

    test('recomputes cells consistently after start is reassigned to an equal-valued Point (cache invalidation)', () => {
        const grid = makeGrid(100);
        const shape = new CubeSimpleShape(grid);
        shape.start = new Point(20, 20);
        shape.end = new Point(320, 220);

        const before = sortPoints(shape.cells.map(c => c.center));

        // Reassign start to a new Point object with the same x/y - this clears the memoization
        // cache but should not change the computed result.
        shape.start = new Point(shape.start.x, shape.start.y);

        const after = sortPoints(shape.cells.map(c => c.center));
        assert.deepEqual(after, before);
        assert.equal(shape.roundedDistance, 300);
    });

    test('places labelPosition at the midpoint between the two opposite corners of the cube', () => {
        const grid = makeGrid(100);
        const shape = new CubeSimpleShape(grid);
        shape.start = new Point(20, 20);
        shape.end = new Point(320, 220);

        // Near corner (0, 0), far corner (300, 300) -> midpoint (150, 150).
        assert.equal(shape.labelPosition.x, 150);
        assert.equal(shape.labelPosition.y, 150);
    });

    test('produces an outline array without throwing', () => {
        const grid = makeGrid(100);
        const shape = new CubeSimpleShape(grid);
        shape.start = new Point(20, 20);
        shape.end = new Point(320, 220);

        assert.doesNotThrow(() => shape.outline);
        assert.ok(Array.isArray(shape.outline));
    });

    test('produces an empty-safe outline for the degenerate (zero-cell) case without throwing', () => {
        const grid = makeGrid(100);
        const shape = new CubeSimpleShape(grid);

        assert.doesNotThrow(() => shape.outline);
        assert.ok(Array.isArray(shape.outline));
    });
});
