import OBR, { buildText, TextContent, Vector2 } from '@owlbear-rodeo/sdk';

function clone<T extends object> (src: T): T {
    return JSON.parse(JSON.stringify(src));
}

export async function measureText (text: TextContent): Promise<Vector2> {
    const blankItem = buildText()
        .text(clone(text))
        .visible(false)
        .build();

    await OBR.scene.local.addItems([blankItem]);
    const size = await OBR.scene.local.getItemBounds([blankItem.id]);
    await OBR.scene.local.deleteItems([blankItem.id]);

    return {
        x: size.width,
        y: size.height,
    };
}
