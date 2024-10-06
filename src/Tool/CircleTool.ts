import { BaseTool } from './BaseTool';
import { getId } from '../Utils/getId';
import { CircleTemplateShape } from '../Shape/CircleTemplateShape';
import { roomMetadata, SquareCircleStyle } from '../Metadata/room';
import { grid } from '@davidsev/owlbear-utils';
import { CirclePathfinderShape } from '../Shape/CirclePathfinderShape';
import { BaseShape } from '../Shape/BaseShape';

export class CircleTool extends BaseTool {

    readonly label = 'Circle';
    readonly icon = '/icons/circle.svg';
    readonly id = getId('circle');

    protected getShape (): BaseShape {
        if (grid.type == 'HEX_HORIZONTAL' || grid.type == 'HEX_VERTICAL')
            return new CircleTemplateShape(
                roomMetadata.data.hexCircleStartPoints,
                roomMetadata.data.hexCircleSizeSnapping,
            );
        else {
            if (roomMetadata.data.squareCircleStyle == SquareCircleStyle.PATHFINDER)
                return new CirclePathfinderShape();
            else
                return new CircleTemplateShape(
                    roomMetadata.data.squareCircleStartPoints,
                    roomMetadata.data.squareCircleSizeSnapping,
                );
        }
    }
}
