import OBR, { buildPath, buildText, Command, Item, Vector2 } from '@owlbear-rodeo/sdk';

export class IntersectionDebugger {

    private static instance: IntersectionDebugger;

    private constructor () {}

    public static getInstance (): IntersectionDebugger {
        if (!IntersectionDebugger.instance)
            IntersectionDebugger.instance = new IntersectionDebugger();
        return IntersectionDebugger.instance;
    }

    public async clear (): Promise<void> {
        const items = await OBR.scene.local.getItems();
        const toDelete: string[] = [];
        for (const item of items) {
            if (item.metadata.hasOwnProperty('aoe-debug')) {
                toDelete.push(item.id);
            }
        }
        return OBR.scene.local.deleteItems(toDelete);
    }

    public async add (...items: Item[]): Promise<void> {
        return OBR.scene.local.addItems(items.map((item) => {
            item.metadata['aoe-debug'] = true;
            return item;
        }));
    }

    public async cross (...points: Vector2[]): Promise<void> {
        const items = points.map((point) =>
            buildPath()
                .position(point)
                .strokeColor('white')
                .strokeWidth(3)
                .commands([
                    [Command.MOVE, -10, 0],
                    [Command.LINE, 10, 0],
                    [Command.MOVE, 0, -10],
                    [Command.LINE, 0, 10],
                ])
                .build(),
        );
        return this.add(...items);
    }

    public line (point1: Vector2, point2: Vector2): Promise<void> {
        return this.add(buildPath()
            .position({ x: 0, y: 0 })
            .strokeColor('white')
            .strokeWidth(1)
            .commands([
                [Command.MOVE, point1.x, point1.y],
                [Command.LINE, point2.x, point2.y],
            ])
            .build(),
        );
    }

    public text (point: Vector2, text: string): Promise<void> {
        return this.add(buildText()
            .position({ x: point.x - 100, y: point.y - 50 })
            .strokeWidth(0)
            .fillColor('white')
            .fontSize(10)
            .textType('PLAIN')
            .width(200)
            .height(100)
            .textAlign('CENTER')
            .textAlignVertical('MIDDLE')
            .plainText(text)
            .build(),
        );
    }
}
