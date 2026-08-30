import assert from 'node:assert/strict';
import { suite, test } from 'node:test';
import { calculateCenter } from './calculateCenter';

suite('calculateCenter', () => {
    test('averages the points of a square', () => {
        const center = calculateCenter([
            { x: 0, y: 0 },
            { x: 10, y: 0 },
            { x: 10, y: 10 },
            { x: 0, y: 10 },
        ]);
        assert.equal(center.x, 5);
        assert.equal(center.y, 5);
    });

    test('returns the point itself for a single point', () => {
        const center = calculateCenter([{ x: 3, y: 7 }]);
        assert.equal(center.x, 3);
        assert.equal(center.y, 7);
    });
});
