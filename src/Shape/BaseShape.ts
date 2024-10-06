import { Cell, grid, Point } from '@davidsev/owlbear-utils';
import { PathCommand } from '@owlbear-rodeo/sdk/lib/types/items/Path';
import { CellOutliner } from '../Utils/CellOutliner';

export abstract class BaseShape {

    private _start: Point;
    private _end: Point;
    public readonly _cache: Map<string | symbol, unknown> = new Map();

    constructor () {
        this._start = new Point(0, 0);
        this._end = new Point(0, 0);
    }

    public get start (): Point {
        return this._start;
    }

    public set start (value: Point) {
        this._start = value;
        this._cache.clear();
    }

    @cached()
    public get startCell (): Cell {
        return grid.getCell(this._start);
    }

    public get end (): Point {
        return this._end;
    }

    public set end (value: Point) {
        this._end = value;
        this._cache.clear();
    }

    @cached()
    public get endCell (): Cell {
        return grid.getCell(this._end);
    }

    @cached()
    public get distance (): number {
        return this.start.distanceTo(this.end);
    }

    @cached()
    public get roundedDistance (): number {
        return Math.round(this.distance / grid.dpi) * grid.dpi;
    }

    @cached()
    public get isValid (): boolean {
        return this.roundedDistance > 0;
    }

    public abstract get cells (): Cell[];

    public abstract get labelPosition (): Point;

    @cached()
    public get labelText (): string {
        return `${this.roundedDistance / grid.dpi * (grid.gridScale.parsed.multiplier || 0)}${grid.gridScale.parsed.unit || ''}`;
    }

    public abstract get outline (): PathCommand[];

    @cached()
    public get areaPath (): PathCommand[] {
        const outliner = new CellOutliner(this.cells);
        return outliner.getOutlinePath();
    }
}

export function cached () {
    return function (func: () => unknown) {
        return function (this: any) {
            if (this._cache.has(func.name)) {
                return this._cache.get(func.name);
            }
            const result = func.apply(this);
            this._cache.set(func.name, result);
            return result;
        };
    };
}
