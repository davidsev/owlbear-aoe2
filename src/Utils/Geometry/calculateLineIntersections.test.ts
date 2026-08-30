import assert from 'node:assert/strict';
import { suite, test } from 'node:test';
import { LineSegment } from '@davidsev/owlbear-utils';
import { calculateLineIntersections } from './calculateLineIntersections';

suite('calculateLineIntersections', () => {
    test('finds the single intersection of two crossing segments', () => {
        const a = new LineSegment({ x: 0, y: 0 }, { x: 10, y: 10 });
        const b = new LineSegment({ x: 0, y: 10 }, { x: 10, y: 0 });
        const points = calculateLineIntersections(a, b);
        assert.equal(points.length, 1);
        const [point] = points;
        assert.ok(point);
        assert.ok(Math.abs(point.x - 5) < 1e-9);
        assert.ok(Math.abs(point.y - 5) < 1e-9);
    });

    test('returns nothing for segments that would cross if extended, but do not overlap', () => {
        const a = new LineSegment({ x: 0, y: 0 }, { x: 1, y: 1 });
        const b = new LineSegment({ x: 5, y: 0 }, { x: 6, y: -1 });
        assert.deepEqual(calculateLineIntersections(a, b), []);
    });

    test('returns nothing for parallel, non-colinear segments', () => {
        const a = new LineSegment({ x: 0, y: 0 }, { x: 10, y: 0 });
        const b = new LineSegment({ x: 0, y: 5 }, { x: 10, y: 5 });
        assert.deepEqual(calculateLineIntersections(a, b), []);
    });

    test('returns nothing for colinear, non-overlapping segments', () => {
        const a = new LineSegment({ x: 0, y: 0 }, { x: 5, y: 0 });
        const b = new LineSegment({ x: 10, y: 0 }, { x: 15, y: 0 });
        assert.deepEqual(calculateLineIntersections(a, b), []);
    });

    test('returns both endpoints of a colinear segment fully contained within the other', () => {
        const a = new LineSegment({ x: 0, y: 0 }, { x: 20, y: 0 });
        const b = new LineSegment({ x: 5, y: 0 }, { x: 15, y: 0 });
        const points = calculateLineIntersections(a, b);
        assert.equal(points.length, 2);
        const [first, second] = points;
        assert.ok(first);
        assert.ok(second);
        assert.ok(Math.abs(first.x - 5) < 1e-9);
        assert.ok(Math.abs(second.x - 15) < 1e-9);
    });

    test('returns only the point within bounds for colinear segments that partially overlap', () => {
        const a = new LineSegment({ x: 0, y: 0 }, { x: 10, y: 0 });
        const b = new LineSegment({ x: 5, y: 0 }, { x: 15, y: 0 });
        const points = calculateLineIntersections(a, b);
        assert.equal(points.length, 1);
        const [point] = points;
        assert.ok(point);
        assert.ok(Math.abs(point.x - 5) < 1e-9);
    });

    test('returns nothing when the would-be intersection is outside the other segment’s bounds', () => {
        const a = new LineSegment({ x: 0, y: 0 }, { x: 10, y: 0 });
        const b = new LineSegment({ x: 4, y: 5 }, { x: 4, y: 6 });
        assert.deepEqual(calculateLineIntersections(a, b), []);
    });
});
