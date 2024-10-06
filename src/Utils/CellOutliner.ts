import { Cell, LineSegment, Point } from '@davidsev/owlbear-utils';
import { Command, PathCommand } from '@owlbear-rodeo/sdk/lib/types/items/Path';

export class CellOutliner {

    public readonly cells: Cell[];
    public readonly outline: Point[][] = [];

    constructor (cells: Cell[]) {
        this.cells = cells;
        this.calculateOutline();
    }

    private calculateOutline () {

        if (!this.cells.length)
            return;

        // Break the cells into their constituent line segments.
        const lines: LineSegment[] = [];
        for (const cell of this.cells)
            lines.push(...cell.edges);

        // Count how many times each line shows up, any line that shows up more than once is internal and can be removed.
        const lineCounts = new Map<string, [LineSegment, number]>();
        for (const line of lines) {
            const key = line.p1.toString() + line.p2.toString();
            const [, count] = lineCounts.get(key) ?? [line, 0];
            lineCounts.set(key, [line, count + 1]);
        }
        const externalLines: LineSegment[] = [];
        for (const [line, count] of lineCounts.values()) {
            if (count === 1) {
                externalLines.push(line);
            }
        }

        if (!externalLines.length)
            throw new Error('No external lines found.  Should never happen?');

        // Sort the lines into order.  Pick a starting point and then find the next line that has that point etc.
        const points: Point[] = [];
        const firstLine = externalLines.shift() as LineSegment; // We know there's at least one line, so this can't be undefined.
        points.push(firstLine.p1, firstLine.p2);
        let currentPoint = firstLine.p2;

        while (externalLines.length) {
            // Find a line with our current point
            const nextLine = externalLines.find(line => line.p1.equals(currentPoint) || line.p2.equals(currentPoint));
            if (!nextLine) {
                throw new Error('Could not find next line.  Should never happen?');
            }

            // Remove the line from the list
            externalLines.splice(externalLines.indexOf(nextLine), 1);

            // Add the new point to the list and make it the current point
            if (nextLine.p1.equals(currentPoint)) {
                points.push(nextLine.p2);
                currentPoint = nextLine.p2;
            } else {
                points.push(nextLine.p1);
                currentPoint = nextLine.p1;
            }
        }

        this.outline.push(points);
    }

    public getOutlinePath (): PathCommand[] {
        const commands: PathCommand[] = [];

        for (const group of this.outline) {
            const firstPoint = group.shift();
            if (!firstPoint)
                return [];

            commands.push([Command.MOVE, firstPoint.x, firstPoint.y]);
            for (const point of group) {
                commands.push([Command.LINE, point.x, point.y]);
            }
            commands.push([Command.CLOSE]);
        }

        return commands;
    }
}
