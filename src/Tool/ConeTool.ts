import { BaseTool } from './BaseTool';
import { getId } from '../Utils/getId';
import { ConeTemplateShape } from '../Shape/ConeTemplateShape';
import { HexConeStyle, roomMetadata, SquareConeStyle, SquareDirection } from '../Metadata/room';
import { ConePathfinderShape } from '../Shape/ConePathfinderShape';
import { BaseShape } from '../Shape/BaseShape';
import { ConeTokenShape } from '../Shape/ConeTokenShape';
import { grid } from '@davidsev/owlbear-utils';
import { ConeHexShape } from '../Shape/ConeHexShape';

export class ConeTool extends BaseTool {

    readonly label = 'Cone';
    readonly icon = '/icons/cone.svg';
    readonly id = getId('cone');

    protected getShape (): BaseShape {
        if (grid.type == 'HEX_HORIZONTAL' || grid.type == 'HEX_VERTICAL') {
            if (roomMetadata.data.hexConeStyle == HexConeStyle.EQUILATERAL) {
                return new ConeHexShape();
            } else {
                return new ConeTemplateShape(
                    (roomMetadata.data.hexConeWidth % 180) * Math.PI / 180,
                    roomMetadata.data.hexConeStartPoints,
                    roomMetadata.data.hexConeOverlapThreshold,
                    roomMetadata.data.hexConeSizeSnapping,
                    SquareDirection.ALL,
                );
            }
        } else {
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
}
