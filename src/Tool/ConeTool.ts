import { BaseTool } from './BaseTool';
import { getId } from '../Utils/getId';
import { ConeTemplateShape } from '../Shape/ConeTemplateShape';
import { ConeStyle, roomMetadata } from '../Metadata/room';

export class ConeTool extends BaseTool {

    readonly label = 'Cone';
    readonly icon = '/icons/cone.svg';
    readonly id = getId('cone');

    protected getShape (): ConeTemplateShape {
        if (roomMetadata.data.coneStyle == ConeStyle.CUSTOM_TEMPLATE) {
            return new ConeTemplateShape(roomMetadata.data.coneWidth * Math.PI / 180);
        } else { // Default to TEMPLATE
            return new ConeTemplateShape(0.9273); // Width = height, so this is the angle where you cast.
        }
    }
}
