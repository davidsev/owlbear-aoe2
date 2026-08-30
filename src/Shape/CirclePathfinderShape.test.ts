import assert from 'node:assert/strict';
import { suite, test } from 'node:test';
import { Command } from '@owlbear-rodeo/sdk';
import { type Cell, Point, SnapTo, SquareGrid } from '@davidsev/owlbear-utils';
import { CirclePathfinderShape } from './CirclePathfinderShape';

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

function expectedRoundedDistance(grid: SquareGrid, start: Point, end: Point): number {
    const roundedStart = grid.snapTo(start, SnapTo.CORNER);
    const alternatingGrid = grid.withMeasurement('ALTERNATING');
    return Math.round(alternatingGrid.measure(roundedStart, end)) * grid.dpi;
}

/** Every cell overlapping a Chebyshev-square region big enough to be a guaranteed superset of any
 *  circle of the given radius (alternating distance is always >= Chebyshev distance, so the true
 *  "included" set can never reach further than this square). */
function candidateCellsAround(grid: SquareGrid, center: Point, radius: number): Cell[] {
    const half = radius + grid.dpi;
    const corners = [
        grid.getCell(new Point(center.x - half, center.y - half)),
        grid.getCell(new Point(center.x + half, center.y - half)),
        grid.getCell(new Point(center.x - half, center.y + half)),
        grid.getCell(new Point(center.x + half, center.y + half)),
    ];
    return grid.iterateCellsBoundingPoints(corners);
}

function shouldBeIncluded(grid: SquareGrid, center: Point, radius: number, cell: Cell): boolean {
    const alternatingGrid = grid.withMeasurement('ALTERNATING');
    const dists = cell.corners.map(c => alternatingGrid.measure(center, c));
    return Math.max(...dists) * grid.dpi <= radius + 1e-6;
}

function cellKey(cell: Cell): string {
    return `${Math.round(cell.center.x)},${Math.round(cell.center.y)}`;
}

