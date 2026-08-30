import { type Cell, type Grid, Point } from '@davidsev/owlbear-utils';
import type { PathCommand } from '@owlbear-rodeo/sdk/lib/types/items/Path';
import { CellOutliner } from '../Utils/CellOutliner';
import type { DrawableShape } from './DrawableShape';

export abstract class BaseShape<G extends Grid = Grid> implements DrawableShape {
    private _start: Point;
    private _end: Point;
    public readonly _cache: Map<unknown, unknown> = new Map();

    constructor(public readonly grid: G) {
        this._start = new Point(0, 0);
        this._end = new Point(0, 0);
    }

    public get start(): Point {
        return this._start;
    }

    public set start(value: Point) {
        this._start = value;
        this._cache.clear();
    }

    @cached()
    public get startCell(): ReturnType<G['getCell']> {
        return this.grid.getCell(this._start) as ReturnType<G['getCell']>;
    }

    public get end(): Point {
        return this._end;
    }

    public set end(value: Point) {
        this._end = value;
        this._cache.clear();
    }

    @cached()
    public get endCell(): ReturnType<G['getCell']> {
        return this.grid.getCell(this._end) as ReturnType<G['getCell']>;
    }

    @cached()
    public get distance(): number {
        return this.start.distanceTo(this.end);
    }

    @cached()
    public get roundedDistance(): number {
        return Math.round(this.distance / this.grid.dpi) * this.grid.dpi;
    }

    @cached()
    public get isValid(): boolean {
        return this.roundedDistance > 0;
    }

    public abstract get cells(): Cell[];

    public abstract get labelPosition(): Point;

    @cached()
    public get labelText(): string {
        return `${(this.roundedDistance / this.grid.dpi) * (this.grid.gridScale.parsed.multiplier || 0)}${this.grid.gridScale.parsed.unit || ''}`;
    }

    public abstract get outline(): PathCommand[];

    @cached()
    public get areaPath(): PathCommand[] {
        const outliner = new CellOutliner(this.cells);
        return outliner.getOutlinePath();
    }
}

export function cached<T>() {
    return (func: () => T) =>
        function (this: BaseShape): T {
            if (this._cache.has(func)) {
                return this._cache.get(func) as T;
            }
            const result = func.apply(this);
            this._cache.set(func, result);
            return result;
        };
}
