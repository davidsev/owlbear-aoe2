import assert from 'node:assert/strict';
import { suite, test } from 'node:test';
import { Point, SquareGrid } from '@davidsev/owlbear-utils';
import { SquareDirection, StartPoint } from '../Metadata/room';
import { CubeTemplateShape } from './CubeTemplateShape';

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

function approxEqual(a: number, b: number, eps = 1e-4, message?: string) {
    assert.ok(Math.abs(a - b) < eps, `${message ?? ''} expected ${a} to be within ${eps} of ${b}`.trim());
}

type XY = { x: number; y: number };

function dist(a: XY, b: XY): number {
    return Math.hypot(a.x - b.x, a.y - b.y);
}

// Extract the 4 corners (in outline order) from `outline` as plain {x, y} points.
function getCorners(outline: ReadonlyArray<ReadonlyArray<unknown>>): [XY, XY, XY, XY] {
    const [c0, c1, c2, c3] = outline;
    assert.ok(c0 && c1 && c2 && c3, 'outline should have at least 4 commands with corners');
    const toXY = (command: ReadonlyArray<unknown>): XY => ({ x: command[1] as number, y: command[2] as number });
    return [toXY(c0), toXY(c1), toXY(c2), toXY(c3)];
}

function sideLengths([c0, c1, c2, c3]: [XY, XY, XY, XY]): [number, number, number, number] {
    return [dist(c0, c1), dist(c1, c2), dist(c2, c3), dist(c3, c0)];
}

