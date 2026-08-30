import assert from 'node:assert/strict';
import { suite, test } from 'node:test';
import { HHexGrid, Point, VHexGrid } from '@davidsev/owlbear-utils';
import { ConeHexShape } from './ConeHexShape';

function makeHexGrid(dpi: number, orientation: 'HEX_VERTICAL' | 'HEX_HORIZONTAL' = 'HEX_VERTICAL'): VHexGrid | HHexGrid {
    const params = {
        type: orientation,
        dpi,
        style: { lineType: 'SOLID', lineOpacity: 1, lineColor: 'DARK', lineWidth: 1 },
        measurement: 'CHEBYSHEV',
        scale: '5ft',
    } as const;
    const scale = { raw: '5ft', parsed: { multiplier: 5, unit: 'ft', digits: 0 } };
    return orientation === 'HEX_VERTICAL'
        ? new VHexGrid({ ...params, type: 'HEX_VERTICAL' }, scale)
        : new HHexGrid({ ...params, type: 'HEX_HORIZONTAL' }, scale);
}

function triangular(n: number): number {
    return (n * (n + 1)) / 2;
}

suite('ConeHexShape', () => {
    const orientations: ('HEX_VERTICAL' | 'HEX_HORIZONTAL')[] = ['HEX_VERTICAL', 'HEX_HORIZONTAL'];

    const directions: { name: string; dx: number; dy: number }[] = [0, 60, 120, 180, 240, 300].map(deg => ({
        name: `${deg}deg`,
        dx: Math.cos((deg * Math.PI) / 180),
        dy: Math.sin((deg * Math.PI) / 180),
    }));

    for (const orientation of orientations) {
        for (const dir of directions) {
            for (const dpi of [100, 150]) {
                for (const lengthMultiplier of [3, 5]) {
                    test(`produces N*(N+1)/2 distinct cells for orientation "${orientation}", direction "${dir.name}", dpi=${dpi}, length multiplier=${lengthMultiplier}`, () => {
                        const grid = makeHexGrid(dpi, orientation);
                        const shape = new ConeHexShape(grid);
                        shape.start = new Point(0, 0);
                        shape.end = new Point(dir.dx * dpi * lengthMultiplier, dir.dy * dpi * lengthMultiplier);

                        const n = shape.roundedDistance / dpi;
                        assert.ok(Number.isInteger(n) && n > 0, `expected roundedDistance/dpi to be a positive whole number, got ${n}`);

                        const cells = shape.cells;
                        assert.equal(cells.length, triangular(n), `expected ${triangular(n)} cells for N=${n}, got ${cells.length}`);

                        // All cells distinct, keyed by exact axial coordinates (integers, so no float-equality concerns).
                        // `cells` is typed as `Cell[]`, but the spec documents `.axialCoords` on the concrete hex cell type.
                        const seen = new Set<string>();
                        for (const cell of cells) {
                            const axialCoords = (cell as unknown as { axialCoords: [number, number, number] }).axialCoords;
                            const key = axialCoords.join(',');
                            assert.ok(!seen.has(key), `duplicate cell axialCoords found: ${key}`);
                            seen.add(key);
                        }
                    });
                }
            }
        }
    }

    function axialKey(cell: unknown): string {
        const [a, b, c] = (cell as { axialCoords: [number, number, number] }).axialCoords;
        // Coordinates come back with float noise (e.g. 0.9999999999999999); round for comparison.
        return [a, b, c].map(n => Math.round(n)).join(',');
    }

    test('lays out the exact triangle of axial coordinates for a 3-cell cone in each of the 6 hex directions (HEX_VERTICAL)', () => {
        const grid = makeHexGrid(100, 'HEX_VERTICAL');
        const expectedByDeg: Record<number, string[]> = {
            0: ['0,0,0', '1,0,-1', '1,-1,0', '2,0,-2', '2,-1,-1', '2,-2,0', '3,0,-3', '3,-1,-2', '3,-2,-1', '3,-3,0'],
            60: ['0,0,0', '1,0,-1', '0,1,-1', '2,0,-2', '1,1,-2', '0,2,-2', '3,0,-3', '2,1,-3', '1,2,-3', '0,3,-3'],
            120: ['0,0,0', '0,1,-1', '-1,1,0', '0,2,-2', '-1,2,-1', '-2,2,0', '0,3,-3', '-1,3,-2', '-2,3,-1', '-3,3,0'],
        };

        for (const [deg, expected] of Object.entries(expectedByDeg)) {
            const shape = new ConeHexShape(grid);
            shape.start = new Point(0, 0);
            const rad = (Number(deg) * Math.PI) / 180;
            shape.end = new Point(Math.cos(rad) * 300, Math.sin(rad) * 300);

            const actual = shape.cells.map(axialKey).sort();
            assert.deepEqual(actual, [...expected].sort(), `direction ${deg}deg`);
        }
    });

    test('produces cells of the HHex class on a horizontal-hex grid', () => {
        const grid = makeHexGrid(100, 'HEX_HORIZONTAL');
        const shape = new ConeHexShape(grid);
        shape.start = new Point(0, 0);
        shape.end = new Point(300, 0);

        const cells = shape.cells;
        assert.ok(cells.length > 0);
        for (const cell of cells) {
            assert.equal(cell.constructor.name, 'HHex', `expected HHex cells on a horizontal-hex grid, got ${cell.constructor.name}`);
        }
    });

    for (const orientation of orientations) {
        test(`labelPosition equals the average center of all cells (${orientation})`, () => {
            const grid = makeHexGrid(120, orientation);
            const shape = new ConeHexShape(grid);
            shape.start = new Point(0, 0);
            shape.end = new Point(120 * 4, 0);

            const cells = shape.cells;
            assert.ok(cells.length > 0);

            const avgX = cells.reduce((sum, c) => sum + c.center.x, 0) / cells.length;
            const avgY = cells.reduce((sum, c) => sum + c.center.y, 0) / cells.length;

            assert.ok(Math.abs(shape.labelPosition.x - avgX) < 1e-6, `expected labelPosition.x=${avgX}, got ${shape.labelPosition.x}`);
            assert.ok(Math.abs(shape.labelPosition.y - avgY) < 1e-6, `expected labelPosition.y=${avgY}, got ${shape.labelPosition.y}`);
        });

        test(`outline does not throw and returns an array (${orientation})`, () => {
            const grid = makeHexGrid(100, orientation);
            const shape = new ConeHexShape(grid);
            shape.start = new Point(0, 0);
            shape.end = new Point(300, 100);

            let outline: unknown;
            assert.doesNotThrow(() => {
                outline = shape.outline;
            });
            assert.ok(Array.isArray(outline));
        });

        test(`does not throw when start equals end (${orientation})`, () => {
            const grid = makeHexGrid(100, orientation);
            const shape = new ConeHexShape(grid);
            shape.start = new Point(50, 50);
            shape.end = new Point(50, 50);

            assert.doesNotThrow(() => {
                const _cells = shape.cells;
            });
        });

        test(`cell count follows triangular-number growth as the cone gets longer, for a consistent direction (${orientation})`, () => {
            // Sweep raw drag length finely and read N off the shape itself each time (per spec: don't
            // derive/assume the rounding formula from dpi and drag length) rather than assuming any
            // particular pixel-length maps to a particular N.
            const grid = makeHexGrid(100, orientation);
            const dpi = grid.dpi;
            const countByN = new Map<number, number>();

            for (let px = dpi * 0.2; px <= dpi * 6.01; px += dpi * 0.1) {
                const shape = new ConeHexShape(grid);
                shape.start = new Point(0, 0);
                shape.end = new Point(px, 0);

                const n = shape.roundedDistance / dpi;
                assert.ok(Number.isInteger(n) && n > 0, `roundedDistance/dpi should be a positive whole number; got ${n} for a ${px}px drag`);
                assert.equal(shape.cells.length, triangular(n), `${px}px drag -> N=${n}: expected ${triangular(n)} cells, got ${shape.cells.length}`);
                if (!countByN.has(n)) countByN.set(n, shape.cells.length);
            }

            // Confirm the progression itself, against N values the shape actually produced along the sweep.
            for (const n of [1, 2, 3]) {
                assert.equal(
                    countByN.get(n),
                    triangular(n),
                    `expected some drag length in the sweep to yield N=${n} with ${triangular(n)} cells; observed N values: ${[...countByN.keys()].sort((a, b) => a - b).join(',')}`,
                );
            }
        });

        test(`works with a second, larger dpi grid (${orientation})`, () => {
            const grid = makeHexGrid(250, orientation);
            const shape = new ConeHexShape(grid);
            shape.start = new Point(0, 0);
            shape.end = new Point(0, 250 * 4);

            const n = shape.roundedDistance / grid.dpi;
            assert.ok(Number.isInteger(n) && n > 0);
            assert.equal(shape.cells.length, triangular(n));
        });
    }
});
