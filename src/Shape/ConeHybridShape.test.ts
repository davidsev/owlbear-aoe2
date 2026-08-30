import assert from 'node:assert/strict';
import { suite, test } from 'node:test';
import { Point, SquareGrid } from '@davidsev/owlbear-utils';
import { SquareDirection, StartPoint } from '../Metadata/room';
import { ConeHybridShape } from './ConeHybridShape';

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

function budgetFor(n: number): number {
    return (n * (n + 1)) / 2;
}

suite('ConeHybridShape', () => {
    test('exactly fills the budget of N*(N+1)/2 cells for a whole-cell-length cone', () => {
        const grid = makeGrid(100);
        const shape = new ConeHybridShape(grid, [], 1, SquareDirection.ALL);
        shape.start = new Point(0, 0);
        shape.end = new Point(300, 0);

        assert.equal(shape.roundedDistance, 300);
        const n = Math.round(shape.roundedDistance / grid.dpi);
        assert.equal(n, 3);
        assert.equal(shape.cells.length, budgetFor(n));
    });

    test('picks the specific cells closest to the centre line, nearest-row-first, for a whole-cell-length cone', () => {
        const grid = makeGrid(100);
        const shape = new ConeHybridShape(grid, [], 1, SquareDirection.ALL);
        shape.start = new Point(0, 0);
        shape.end = new Point(300, 0);

        // For a 53.1deg-wide cone of length 3 cells pointing due east, the budget is 6 cells: the two
        // cells straddling the centre line in each of the three columns, closest column first.
        const actual = shape.cells.map(cell => cell.center.toString()).sort();
        const expected = ['(150, -50)', '(150, 50)', '(250, -50)', '(250, 50)', '(50, -50)', '(50, 50)'].sort();
        assert.deepEqual(actual, expected);
    });

    test('never exceeds the N*(N+1)/2 budget across a range of lengths', () => {
        const grid = makeGrid(100);
        const shape = new ConeHybridShape(grid, [], 1, SquareDirection.ALL);
        shape.start = new Point(0, 0);

        for (const end of [new Point(100, 0), new Point(250, 0), new Point(400, 0), new Point(730, 40)]) {
            shape.end = end;
            const n = Math.round(shape.roundedDistance / grid.dpi);
            assert.ok(shape.cells.length <= budgetFor(n), `expected at most ${budgetFor(n)} cells for n=${n} (end=${end}), got ${shape.cells.length}`);
        }
    });

    test('returns no cells when start equals end', () => {
        const grid = makeGrid(100);
        const shape = new ConeHybridShape(grid, [], 1, SquareDirection.ALL);
        shape.start = new Point(50, 50);
        shape.end = new Point(50, 50);

        assert.deepEqual(shape.cells, []);
    });

    test('keeps every returned cell within a generous distance of the apex', () => {
        const grid = makeGrid(100);
        const shape = new ConeHybridShape(grid, [], 1, SquareDirection.ALL);
        shape.start = new Point(0, 0);
        shape.end = new Point(300, 0);

        assert.ok(shape.cells.length > 0);
        for (const cell of shape.cells) {
            const d = cell.center.distanceTo(shape.start);
            assert.ok(d <= shape.roundedDistance * 2, `cell at ${cell.center} is ${d} from apex, expected <= ${shape.roundedDistance * 2}`);
        }
    });

    test('does not decrease cell count as the cone gets longer (while under budget-limiting capacity)', () => {
        const grid = makeGrid(100);
        const shape = new ConeHybridShape(grid, [], 1, SquareDirection.ALL);
        shape.start = new Point(0, 0);

        const lengths = [100, 200, 300, 400, 500];
        const counts: number[] = [];
        for (const len of lengths) {
            shape.end = new Point(len, 0);
            counts.push(shape.cells.length);
        }

        for (let i = 1; i < counts.length; i++) {
            const prev = counts[i - 1] ?? 0;
            const curr = counts[i] ?? 0;
            assert.ok(
                curr >= prev,
                `expected cell count to not decrease going from length ${lengths[i - 1]} (${prev} cells) to length ${lengths[i]} (${curr} cells)`,
            );
        }
    });

    test('isValid is false when start equals end and true otherwise', () => {
        const grid = makeGrid(100);
        const shape = new ConeHybridShape(grid, [], 1, SquareDirection.ALL);

        shape.start = new Point(10, 10);
        shape.end = new Point(10, 10);
        assert.equal(shape.isValid, false);

        shape.end = new Point(210, 10);
        assert.equal(shape.isValid, true);
    });

    test('has an outline that is a closed triangle (MOVE, LINE, LINE, CLOSE), apex first', () => {
        const grid = makeGrid(100);
        const shape = new ConeHybridShape(grid, [], 1, SquareDirection.ALL);
        shape.start = new Point(0, 0);
        shape.end = new Point(300, 0);

        const [move, line1, line2, close] = shape.outline;
        assert.equal(shape.outline.length, 4);
        assert.ok(move && line1 && line2 && close);
        assert.equal(move[0], 0); // Command.MOVE
        assert.equal(line1[0], 1); // Command.LINE
        assert.equal(line2[0], 1); // Command.LINE
        assert.equal(close[0], 5); // Command.CLOSE
        assert.equal(close.length, 1);

        // Apex of the triangle (first MOVE point) should be the (unsnapped) start point.
        const [, apexX, apexY] = move as [number, number, number];
        assert.equal(apexX, shape.start.x);
        assert.equal(apexY, shape.start.y);
    });

    test('labelPosition is the centroid of the three outline points', () => {
        const grid = makeGrid(100);
        const shape = new ConeHybridShape(grid, [], 1, SquareDirection.ALL);
        shape.start = new Point(0, 0);
        shape.end = new Point(300, 0);

        const [, x0, y0] = shape.outline[0] as [number, number, number];
        const [, x1, y1] = shape.outline[1] as [number, number, number];
        const [, x2, y2] = shape.outline[2] as [number, number, number];

        const expectedX = (x0 + x1 + x2) / 3;
        const expectedY = (y0 + y1 + y2) / 3;

        assert.ok(Math.abs(shape.labelPosition.x - expectedX) < 1e-6);
        assert.ok(Math.abs(shape.labelPosition.y - expectedY) < 1e-6);
    });

    test('with startPoints: [] the apex is exactly the raw start point, unsnapped', () => {
        const grid = makeGrid(100);
        const shape = new ConeHybridShape(grid, [], 1, SquareDirection.ALL);
        shape.start = new Point(37, 63); // deliberately not on a grid corner
        shape.end = new Point(337, 63);

        const [, apexX, apexY] = shape.outline[0] as [number, number, number];
        assert.equal(apexX, 37);
        assert.equal(apexY, 63);
    });

    test('with startPoints: [CORNER] the apex may snap to the nearest grid corner', () => {
        const grid = makeGrid(100);
        const shape = new ConeHybridShape(grid, [StartPoint.CORNER], 1, SquareDirection.ALL);
        shape.start = new Point(37, 63); // deliberately not on a grid corner
        shape.end = new Point(337, 63);

        const [, apexX, apexY] = shape.outline[0] as [number, number, number];
        // Nearest corner to (37, 63) on a 100dpi grid is (0, 100).
        assert.equal(apexX, 0);
        assert.equal(apexY, 100);
    });
});
