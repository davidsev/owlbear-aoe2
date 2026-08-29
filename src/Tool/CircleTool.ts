import { BaseTool } from './BaseTool';
import { getId } from '../Utils/getId';
import { CircleTemplateShape } from '../Shape/CircleTemplateShape';
import { roomMetadata, SquareCircleStyle, type StartPoint } from '../Metadata/room';
import type { HHexGrid, SquareGrid, VHexGrid } from '@davidsev/owlbear-utils';
import { CirclePathfinderShape } from '../Shape/CirclePathfinderShape';
import type { BaseShape } from '../Shape/BaseShape';

export class CircleTool extends BaseTool {
    readonly label = 'Circle';
    readonly icon = '/icons/circle.svg';
    readonly id = getId('circle');

    protected getHexShape(grid: VHexGrid | HHexGrid): BaseShape {
        return new CircleTemplateShape(grid, roomMetadata.data.hexCircleStartPoints, roomMetadata.data.hexCircleSizeSnapping);
    }

    protected getSquareShape(grid: SquareGrid): BaseShape {
        return this.buildSquareShape(
            grid,
            roomMetadata.data.squareCircleStyle,
            roomMetadata.data.squareCircleStartPoints,
            roomMetadata.data.squareCircleSizeSnapping,
        );
    }

    protected getAxonometricShape(grid: SquareGrid): BaseShape {
        return this.buildSquareShape(
            grid,
            roomMetadata.data.axonometricCircleStyle,
            roomMetadata.data.axonometricCircleStartPoints,
            roomMetadata.data.axonometricCircleSizeSnapping,
        );
    }

    private buildSquareShape(grid: SquareGrid, style: SquareCircleStyle, startPoints: StartPoint[], sizeSnapping: number): BaseShape {
        if (style === SquareCircleStyle.PATHFINDER) return new CirclePathfinderShape(grid);
        return new CircleTemplateShape(grid, startPoints, sizeSnapping);
    }
}
