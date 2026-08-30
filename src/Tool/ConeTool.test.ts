import assert from 'node:assert/strict';
import { suite, test } from 'node:test';
import { coneWidthRads, MAX_CONE_WIDTH_DEGREES, MIN_CONE_WIDTH_DEGREES } from './ConeTool';

suite('coneWidthRads', () => {
    test('converts a normal width in the middle of the range to radians', () => {
        assert.ok(Math.abs(coneWidthRads(90) - Math.PI / 2) < 1e-9);
    });

    test('never returns 0 (a degenerate, invisible cone) for 180 degrees', () => {
        // Previously computed via `degrees % 180`, which turns exactly 180 into 0.
        assert.notEqual(coneWidthRads(180), 0);
    });

    test('never returns 0 (a degenerate, invisible cone) for 360 degrees', () => {
        // Previously computed via `degrees % 180`, which turns exactly 360 into 0.
        assert.notEqual(coneWidthRads(360), 0);
    });

    test('clamps values at or above 180 degrees to the max allowed width', () => {
        assert.equal(coneWidthRads(180), (MAX_CONE_WIDTH_DEGREES * Math.PI) / 180);
        assert.equal(coneWidthRads(360), (MAX_CONE_WIDTH_DEGREES * Math.PI) / 180);
        assert.equal(coneWidthRads(1000), (MAX_CONE_WIDTH_DEGREES * Math.PI) / 180);
    });

    test('clamps non-positive values to the min allowed width, rather than producing a 0-radian cone', () => {
        assert.equal(coneWidthRads(0), (MIN_CONE_WIDTH_DEGREES * Math.PI) / 180);
        assert.equal(coneWidthRads(-45), (MIN_CONE_WIDTH_DEGREES * Math.PI) / 180);
    });
});
