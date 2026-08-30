import assert from 'node:assert/strict';
import { suite, test } from 'node:test';
import { calculateArea } from './calculateArea';

suite('calculateArea', () => {
    test('returns 0 for fewer than 3 points', () => {
        assert.equal(calculateArea([]), 0);
        assert.equal(calculateArea([{ x: 0, y: 0 }]), 0);
        assert.equal(
            calculateArea([
                { x: 0, y: 0 },
                { x: 1, y: 1 },
            ]),
            0,
        );
    });

    test('returns 0 for 3 colinear points', () => {
        const area = calculateArea([
            { x: 0, y: 0 },
            { x: 5, y: 0 },
            { x: 10, y: 0 },
        ]);
        assert.equal(area, 0);
    });

    test('computes the area of a right triangle via Heron’s formula', () => {
        const area = calculateArea([
            { x: 0, y: 0 },
            { x: 4, y: 0 },
            { x: 0, y: 3 },
        ]);
        assert.ok(Math.abs(area - 6) < 1e-9);
    });

    test('computes the area of a square by fanning into triangles', () => {
        const area = calculateArea([
            { x: 0, y: 0 },
            { x: 10, y: 0 },
            { x: 10, y: 10 },
            { x: 0, y: 10 },
        ]);
        assert.ok(Math.abs(area - 100) < 1e-9);
    });
});
