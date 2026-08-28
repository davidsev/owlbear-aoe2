import { BaseTool } from './BaseTool';
import { getId } from '../Utils/getId';
import { CircleTemplateShape } from '../Shape/CircleTemplateShape';
import { roomMetadata, SquareCircleStyle } from '../Metadata/room';
import { grid } from '@davidsev/owlbear-utils';
import { CirclePathfinderShape } from '../Shape/CirclePathfinderShape';
import type { BaseShape } from '../Shape/BaseShape';

export class CircleTool extends BaseTool {
    readonly label = 'Circle';
    readonly icon = '/icons/circle.svg';
    readonly id = getId('circle');

    protected getShape(): BaseShape {
        const gridSnapshot = grid.snapshot;
        if (gridSnapshot.type === 'HEX_HORIZONTAL' || gridSnapshot.type === 'HEX_VERTICAL')
            return new CircleTemplateShape(gridSnapshot, roomMetadata.data.hexCircleStartPoints, roomMetadata.data.hexCircleSizeSnapping);
        else {
            if (roomMetadata.data.squareCircleStyle === SquareCircleStyle.PATHFINDER) return new CirclePathfinderShape(gridSnapshot);
            else return new CircleTemplateShape(gridSnapshot, roomMetadata.data.squareCircleStartPoints, roomMetadata.data.squareCircleSizeSnapping);
        }
    }
}
