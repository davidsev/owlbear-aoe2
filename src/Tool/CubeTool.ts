import { BaseTool } from './BaseTool';
import { getId } from '../Utils/getId';
import { CubeTemplateShape } from '../Shape/CubeTemplateShape';
import { roomMetadata, SquareCubeStyle, SquareDirection, type StartPoint } from '../Metadata/room';
import type { BaseShape } from '../Shape/BaseShape';
import { CubeSimpleShape } from '../Shape/CubeSimpleShape';
import type { HHexGrid, SquareGrid, VHexGrid } from '@davidsev/owlbear-utils';

interface CubeSettings {
    style: SquareCubeStyle;
    startPoints: StartPoint[];
    overlapThreshold: number;
    sizeSnapping: number;
    direction: SquareDirection;
}

export class CubeTool extends BaseTool {
    readonly label = 'Cube';
    readonly icon = '/icons/cube.svg';
    readonly id = getId('cube');

    protected getHexShape(grid: VHexGrid | HHexGrid): BaseShape {
        return new CubeTemplateShape(
            grid,
            roomMetadata.data.hexCubeStartPoints,
            roomMetadata.data.hexCubeOverlapThreshold,
            roomMetadata.data.hexCubeSizeSnapping,
            SquareDirection.ALL,
        );
    }

    protected getSquareShape(grid: SquareGrid): BaseShape {
        return this.buildSquareShape(grid, {
            style: roomMetadata.data.squareCubeStyle,
            startPoints: roomMetadata.data.squareCubeStartPoints,
            overlapThreshold: roomMetadata.data.squareCubeOverlapThreshold,
            sizeSnapping: roomMetadata.data.squareCubeSizeSnapping,
            direction: roomMetadata.data.squareCubeDirection,
        });
    }

    protected getAxonometricShape(grid: SquareGrid): BaseShape {
        return this.buildSquareShape(grid, {
            style: roomMetadata.data.axonometricCubeStyle,
            startPoints: roomMetadata.data.axonometricCubeStartPoints,
            overlapThreshold: roomMetadata.data.axonometricCubeOverlapThreshold,
            sizeSnapping: roomMetadata.data.axonometricCubeSizeSnapping,
            direction: roomMetadata.data.axonometricCubeDirection,
        });
    }

    private buildSquareShape(grid: SquareGrid, settings: CubeSettings): BaseShape {
        if (settings.style === SquareCubeStyle.SQUARE) return new CubeSimpleShape(grid);
        return new CubeTemplateShape(grid, settings.startPoints, settings.overlapThreshold, settings.sizeSnapping, settings.direction);
    }
}
