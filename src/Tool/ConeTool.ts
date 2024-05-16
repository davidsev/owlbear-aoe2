import { BaseTool } from './BaseTool';
import { getId } from '../Utils/getId';
import { ConeTemplateShape } from '../Shape/ConeTemplateShape';
import { roomMetadata, SquareConeStyle } from '../Metadata/room';
import { ConePathfinderShape } from '../Shape/ConePathfinderShape';
import { BaseShape } from '../Shape/BaseShape';
import { ConeTokenShape } from '../Shape/ConeTokenShape';

export class ConeTool extends BaseTool {

    readonly label = 'Cone';
    readonly icon = '/icons/cone.svg';
    readonly id = getId('cone');

    protected getShape (): BaseShape {
        if (roomMetadata.data.squareConeStyle == SquareConeStyle.PATHFINDER) {
            return new ConePathfinderShape();
        } else if (roomMetadata.data.squareConeStyle == SquareConeStyle.TOKEN) {
            return new ConeTokenShape();
        } else { // TEMPLATE
            return new ConeTemplateShape(
                ((roomMetadata.data.squareConeWidth || 53.1) % 180) * Math.PI / 180,
                roomMetadata.data.squareConeStartPoints,
                roomMetadata.data.squareConeOverlapThreshold,
                roomMetadata.data.squareConeSizeSnapping,
                roomMetadata.data.squareConeDirection,
            );
        }
    }
}
