import assert from 'node:assert/strict';
import { suite, test } from 'node:test';
import { cross, dot } from './vectorFunctions';

suite('dot', () => {
    test('multiplies and sums components', () => {
        assert.equal(dot({ x: 2, y: 3 }, { x: 4, y: 5 }), 2 * 4 + 3 * 5);
    });

    test('is zero for perpendicular vectors', () => {
        assert.equal(dot({ x: 1, y: 0 }, { x: 0, y: 1 }), 0);
    });
});

suite('cross', () => {
    test('computes the 2D cross product', () => {
        assert.equal(cross({ x: 2, y: 3 }, { x: 4, y: 5 }), 2 * 5 - 3 * 4);
    });

    test('is zero for parallel vectors', () => {
        assert.equal(cross({ x: 2, y: 4 }, { x: 1, y: 2 }), 0);
    });
});
