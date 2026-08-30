import assert from 'node:assert/strict';
import { suite, test } from 'node:test';
import { Triangle } from './Triangle';

suite('Triangle.containsPoint', () => {
    const triangle = new Triangle({ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 0, y: 10 });

    test('is true for a point inside the triangle', () => {
        assert.equal(triangle.containsPoint({ x: 2, y: 2 }), true);
    });

    test('is false for a point outside the triangle', () => {
        assert.equal(triangle.containsPoint({ x: 9, y: 9 }), false);
    });

    test('is false for a point on the far side of the hypotenuse', () => {
        assert.equal(triangle.containsPoint({ x: 6, y: 6 }), false);
    });
});
