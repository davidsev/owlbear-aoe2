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
        if (roomMetadata.data.coneStyle == ConeStyle.CUSTOM_TEMPLATE) {
            return new ConeTemplateShape(roomMetadata.data.coneWidth * Math.PI / 180);
        } else if (roomMetadata.data.coneStyle == ConeStyle.PATHFINDER) {
            return new ConePathfinderShape();
        } else { // Default to TEMPLATE
            return new ConeTemplateShape(0.9273); // Width = height, so this is the angle where you cast.
        }
    }
}
