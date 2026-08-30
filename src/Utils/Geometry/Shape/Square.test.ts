import assert from 'node:assert/strict';
import { suite, test } from 'node:test';
import { Square } from './Square';

suite('Square (axis-aligned)', () => {
    const square = new Square({ x: 0, y: 0 }, { x: 10, y: 10 });

    test('is detected as an AABB', () => {
        assert.equal(square.isAABB, true);
    });

    test('contains a point in the middle', () => {
        assert.equal(square.containsPoint({ x: 5, y: 5 }), true);
    });

    test('contains points on the boundary', () => {
        assert.equal(square.containsPoint({ x: 0, y: 5 }), true);
        assert.equal(square.containsPoint({ x: 10, y: 5 }), true);
    });

    test('does not contain a point outside', () => {
        assert.equal(square.containsPoint({ x: 15, y: 5 }), false);
        assert.equal(square.containsPoint({ x: -1, y: 5 }), false);
    });
});

suite('Square (rotated)', () => {
    // A square rotated 45 degrees: corners at the compass points of a diamond.
    const square = new Square({ x: 0, y: -10 }, { x: 0, y: 10 });

    test('is not detected as an AABB', () => {
        assert.equal(square.isAABB, false);
    });

    test('contains the center', () => {
        assert.equal(square.containsPoint({ x: 0, y: 0 }), true);
    });

    test('does not contain a point outside the diamond but inside its bounding box', () => {
        assert.equal(square.containsPoint({ x: 9, y: 9 }), false);
    });

    test('does not contain a point far outside', () => {
        assert.equal(square.containsPoint({ x: 100, y: 100 }), false);
    });
});
