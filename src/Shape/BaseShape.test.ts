import assert from 'node:assert/strict';
import { suite, test } from 'node:test';
import { type Cell, Point, SquareGrid } from '@davidsev/owlbear-utils';
import type { GridScale } from '@owlbear-rodeo/sdk';
import { Command, type PathCommand } from '@owlbear-rodeo/sdk/lib/types/items/Path';
import { BaseShape, cached } from './BaseShape';

const DEFAULT_GRID_SCALE: GridScale = { raw: '5ft', parsed: { multiplier: 5, unit: 'ft', digits: 0 } };

function makeGrid(dpi: number, gridScale: GridScale = DEFAULT_GRID_SCALE): SquareGrid {
    return new SquareGrid(
        {
            type: 'SQUARE',
            dpi,
            style: { lineType: 'SOLID', lineOpacity: 1, lineColor: 'DARK', lineWidth: 1 },
            measurement: 'CHEBYSHEV',
            scale: gridScale.raw,
        },
        gridScale,
    );
}

// Minimal concrete subclass so we can exercise the abstract base directly. Each abstract getter
// increments its own call counter so tests can prove (or disprove) memoization unambiguously,
// without relying on assumptions about whether grid.getCell() etc return fresh objects.
class TestShape extends BaseShape<SquareGrid> {
    public cellsCallCount = 0;
    public labelPositionCallCount = 0;
    public cellsToReturn: Cell[] = [];

    get cells(): Cell[] {
        this.cellsCallCount++;
        return this.cellsToReturn;
    }

    get labelPosition(): Point {
        this.labelPositionCallCount++;
        return this.start;
    }

    get outline(): PathCommand[] {
        return [];
    }
}

// Extends TestShape purely to add our own @cached() getters with explicit counters, to test the
// decorator's memoization/invalidation behaviour in isolation.
class CountingCachedShape extends TestShape {
    public counterCallCount = 0;
    public otherCounterCallCount = 0;

    @cached()
    get counter(): number {
        this.counterCallCount++;
        return this.counterCallCount;
    }

    @cached()
    get otherCounter(): number {
        this.otherCounterCallCount++;
        return this.otherCounterCallCount * 100;
    }
}

