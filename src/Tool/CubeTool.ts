import { BaseTool } from './BaseTool';
import { getId } from '../Utils/getId';
import { CubeTemplateShape } from '../Shape/CubeTemplateShape';
import { roomMetadata, SquareCubeStyle, SquareDirection } from '../Metadata/room';
import type { BaseShape } from '../Shape/BaseShape';
import { CubeSimpleShape } from '../Shape/CubeSimpleShape';
import { grid } from '@davidsev/owlbear-utils';
import { AxonometricShapeAdapter } from '../Shape/AxonometricShapeAdapter';
import { buildFakeSquareGrid } from '../Utils/buildFakeSquareGrid';

export class CubeTool extends BaseTool {
    readonly label = 'Cube';
    readonly icon = '/icons/cube.svg';
    readonly id = getId('cube');

    protected getShape(): BaseShape {
        const gridSnapshot = grid.snapshot;
        if (gridSnapshot.type === 'HEX_HORIZONTAL' || gridSnapshot.type === 'HEX_VERTICAL') {
            return new CubeTemplateShape(
                gridSnapshot,
                roomMetadata.data.hexCubeStartPoints,
                roomMetadata.data.hexCubeOverlapThreshold,
                roomMetadata.data.hexCubeSizeSnapping,
                SquareDirection.ALL,
            );
        } else if (gridSnapshot.type === 'ISOMETRIC' || gridSnapshot.type === 'DIMETRIC') {
            const squareGrid = buildFakeSquareGrid(gridSnapshot);
            let shape: BaseShape;
            if (roomMetadata.data.axonometricCubeStyle === SquareCubeStyle.SQUARE) {
                shape = new CubeSimpleShape(squareGrid);
            } else {
                // TEMPLATE
                shape = new CubeTemplateShape(
                    squareGrid,
                    roomMetadata.data.axonometricCubeStartPoints,
                    roomMetadata.data.axonometricCubeOverlapThreshold,
                    roomMetadata.data.axonometricCubeSizeSnapping,
                    roomMetadata.data.axonometricCubeDirection,
                );
            }
            return new AxonometricShapeAdapter(gridSnapshot, shape);
        } else {
            if (roomMetadata.data.squareCubeStyle === SquareCubeStyle.SQUARE) {
                return new CubeSimpleShape(gridSnapshot);
            } else {
                // TEMPLATE
                return new CubeTemplateShape(
                    gridSnapshot,
                    roomMetadata.data.squareCubeStartPoints,
                    roomMetadata.data.squareCubeOverlapThreshold,
                    roomMetadata.data.squareCubeSizeSnapping,
                    roomMetadata.data.squareCubeDirection,
                );
            }
        }
    }
}
