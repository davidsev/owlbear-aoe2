import assert from 'node:assert/strict';
import { suite, test } from 'node:test';
import { sortPointsClockwise } from './sortPointsClockwise';

suite('sortPointsClockwise', () => {
    test('sorts the corners of a square into clockwise order, starting anywhere', () => {
        const topLeft = { x: 0, y: 0 };
        const topRight = { x: 10, y: 0 };
        const bottomRight = { x: 10, y: 10 };
        const bottomLeft = { x: 0, y: 10 };

        const sorted = sortPointsClockwise([bottomRight, topLeft, bottomLeft, topRight]);

        // Whatever the starting point, walking the result in order should always turn the same way (clockwise
        // in screen space, where y increases downward), i.e. consecutive edges keep a consistent sign of turn.
        const cross = (a: typeof topLeft, b: typeof topLeft, c: typeof topLeft) => (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);

        for (let i = 0; i < sorted.length; i++) {
            const a = sorted[i] as typeof topLeft;
            const b = sorted[(i + 1) % sorted.length] as typeof topLeft;
            const c = sorted[(i + 2) % sorted.length] as typeof topLeft;
            assert.ok(cross(a, b, c) > 0);
        }

        assert.equal(sorted.length, 4);
        for (const point of [topLeft, topRight, bottomRight, bottomLeft]) {
            assert.ok(sorted.some(p => p.x === point.x && p.y === point.y));
        }
    });

    test('preserves cyclic order for an already-sorted set of points', () => {
        const points = [
            { x: 0, y: -10 },
            { x: 10, y: 0 },
            { x: 0, y: 10 },
            { x: -10, y: 0 },
        ];
        const sorted = sortPointsClockwise([...points]);

        // The function may rotate which point comes first, but shouldn't reorder them relative to each other.
        const startIndex = points.findIndex(p => p.x === sorted[0]?.x && p.y === sorted[0]?.y);
        const rotated = [...points.slice(startIndex), ...points.slice(0, startIndex)];
        assert.deepEqual(sorted, rotated);
    });
});
