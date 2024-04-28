import { BaseTool } from './BaseTool';
import { getId } from '../Utils/getId';
import { ConeTemplateShape } from '../Shape/ConeTemplateShape';
import { ConeStyle, roomMetadata } from '../Metadata/room';
import { ConePathfinderShape } from '../Shape/ConePathfinderShape';
import { BaseShape } from '../Shape/BaseShape';

export class ConeTool extends BaseTool {

    readonly label = 'Cone';
    readonly icon = '/icons/cone.svg';
    readonly id = getId('cone');

    protected getShape (): BaseShape {
        if (roomMetadata.data.coneStyle == ConeStyle.PATHFINDER) {
            return new ConePathfinderShape();
        } else { // TEMPLATE
            return new ConeTemplateShape(
                ((roomMetadata.data.coneWidth || 53.1) % 180) * Math.PI / 180,
                roomMetadata.data.coneStartPoints,
                roomMetadata.data.coneOverlapThreshold,
                roomMetadata.data.coneSizeSnapping,
            );
        }
    }
}
