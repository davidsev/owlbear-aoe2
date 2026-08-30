import assert from 'node:assert/strict';
import { suite, test } from 'node:test';
import { DimetricGrid, IsometricGrid } from '@davidsev/owlbear-utils';
import { buildFakeSquareGrid } from './buildFakeSquareGrid';

function makeIsometricGrid(dpi: number, measurement: 'CHEBYSHEV' | 'MANHATTAN' = 'CHEBYSHEV', scale = '5ft'): IsometricGrid {
    return new IsometricGrid(
        {
            type: 'ISOMETRIC',
            dpi,
            style: { lineType: 'SOLID', lineOpacity: 1, lineColor: 'DARK', lineWidth: 1 },
            measurement,
            scale,
        },
        { raw: scale, parsed: { multiplier: 5, unit: 'ft', digits: 0 } },
    );
}

function makeDimetricGrid(dpi: number, measurement: 'CHEBYSHEV' | 'MANHATTAN' = 'CHEBYSHEV', scale = '5ft'): DimetricGrid {
    return new DimetricGrid(
        {
            type: 'DIMETRIC',
            dpi,
            style: { lineType: 'DASHED', lineOpacity: 0.5, lineColor: 'LIGHT', lineWidth: 2 },
            measurement,
            scale,
        },
        { raw: scale, parsed: { multiplier: 5, unit: 'ft', digits: 0 } },
    );
}

suite('buildFakeSquareGrid', () => {
    test('copies type, dpi, style, measurement, scale and gridScale from an IsometricGrid (dpi=100)', () => {
        const source = makeIsometricGrid(100, 'CHEBYSHEV', '5ft');
        const fake = buildFakeSquareGrid(source);

        assert.equal(fake.type, 'SQUARE');
        assert.equal(fake.dpi, source.dpi);
        assert.deepEqual(fake.style, source.style);
        assert.equal(fake.measurement, source.measurement);
        assert.equal(fake.scale, source.scale);
        assert.deepEqual(fake.gridScale, source.gridScale);
    });

    test('copies properties from an IsometricGrid with a different dpi and measurement (dpi=140, MANHATTAN)', () => {
        const source = makeIsometricGrid(140, 'MANHATTAN', '10ft');
        const fake = buildFakeSquareGrid(source);

        assert.equal(fake.type, 'SQUARE');
        assert.equal(fake.dpi, 140);
        assert.deepEqual(fake.style, source.style);
        assert.equal(fake.measurement, 'MANHATTAN');
        assert.equal(fake.scale, source.scale);
        assert.deepEqual(fake.gridScale, source.gridScale);
    });

    test('copies properties from a DimetricGrid, proving nothing is hardcoded to isometric grids', () => {
        const source = makeDimetricGrid(75, 'CHEBYSHEV', '5ft');
        const fake = buildFakeSquareGrid(source);

        assert.equal(fake.type, 'SQUARE');
        assert.equal(fake.dpi, source.dpi);
        assert.deepEqual(fake.style, source.style);
        assert.equal(fake.measurement, source.measurement);
        assert.equal(fake.scale, source.scale);
        assert.deepEqual(fake.gridScale, source.gridScale);
    });

    test('returns a genuine, usable SquareGrid whose cells are consistent with the given dpi', () => {
        const source = makeIsometricGrid(100, 'CHEBYSHEV', '5ft');
        const fake = buildFakeSquareGrid(source);

        const cell = fake.getCell({ x: 10, y: 10 });

        assert.doesNotThrow(() => fake.getCell({ x: 10, y: 10 }));
        assert.equal(cell.center.x, 50);
        assert.equal(cell.center.y, 50);
    });
});
