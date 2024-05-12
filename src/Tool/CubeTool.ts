import { BaseTool } from './BaseTool';
import { getId } from '../Utils/getId';
import { CubeTemplateShape } from '../Shape/CubeTemplateShape';
import { CubeStyle, roomMetadata } from '../Metadata/room';
import { BaseShape } from '../Shape/BaseShape';
import { CubeSimpleShape } from '../Shape/CubeSimpleShape';

export class CubeTool extends BaseTool {

    readonly label = 'Cube';
    readonly icon = '/icons/cube.svg';
    readonly id = getId('cube');

    protected getShape (): BaseShape {
        if (roomMetadata.data.squareCubeStyle == CubeStyle.SQUARE) {
            return new CubeSimpleShape();
        } else { // TEMPLATE
            return new CubeTemplateShape(
                roomMetadata.data.squareCubeStartPoints,
                roomMetadata.data.squareCubeOverlapThreshold,
                roomMetadata.data.squareCubeSizeSnapping,
            );
        }
    }
}
