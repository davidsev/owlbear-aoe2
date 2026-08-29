import { cached } from './BaseShape';
import { ConeTemplateShape } from './ConeTemplateShape';
import type { Cell, Grid } from '@davidsev/owlbear-utils';
import type { SquareDirection, StartPoint } from '../Metadata/room';

/**
 * A cross between the two D&D 5e methods.  The shape comes from the template method, but the number of
 * squares comes from the token method, so a cone always hits a consistent count without the wonky
 * shapes the token method produces.  We keep the cells the triangle covers the most of, until we run
 * out of budget.
 */
export class ConeHybridShape extends ConeTemplateShape {
    constructor(grid: Grid, startPoints: StartPoint[], sizeSnapping: number, directionSnapping: SquareDirection) {
        // The width is fixed at the 5e "width = height" angle, as the cell count is only defined for that
        // shape, and the overlap threshold does nothing when the count is what limits us.
        super(grid, (53.1 * Math.PI) / 180, startPoints, 0, sizeSnapping, directionSnapping);
    }

    /**
     * How many cells the token method would light up: one in the first row, two in the second, and so on.
     * (See ConeTokenShape.cells, which builds exactly roundedDistance/dpi rows.)  Only exact for whole
     * square cones, which is the only size where "matches the token method" means anything anyway.
     */
    @cached()
    private get cellBudget(): number {
        const length = this.roundedDistance / this.grid.dpi;
        return Math.round((length * (length + 1)) / 2);
    }

    @cached()
    public get cells(): Cell[] {
        const budget = this.cellBudget;
        if (budget < 1) return [];

        // The centre line of the cone.  Zero length means there's no direction to draw in.
        const axis = this.roundedEnd.sub(this.roundedStart);
        const axisLength = this.roundedEnd.distanceTo(this.roundedStart);
        if (!axisLength) return [];

        // Score every cell the triangle touches at all.  We deliberately ignore the overlap threshold:
        // the budget is what limits us, and filtering the candidates first would only leave the cone short.
        const triangle = this.triangle;
        const candidates: { cell: Cell; coverage: number; offset: number }[] = [];
        for (const cell of this.grid.iterateCellsBoundingPoints(triangle.points.map(point => this.grid.getCell(point)))) {
            const coverage = triangle.intersectsCellPercentage(cell);
            if (coverage <= 0) continue;

            // Perpendicular distance from the centre line, to break ties between equally covered cells.
            // This only matters for wide cones, where more cells can be fully covered than we have budget for.
            const toCell = cell.center.sub(this.roundedStart);
            const offset = Math.abs(axis.x * toCell.y - axis.y * toCell.x) / axisLength;

            candidates.push({ cell, coverage, offset });
        }

        // Most covered first, then nearest the centre line.  Fully covered cells return exactly 100, so
        // comparing the percentages directly is safe.
        candidates.sort((a, b) => b.coverage - a.coverage || a.offset - b.offset);

        return candidates.slice(0, budget).map(candidate => candidate.cell);
    }
}
