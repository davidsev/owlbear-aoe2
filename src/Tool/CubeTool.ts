import { BaseTool } from './BaseTool';
import { getId } from '../Utils/getId';
import { CubeTemplateShape } from '../Shape/CubeTemplateShape';
import { roomMetadata, SquareCubeStyle } from '../Metadata/room';
import { BaseShape } from '../Shape/BaseShape';
import { CubeSimpleShape } from '../Shape/CubeSimpleShape';

export class CubeTool extends BaseTool {

    readonly label = 'Cube';
    readonly icon = '/icons/cube.svg';
    readonly id = getId('cube');

    protected getShape (): BaseShape {
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
