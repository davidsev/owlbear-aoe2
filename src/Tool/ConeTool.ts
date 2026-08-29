import { BaseTool } from './BaseTool';
import { getId } from '../Utils/getId';
import { ConeTemplateShape } from '../Shape/ConeTemplateShape';
import { HexConeStyle, roomMetadata, SquareConeStyle, SquareDirection, type StartPoint } from '../Metadata/room';
import { ConePathfinderShape } from '../Shape/ConePathfinderShape';
import type { BaseShape } from '../Shape/BaseShape';
import { ConeTokenShape } from '../Shape/ConeTokenShape';
import type { HHexGrid, SquareGrid, VHexGrid } from '@davidsev/owlbear-utils';
import { ConeHexShape } from '../Shape/ConeHexShape';

interface ConeSettings {
    style: SquareConeStyle;
    widthRads: number;
    startPoints: StartPoint[];
    overlapThreshold: number;
    sizeSnapping: number;
    direction: SquareDirection;
}

function coneWidthRads(degrees: number): number {
    return ((degrees % 180) * Math.PI) / 180;
}

export class ConeTool extends BaseTool {
    readonly label = 'Cone';
    readonly icon = '/icons/cone.svg';
    readonly id = getId('cone');

    protected getHexShape(grid: VHexGrid | HHexGrid): BaseShape {
        if (roomMetadata.data.hexConeStyle === HexConeStyle.EQUILATERAL) return new ConeHexShape(grid);
        return new ConeTemplateShape(
            grid,
            coneWidthRads(roomMetadata.data.hexConeWidth),
            roomMetadata.data.hexConeStartPoints,
            roomMetadata.data.hexConeOverlapThreshold,
            roomMetadata.data.hexConeSizeSnapping,
            SquareDirection.ALL,
        );
    }

    protected getSquareShape(grid: SquareGrid): BaseShape {
        return this.buildSquareShape(grid, {
            style: roomMetadata.data.squareConeStyle,
            widthRads: coneWidthRads(roomMetadata.data.squareConeWidth || 53.1),
            startPoints: roomMetadata.data.squareConeStartPoints,
            overlapThreshold: roomMetadata.data.squareConeOverlapThreshold,
            sizeSnapping: roomMetadata.data.squareConeSizeSnapping,
            direction: roomMetadata.data.squareConeDirection,
        });
    }

    protected getAxonometricShape(grid: SquareGrid): BaseShape {
        return this.buildSquareShape(grid, {
            style: roomMetadata.data.axonometricConeStyle,
            widthRads: coneWidthRads(roomMetadata.data.axonometricConeWidth || 53.1),
            startPoints: roomMetadata.data.axonometricConeStartPoints,
            overlapThreshold: roomMetadata.data.axonometricConeOverlapThreshold,
            sizeSnapping: roomMetadata.data.axonometricConeSizeSnapping,
            direction: roomMetadata.data.axonometricConeDirection,
        });
    }

    private buildSquareShape(grid: SquareGrid, settings: ConeSettings): BaseShape {
        switch (settings.style) {
            case SquareConeStyle.PATHFINDER:
                return new ConePathfinderShape(grid);
            case SquareConeStyle.TOKEN:
                return new ConeTokenShape(grid);
            default:
                return new ConeTemplateShape(
                    grid,
                    settings.widthRads,
                    settings.startPoints,
                    settings.overlapThreshold,
                    settings.sizeSnapping,
                    settings.direction,
                );
        }
    }
}
