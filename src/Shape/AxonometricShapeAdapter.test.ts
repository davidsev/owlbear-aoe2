import assert from 'node:assert/strict';
import { suite, test } from 'node:test';
import { IsometricGrid, Point } from '@davidsev/owlbear-utils';
import { Command, type PathCommand } from '@owlbear-rodeo/sdk/lib/types/items/Path';
import { SquareDirection } from '../Metadata/room';
import { buildFakeSquareGrid } from '../Utils/buildFakeSquareGrid';
import type { BaseShape } from './BaseShape';
import { AxonometricShapeAdapter } from './AxonometricShapeAdapter';
import { ConeTemplateShape } from './ConeTemplateShape';

function makeIsometricGrid(dpi: number): IsometricGrid {
    return new IsometricGrid(
        {
            type: 'ISOMETRIC',
            dpi,
            style: { lineType: 'SOLID', lineOpacity: 1, lineColor: 'DARK', lineWidth: 1 },
            measurement: 'CHEBYSHEV',
            scale: '5ft',
        },
        { raw: '5ft', parsed: { multiplier: 5, unit: 'ft', digits: 0 } },
    );
}

/** Reimplementation of the adapter's documented `toGridSpace`, built purely from the grid's own (real, trusted) API. */
function toGridSpace(grid: IsometricGrid, point: Point): Point {
    const [u, v] = grid.xy_to_uv(point.x, point.y);
    return new Point(u * grid.dpi, v * grid.dpi);
}

/** Reimplementation of the adapter's documented `fromGridSpace`. */
function fromGridSpace(grid: IsometricGrid, point: Point): Point {
    const [x, y] = grid.uv_to_xy(point.x / grid.dpi, point.y / grid.dpi);
    return new Point(x, y);
}

interface FakeInnerShape {
    start: Point;
    end: Point;
    isValid: boolean;
    labelText: string;
    labelPosition: Point;
    outline: PathCommand[];
    areaPath: PathCommand[];
}

function makeFakeInnerShape(overrides: Partial<FakeInnerShape> = {}): FakeInnerShape {
    return {
        start: overrides.start ?? new Point(0, 0),
        end: overrides.end ?? new Point(0, 0),
        isValid: overrides.isValid ?? true,
        labelText: overrides.labelText ?? '',
        labelPosition: overrides.labelPosition ?? new Point(0, 0),
        outline: overrides.outline ?? [],
        areaPath: overrides.areaPath ?? [],
    };
}

function assertPointEqual(actual: Point, expected: Point, message = 'point') {
    assert.equal(actual.x, expected.x, `${message} (x)`);
    assert.equal(actual.y, expected.y, `${message} (y)`);
}

