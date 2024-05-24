import { BaseTool } from './BaseTool';
import { getId } from '../Utils/getId';
import { CircleShape } from '../Shape/CircleShape';
import { roomMetadata } from '../Metadata/room';
import { grid } from '@davidsev/owlbear-utils';

export class CircleTool extends BaseTool {

    readonly label = 'Circle';
    readonly icon = '/icons/circle.svg';
    readonly id = getId('circle');

    protected getShape (): CircleShape {
        if (grid.type == 'HEX_HORIZONTAL' || grid.type == 'HEX_VERTICAL')
            return new CircleShape(
                roomMetadata.data.hexCircleStartPoints,
                roomMetadata.data.hexCircleSizeSnapping,
            );
        else
            return new CircleShape(
                roomMetadata.data.squareCircleStartPoints,
                roomMetadata.data.squareCircleSizeSnapping,
            );
    }
}
