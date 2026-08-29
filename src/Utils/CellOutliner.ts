import type { Cell, LineSegment, Point } from '@davidsev/owlbear-utils';
import { Command, type PathCommand } from '@owlbear-rodeo/sdk/lib/types/items/Path';

export class CellOutliner {
    public readonly cells: Cell[];
    public readonly outline: Point[][] = [];

    constructor(cells: Cell[]) {
        this.cells = cells;
        this.calculateOutline();
    }

    private calculateOutline() {
        if (!this.cells.length) return;

        // Break the cells into their constituent line segments.
        const lines: LineSegment[] = [];
        for (const cell of this.cells) lines.push(...cell.edges);

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

        if (!externalLines.length) throw new Error('No external lines found.  Should never happen?');

        // Sort the lines into order.  Pick a starting point and then find the next line that has that
        // point etc, until we're back where we started - that's one loop.  Cells can form several
        // disconnected islands, so keep going until every external line has been used up in some loop.
        while (externalLines.length) {
            const firstLine = externalLines.shift() as LineSegment; // externalLines.length was just checked, so this can't be undefined.
            const startPoint = firstLine.p1;
            const points: Point[] = [firstLine.p1, firstLine.p2];
            let currentPoint = firstLine.p2;

            while (!currentPoint.equals(startPoint)) {
                // Find a line with our current point
                const nextLineIndex = externalLines.findIndex(line => line.p1.equals(currentPoint) || line.p2.equals(currentPoint));
                if (nextLineIndex === -1) {
                    throw new Error('Could not find next line.  Should never happen?');
                }

                // Remove the line from the list
                const [nextLine] = externalLines.splice(nextLineIndex, 1) as [LineSegment];

                // Add the new point to the list and make it the current point
                const nextPoint = nextLine.p1.equals(currentPoint) ? nextLine.p2 : nextLine.p1;
                points.push(nextPoint);
                currentPoint = nextPoint;
            }

            this.outline.push(points);
        }
    }

    public getOutlinePath(): PathCommand[] {
        const commands: PathCommand[] = [];

        for (const group of this.outline) {
            const [firstPoint, ...rest] = group;
            if (!firstPoint) continue;

            commands.push([Command.MOVE, firstPoint.x, firstPoint.y]);
            for (const point of rest) {
                commands.push([Command.LINE, point.x, point.y]);
            }
            commands.push([Command.CLOSE]);
        }

        return commands;
    }
}
