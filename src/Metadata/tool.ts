//
// Tool Metadata
//

import { ToolMetadataMapper } from '@davidsev/owlbear-utils';
import { getId } from '../Utils/getId';

export enum LabelDisplayMode {
    ALWAYS = 'ALWAYS',
    DRAWING = 'DRAWING',
    NEVER = 'NEVER',
}

export enum ShapeDisplayMode {
    ALWAYS = 'ALWAYS',
    DRAWING = 'DRAWING',
    NEVER = 'NEVER',
}

export class ToolMetadata {
    areaFillColor: string = '#000000';
    areaFillOpacity: number = 0.5;
    areaStrokeColor: string = '#FFFFFF';
    areaStrokeOpacity: number = 1;
    shapeFillColor: string = '#000000';
    shapeFillOpacity: number = 0;
    shapeStrokeColor: string = '#FF0000';
    shapeStrokeOpacity: number = 1;
    shapeDisplayMode: ShapeDisplayMode = ShapeDisplayMode.DRAWING;
    labelDisplayMode: LabelDisplayMode = LabelDisplayMode.DRAWING;
}

export const toolMetadata = new ToolMetadataMapper(getId('tool'), new ToolMetadata);
