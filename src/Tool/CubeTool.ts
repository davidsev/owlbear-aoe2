import { BaseTool } from './BaseTool';
import { getId } from '../Utils/getId';
import { CubeTemplateShape } from '../Shape/CubeTemplateShape';
import { roomMetadata, SquareCubeStyle, SquareDirection } from '../Metadata/room';
import { BaseShape } from '../Shape/BaseShape';
import { CubeSimpleShape } from '../Shape/CubeSimpleShape';
import { grid } from '@davidsev/owlbear-utils';

export class CubeTool extends BaseTool {

    readonly label = 'Cube';
    readonly icon = '/icons/cube.svg';
    readonly id = getId('cube');

    protected getShape (): BaseShape {
        if (grid.type == 'HEX_HORIZONTAL' || grid.type == 'HEX_VERTICAL') {
            return new CubeTemplateShape(
                roomMetadata.data.hexCubeStartPoints,
                roomMetadata.data.hexCubeOverlapThreshold,
                roomMetadata.data.hexCubeSizeSnapping,
                SquareDirection.ALL,
            );
        } else {
            if (roomMetadata.data.squareCubeStyle == SquareCubeStyle.SQUARE) {
                return new CubeSimpleShape();
            } else { // TEMPLATE
                return new CubeTemplateShape(
                    roomMetadata.data.squareCubeStartPoints,
                    roomMetadata.data.squareCubeOverlapThreshold,
                    roomMetadata.data.squareCubeSizeSnapping,
                    roomMetadata.data.squareCubeDirection,
                );
            }
        }
    }
}
