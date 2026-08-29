import type { BaseAxonometricGrid, Cell } from '@davidsev/owlbear-utils';
import { Point } from '@davidsev/owlbear-utils';
import { Command, type PathCommand } from '@owlbear-rodeo/sdk/lib/types/items/Path';
import { BaseShape } from './BaseShape';

/**
 * Runs a square-grid shape on an axonometric grid by working in "grid space": the linear map
 * xy_to_uv scaled up by dpi, under which each axonometric cell is an axis-aligned dpi-sized square
 * (see buildFakeSquareGrid, which the inner shape must have been built with).
 *
 * Pointer positions are mapped into grid space for the inner shape, and its output paths are
 * mapped back.  The map is affine, so straight lines, bezier control points, and area ratios
 * (overlap thresholds) all survive the round trip; angles and distances deliberately don't, which
 * is what skews the shape to the grid.
 */
export class AxonometricShapeAdapter extends BaseShape<BaseAxonometricGrid> {
    constructor(
        grid: BaseAxonometricGrid,
        public readonly squareShape: BaseShape,
    ) {
        super(grid);
    }

    public get start(): Point {
        return super.start;
    }

    public set start(value: Point) {
        super.start = value;
        this.squareShape.start = this.toGridSpace(value);
    }

    public get end(): Point {
        return super.end;
    }

    public set end(value: Point) {
        super.end = value;
        this.squareShape.end = this.toGridSpace(value);
    }

    /** Map a scene point into grid space, where the cells form a square grid. */
    private toGridSpace(point: Point): Point {
        const [u, v] = this.grid.xy_to_uv(point.x, point.y);
        return new Point(u * this.grid.dpi, v * this.grid.dpi);
    }

    /** Map a grid-space point back into the scene. */
    private fromGridSpace(point: Point): Point {
        const [x, y] = this.grid.uv_to_xy(point.x / this.grid.dpi, point.y / this.grid.dpi);
        return new Point(x, y);
    }

    /** Map every coordinate pair in a grid-space path back into the scene.  Conic weights carry over unchanged, as affine maps preserve rational beziers. */
    private mapCommands(commands: PathCommand[]): PathCommand[] {
        return commands.map((command): PathCommand => {
            switch (command[0]) {
                case Command.MOVE: {
                    const p = this.fromGridSpace(new Point(command[1], command[2]));
                    return [Command.MOVE, p.x, p.y];
                }
                case Command.LINE: {
                    const p = this.fromGridSpace(new Point(command[1], command[2]));
                    return [Command.LINE, p.x, p.y];
                }
                case Command.QUAD: {
                    const c = this.fromGridSpace(new Point(command[1], command[2]));
                    const p = this.fromGridSpace(new Point(command[3], command[4]));
                    return [Command.QUAD, c.x, c.y, p.x, p.y];
                }
                case Command.CONIC: {
                    const c = this.fromGridSpace(new Point(command[1], command[2]));
                    const p = this.fromGridSpace(new Point(command[3], command[4]));
                    return [Command.CONIC, c.x, c.y, p.x, p.y, command[5]];
                }
                case Command.CUBIC: {
                    const c1 = this.fromGridSpace(new Point(command[1], command[2]));
                    const c2 = this.fromGridSpace(new Point(command[3], command[4]));
                    const p = this.fromGridSpace(new Point(command[5], command[6]));
                    return [Command.CUBIC, c1.x, c1.y, c2.x, c2.y, p.x, p.y];
                }
                default:
                    return command;
            }
        });
    }

    public get isValid(): boolean {
        return this.squareShape.isValid;
    }

    public get roundedDistance(): number {
        return this.squareShape.roundedDistance;
    }

    public get labelText(): string {
        return this.squareShape.labelText;
    }

    public get labelPosition(): Point {
        return this.fromGridSpace(this.squareShape.labelPosition);
    }

    public get outline(): PathCommand[] {
        return this.mapCommands(this.squareShape.outline);
    }

    public get areaPath(): PathCommand[] {
        return this.mapCommands(this.squareShape.areaPath);
    }

    public get cells(): Cell[] {
        // Cell centers map exactly between the two spaces, so converting centers gives the matching real cells.
        return this.squareShape.cells.map(cell => this.grid.getCell(this.fromGridSpace(cell.center)));
    }
}
