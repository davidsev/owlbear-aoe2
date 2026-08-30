import assert from 'node:assert/strict';
import { suite, test } from 'node:test';
import { Point, SnapTo, SquareGrid } from '@davidsev/owlbear-utils';
import { Command, type PathCommand } from '@owlbear-rodeo/sdk';
import { getDirection8 } from '../Utils/Geometry/getDirection';
import { ConeTokenShape } from './ConeTokenShape';

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

/** Builds an end point `N` whole cells away from `start`, in the given compass direction. */
function endPointFor(start: Point, dpi: number, n: number, direction: 'east' | 'north' | 'northeast'): Point {
    const distance = n * dpi;
    switch (direction) {
        case 'east':
            return start.add(new Point(distance, 0));
        case 'north':
            return start.add(new Point(0, -distance));
        case 'northeast': {
            const component = distance * (Math.SQRT2 / 2);
            return start.add(new Point(component, -component));
        }
    }
}

suite('ConeTokenShape', () => {
    suite('roundedDistance', () => {
        test('rounds a distance down to the nearest whole cell', () => {
            const grid = makeGrid(100);
            const shape = new ConeTokenShape(grid);
            shape.start = new Point(0, 0);
            shape.end = new Point(140, 0);

            // 140 / 100 = 1.4 -> rounds down to 1 cell.
            assert.equal(shape.roundedDistance, 100);
        });

        test('rounds a distance up to the nearest whole cell', () => {
            const grid = makeGrid(100);
            const shape = new ConeTokenShape(grid);
            shape.start = new Point(0, 0);
            shape.end = new Point(160, 0);

            // 160 / 100 = 1.6 -> rounds up to 2 cells.
            assert.equal(shape.roundedDistance, 200);
        });

        test('leaves an exact whole-cell distance unchanged', () => {
            const grid = makeGrid(100);
            const shape = new ConeTokenShape(grid);
            shape.start = new Point(0, 0);
            shape.end = new Point(200, 0);

            assert.equal(shape.roundedDistance, 200);
        });

        test('rounds correctly for a non-round dpi', () => {
            const grid = makeGrid(70);
            const shape = new ConeTokenShape(grid);
            shape.start = new Point(0, 0);
            shape.end = new Point(100, 0);

            // 100 / 70 = 1.43 -> rounds down to 1 cell (70).
            assert.equal(shape.roundedDistance, 70);
        });
    });

    suite('outline', () => {
        test('is always a closed 4-command triangle whose apex is the corner-snapped start', () => {
            const grid = makeGrid(100);
            const shape = new ConeTokenShape(grid);
            shape.start = new Point(37, 52);
            shape.end = new Point(237, 52);

            const outline = shape.outline;
            assert.equal(outline.length, 4);
            const [move, line1, line2, close] = outline as [
                [Command.MOVE, number, number],
                [Command.LINE, number, number],
                [Command.LINE, number, number],
                [Command.CLOSE],
            ];
            assert.equal(move[0], Command.MOVE);
            assert.equal(line1[0], Command.LINE);
            assert.equal(line2[0], Command.LINE);
            assert.deepEqual(close, [Command.CLOSE]);

            const expectedApex = grid.snapTo(shape.start, SnapTo.CORNER);
            assert.equal(move[1], expectedApex.x);
            assert.equal(move[2], expectedApex.y);
        });

        test('recomputes the apex when start moves to a different grid corner', () => {
            const grid = makeGrid(100);
            const shape = new ConeTokenShape(grid);
            shape.start = new Point(370, 520);
            shape.end = new Point(600, 520);

            const outline = shape.outline;
            const [move] = outline as [[Command.MOVE, number, number], ...PathCommand[]];
            const expectedApex = grid.snapTo(shape.start, SnapTo.CORNER);
            assert.equal(move[1], expectedApex.x);
            assert.equal(move[2], expectedApex.y);
        });
    });

    suite('labelPosition', () => {
        test('is the average of the outline triangle points', () => {
            const grid = makeGrid(100);
            const shape = new ConeTokenShape(grid);
            shape.start = new Point(0, 0);
            shape.end = new Point(300, -100);

            const outline = shape.outline;
            const [, x1, y1] = outline[0] as [Command.MOVE, number, number];
            const [, x2, y2] = outline[1] as [Command.LINE, number, number];
            const [, x3, y3] = outline[2] as [Command.LINE, number, number];

            const expectedX = (x1 + x2 + x3) / 3;
            const expectedY = (y1 + y2 + y3) / 3;

            assert.equal(shape.labelPosition.x, expectedX);
            assert.equal(shape.labelPosition.y, expectedY);
        });
    });

    suite('cells', () => {
        test('is empty when start equals end', () => {
            const grid = makeGrid(100);
            const shape = new ConeTokenShape(grid);
            shape.start = new Point(50, 50);
            shape.end = new Point(50, 50);

            assert.deepEqual(shape.cells, []);
        });

        test('is empty for a sub-half-cell drag', () => {
            const grid = makeGrid(100);
            const shape = new ConeTokenShape(grid);
            shape.start = new Point(0, 0);
            shape.end = new Point(40, 0);

            assert.equal(shape.roundedDistance, 0);
            assert.deepEqual(shape.cells, []);
        });

        // Exact expected cell centers for each direction/N, pinned down from the documented placement
        // rule: row `i` (0-indexed, nearest the apex first) keeps the `i+1` cells whose triangle
        // coverage/centre-line-distance score is best, with ties (equal coverage) broken in favour of
        // the cell encountered first when sweeping the row from the "start" side outwards.
        const expectedCells: Record<'east' | 'north' | 'northeast', Record<1 | 2 | 3, string[]>> = {
            east: {
                1: ['(50, -50)'],
                2: ['(50, -50)', '(150, 50)', '(150, -50)'],
                3: ['(50, -50)', '(150, 50)', '(150, -50)', '(250, 50)', '(250, -50)', '(250, -150)'],
            },
            north: {
                1: ['(-50, -50)'],
                2: ['(-50, -50)', '(-50, -150)', '(50, -150)'],
                3: ['(-50, -50)', '(-50, -150)', '(50, -150)', '(50, -250)', '(-50, -250)', '(-150, -250)'],
            },
            northeast: {
                1: ['(50, -50)'],
                2: ['(150, -50)', '(50, -150)', '(50, -50)'],
                3: ['(250, -150)', '(150, -150)', '(150, -250)', '(50, -50)', '(50, -150)', '(50, -250)'],
            },
        };

        for (const direction of ['east', 'north', 'northeast'] as const) {
            for (const n of [1, 2, 3] as const) {
                test(`covers ${(n * (n + 1)) / 2} distinct cells for N=${n} drawn due ${direction}`, () => {
                    const grid = makeGrid(100);
                    const shape = new ConeTokenShape(grid);
                    const start = new Point(0, 0);
                    shape.start = start;
                    shape.end = endPointFor(start, 100, n, direction);

                    assert.equal(shape.roundedDistance, n * 100);

                    const expectedCount = (n * (n + 1)) / 2;
                    assert.equal(shape.cells.length, expectedCount);

                    // All cells are distinct.
                    const centers = new Set(shape.cells.map(cell => cell.center.toString()));
                    assert.equal(centers.size, expectedCount);

                    // The exact set of cells chosen, not just their count.
                    const actual = [...centers].sort();
                    const expected = [...expectedCells[direction][n]].sort();
                    assert.deepEqual(actual, expected, `expected cells ${expected.join(', ')} for ${direction} N=${n}, got ${actual.join(', ')}`);

                    // Every cell lies roughly ahead of the corner-snapped apex, in the direction of the drag.
                    const apex = grid.snapTo(shape.start, SnapTo.CORNER);
                    const dragVector = shape.end.sub(shape.start);
                    const dir = getDirection8(dragVector);
                    assert.ok(dir !== null);

                    for (const cell of shape.cells) {
                        const fromApex = cell.center.sub(apex);
                        const dot = fromApex.x * dragVector.x + fromApex.y * dragVector.y;
                        assert.ok(dot >= -1e-6, `expected cell ${cell.center} to lie ahead of apex ${apex} for drag ${dragVector}, got dot=${dot}`);
                    }
                });
            }
        }

        test('produces the expected triangular-number cell counts for a non-round dpi', () => {
            const grid = makeGrid(60);
            const shape = new ConeTokenShape(grid);
            const start = new Point(0, 0);
            shape.start = start;

            for (const n of [1, 2]) {
                shape.end = endPointFor(start, 60, n, 'east');
                assert.equal(shape.roundedDistance, n * 60);
                assert.equal(shape.cells.length, (n * (n + 1)) / 2);
            }
        });
    });
});
