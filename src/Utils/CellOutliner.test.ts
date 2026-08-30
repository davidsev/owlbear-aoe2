import assert from 'node:assert/strict';
import { suite, test } from 'node:test';
import { Point, SquareGrid } from '@davidsev/owlbear-utils';
import { Command } from '@owlbear-rodeo/sdk/lib/types/items/Path';
import { CellOutliner } from './CellOutliner';

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

function pointKey(p: Point): string {
    return `${p.x},${p.y}`;
}

function sortedPointKeys(points: Point[]): string[] {
    return points.map(pointKey).sort();
}

function isCollinear(a: Point, b: Point, c: Point): boolean {
    const cross = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
    return Math.abs(cross) < 1e-9;
}

/**
 * CellOutliner's raw loops only drop edges shared by two cells - they don't merge collinear
 * "pass-through" vertices where two boundary edges from different cells happen to run the same
 * direction (eg. the midpoint where two adjacent cells' outer edges meet). This reduces a closed
 * loop (which is stored with an explicit trailing duplicate of its start point) down to just its
 * true corners, so tests can assert on shape rather than on that non-simplified vertex count.
 */
function simplifyClosedLoop(points: Point[]): Point[] {
    let pts = points;
    if (pts.length > 1 && pts[0]?.equals(pts[pts.length - 1] as Point)) {
        pts = pts.slice(0, -1);
    }
    const n = pts.length;
    const result: Point[] = [];
    for (let i = 0; i < n; i++) {
        const prev = pts[(i - 1 + n) % n] as Point;
        const curr = pts[i] as Point;
        const next = pts[(i + 1) % n] as Point;
        if (!isCollinear(prev, curr, next)) result.push(curr);
    }
    return result;
}

function assertPointSetEquals(actual: Point[], expected: Point[]) {
    assert.deepEqual(sortedPointKeys(actual), sortedPointKeys(expected));
}