suite('CirclePathfinderShape', () => {
    suite('roundedDistance', () => {
        test('matches the independently-computed alternating-measurement radius (straight line)', () => {
            const grid = makeGrid(100);
            const shape = new CirclePathfinderShape(grid);
            shape.start = new Point(0, 0);
            shape.end = new Point(500, 0);
            assert.equal(shape.roundedDistance, expectedRoundedDistance(grid, shape.start, shape.end));
        });

        test('matches the independently-computed alternating-measurement radius (diagonal line)', () => {
            const grid = makeGrid(100);
            const shape = new CirclePathfinderShape(grid);
            shape.start = new Point(0, 0);
            shape.end = new Point(330, 270);
            assert.equal(shape.roundedDistance, expectedRoundedDistance(grid, shape.start, shape.end));
        });

        test('matches the independently-computed alternating-measurement radius (off-corner start)', () => {
            const grid = makeGrid(100);
            const shape = new CirclePathfinderShape(grid);
            shape.start = new Point(53, 78);
            shape.end = new Point(500, 500);
            assert.equal(shape.roundedDistance, expectedRoundedDistance(grid, shape.start, shape.end));
        });

        test('matches the independently-computed alternating-measurement radius at a different dpi', () => {
            const grid = makeGrid(130);
            const shape = new CirclePathfinderShape(grid);
            shape.start = new Point(12, -34);
            shape.end = new Point(410, 260);
            assert.equal(shape.roundedDistance, expectedRoundedDistance(grid, shape.start, shape.end));
        });

        test('matches the independently-computed alternating-measurement radius at a small dpi', () => {
            const grid = makeGrid(37);
            const shape = new CirclePathfinderShape(grid);
            shape.start = new Point(5, 5);
            shape.end = new Point(150, 90);
            assert.equal(shape.roundedDistance, expectedRoundedDistance(grid, shape.start, shape.end));
        });
    });

    suite('labelPosition', () => {
        test('equals the corner-snapped start point when start is not already on a corner (dpi=100)', () => {
            const grid = makeGrid(100);
            const shape = new CirclePathfinderShape(grid);
            shape.start = new Point(53, 78);
            shape.end = new Point(500, 500);
            const expected = grid.snapTo(shape.start, SnapTo.CORNER);
            assert.ok(shape.labelPosition.equals(expected));
        });

        test('equals the corner-snapped start point when start is not already on a corner (dpi=130)', () => {
            const grid = makeGrid(130);
            const shape = new CirclePathfinderShape(grid);
            shape.start = new Point(-22, 61);
            shape.end = new Point(300, -140);
            const expected = grid.snapTo(shape.start, SnapTo.CORNER);
            assert.ok(shape.labelPosition.equals(expected));
        });
    });

    suite('outline', () => {
        test('is non-empty, starts with a MOVE, and that point lies on the circle', () => {
            const grid = makeGrid(100);
            const shape = new CirclePathfinderShape(grid);
            shape.start = new Point(0, 0);
            shape.end = new Point(400, 100);

            const outline = shape.outline;
            assert.ok(outline.length > 0);
            const first = outline[0];
            assert.ok(first);
            assert.equal(first[0], Command.MOVE);

            const [, x, y] = first as [Command.MOVE, number, number];
            const dist = shape.labelPosition.distanceTo(new Point(x, y));
            assert.ok(
                Math.abs(dist - shape.roundedDistance) < 1e-6,
                `expected outline start point at distance ${shape.roundedDistance} from label position, got ${dist}`,
            );
        });

        test('every MOVE/LINE point in the outline lies on the circle', () => {
            const grid = makeGrid(100);
            const shape = new CirclePathfinderShape(grid);
            shape.start = new Point(20, 30);
            shape.end = new Point(450, 320);

            for (const command of shape.outline) {
                if (command[0] === Command.MOVE || command[0] === Command.LINE) {
                    const [, x, y] = command as [Command.MOVE | Command.LINE, number, number];
                    const dist = shape.labelPosition.distanceTo(new Point(x, y));
                    assert.ok(
                        Math.abs(dist - shape.roundedDistance) < 1e-6,
                        `expected point (${x},${y}) at distance ${shape.roundedDistance} from label position, got ${dist}`,
                    );
                }
            }
        });
    });

    suite('cells', () => {
        test('includes a cell very close to the center', () => {
            const grid = makeGrid(100);
            const shape = new CirclePathfinderShape(grid);
            shape.start = new Point(0, 0);
            shape.end = new Point(400, 0);

            const centerCell = grid.getCell(shape.labelPosition.add(new Point(1, 1)));
            assert.ok(shouldBeIncluded(grid, shape.labelPosition, shape.roundedDistance, centerCell));
            assert.ok(shape.cells.some(c => cellKey(c) === cellKey(centerCell)));
        });

        test('excludes a cell clearly outside the radius', () => {
            const grid = makeGrid(100);
            const shape = new CirclePathfinderShape(grid);
            shape.start = new Point(0, 0);
            shape.end = new Point(400, 0);

            const farCell = grid.getCell(shape.labelPosition.add(new Point(2000, 2000)));
            assert.ok(!shouldBeIncluded(grid, shape.labelPosition, shape.roundedDistance, farCell));
            assert.ok(!shape.cells.some(c => cellKey(c) === cellKey(farCell)));
        });

        test('returns exactly the set of cells whose farthest corner is within the alternating radius (dpi=100)', () => {
            const grid = makeGrid(100);
            const shape = new CirclePathfinderShape(grid);
            shape.start = new Point(0, 0);
            shape.end = new Point(320, 180);

            const candidates = candidateCellsAround(grid, shape.labelPosition, shape.roundedDistance);
            const expectedKeys = new Set(candidates.filter(c => shouldBeIncluded(grid, shape.labelPosition, shape.roundedDistance, c)).map(cellKey));
            const actualKeys = new Set(shape.cells.map(cellKey));

            assert.deepEqual(actualKeys, expectedKeys);
        });

        test('returns exactly the set of cells whose farthest corner is within the alternating radius (dpi=150)', () => {
            const grid = makeGrid(150);
            const shape = new CirclePathfinderShape(grid);
            shape.start = new Point(0, 0);
            shape.end = new Point(480, 270);

            const candidates = candidateCellsAround(grid, shape.labelPosition, shape.roundedDistance);
            const expectedKeys = new Set(candidates.filter(c => shouldBeIncluded(grid, shape.labelPosition, shape.roundedDistance, c)).map(cellKey));
            const actualKeys = new Set(shape.cells.map(cellKey));

            assert.deepEqual(actualKeys, expectedKeys);
        });
    });

    suite('isValid', () => {
        test('is false when end is the same point as the corner-snapped start', () => {
            // roundedDistance is measured from the CORNER-snapped start, not the raw start, so the
            // degenerate (zero-radius) case is "end lands on that same corner" rather than simply
            // "start.equals(end)" - a raw start that isn't itself on a corner still snaps away from
            // end, producing a nonzero radius even though start and end were equal.
            const grid = makeGrid(100);
            const shape = new CirclePathfinderShape(grid);
            shape.start = new Point(100, 100);
            shape.end = new Point(100, 100);
            assert.ok(grid.snapTo(shape.start, SnapTo.CORNER).equals(shape.start), 'precondition: start must already be on a corner');
            assert.equal(shape.isValid, false);
        });

        test('is true when start and end are equal but start is not on a corner', () => {
            const grid = makeGrid(100);
            const shape = new CirclePathfinderShape(grid);
            shape.start = new Point(150, 150);
            shape.end = new Point(150, 150);
            assert.equal(shape.isValid, true);
        });

        test('is true for a reasonably sized circle', () => {
            const grid = makeGrid(100);
            const shape = new CirclePathfinderShape(grid);
            shape.start = new Point(0, 0);
            shape.end = new Point(300, 300);
            assert.equal(shape.isValid, true);
        });
    });
});
