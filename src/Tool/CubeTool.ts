import { BaseTool } from './BaseTool';
import { getId } from '../Utils/getId';
import { CubeTemplateShape } from '../Shape/CubeTemplateShape';
import { CubeStyle, roomMetadata } from '../Metadata/room';
import { ConePathfinderShape } from '../Shape/ConePathfinderShape';
import { BaseShape } from '../Shape/BaseShape';

export class CubeTool extends BaseTool {

    readonly label = 'Cube';
    readonly icon = '/icons/cube.svg';
    readonly id = getId('cube');

    protected getShape (): BaseShape {
        if (roomMetadata.data.squareCubeStyle == CubeStyle.SQUARE) {
            return new ConePathfinderShape();
        } else { // TEMPLATE
            return new CubeTemplateShape(
                roomMetadata.data.squareCubeStartPoints,
                roomMetadata.data.squareCubeOverlapThreshold,
                roomMetadata.data.squareCubeSizeSnapping,
            );
        }
    }
}
