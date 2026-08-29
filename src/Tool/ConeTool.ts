import { BaseTool } from './BaseTool';
import { getId } from '../Utils/getId';
import { ConeTemplateShape } from '../Shape/ConeTemplateShape';
import { HexConeStyle, roomMetadata, SquareConeStyle, SquareDirection } from '../Metadata/room';
import { ConePathfinderShape } from '../Shape/ConePathfinderShape';
import type { BaseShape } from '../Shape/BaseShape';
import { ConeTokenShape } from '../Shape/ConeTokenShape';
import { grid } from '@davidsev/owlbear-utils';
import { ConeHexShape } from '../Shape/ConeHexShape';
import { AxonometricShapeAdapter } from '../Shape/AxonometricShapeAdapter';
import { buildFakeSquareGrid } from '../Utils/buildFakeSquareGrid';

export class ConeTool extends BaseTool {
    readonly label = 'Cone';
    readonly icon = '/icons/cone.svg';
    readonly id = getId('cone');

    protected getShape(): BaseShape {
        const gridSnapshot = grid.snapshot;
        if (gridSnapshot.type === 'HEX_HORIZONTAL' || gridSnapshot.type === 'HEX_VERTICAL') {
            if (roomMetadata.data.hexConeStyle === HexConeStyle.EQUILATERAL) {
                return new ConeHexShape(gridSnapshot);
            } else {
                return new ConeTemplateShape(
                    gridSnapshot,
                    ((roomMetadata.data.hexConeWidth % 180) * Math.PI) / 180,
                    roomMetadata.data.hexConeStartPoints,
                    roomMetadata.data.hexConeOverlapThreshold,
                    roomMetadata.data.hexConeSizeSnapping,
                    SquareDirection.ALL,
                );
            }
        } else if (gridSnapshot.type === 'ISOMETRIC' || gridSnapshot.type === 'DIMETRIC') {
            const squareGrid = buildFakeSquareGrid(gridSnapshot);
            let shape: BaseShape;
            if (roomMetadata.data.axonometricConeStyle === SquareConeStyle.PATHFINDER) {
                shape = new ConePathfinderShape(squareGrid);
            } else if (roomMetadata.data.axonometricConeStyle === SquareConeStyle.TOKEN) {
                shape = new ConeTokenShape(squareGrid);
            } else {
                // TEMPLATE
                shape = new ConeTemplateShape(
                    squareGrid,
                    (((roomMetadata.data.axonometricConeWidth || 53.1) % 180) * Math.PI) / 180,
                    roomMetadata.data.axonometricConeStartPoints,
                    roomMetadata.data.axonometricConeOverlapThreshold,
                    roomMetadata.data.axonometricConeSizeSnapping,
                    roomMetadata.data.axonometricConeDirection,
                );
            }
            return new AxonometricShapeAdapter(gridSnapshot, shape);
        } else {
            if (roomMetadata.data.squareConeStyle === SquareConeStyle.PATHFINDER) {
                return new ConePathfinderShape(gridSnapshot);
            } else if (roomMetadata.data.squareConeStyle === SquareConeStyle.TOKEN) {
                return new ConeTokenShape(gridSnapshot);
            } else {
                // TEMPLATE
                return new ConeTemplateShape(
                    gridSnapshot,
                    (((roomMetadata.data.squareConeWidth || 53.1) % 180) * Math.PI) / 180,
                    roomMetadata.data.squareConeStartPoints,
                    roomMetadata.data.squareConeOverlapThreshold,
                    roomMetadata.data.squareConeSizeSnapping,
                    roomMetadata.data.squareConeDirection,
                );
            }
        }
    }
}
