import { BaseShape, cached } from './BaseShape';
import { Cell, grid, Point, SnapTo } from '@davidsev/owlbear-utils';
import { Command, PathCommand } from '@owlbear-rodeo/sdk/lib/types/items/Path';
import { Measure } from '@davidsev/owlbear-utils/js/Grid/MeasurementFunctions';

export class CirclePathfinderShape extends BaseShape {

    @cached()
    private get roundedStart (): Point {
        return grid.snapTo(this.start, SnapTo.CORNER);
    }

    @cached()
    public get roundedDistance (): number {
        return Math.round(Measure.alternatingSquare(this.roundedStart, this.end)) * grid.dpi;
    }

    @cached()
    public get labelPosition (): Point {
        return this.roundedStart;
    }

    @cached()
    public get outline (): PathCommand[] {
        return [
            [Command.MOVE, this.roundedStart.x, this.roundedStart.y + this.roundedDistance],
            [Command.CONIC, this.roundedStart.x + this.roundedDistance, this.roundedStart.y + this.roundedDistance, this.roundedStart.x + this.roundedDistance, this.roundedStart.y, Math.PI / 4],
            [Command.CONIC, this.roundedStart.x + this.roundedDistance, this.roundedStart.y - this.roundedDistance, this.roundedStart.x, this.roundedStart.y - this.roundedDistance, Math.PI / 4],
            [Command.CONIC, this.roundedStart.x - this.roundedDistance, this.roundedStart.y - this.roundedDistance, this.roundedStart.x - this.roundedDistance, this.roundedStart.y, Math.PI / 4],
            [Command.CONIC, this.roundedStart.x - this.roundedDistance, this.roundedStart.y + this.roundedDistance, this.roundedStart.x, this.roundedStart.y + this.roundedDistance, Math.PI / 4],
        ];
    }

    @cached()
    public get cells (): Cell[] {

        // Work out the bounding area of the circle.
        const boundingSquare = [
            grid.getCell(this.roundedStart.add({ x: -this.roundedDistance, y: -this.roundedDistance })),
            grid.getCell(this.roundedStart.add({ x: this.roundedDistance, y: -this.roundedDistance })),
            grid.getCell(this.roundedStart.add({ x: this.roundedDistance, y: this.roundedDistance })),
            grid.getCell(this.roundedStart.add({ x: -this.roundedDistance, y: this.roundedDistance })),
        ];

        // Check every square.
        const cells: Cell[] = [];
        for (const cell of grid.iterateCellsBoundingPoints(boundingSquare)) {
            // Find which corner is farthest from the center, and check if it's within the circle.
            const distances = cell.corners.map(corner => Measure.alternatingSquare(this.roundedStart, corner));
            const maxDistance = Math.max(...distances);
            if (maxDistance * grid.dpi <= this.roundedDistance)
                cells.push(cell);
        }

        return cells;
    }
}
