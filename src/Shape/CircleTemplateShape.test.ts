import assert from 'node:assert/strict';
import { suite, test } from 'node:test';
import { Point, SquareGrid } from '@davidsev/owlbear-utils';
import { StartPoint } from '../Metadata/room';
import { CircleTemplateShape } from './CircleTemplateShape';

function makeGrid(dpi: number): SquareGrid {
    return new SquareGrid(
        {
            type: 'SQUARE',
            dpi,
            style: { lineType: 'SOLID', lineOpacity: 1, lineColor: 'DARK', lineWidth: 1 },
            measurement: 'CHEBYSHEV',
            scale: '5ft',
        },
        { raw: '5ft', parsed: { multiplier: 5, unit: 'ft', digits: 0 } },
    );
}

suite('CircleTemplateShape', () => {
    test('snaps distance to the nearest cell size and covers the expected diamond of cells', () => {
        const grid = makeGrid(100);
        const shape = new CircleTemplateShape(grid, [StartPoint.CORNER], 1);
        shape.start = new Point(0, 0);
        shape.end = new Point(200, 0);

        assert.equal(shape.roundedDistance, 200);
        assert.equal(shape.labelPosition.x, 0);
        assert.equal(shape.labelPosition.y, 0);

        const centers = new Set(shape.cells.map(cell => cell.center.toString()));
        assert.equal(centers.size, 12);

        // The 8 cells whose centers are closest to the origin (within one grid step diagonally)
        // are always included; the corners of the bounding box (eg. (150, 150)) are excluded
        // because they fall outside the circle's radius.
        for (const included of [
            { x: -50, y: -50 },
            { x: -50, y: 50 },
            { x: 50, y: -50 },
            { x: 50, y: 50 },
            { x: -150, y: -50 },
            { x: -150, y: 50 },
            { x: 150, y: -50 },
            { x: 150, y: 50 },
        ]) {
            assert.ok(centers.has(new Point(included).toString()), `expected ${new Point(included)} to be covered`);
        }

        for (const excluded of [
            { x: 150, y: 150 },
            { x: -150, y: 150 },
            { x: 150, y: -150 },
            { x: -150, y: -150 },
        ]) {
            assert.ok(!centers.has(new Point(excluded).toString()), `expected ${new Point(excluded)} not to be covered`);
        }
    });

    test('rounds the distance down/up to the nearest sizeSnapping step', () => {
        const grid = makeGrid(100);
        const shape = new CircleTemplateShape(grid, [], 1);
        shape.start = new Point(0, 0);
        shape.end = new Point(240, 0);

        // 240 is closer to 200 than 300 given a 100-unit (1 cell) snapping step.
        assert.equal(shape.roundedDistance, 200);
    });

    test('snaps the start point to the nearest allowed grid point before measuring the radius', () => {
        const grid = makeGrid(100);
        const shape = new CircleTemplateShape(grid, [StartPoint.CORNER], 1);
        // (80, 80) is inside cell (0,0)-(100,100), closer to corner (100, 100) than (0, 0).
        shape.start = new Point(80, 80);
        shape.end = new Point(280, 80);

        // The radius is measured from the snapped corner (100, 100), not from the raw start point.
        assert.equal(shape.labelPosition.x, 100);
        assert.equal(shape.labelPosition.y, 100);
        assert.equal(shape.roundedDistance, 200);

        const centers = new Set(shape.cells.map(cell => cell.center.toString()));
        // These are relative to the snapped start (100, 100), not the raw start (80, 80).
        assert.ok(centers.has(new Point({ x: 250, y: 150 }).toString()));
        assert.ok(!centers.has(new Point({ x: 250, y: 250 }).toString()));
    });

    test('does not snap the distance when sizeSnapping is 0', () => {
        const grid = makeGrid(100);
        const shape = new CircleTemplateShape(grid, [], 0);
        shape.start = new Point(0, 0);
        shape.end = new Point(240, 0);

        assert.equal(shape.roundedDistance, shape.distance);
    });
});