suite('CubeTemplateShape', () => {
    test('produces an outline shaped as MOVE, LINE, LINE, LINE, CLOSE', () => {
        const grid = makeGrid(100);
        const shape = new CubeTemplateShape(grid, [StartPoint.CORNER], 0.5, 1, SquareDirection.ALL);
        shape.start = new Point(0, 0);
        shape.end = new Point(250, 250);

        const outline = shape.outline;
        assert.equal(outline.length, 5);

        // MOVE and the 3 LINEs each carry an (x, y) pair.
        for (let i = 0; i < 4; i++) {
            assert.equal(outline[i]?.length, 3, `command ${i} should carry [type, x, y]`);
        }
        // CLOSE carries no coordinates.
        assert.equal(outline[4]?.length, 1, 'CLOSE command should carry no coordinates');
    });

    test('outline corners form a square: equal sides, equal bisecting diagonals through labelPosition', () => {
        const grid = makeGrid(100);
        const shape = new CubeTemplateShape(grid, [StartPoint.CORNER], 0.5, 1, SquareDirection.ALL);
        shape.start = new Point(0, 0);
        shape.end = new Point(300, 150);

        const corners = getCorners(shape.outline);
        const [c0, c1, c2, c3] = corners;
        const sides = sideLengths(corners);
        const [side0, side1, side2, side3] = sides;

        approxEqual(side1, side0, 1e-2, 'side 1 should equal side 0');
        approxEqual(side2, side0, 1e-2, 'side 2 should equal side 0');
        approxEqual(side3, side0, 1e-2, 'side 3 should equal side 0');

        const diagonal1 = dist(c0, c2);
        const diagonal2 = dist(c1, c3);
        approxEqual(diagonal1, diagonal2, 1e-2, 'both diagonals should be equal length');

        const midpoint1 = { x: (c0.x + c2.x) / 2, y: (c0.y + c2.y) / 2 };
        const midpoint2 = { x: (c1.x + c3.x) / 2, y: (c1.y + c3.y) / 2 };
        approxEqual(midpoint1.x, midpoint2.x, 1e-2, 'diagonals should bisect at the same x');
        approxEqual(midpoint1.y, midpoint2.y, 1e-2, 'diagonals should bisect at the same y');

        approxEqual(midpoint1.x, shape.labelPosition.x, 1e-2, 'diagonal midpoint should equal labelPosition.x');
        approxEqual(midpoint1.y, shape.labelPosition.y, 1e-2, 'diagonal midpoint should equal labelPosition.y');
    });

    test('roundedDistance at 0 and 45 degrees is (Euclidean) drag distance / sqrt(2) (the two angles where the square-as-diagonal construction is unambiguous)', () => {
        const grid = makeGrid(100);
        const distance = 300; // raw Euclidean start-to-end distance, held constant across both cases below

        const axisAligned = new CubeTemplateShape(grid, [StartPoint.CORNER], 0.5, 0, SquareDirection.ALL);
        axisAligned.start = new Point(0, 0);
        axisAligned.end = new Point(distance, 0);
        approxEqual(axisAligned.roundedDistance, distance / Math.SQRT2, 5, 'axis-aligned (0deg) drag');

        const diagonal = new CubeTemplateShape(grid, [StartPoint.CORNER], 0.5, 0, SquareDirection.ALL);
        diagonal.start = new Point(0, 0);
        diagonal.end = new Point(distance / Math.SQRT2, distance / Math.SQRT2); // same Euclidean distance, at 45deg
        approxEqual(diagonal.roundedDistance, distance / Math.SQRT2, 5, '45deg diagonal drag');
    });

    test('roundedDistance is monotonically non-decreasing as drag distance increases at a fixed angle', () => {
        const grid = makeGrid(100);
        const shape = new CubeTemplateShape(grid, [StartPoint.CORNER], 0.5, 0, SquareDirection.ALL);
        shape.start = new Point(0, 0);

        const angle = Math.PI / 6; // 30 degrees, an arbitrary fixed angle.
        const distances = [50, 100, 150, 200, 250, 300, 350, 400, 450, 500];

        let previous = -Infinity;
        for (const d of distances) {
            shape.end = new Point(d * Math.cos(angle), d * Math.sin(angle));
            const current = shape.roundedDistance;
            assert.ok(
                current >= previous - 1e-6,
                `roundedDistance should not decrease as drag distance grows: at d=${d}, got ${current}, previous was ${previous}`,
            );
            previous = current;
        }
    });

    test('with no snapping, one outline corner equals the raw start point exactly', () => {
        const grid = makeGrid(100);
        const shape = new CubeTemplateShape(grid, [], 0.5, 1, SquareDirection.ALL);
        const start = new Point(37, -19);
        shape.start = start;
        shape.end = new Point(237, 181);

        const corners = getCorners(shape.outline);
        const matchesStart = corners.some(c => Math.abs(c.x - start.x) < 1e-6 && Math.abs(c.y - start.y) < 1e-6);
        assert.ok(matchesStart, `expected one of ${JSON.stringify(corners)} to equal raw start ${JSON.stringify(start)}`);
    });

    test('cells included at a higher overlapThreshold are a subset of cells included at a lower one', () => {
        const grid = makeGrid(100);

        const lowThreshold = new CubeTemplateShape(grid, [StartPoint.CORNER], 0.1, 1, SquareDirection.ALL);
        lowThreshold.start = new Point(0, 0);
        lowThreshold.end = new Point(320, 260);

        const highThreshold = new CubeTemplateShape(grid, [StartPoint.CORNER], 0.9, 1, SquareDirection.ALL);
        highThreshold.start = new Point(0, 0);
        highThreshold.end = new Point(320, 260);

        const lowCells = new Set(lowThreshold.cells.map(cell => JSON.stringify(cell)));
        const highCells = new Set(highThreshold.cells.map(cell => JSON.stringify(cell)));

        assert.ok(highCells.size <= lowCells.size, 'higher threshold should include no more cells than lower threshold');
        for (const cell of highCells) {
            assert.ok(lowCells.has(cell), `cell ${cell} included at high threshold should also be included at low threshold`);
        }
    });

    test('isValid is false when start equals end, and true for a reasonably sized cube', () => {
        const grid = makeGrid(100);

        const degenerate = new CubeTemplateShape(grid, [StartPoint.CORNER], 0.5, 1, SquareDirection.ALL);
        degenerate.start = new Point(50, 50);
        degenerate.end = new Point(50, 50);
        assert.equal(degenerate.isValid, false);

        const valid = new CubeTemplateShape(grid, [StartPoint.CORNER], 0.5, 1, SquareDirection.ALL);
        valid.start = new Point(0, 0);
        valid.end = new Point(300, 200);
        assert.equal(valid.isValid, true);
    });

    test('directionSnapping FOUR and EIGHT do not throw and still produce a valid square', () => {
        const grid = makeGrid(100);

        for (const directionSnapping of [SquareDirection.FOUR, SquareDirection.EIGHT, SquareDirection.ALL]) {
            const shape = new CubeTemplateShape(grid, [StartPoint.CORNER], 0.5, 1, directionSnapping);
            shape.start = new Point(0, 0);
            shape.end = new Point(217, 133);

            const corners = getCorners(shape.outline);
            const [side0, side1, side2, side3] = sideLengths(corners);
            approxEqual(side1, side0, 1e-2, `directionSnapping=${directionSnapping}: side 1 should equal side 0`);
            approxEqual(side2, side0, 1e-2, `directionSnapping=${directionSnapping}: side 2 should equal side 0`);
            approxEqual(side3, side0, 1e-2, `directionSnapping=${directionSnapping}: side 3 should equal side 0`);
        }
    });
});
