import { BaseTool } from './BaseTool';
import { getId } from '../Utils/getId';
import { CubeShape } from '../Shape/CubeShape';

export class CubeTool extends BaseTool {

    readonly label = 'Cube';
    readonly icon = '/icons/cube.svg';
    readonly id = getId('cube');

    protected getShape (): CubeShape {
        return new CubeShape(); // Width = height, so this is the angle where you cast.
    }
}
