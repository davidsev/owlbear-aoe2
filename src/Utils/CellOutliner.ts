import { Cell, LineSegment, Point } from '@davidsev/owlbear-utils';
import { Command, PathCommand } from '@owlbear-rodeo/sdk/lib/types/items/Path';

export class CellOutliner {

    public readonly cells: Set<Cell>;
    public readonly groupedCells: Cell[][] = [];
    public readonly outline: Point[][] = [];

    constructor (cells: Set<Cell> | Cell[]) {
        this.cells = new Set(cells);
        this.groupCells();
        this.calculateOutline();
    }

    private groupCells () {
        // For each cell, check every group to see if it's adjacent to any of the cells in the group.
        // Repeat until no cells can be added to a group, then promote a random cell to a new group and repeat the whole process.

        if (!this.cells.size)
            return;

        const remainingCells: Cell[] = [...this.cells];

        while (remainingCells.length) {

            // Make a new group
            const currentGroup: Cell[] = [remainingCells.pop() as Cell];

            // Keep adding stuff to that group until we can't anymore.
            let haveChanged = true;
            while (haveChanged) {
                haveChanged = false;
                for (const [i, c] of remainingCells.entries()) {
                    if (currentGroup.some(g => g.isAdjacent(c))) {
                        currentGroup.push(c);
                        remainingCells.splice(i, 1);
                        haveChanged = true;
                    }
                }
            }

            // If we can't add any more to this group, then save it.
            this.groupedCells.push(currentGroup);
        }
    }

    private calculateOutline () {
        for (const group of this.groupedCells) {

            // Break the cells into their constituent line segments.
            const lines: LineSegment[] = [];
            for (const cell of group)
                lines.push(...cell.edges);

            // Count how many times each line shows up, any line that shows up more than once is internal and can be removed.
            const lineCounts = new Map<string, [LineSegment, number]>();
            for (const line of lines) {
                const key = line.toString();
                const [_, count] = lineCounts.get(key) ?? [line, 0];
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
