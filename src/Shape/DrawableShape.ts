import type { Point } from '@davidsev/owlbear-utils';
import type { PathCommand } from '@owlbear-rodeo/sdk/lib/types/items/Path';

/**
 * The parts of a shape that the tools use to draw, all in scene space.
 *
 * Shapes that don't work in scene space should implement this rather than extend BaseShape, so that
 * they can't inherit a scene-space member by accident (see AxonometricShapeAdapter).
 */
export interface DrawableShape {
    start: Point;
    end: Point;
    readonly isValid: boolean;
    readonly outline: PathCommand[];
    readonly areaPath: PathCommand[];
    readonly labelText: string;
    readonly labelPosition: Point;
}
