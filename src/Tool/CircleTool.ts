import { BaseTool } from './BaseTool';
import { getId } from '../Utils/getId';
import { CircleShape } from '../Shape/CircleShape';
import { roomMetadata } from '../Metadata/room';

export class CircleTool extends BaseTool {

    readonly label = 'Circle';
    readonly icon = '/icons/circle.svg';
    readonly id = getId('circle');

    protected getShape (): CircleShape {
        return new CircleShape(
            roomMetadata.data.squareCircleStartPoints,
            roomMetadata.data.squareCircleSizeSnapping,
        );
    }
}
