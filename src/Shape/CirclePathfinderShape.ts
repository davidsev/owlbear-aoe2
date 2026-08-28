import { BaseShape, cached } from './BaseShape';
import { type Cell, type Point, SnapTo } from '@davidsev/owlbear-utils';
import { Command, type PathCommand } from '@owlbear-rodeo/sdk/lib/types/items/Path';

export class CirclePathfinderShape extends BaseShape {
    // D&D 5e's alternating diagonal rule: every other diagonal move costs double.  This is
    // independent of the scene's configured measurement style, so we override it here regardless.
    @cached()
    private get alternatingGrid() {
        return this.grid.withMeasurement('ALTERNATING');
    }

    @cached()
    private get roundedStart(): Point {
        return this.grid.snapTo(this.start, SnapTo.CORNER);
    }

    @cached()
    public get roundedDistance(): number {
        return Math.round(this.alternatingGrid.measure(this.roundedStart, this.end)) * this.grid.dpi;
    }

    @cached()
    public get labelPosition(): Point {
        return this.roundedStart;
    }

    @cached()
    public get outline(): PathCommand[] {
        return [
            [Command.MOVE, this.roundedStart.x, this.roundedStart.y + this.roundedDistance],
            [
                Command.CONIC,
                this.roundedStart.x + this.roundedDistance,
                this.roundedStart.y + this.roundedDistance,
                this.roundedStart.x + this.roundedDistance,
                this.roundedStart.y,
                Math.PI / 4,
            ],
            [
                Command.CONIC,
                this.roundedStart.x + this.roundedDistance,
                this.roundedStart.y - this.roundedDistance,
                this.roundedStart.x,
                this.roundedStart.y - this.roundedDistance,
                Math.PI / 4,
            ],
            [
                Command.CONIC,
                this.roundedStart.x - this.roundedDistance,
                this.roundedStart.y - this.roundedDistance,
                this.roundedStart.x - this.roundedDistance,
                this.roundedStart.y,
                Math.PI / 4,
            ],
            [
                Command.CONIC,
                this.roundedStart.x - this.roundedDistance,
                this.roundedStart.y + this.roundedDistance,
                this.roundedStart.x,
                this.roundedStart.y + this.roundedDistance,
                Math.PI / 4,
            ],
        ];
    }

    @cached()
    public get cells(): Cell[] {
        // Work out the bounding area of the circle.
        const boundingSquare = [
            this.grid.getCell(this.roundedStart.add({ x: -this.roundedDistance, y: -this.roundedDistance })),
            this.grid.getCell(this.roundedStart.add({ x: this.roundedDistance, y: -this.roundedDistance })),
            this.grid.getCell(this.roundedStart.add({ x: this.roundedDistance, y: this.roundedDistance })),
            this.grid.getCell(this.roundedStart.add({ x: -this.roundedDistance, y: this.roundedDistance })),
        ];

        // Check every square.
        const cells: Cell[] = [];
        for (const cell of this.grid.iterateCellsBoundingPoints(boundingSquare)) {
            // Find which corner is farthest from the center, and check if it's within the circle.
            const distances = cell.corners.map(corner => this.alternatingGrid.measure(this.roundedStart, corner));
            const maxDistance = Math.max(...distances);
            if (maxDistance * this.grid.dpi <= this.roundedDistance) cells.push(cell);
        }

        return cells;
    }
}