suite('AxonometricShapeAdapter', () => {
    suite('isValid', () => {
        test('passes through true from the inner shape', () => {
            const grid = makeIsometricGrid(100);
            const inner = makeFakeInnerShape({ isValid: true });
            const adapter = new AxonometricShapeAdapter(grid, inner as unknown as BaseShape);
            assert.equal(adapter.isValid, true);
        });

        test('passes through false from the inner shape', () => {
            const grid = makeIsometricGrid(100);
            const inner = makeFakeInnerShape({ isValid: false });
            const adapter = new AxonometricShapeAdapter(grid, inner as unknown as BaseShape);
            assert.equal(adapter.isValid, false);
        });
    });

    suite('labelText', () => {
        test('passes through the inner shape label text unchanged', () => {
            const grid = makeIsometricGrid(100);
            const inner = makeFakeInnerShape({ labelText: '30ft cone' });
            const adapter = new AxonometricShapeAdapter(grid, inner as unknown as BaseShape);
            assert.equal(adapter.labelText, '30ft cone');
        });

        test('passes through an empty label text unchanged', () => {
            const grid = makeIsometricGrid(100);
            const inner = makeFakeInnerShape({ labelText: '' });
            const adapter = new AxonometricShapeAdapter(grid, inner as unknown as BaseShape);
            assert.equal(adapter.labelText, '');
        });
    });

    suite('start / end coordinate mapping', () => {
        for (const dpi of [100, 70]) {
            test(`forwards start converted to grid space to the inner shape at dpi=${dpi}`, () => {
                const grid = makeIsometricGrid(dpi);
                const inner = makeFakeInnerShape();
                const adapter = new AxonometricShapeAdapter(grid, inner as unknown as BaseShape);

                const scenePoint = new Point(123, -45);
                adapter.start = scenePoint;

                const expected = toGridSpace(grid, scenePoint);
                assertPointEqual(inner.start, expected, 'inner.start');
            });

            test(`forwards end converted to grid space to the inner shape at dpi=${dpi}`, () => {
                const grid = makeIsometricGrid(dpi);
                const inner = makeFakeInnerShape();
                const adapter = new AxonometricShapeAdapter(grid, inner as unknown as BaseShape);

                const scenePoint = new Point(-77, 200);
                adapter.end = scenePoint;

                const expected = toGridSpace(grid, scenePoint);
                assertPointEqual(inner.end, expected, 'inner.end');
            });
        }

        test('start getter returns the raw scene-space value that was set, not a re-derived one', () => {
            const grid = makeIsometricGrid(100);
            const inner = makeFakeInnerShape();
            const adapter = new AxonometricShapeAdapter(grid, inner as unknown as BaseShape);

            const scenePoints = [new Point(0, 0), new Point(150, 250), new Point(-300, 42.5), new Point(1, -1)];
            for (const scenePoint of scenePoints) {
                adapter.start = scenePoint;
                assertPointEqual(adapter.start, scenePoint, `adapter.start for ${scenePoint.toString()}`);
                // The inner shape should have received the grid-space mapping, not the raw scene point.
                const expected = toGridSpace(grid, scenePoint);
                assertPointEqual(inner.start, expected, `inner.start for ${scenePoint.toString()}`);
            }
        });

        test('end getter returns the raw scene-space value that was set, not a re-derived one', () => {
            const grid = makeIsometricGrid(100);
            const inner = makeFakeInnerShape();
            const adapter = new AxonometricShapeAdapter(grid, inner as unknown as BaseShape);

            const scenePoints = [new Point(0, 0), new Point(80, -60), new Point(-10, -10)];
            for (const scenePoint of scenePoints) {
                adapter.end = scenePoint;
                assertPointEqual(adapter.end, scenePoint, `adapter.end for ${scenePoint.toString()}`);
                const expected = toGridSpace(grid, scenePoint);
                assertPointEqual(inner.end, expected, `inner.end for ${scenePoint.toString()}`);
            }
        });
    });

    suite('labelPosition', () => {
        for (const dpi of [100, 50]) {
            test(`maps the inner shape's grid-space label position back to scene space at dpi=${dpi}`, () => {
                const grid = makeIsometricGrid(dpi);
                const gridSpaceLabelPos = new Point(37, -19);
                const inner = makeFakeInnerShape({ labelPosition: gridSpaceLabelPos });
                const adapter = new AxonometricShapeAdapter(grid, inner as unknown as BaseShape);

                const expected = fromGridSpace(grid, gridSpaceLabelPos);
                assertPointEqual(adapter.labelPosition, expected, 'adapter.labelPosition');
            });
        }
    });

    suite('outline / areaPath command mapping', () => {
        function makeSampleCommands(): PathCommand[] {
            return [
                [Command.MOVE, 10, 20],
                [Command.LINE, 30, 40],
                [Command.QUAD, 50, 60, 70, 80],
                [Command.CONIC, 90, 100, 110, 120, 0.5],
                [Command.CUBIC, 130, 140, 150, 160, 170, 180],
                [Command.CLOSE],
            ];
        }

        function assertMappedCommands(grid: IsometricGrid, actual: PathCommand[], original: PathCommand[]) {
            assert.equal(actual.length, original.length);
            for (const [i, orig] of original.entries()) {
                const got = actual[i] ?? assert.fail(`missing mapped command at index ${i}`);
                assert.equal(got[0], orig[0], `command type at index ${i}`);
                switch (orig[0]) {
                    case Command.MOVE:
                    case Command.LINE: {
                        const [, x, y] = orig;
                        const expected = fromGridSpace(grid, new Point(x, y));
                        assert.equal(got.length, 3);
                        assert.equal(got[1], expected.x);
                        assert.equal(got[2], expected.y);
                        break;
                    }
                    case Command.QUAD: {
                        const [, cx, cy, x, y] = orig;
                        const expectedC = fromGridSpace(grid, new Point(cx, cy));
                        const expectedP = fromGridSpace(grid, new Point(x, y));
                        assert.equal(got.length, 5);
                        assert.equal(got[1], expectedC.x);
                        assert.equal(got[2], expectedC.y);
                        assert.equal(got[3], expectedP.x);
                        assert.equal(got[4], expectedP.y);
                        break;
                    }
                    case Command.CONIC: {
                        const [, cx, cy, x, y, weight] = orig;
                        const expectedC = fromGridSpace(grid, new Point(cx, cy));
                        const expectedP = fromGridSpace(grid, new Point(x, y));
                        assert.equal(got.length, 6);
                        assert.equal(got[1], expectedC.x);
                        assert.equal(got[2], expectedC.y);
                        assert.equal(got[3], expectedP.x);
                        assert.equal(got[4], expectedP.y);
                        assert.equal(got[5], weight, 'CONIC weight should pass through unchanged');
                        break;
                    }
                    case Command.CUBIC: {
                        const [, c1x, c1y, c2x, c2y, x, y] = orig;
                        const expectedC1 = fromGridSpace(grid, new Point(c1x, c1y));
                        const expectedC2 = fromGridSpace(grid, new Point(c2x, c2y));
                        const expectedP = fromGridSpace(grid, new Point(x, y));
                        assert.equal(got.length, 7);
                        assert.equal(got[1], expectedC1.x);
                        assert.equal(got[2], expectedC1.y);
                        assert.equal(got[3], expectedC2.x);
                        assert.equal(got[4], expectedC2.y);
                        assert.equal(got[5], expectedP.x);
                        assert.equal(got[6], expectedP.y);
                        break;
                    }
                    case Command.CLOSE: {
                        assert.deepEqual(got, [Command.CLOSE]);
                        break;
                    }
                }
            }
        }

        test('maps every outline command type from grid space to scene space, preserving order and non-coordinate fields', () => {
            const grid = makeIsometricGrid(100);
            const commands = makeSampleCommands();
            const inner = makeFakeInnerShape({ outline: commands });
            const adapter = new AxonometricShapeAdapter(grid, inner as unknown as BaseShape);

            assertMappedCommands(grid, adapter.outline, commands);
        });

        test('maps every areaPath command type from grid space to scene space, preserving order and non-coordinate fields', () => {
            const grid = makeIsometricGrid(70);
            const commands = makeSampleCommands();
            const inner = makeFakeInnerShape({ areaPath: commands });
            const adapter = new AxonometricShapeAdapter(grid, inner as unknown as BaseShape);

            assertMappedCommands(grid, adapter.areaPath, commands);
        });

        test('maps an empty outline to an empty array', () => {
            const grid = makeIsometricGrid(100);
            const inner = makeFakeInnerShape({ outline: [] });
            const adapter = new AxonometricShapeAdapter(grid, inner as unknown as BaseShape);
            assert.deepEqual(adapter.outline, []);
        });

        test('maps an empty areaPath to an empty array', () => {
            const grid = makeIsometricGrid(100);
            const inner = makeFakeInnerShape({ areaPath: [] });
            const adapter = new AxonometricShapeAdapter(grid, inner as unknown as BaseShape);
            assert.deepEqual(adapter.areaPath, []);
        });
    });

    // These compose the adapter with a real square-grid shape running on a real buildFakeSquareGrid
    // grid -- exactly what BaseTool.getShape() wires up for every isometric/dimetric room -- rather
    // than a plain fake object standing in for the inner shape.
    suite('composed with buildFakeSquareGrid and a real square-grid shape', () => {
        function makeComposedCone(grid: IsometricGrid) {
            const fakeGrid = buildFakeSquareGrid(grid);
            const inner = new ConeTemplateShape(fakeGrid, (53.1 * Math.PI) / 180, [], 0, 0, SquareDirection.ALL);
            return { fakeGrid, inner, adapter: new AxonometricShapeAdapter(grid, inner) };
        }

        test('round-trips the apex through toGridSpace/fromGridSpace so the outline starts exactly at the scene start point', () => {
            const grid = makeIsometricGrid(100);
            const { adapter } = makeComposedCone(grid);

            for (const start of [new Point(0, 0), new Point(120, -45)]) {
                adapter.start = start;
                adapter.end = start.add(new Point(300, 0));

                const [move] = adapter.outline as [[Command.MOVE, number, number], ...PathCommand[]];
                assert.ok(Math.abs(move[1] - start.x) < 1e-9, `apex.x for start ${start.toString()}`);
                assert.ok(Math.abs(move[2] - start.y) < 1e-9, `apex.y for start ${start.toString()}`);
            }
        });

        test("maps the real inner triangle's LINE endpoints back to scene space consistently with the adapter's own coordinate mapping", () => {
            const grid = makeIsometricGrid(100);
            const { inner, adapter } = makeComposedCone(grid);

            adapter.start = new Point(120, -45);
            adapter.end = new Point(420, 55);

            const [, line1, line2] = adapter.outline as [PathCommand, [Command.LINE, number, number], [Command.LINE, number, number], PathCommand];
            const [, innerLine1, innerLine2] = inner.outline as [PathCommand, [Command.LINE, number, number], [Command.LINE, number, number], PathCommand];

            const expected1 = fromGridSpace(grid, new Point(innerLine1[1], innerLine1[2]));
            const expected2 = fromGridSpace(grid, new Point(innerLine2[1], innerLine2[2]));

            assert.ok(Math.abs(line1[1] - expected1.x) < 1e-9 && Math.abs(line1[2] - expected1.y) < 1e-9, 'first LINE endpoint');
            assert.ok(Math.abs(line2[1] - expected2.x) < 1e-9 && Math.abs(line2[2] - expected2.y) < 1e-9, 'second LINE endpoint');
        });

        test('skews the real triangle asymmetrically, proving the axonometric mapping actually ran (not a passthrough)', () => {
            const grid = makeIsometricGrid(100);
            const { adapter } = makeComposedCone(grid);

            // A start away from the origin, dragged due "east" in scene space: on a plain square grid
            // this cone's two flank points would be equidistant from the apex; the isometric skew
            // breaks that symmetry (a cone dragged from the origin happens to sit exactly on the
            // isometric grid's own symmetry line, so it wouldn't demonstrate this).
            adapter.start = new Point(120, -45);
            adapter.end = new Point(420, -45);

            const [move, line1, line2] = adapter.outline as [
                [Command.MOVE, number, number],
                [Command.LINE, number, number],
                [Command.LINE, number, number],
                PathCommand,
            ];
            const apexToLine1 = Math.hypot(line1[1] - move[1], line1[2] - move[2]);
            const apexToLine2 = Math.hypot(line2[1] - move[1], line2[2] - move[2]);
            assert.notEqual(apexToLine1, apexToLine2);
        });

        test('produces real, non-empty grid cells from the fake grid that CellOutliner turns into a non-empty areaPath', () => {
            const grid = makeIsometricGrid(100);
            const { inner, adapter } = makeComposedCone(grid);

            adapter.start = new Point(0, 0);
            adapter.end = new Point(300, 0);

            assert.ok(inner.cells.length > 0, 'inner shape should have found real cells on the fake square grid');
            assert.ok(adapter.areaPath.length > 0, 'adapter should expose a non-empty mapped areaPath');
        });

        test('isValid reflects the real inner shape geometry (false when start equals end, true once dragged)', () => {
            const grid = makeIsometricGrid(100);
            const { adapter } = makeComposedCone(grid);

            adapter.start = new Point(10, 10);
            adapter.end = new Point(10, 10);
            assert.equal(adapter.isValid, false);

            adapter.end = new Point(310, 10);
            assert.equal(adapter.isValid, true);
        });
    });
});
