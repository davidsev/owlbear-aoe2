import { BaseTool } from './BaseTool';
import { getId } from '../Utils/getId';
import { CubeTemplateShape } from '../Shape/CubeTemplateShape';
import { roomMetadata, SquareCubeStyle, SquareDirection } from '../Metadata/room';
import type { BaseShape } from '../Shape/BaseShape';
import { CubeSimpleShape } from '../Shape/CubeSimpleShape';
import { grid } from '@davidsev/owlbear-utils';

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
