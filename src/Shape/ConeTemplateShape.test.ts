import assert from 'node:assert/strict';
import { suite, test } from 'node:test';
import { Command } from '@owlbear-rodeo/sdk';
import { Point, SquareGrid } from '@davidsev/owlbear-utils';
import { SquareDirection, StartPoint } from '../Metadata/room';
import { getDirection4, getDirection8 } from '../Utils/Geometry/getDirection';
import { ConeTemplateShape } from './ConeTemplateShape';

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

const NINETY = Math.PI / 2;
const SIXTY = Math.PI / 3;
const FIVE_E = (53.1 * Math.PI) / 180;

/** Pulls the apex and two base corners out of a shape's outline, asserting the expected 4-command shape. */
function getTrianglePoints(shape: ConeTemplateShape): { apex: Point; b1: Point; b2: Point } {
    const outline = shape.outline;
    assert.equal(outline.length, 4);

    const [move, line1, line2, close] = outline;
    assert.ok(move && line1 && line2 && close, 'expected 4 defined outline commands');
    assert.equal(move[0], Command.MOVE);
    assert.equal(line1[0], Command.LINE);
    assert.equal(line2[0], Command.LINE);
    assert.equal(close[0], Command.CLOSE);
    assert.equal(close.length, 1);

    const moveCmd = move as [number, number, number];
    const line1Cmd = line1 as [number, number, number];
    const line2Cmd = line2 as [number, number, number];

    return {
        apex: new Point(moveCmd[1], moveCmd[2]),
        b1: new Point(line1Cmd[1], line1Cmd[2]),
        b2: new Point(line2Cmd[1], line2Cmd[2]),
    };
}

function cross(a: Point, b: Point): number {
    return a.x * b.y - a.y * b.x;
}

function dot(a: Point, b: Point): number {
    return a.x * b.x + a.y * b.y;
}

/** Asserts that vector `a` points in (approximately) the same direction as vector `b`. */
function assertParallelSameWay(a: Point, b: Point, message: string) {
    const magA = Math.hypot(a.x, a.y);
    const magB = Math.hypot(b.x, b.y);
    assert.ok(magA > 1e-9, `${message}: vector a is ~zero`);
    assert.ok(magB > 1e-9, `${message}: vector b is ~zero`);

    const normalizedCross = cross(a, b) / (magA * magB);
    assert.ok(Math.abs(normalizedCross) < 1e-6, `${message}: expected parallel, cross=${normalizedCross}`);
    assert.ok(dot(a, b) > 0, `${message}: expected same direction, dot=${dot(a, b)}`);
}

