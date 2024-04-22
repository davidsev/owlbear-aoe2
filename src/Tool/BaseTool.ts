import OBR, {
    buildPath,
    buildText,
    InteractionManager,
    Item,
    Path,
    Text,
    ToolContext,
    ToolEvent,
    ToolIcon,
    ToolMode,
} from '@owlbear-rodeo/sdk';
import { getId } from '../Utils/getId';
import { BaseShape } from '../Shape/BaseShape';
import { PathBuilder } from '@owlbear-rodeo/sdk/lib/builders/PathBuilder';
import { Point } from '@davidsev/owlbear-utils';
import { TextBuilder } from '@owlbear-rodeo/sdk/lib/builders/TextBuilder';
import { toolMetadata, ToolMetadata } from '../Metadata/tool';

export abstract class BaseTool implements ToolMode {

    abstract readonly label: string;
    abstract readonly icon: string;
    abstract readonly id: string;

    private currentArea?: {
        interaction: InteractionManager<Item[]>,
        shape: BaseShape,
    } = undefined;

    public toolMetadata: ToolMetadata = toolMetadata.defaultValues;

    /** The icon that will be displayed in the toolbar. */
    get icons (): ToolIcon[] {
        return [{
            icon: this.icon,
            label: this.label,
            filter: {
                activeTools: [getId('tool')],
            },
        }];
    }

    /** Get the shape that has the implementation to use for this area */
    protected abstract getShape (): BaseShape;

    // When they start drawing, create the shape.
    async onToolDragStart (context: ToolContext, event: ToolEvent) {
        this.toolMetadata = toolMetadata.clean(context.metadata);

        // Make the items.
        const areaItem = this.buildAreaPath().build();
        const outlineItem = this.buildOutlinePath().attachedTo(areaItem.id).build();
        const labelItem = this.buildLabel().attachedTo(areaItem.id).build();
        const items: Item[] = [areaItem, outlineItem, labelItem];

        // Start drawing.
        const shape = this.getShape();
        shape.start = new Point(event.pointerPosition);
        this.currentArea = {
            shape: shape,
            interaction: await OBR.interaction.startItemInteraction(items),
        };
    }

    /** Get the items out of the array returned by the interaction update */
    private getItems (items: Item[]): [Path, Path?, Text?] {
        return [items.shift() as Path, items.shift() as Path, items.shift() as Text];
    }

    /** Update the items based on the current mouse position */
    private async updateItems (area: Path, outline ?: Path, label?: Text) {
        if (!this.currentArea)
            return;

        // Check if the line is long enough etc
        if (!this.currentArea.shape.isValid()) {
            if (outline)
                outline.commands = [];
            area.commands = [];
            if (label)
                label.visible = false;
            return;
        }

        // Update the outline
        if (outline)
            outline.commands = this.currentArea.shape.getOutline();

        // Update the area
        area.commands = this.currentArea.shape.getAreaPath();

        // And the text
        if (label) {
            label.text.plainText = this.currentArea.shape.getLabelText();
            // label.position = this.currentArea.shape.getLabelPosition();
            const pos = this.currentArea.shape.getLabelPosition();
            label.position = { x: pos.x - 100, y: pos.y - 50 };
            label.visible = true;
            //const size = await measureText(label.text);
            //const center = this.currentArea.shape.getLabelPosition();
            //label.position = { x: center.x - size.x / 2, y: center.y - size.y / 2 };
        }
    }

    async onToolDragMove (context: ToolContext, event: ToolEvent) {

        if (this.currentArea) {
            const [update] = this.currentArea.interaction;
            update((items: Item[]) => {
                if (this.currentArea) {
                    this.currentArea.shape.end = new Point(event.pointerPosition);
                    this.updateItems(...this.getItems(Array.from(items)));
                }
            });
        }
    }

    async onToolDragEnd (context: ToolContext, event: ToolEvent) {

        if (this.currentArea) {
            // Do a final update of the shape.
            const [update, stop] = this.currentArea.interaction;
            const items = update((items: Item[]) => {
                if (this.currentArea) {
                    this.currentArea.shape.end = new Point(event.pointerPosition);
                    this.updateItems(...this.getItems(Array.from(items)));
                }
            });

            // Save the items we want to keep.
            if (this.currentArea.shape.isValid()) {
                const [area, outline, label] = this.getItems(Array.from(items));
                const itemsToKeep: Item[] = [area];
                if (/*this.toolMetadata.shapeDisplayMode == 'always' && */ outline)
                    itemsToKeep.push(outline);
                if (/*this.toolMetadata.labelDisplayMode == 'always' && */ label)
                    itemsToKeep.push(label);
                await OBR.scene.items.addItems(itemsToKeep);

                // And attach them to eachother.
                if (itemsToKeep.length > 1) {
                    await OBR.scene.items.updateItems(itemsToKeep, (items: Item[]) => {
                        for (let i = 0; i < items.length - 1; i++)
                            items[i].attachedTo = items[i + 1 % items.length].id;
                    });
                }
            }

            // Stop the interaction.
            stop();
        }

        // Clean up the references to the shapes we don't need any more.
        this.cleanup();

        // Track the event.
        // if (window._paq)
        //   window._paq.push(['trackEvent', 'shape', 'keep_shape', this.getEventName()]);
    }

    onToolDragCancel () {
        this.cleanup();

        // Track the event.
        // if (window._paq)
        //   window._paq.push(['trackEvent', 'shape', 'cancel_shape', this.getEventName()]);
    }

    cleanup () {
        if (this.currentArea) {
            const [update, stop] = this.currentArea.interaction;
            stop();
        }
        this.currentArea = undefined;
    }

    protected buildAreaPath (): PathBuilder {
        return buildPath()
            .commands([])
            .metadata({ createdBy: getId() })
            .fillColor(this.toolMetadata.areaFillColor)
            .fillOpacity(this.toolMetadata.areaFillOpacity)
            .strokeWidth(5)
            .strokeColor(this.toolMetadata.areaStrokeColor)
            .name('AoE Area')
            .strokeOpacity(this.toolMetadata.areaStrokeOpacity);
    }

    protected buildOutlinePath (): PathBuilder {
        return buildPath()
            .commands([])
            .metadata({ createdBy: getId() })
            .fillColor(this.toolMetadata.shapeFillColor)
            .fillOpacity(this.toolMetadata.shapeFillOpacity)
            .strokeWidth(5)
            .strokeColor(this.toolMetadata.shapeStrokeColor)
            .strokeOpacity(this.toolMetadata.shapeStrokeOpacity)
            .locked(true)
            .name('AoE Outline')
            .layer('ATTACHMENT');
    }

    protected buildLabel (): TextBuilder {
        return buildText()
            .plainText('')
            .textType('PLAIN')
            .fontWeight(700)
            .fontSize(60)
            .width(200)
            .height(100)
            .strokeColor('black')
            .strokeWidth(4)
            .textAlign('CENTER')
            .textAlignVertical('MIDDLE')
            .fillColor('white')
            .metadata({ createdBy: getId() })
            .locked(true)
            .name('AoE Label')
            .layer('ATTACHMENT');
    }
}
