import { BaseTool } from './BaseTool';
import { getId } from '../Utils/getId';
import { CircleTemplateShape } from '../Shape/CircleTemplateShape';
import { roomMetadata, SquareCircleStyle } from '../Metadata/room';
import { grid } from '@davidsev/owlbear-utils';
import { CirclePathfinderShape } from '../Shape/CirclePathfinderShape';
import type { BaseShape } from '../Shape/BaseShape';
import { AxonometricShapeAdapter } from '../Shape/AxonometricShapeAdapter';
import { buildFakeSquareGrid } from '../Utils/buildFakeSquareGrid';

export class CircleTool extends BaseTool {
    readonly label = 'Circle';
    readonly icon = '/icons/circle.svg';
    readonly id = getId('circle');

    protected getShape(): BaseShape {
        const gridSnapshot = grid.snapshot;
        if (gridSnapshot.type === 'HEX_HORIZONTAL' || gridSnapshot.type === 'HEX_VERTICAL')
            return new CircleTemplateShape(gridSnapshot, roomMetadata.data.hexCircleStartPoints, roomMetadata.data.hexCircleSizeSnapping);
        else if (gridSnapshot.type === 'ISOMETRIC' || gridSnapshot.type === 'DIMETRIC') {
            const squareGrid = buildFakeSquareGrid(gridSnapshot);
            let shape: BaseShape;
            if (roomMetadata.data.axonometricCircleStyle === SquareCircleStyle.PATHFINDER) shape = new CirclePathfinderShape(squareGrid);
            else shape = new CircleTemplateShape(squareGrid, roomMetadata.data.axonometricCircleStartPoints, roomMetadata.data.axonometricCircleSizeSnapping);
            return new AxonometricShapeAdapter(gridSnapshot, shape);
        } else {
            if (roomMetadata.data.squareCircleStyle === SquareCircleStyle.PATHFINDER) return new CirclePathfinderShape(gridSnapshot);
            else return new CircleTemplateShape(gridSnapshot, roomMetadata.data.squareCircleStartPoints, roomMetadata.data.squareCircleSizeSnapping);
        }
    }
}