suite('ConeTemplateShape', () => {
    suite('roundedDistance', () => {
        test('equals the raw distance when sizeSnapping is 0', () => {
            const grid = makeGrid(100);
            const shape = new ConeTemplateShape(grid, NINETY, [], 1, 0, SquareDirection.ALL);
            shape.start = new Point(0, 0);
            shape.end = new Point(240, 0);

            assert.equal(shape.roundedDistance, shape.distance);
            assert.equal(shape.roundedDistance, 240);
        });

        test('snaps to the exact cell size when the distance is already a multiple', () => {
            const grid = makeGrid(100);
            const shape = new ConeTemplateShape(grid, NINETY, [], 1, 1, SquareDirection.ALL);
            shape.start = new Point(0, 0);
            shape.end = new Point(200, 0);

            assert.equal(shape.roundedDistance, 200);
        });

        test('rounds down to the nearest sizeSnapping step when closer to the lower multiple', () => {
            const grid = makeGrid(100);
            const shape = new ConeTemplateShape(grid, NINETY, [], 1, 1, SquareDirection.ALL);
            shape.start = new Point(0, 0);
            shape.end = new Point(240, 0);

            // 240 is closer to 200 than 300 given a 100-unit (1 cell) snapping step.
            assert.equal(shape.roundedDistance, 200);
        });

        test('rounds to a multiple of sizeSnapping * dpi for sizeSnapping > 1', () => {
            const grid = makeGrid(100);
            const shape = new ConeTemplateShape(grid, NINETY, [], 1, 2, SquareDirection.ALL);
            shape.start = new Point(0, 0);
            shape.end = new Point(280, 0);

            // sizeSnapping=2 with dpi=100 means steps of 200. 280 is closer to 200 than 400.
            assert.equal(shape.roundedDistance, 200);
        });

        test('rounds up to the nearest sizeSnapping step when closer to the upper multiple', () => {
            const grid = makeGrid(100);
            const shape = new ConeTemplateShape(grid, NINETY, [], 1, 1, SquareDirection.ALL);
            shape.start = new Point(0, 0);
            shape.end = new Point(160, 0);

            // 160 is closer to 200 than 100 given a 100-unit (1 cell) snapping step.
            assert.equal(shape.roundedDistance, 200);
        });
    });

    suite('outline', () => {
        test('is always a closed triangle: MOVE, LINE, LINE, CLOSE', () => {
            const grid = makeGrid(100);
            const shape = new ConeTemplateShape(grid, SIXTY, [], 1, 0, SquareDirection.ALL);
            shape.start = new Point(10, 10);
            shape.end = new Point(310, 10);

            // getTrianglePoints already asserts the 4-command shape.
            getTrianglePoints(shape);
        });

        test('has its MOVE point at the (unsnapped) apex when startPoints is empty', () => {
            const grid = makeGrid(100);
            const shape = new ConeTemplateShape(grid, SIXTY, [], 1, 0, SquareDirection.ALL);
            shape.start = new Point(37, 53);
            shape.end = new Point(337, 53);

            const { apex } = getTrianglePoints(shape);
            assert.equal(apex.x, 37);
            assert.equal(apex.y, 53);
        });

        test('snaps the apex to the nearest cell center when startPoints includes StartPoint.CENTER', () => {
            const grid = makeGrid(100);
            const shape = new ConeTemplateShape(grid, SIXTY, [StartPoint.CENTER], 1, 0, SquareDirection.ALL);
            shape.start = new Point(37, 53);
            shape.end = new Point(337, 53);

            // The cell containing the scene origin has center (dpi/2, dpi/2) = (50, 50), which is
            // the nearest cell center to (37, 53).
            const { apex } = getTrianglePoints(shape);
            assert.equal(apex.x, 50);
            assert.equal(apex.y, 50);
        });

        test('snaps the apex to the nearest grid corner when startPoints includes StartPoint.CORNER', () => {
            const grid = makeGrid(100);
            const shape = new ConeTemplateShape(grid, SIXTY, [StartPoint.CORNER], 1, 0, SquareDirection.ALL);
            shape.start = new Point(37, 53);
            shape.end = new Point(337, 53);

            // Corners lie on multiples of dpi (100). Of the 4 corners of the cell containing
            // (37, 53) - (0,0), (100,0), (0,100), (100,100) - (0, 100) is nearest.
            const { apex } = getTrianglePoints(shape);
            assert.equal(apex.x, 0);
            assert.equal(apex.y, 100);
        });
    });

    suite('labelPosition', () => {
        test('is the average of the 3 outline points', () => {
            const grid = makeGrid(100);
            const shape = new ConeTemplateShape(grid, SIXTY, [], 1, 0, SquareDirection.ALL);
            shape.start = new Point(12, -8);
            shape.end = new Point(312, 192);

            const { apex, b1, b2 } = getTrianglePoints(shape);
            const expectedX = (apex.x + b1.x + b2.x) / 3;
            const expectedY = (apex.y + b1.y + b2.y) / 3;

            assert.ok(Math.abs(shape.labelPosition.x - expectedX) < 1e-6);
            assert.ok(Math.abs(shape.labelPosition.y - expectedY) < 1e-6);
        });
    });

    suite('direction snapping', () => {
        test('with SquareDirection.ALL, points exactly at the raw end (angle unsnapped)', () => {
            const grid = makeGrid(100);
            const shape = new ConeTemplateShape(grid, SIXTY, [], 1, 0, SquareDirection.ALL);
            shape.start = new Point(0, 0);
            shape.end = new Point(173, 291);

            const { apex, b1, b2 } = getTrianglePoints(shape);
            const mid = new Point((b1.x + b2.x) / 2, (b1.y + b2.y) / 2);
            const apexToMid = mid.sub(apex);
            const apexToEnd = shape.end.sub(shape.start);

            assertParallelSameWay(apexToMid, apexToEnd, 'ALL direction snapping');
        });

        test('with SquareDirection.FOUR, points in the direction returned by getDirection4', () => {
            const grid = makeGrid(100);
            const shape = new ConeTemplateShape(grid, SIXTY, [], 1, 0, SquareDirection.FOUR);
            shape.start = new Point(0, 0);
            shape.end = new Point(30, 220);

            const expectedDir = getDirection4(shape.end.sub(shape.start));
            assert.ok(expectedDir, 'expected a non-null snapped direction');

            const { apex, b1, b2 } = getTrianglePoints(shape);
            const mid = new Point((b1.x + b2.x) / 2, (b1.y + b2.y) / 2);
            const apexToMid = mid.sub(apex);

            assertParallelSameWay(apexToMid, expectedDir as Point, 'FOUR direction snapping');
        });

        test('with SquareDirection.EIGHT, points in the direction returned by getDirection8', () => {
            const grid = makeGrid(100);
            const shape = new ConeTemplateShape(grid, SIXTY, [], 1, 0, SquareDirection.EIGHT);
            shape.start = new Point(0, 0);
            shape.end = new Point(150, 220);

            const expectedDir = getDirection8(shape.end.sub(shape.start));
            assert.ok(expectedDir, 'expected a non-null snapped direction');

            const { apex, b1, b2 } = getTrianglePoints(shape);
            const mid = new Point((b1.x + b2.x) / 2, (b1.y + b2.y) / 2);
            const apexToMid = mid.sub(apex);

            assertParallelSameWay(apexToMid, expectedDir as Point, 'EIGHT direction snapping');
        });
    });

    suite('widthRads', () => {
        test('produces a wider base for a wider apex angle, for the same start/end', () => {
            const grid = makeGrid(100);

            function baseWidth(widthRads: number): number {
                const shape = new ConeTemplateShape(grid, widthRads, [], 1, 0, SquareDirection.ALL);
                shape.start = new Point(0, 0);
                shape.end = new Point(300, 0);
                const { b1, b2 } = getTrianglePoints(shape);
                return b1.distanceTo(b2);
            }

            const widthAt60 = baseWidth(SIXTY);
            const widthAt5e = baseWidth(FIVE_E);
            const widthAt90 = baseWidth(NINETY);

            // 53.1deg < 60deg < 90deg, so the base width should strictly increase in that order.
            assert.ok(widthAt5e < widthAt60, `expected ${widthAt5e} < ${widthAt60}`);
            assert.ok(widthAt60 < widthAt90, `expected ${widthAt60} < ${widthAt90}`);
        });
    });

    suite('overlapThreshold', () => {
        test('is monotonic: a lower threshold never excludes a cell a higher threshold includes', () => {
            const grid = makeGrid(100);

            function cellCenters(overlapThreshold: number): Set<string> {
                const shape = new ConeTemplateShape(grid, NINETY, [], overlapThreshold, 0, SquareDirection.ALL);
                shape.start = new Point(0, 0);
                shape.end = new Point(350, 0);
                return new Set(shape.cells.map(cell => cell.center.toString()));
            }

            const atZero = cellCenters(0);
            const atHalf = cellCenters(0.5);
            const atOne = cellCenters(1);

            assert.ok(atZero.size >= atHalf.size, `expected ${atZero.size} >= ${atHalf.size}`);
            assert.ok(atHalf.size >= atOne.size, `expected ${atHalf.size} >= ${atOne.size}`);

            for (const center of atOne) {
                assert.ok(atHalf.has(center), `expected threshold=0.5 cells to be a superset of threshold=1 cells (missing ${center})`);
            }
            for (const center of atHalf) {
                assert.ok(atZero.has(center), `expected threshold=0 cells to be a superset of threshold=0.5 cells (missing ${center})`);
            }
        });

        test('excludes a cell with 0% overlap even at overlapThreshold 0', () => {
            const grid = makeGrid(100);
            const shape = new ConeTemplateShape(grid, NINETY, [], 0, 0, SquareDirection.ALL);
            shape.start = new Point(0, 0);
            shape.end = new Point(350, 0);

            // A cell entirely behind the apex (negative x) can only ever have 0% overlap with a cone
            // that points in the +x direction, so it must never be included, even at threshold=0.
            const centers = new Set(shape.cells.map(c => c.center.toString()));
            assert.ok(!centers.has(new Point(-50, -50).toString()), 'expected a cell behind the apex to never be included');
        });

        test('with overlapThreshold 1, no cell is ever included, since coverage cannot strictly exceed 100%', () => {
            const grid = makeGrid(100);
            // Per spec, a cell is included iff its coverage percentage *exceeds* overlapThreshold*100
            // (a strict '>'). No cell can ever be covered more than 100%, so an overlapThreshold of 1
            // (100%) can never include any cell, regardless of the cone's size or shape.
            const shape = new ConeTemplateShape(grid, NINETY, [], 1, 0, SquareDirection.ALL);
            shape.start = new Point(0, 0);
            shape.end = new Point(350, 0);

            assert.equal(shape.cells.length, 0);
        });
    });

    suite('isValid', () => {
        test('is false when start equals end', () => {
            const grid = makeGrid(100);
            const shape = new ConeTemplateShape(grid, NINETY, [], 1, 0, SquareDirection.ALL);
            shape.start = new Point(50, 50);
            shape.end = new Point(50, 50);

            assert.equal(shape.isValid, false);
        });

        test('is true for a reasonably sized cone', () => {
            const grid = makeGrid(100);
            const shape = new ConeTemplateShape(grid, NINETY, [], 1, 0, SquareDirection.ALL);
            shape.start = new Point(0, 0);
            shape.end = new Point(300, 0);

            assert.equal(shape.isValid, true);
        });

        test('is false when roundedDistance rounds down to 0, even though start != end', () => {
            const grid = makeGrid(100);
            const shape = new ConeTemplateShape(grid, NINETY, [], 1, 1, SquareDirection.ALL);
            shape.start = new Point(0, 0);
            shape.end = new Point(30, 0);

            // isValid is spec'd as `roundedDistance > 0`, not `distance > 0` - the raw distance (30)
            // is nonzero, but with sizeSnapping=1 (100-unit steps) it rounds down to 0.
            assert.notEqual(shape.start.x, shape.end.x);
            assert.equal(shape.roundedDistance, 0);
            assert.equal(shape.isValid, false);
        });
    });

    suite('caching', () => {
        test('recomputes cached getters after start/end is reassigned', () => {
            const grid = makeGrid(100);
            const shape = new ConeTemplateShape(grid, NINETY, [], 1, 0, SquareDirection.ALL);
            shape.start = new Point(0, 0);
            shape.end = new Point(100, 0);

            const firstDistance = shape.roundedDistance;
            const firstOutline = JSON.stringify(shape.outline);

            shape.end = new Point(300, 0);

            assert.notEqual(shape.roundedDistance, firstDistance);
            assert.notEqual(JSON.stringify(shape.outline), firstOutline);
        });

        test('recomputes cached getters after start is reassigned', () => {
            const grid = makeGrid(100);
            const shape = new ConeTemplateShape(grid, NINETY, [], 1, 0, SquareDirection.ALL);
            shape.start = new Point(0, 0);
            shape.end = new Point(300, 0);

            const firstApex = JSON.stringify(shape.outline[0]);

            shape.start = new Point(100, 100);

            assert.notEqual(JSON.stringify(shape.outline[0]), firstApex);
        });
    });
});
