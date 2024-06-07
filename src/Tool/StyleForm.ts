import OBR, { ToolAction, ToolContext, ToolIcon } from '@owlbear-rodeo/sdk';
import { getId } from '../Utils/getId';

export class StyleForm implements ToolAction {

    readonly id = getId('style');

    readonly icons: ToolIcon[] = [{
        icon: URL_PREFIX + '/icons/style.svg',
        label: 'Style',
        filter: {
            activeTools: [getId('tool')],
        },
    }];

    onClick (context: ToolContext, elementId: string): void {
        OBR.popover.open({
            id: getId('style-form'),
            height: 600,
            width: 350,
            url: URL_PREFIX + '/frame.html#style-form',
            anchorElementId: elementId,
            anchorOrigin: {
                horizontal: 'CENTER',
                vertical: 'BOTTOM',
            },
            transformOrigin: {
                horizontal: 'CENTER',
                vertical: 'TOP',
            },
        });
    }
}