suite('CellOutliner', () => {
    test('produces an empty outline and path for zero cells', () => {
        const outliner = new CellOutliner([]);
        assert.deepEqual(outliner.outline, []);
        assert.deepEqual(outliner.getOutlinePath(), []);
    });

    test('produces a single loop whose corner set matches the cell, for one cell', () => {
        const grid = makeGrid(100);
        const cell = grid.getCell({ x: 50, y: 50 });

        const outliner = new CellOutliner([cell]);

        assert.equal(outliner.outline.length, 1);
        const [loop] = outliner.outline;
        assert.ok(loop);
        assertPointSetEquals(simplifyClosedLoop(loop), cell.corners);
    });

    test('getOutlinePath for a single cell traces a closed loop whose corner set matches the cell', () => {
        const grid = makeGrid(100);
        const cell = grid.getCell({ x: 50, y: 50 });
        const outliner = new CellOutliner([cell]);

        const path = outliner.getOutlinePath();
        assert.equal(path[0]?.[0], Command.MOVE);
        assert.equal(path[path.length - 1]?.[0], Command.CLOSE);
        for (let i = 1; i < path.length - 1; i++) assert.equal(path[i]?.[0], Command.LINE);

        // Collect every (x, y) the path actually visits (MOVE + LINE points) - it may revisit the
        // start point again before CLOSE (an explicit closing duplicate), so dedupe before comparing.
        const visited = path
            .filter((c): c is [Command.MOVE | Command.LINE, number, number] => c[0] === Command.MOVE || c[0] === Command.LINE)
            .map(([, x, y]) => new Point(x, y));
        const uniqueVisited = [...new Map(visited.map(p => [pointKey(p), p])).values()];
        assertPointSetEquals(uniqueVisited, cell.corners);
    });

    test('merges two horizontally-adjacent cells into a single loop, dropping the shared edge', () => {
        const grid = makeGrid(100);
        const left = grid.getCell({ x: 50, y: 50 });
        const right = grid.getCell({ x: 150, y: 50 });

        const outliner = new CellOutliner([left, right]);

        assert.equal(outliner.outline.length, 1);
        const [loop] = outliner.outline;
        assert.ok(loop);

        // The shared edge itself (the segment from (100,0) to (100,100)) must be gone - neither of
        // its endpoints should appear as a lone internal edge, ie. the simplified corner set is
        // exactly the outer rectangle's 4 true corners.
        assertPointSetEquals(simplifyClosedLoop(loop), [new Point(0, 0), new Point(200, 0), new Point(200, 100), new Point(0, 100)]);
    });

    test('merges a 2x2 block of cells into a single loop, dropping all internal edges', () => {
        const grid = makeGrid(100);
        const cells = [grid.getCell({ x: 50, y: 50 }), grid.getCell({ x: 150, y: 50 }), grid.getCell({ x: 50, y: 150 }), grid.getCell({ x: 150, y: 150 })];

        const outliner = new CellOutliner(cells);

        assert.equal(outliner.outline.length, 1);
        const [loop] = outliner.outline;
        assert.ok(loop);
        assertPointSetEquals(simplifyClosedLoop(loop), [new Point(0, 0), new Point(200, 0), new Point(200, 200), new Point(0, 200)]);
    });

    test('every loop in getOutlinePath starts with MOVE, ends with CLOSE, and is LINE in between', () => {
        const grid = makeGrid(100);
        const cells = [grid.getCell({ x: 50, y: 50 }), grid.getCell({ x: 150, y: 50 }), grid.getCell({ x: 50, y: 150 }), grid.getCell({ x: 150, y: 150 })];

        const outliner = new CellOutliner(cells);
        const path = outliner.getOutlinePath();

        assert.ok(path.length > 0);

        let i = 0;
        let loopCount = 0;
        while (i < path.length) {
            assert.equal(path[i]?.[0], Command.MOVE);
            i++;
            while (i < path.length && path[i]?.[0] === Command.LINE) i++;
            assert.ok(i < path.length, 'expected a CLOSE command to terminate the loop');
            assert.equal(path[i]?.[0], Command.CLOSE);
            i++;
            loopCount++;
        }
        assert.equal(loopCount, 1);
    });

    test('keeps two disjoint (non-adjacent) cells as two separate unmerged loops', () => {
        const grid = makeGrid(100);
        const cellA = grid.getCell({ x: 50, y: 50 });
        const cellB = grid.getCell({ x: 350, y: 350 });

        let outliner!: CellOutliner;
        assert.doesNotThrow(() => {
            outliner = new CellOutliner([cellA, cellB]);
        }, 'CellOutliner should not throw for disconnected cell islands');

        assert.equal(outliner.outline.length, 2);
        const actualLoops = outliner.outline.map(loop => sortedPointKeys(simplifyClosedLoop(loop))).sort();
        const expectedLoops = [sortedPointKeys(cellA.corners), sortedPointKeys(cellB.corners)].sort();
        assert.deepEqual(actualLoops, expectedLoops);
    });

    test('keeps two diagonally-adjacent cells (sharing only one corner point) as two separate loops', () => {
        const grid = makeGrid(100);
        const cellA = grid.getCell({ x: 50, y: 50 });
        const cellB = grid.getCell({ x: 150, y: 150 });

        const outliner = new CellOutliner([cellA, cellB]);

        // At the shared corner (100,100), four edges meet - picking the wrong "next" edge there
        // would splice the two squares into a single bowtie-shaped loop instead of keeping them
        // separate, so this asserts both the loop count and each loop's true shape.
        assert.equal(outliner.outline.length, 2);
        const actualLoops = outliner.outline.map(loop => sortedPointKeys(simplifyClosedLoop(loop))).sort();
        const expectedLoops = [sortedPointKeys(cellA.corners), sortedPointKeys(cellB.corners)].sort();
        assert.deepEqual(actualLoops, expectedLoops);
    });

    test('getOutlinePath() does not mutate outline, and returns the same result when called twice', () => {
        const grid = makeGrid(100);
        const cell = grid.getCell({ x: 50, y: 50 });
        const outliner = new CellOutliner([cell]);

        const outlineBefore = outliner.outline.map(loop => [...loop]);
        outliner.getOutlinePath();
        const outlineAfter = outliner.outline;

        assert.deepEqual(
            outlineAfter.map(loop => loop.map(pointKey)),
            outlineBefore.map(loop => loop.map(pointKey)),
            'outline should be unchanged by calling getOutlinePath()',
        );

        const first = outliner.getOutlinePath();
        const second = outliner.getOutlinePath();
        assert.deepEqual(second, first, 'calling getOutlinePath() twice should return the same path both times');
    });
});
