import { Cell, grid, Point } from '@davidsev/owlbear-utils';
import { PathCommand } from '@owlbear-rodeo/sdk/lib/types/items/Path';
import { CellOutliner } from '../Utils/CellOutliner';

export abstract class BaseShape {

    private _start: Point;
    private _startCell?: Cell;
    private _end: Point;
    private _endCell?: Cell;

    constructor () {
        this._start = new Point(0, 0);
        this._end = new Point(0, 0);
    }

    public get start (): Point {
        return this._start;
    }

    public set start (value: Point) {
        this._start = value;
        this._startCell = undefined;
    }

    public get startCell (): Cell {
        if (!this._startCell) {
            this._startCell = grid.getCell(this._start);
        }
        return this._startCell;
    }

    public get end (): Point {
        return this._end;
    }

    public set end (value: Point) {
        this._end = value;
        this._endCell = undefined;
    }

    public get endCell (): Cell {
        if (!this._endCell) {
            this._endCell = grid.getCell(this._end);
        }
        return this._endCell;
    }

    public get distance (): number {
        return this.start.distanceTo(this.end);
    }

    public get roundedDistance (): number {
        return Math.round(this.distance / grid.dpi) * grid.dpi;
    }

    public isValid (): boolean {
        return this.roundedDistance > 0;
    }

    public abstract getCells (): Cell[];

    public abstract getLabelPosition (): Point;

    public getLabelText (): string {
        return `${this.roundedDistance / grid.dpi * (grid.gridScale.parsed.multiplier || 0)}${grid.gridScale.parsed.unit || ''}`;
    }

    public abstract getOutline (): PathCommand[];

    public getAreaPath (): PathCommand[] {
        const outliner = new CellOutliner(this.getCells());
        return outliner.getOutlinePath();
    }
}