suite('BaseShape', () => {
    suite('constructor / defaults', () => {
        test('exposes the grid it was constructed with, and start/end default to (0,0)', () => {
            const grid = makeGrid(100);
            const shape = new TestShape(grid);
            assert.equal(shape.grid, grid);
            assert.equal(shape.start.x, 0);
            assert.equal(shape.start.y, 0);
            assert.equal(shape.end.x, 0);
            assert.equal(shape.end.y, 0);
        });
    });

    suite('distance', () => {
        test('computes the Euclidean distance for a 3-4-5 triangle', () => {
            const grid = makeGrid(100);
            const shape = new TestShape(grid);
            shape.start = new Point(0, 0);
            shape.end = new Point(3, 4);
            assert.equal(shape.distance, 5);
        });

        test('is zero when start and end are the same point', () => {
            const grid = makeGrid(100);
            const shape = new TestShape(grid);
            shape.start = new Point(10, 10);
            shape.end = new Point(10, 10);
            assert.equal(shape.distance, 0);
        });

        test('computes distance for a larger diagonal drag', () => {
            const grid = makeGrid(50);
            const shape = new TestShape(grid);
            shape.start = new Point(0, 0);
            shape.end = new Point(150, 200);
            assert.equal(shape.distance, 250);
        });

        test('recomputes (rather than staying stuck on a stale cached value) after start/end are reassigned', () => {
            const grid = makeGrid(100);
            const shape = new TestShape(grid);
            shape.start = new Point(0, 0);
            shape.end = new Point(200, 0);
            assert.equal(shape.distance, 200);
            assert.equal(shape.labelText, '10ft');

            shape.end = new Point(400, 0);
            assert.equal(shape.distance, 400);
            assert.equal(shape.labelText, '20ft');

            shape.start = new Point(100, 0);
            assert.equal(shape.distance, 300);
            assert.equal(shape.labelText, '15ft');
        });
    });

    suite('roundedDistance (base default implementation)', () => {
        test('rounds down to the nearest multiple of dpi', () => {
            const grid = makeGrid(100);
            const shape = new TestShape(grid);
            shape.start = new Point(0, 0);
            shape.end = new Point(149, 0);
            assert.equal(shape.roundedDistance, 100);
        });

        test('rounds up to the nearest multiple of dpi', () => {
            const grid = makeGrid(100);
            const shape = new TestShape(grid);
            shape.start = new Point(0, 0);
            shape.end = new Point(151, 0);
            assert.equal(shape.roundedDistance, 200);
        });

        test('leaves an exact multiple of dpi unchanged', () => {
            const grid = makeGrid(100);
            const shape = new TestShape(grid);
            shape.start = new Point(0, 0);
            shape.end = new Point(200, 0);
            assert.equal(shape.roundedDistance, 200);
        });
    });

    suite('isValid', () => {
        test('is false when start and end are the same point (zero distance)', () => {
            const grid = makeGrid(100);
            const shape = new TestShape(grid);
            shape.start = new Point(50, 50);
            shape.end = new Point(50, 50);
            assert.equal(shape.isValid, false);
        });

        test('is true for a decent-sized drag', () => {
            const grid = makeGrid(100);
            const shape = new TestShape(grid);
            shape.start = new Point(0, 0);
            shape.end = new Point(300, 400);
            assert.equal(shape.isValid, true);
        });

        test('is false when distance is nonzero but rounds down to zero (discriminates from a naive distance > 0 check)', () => {
            const grid = makeGrid(100);
            const shape = new TestShape(grid);
            shape.start = new Point(0, 0);
            shape.end = new Point(30, 0); // distance 30, roundedDistance rounds to 0
            assert.equal(shape.roundedDistance, 0);
            assert.equal(shape.isValid, false);
        });
    });

    suite('startCell / endCell', () => {
        test('startCell matches grid.getCell(start)', () => {
            const grid = makeGrid(100);
            const shape = new TestShape(grid);
            shape.start = new Point(120, 30);
            shape.end = new Point(500, 500);
            assert.equal(shape.startCell.toString(), grid.getCell(new Point(120, 30)).toString());
        });

        test('endCell matches grid.getCell(end)', () => {
            const grid = makeGrid(100);
            const shape = new TestShape(grid);
            shape.start = new Point(0, 0);
            shape.end = new Point(220, 340);
            assert.equal(shape.endCell.toString(), grid.getCell(new Point(220, 340)).toString());
        });

        test('startCell returns the same object reference on repeated reads (memoized)', () => {
            const grid = makeGrid(100);
            // Sanity guard: confirm grid.getCell() itself returns a fresh object per call, so that
            // the identity assertion below is actually discriminating and not vacuously true.
            const p = new Point(10, 10);
            assert.notEqual(grid.getCell(p), grid.getCell(p));

            const shape = new TestShape(grid);
            shape.start = new Point(10, 10);
            shape.end = new Point(200, 200);
            assert.equal(shape.startCell, shape.startCell);
        });

        test('endCell returns the same object reference on repeated reads (memoized)', () => {
            const grid = makeGrid(100);
            const shape = new TestShape(grid);
            shape.start = new Point(10, 10);
            shape.end = new Point(200, 200);
            assert.equal(shape.endCell, shape.endCell);
        });

        test('startCell and endCell recompute after start/end are reassigned', () => {
            const grid = makeGrid(100);
            const shape = new TestShape(grid);
            shape.start = new Point(10, 10);
            shape.end = new Point(210, 210);
            const firstStartCell = shape.startCell;
            const firstEndCell = shape.endCell;

            shape.start = new Point(310, 310);
            shape.end = new Point(410, 410);

            assert.equal(shape.startCell.toString(), grid.getCell(new Point(310, 310)).toString());
            assert.equal(shape.endCell.toString(), grid.getCell(new Point(410, 410)).toString());
            assert.notEqual(shape.startCell.toString(), firstStartCell.toString());
            assert.notEqual(shape.endCell.toString(), firstEndCell.toString());
        });
    });

    suite('labelText', () => {
        test('formats as (roundedDistance/dpi)*multiplier + unit, e.g. dpi=100, distance=200 -> "10ft"', () => {
            const grid = makeGrid(100);
            const shape = new TestShape(grid);
            shape.start = new Point(0, 0);
            shape.end = new Point(200, 0);
            assert.equal(shape.labelText, '10ft');
        });

        test('formats correctly for a different dpi/roundedDistance combination', () => {
            const grid = makeGrid(50);
            const shape = new TestShape(grid);
            shape.start = new Point(0, 0);
            shape.end = new Point(150, 0); // exact multiple of dpi=50, roundedDistance = 150
            // (150 / 50) * 5 = 15
            assert.equal(shape.labelText, '15ft');
        });

        test('reads the multiplier and unit from grid.gridScale rather than a fixed "5ft"', () => {
            const grid = makeGrid(100, { raw: '10m', parsed: { multiplier: 10, unit: 'm', digits: 0 } });
            const shape = new TestShape(grid);
            shape.start = new Point(0, 0);
            shape.end = new Point(200, 0); // roundedDistance = 200
            // (200 / 100) * 10 = 20
            assert.equal(shape.labelText, '20m');
        });
    });

    suite('areaPath', () => {
        test('is empty when cells is empty', () => {
            const grid = makeGrid(100);
            const shape = new TestShape(grid);
            shape.start = new Point(0, 0);
            shape.end = new Point(200, 0);
            shape.cellsToReturn = [];
            assert.deepEqual(shape.areaPath, []);
        });

        test('traces the outline of this.cells via CellOutliner (discriminates from ignoring cells, using only cells[0], or reimplementing outlining)', () => {
            const grid = makeGrid(100);
            const shape = new TestShape(grid);
            shape.start = new Point(0, 0);
            shape.end = new Point(200, 0);
            // Two horizontally-adjacent cells -> a single outer rectangle from (0,0) to (200,100).
            shape.cellsToReturn = [grid.getCell(new Point(50, 50)), grid.getCell(new Point(150, 50))];

            const path = shape.areaPath;
            assert.equal(path[0]?.[0], Command.MOVE);
            assert.equal(path[path.length - 1]?.[0], Command.CLOSE);
            for (let i = 1; i < path.length - 1; i++) assert.equal(path[i]?.[0], Command.LINE);

            const points = path
                .filter((c): c is [Command.MOVE | Command.LINE, number, number] => c[0] === Command.MOVE || c[0] === Command.LINE)
                .map(([, x, y]) => new Point(x, y));
            assert.equal(Math.min(...points.map(p => p.x)), 0);
            assert.equal(Math.max(...points.map(p => p.x)), 200);
            assert.equal(Math.min(...points.map(p => p.y)), 0);
            assert.equal(Math.max(...points.map(p => p.y)), 100);
        });

        test('memoizes: does not recompute cells on repeated areaPath reads, but does after start is reassigned', () => {
            const grid = makeGrid(100);
            const shape = new TestShape(grid);
            shape.start = new Point(0, 0);
            shape.end = new Point(200, 0);

            void shape.areaPath;
            void shape.areaPath;
            assert.equal(shape.cellsCallCount, 1);

            shape.start = new Point(0, 0); // new Point object, same x/y - still a fresh assignment
            void shape.areaPath;
            assert.equal(shape.cellsCallCount, 2);
        });
    });

    suite('cached() decorator', () => {
        test('memoizes the getter value until start is reassigned, even to an equal-valued new Point', () => {
            const grid = makeGrid(100);
            const shape = new CountingCachedShape(grid);
            shape.start = new Point(0, 0);
            shape.end = new Point(100, 0);

            const first = shape.counter;
            const second = shape.counter;
            assert.equal(shape.counterCallCount, 1);
            assert.equal(first, second);

            shape.start = new Point(0, 0); // new object, same x/y
            const third = shape.counter;
            assert.equal(shape.counterCallCount, 2);
            assert.equal(third, 2);
        });

        test('memoizes the getter value until end is reassigned, even to an equal-valued new Point', () => {
            const grid = makeGrid(100);
            const shape = new CountingCachedShape(grid);
            shape.start = new Point(0, 0);
            shape.end = new Point(100, 0);

            void shape.counter; // prime the cache
            assert.equal(shape.counterCallCount, 1);

            shape.end = new Point(100, 0); // new object, same x/y
            void shape.counter;
            assert.equal(shape.counterCallCount, 2);
        });

        test('caches independently per instance', () => {
            const grid = makeGrid(100);
            const shapeA = new CountingCachedShape(grid);
            const shapeB = new CountingCachedShape(grid);
            shapeA.start = new Point(0, 0);
            shapeA.end = new Point(100, 0);
            shapeB.start = new Point(0, 0);
            shapeB.end = new Point(100, 0);

            void shapeA.counter;
            void shapeA.counter;
            assert.equal(shapeA.counterCallCount, 1);
            assert.equal(shapeB.counterCallCount, 0);

            void shapeB.counter;
            assert.equal(shapeB.counterCallCount, 1);
        });

        test('keeps two different cached getters on the same instance independent, regardless of read order', () => {
            const grid = makeGrid(100);
            const shape = new CountingCachedShape(grid);
            shape.start = new Point(0, 0);
            shape.end = new Point(100, 0);

            void shape.otherCounter;
            void shape.counter;
            void shape.counter;
            void shape.otherCounter;

            assert.equal(shape.counterCallCount, 1);
            assert.equal(shape.otherCounterCallCount, 1);

            shape.start = new Point(50, 50);
            void shape.counter;
            assert.equal(shape.counterCallCount, 2);
            assert.equal(shape.otherCounterCallCount, 1); // untouched until read again

            void shape.otherCounter;
            assert.equal(shape.otherCounterCallCount, 2);
        });
    });
});
