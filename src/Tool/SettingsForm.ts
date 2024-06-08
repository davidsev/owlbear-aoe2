import OBR, { ToolAction, ToolContext, ToolIcon } from '@owlbear-rodeo/sdk';
import { getId } from '../Utils/getId';

export class SettingsForm implements ToolAction {

    readonly id = getId('setting');

    readonly icons: ToolIcon[] = [{
        icon: URL_PREFIX + '/icons/settings.svg',
        label: 'Settings',
        filter: {
            activeTools: [getId('tool')],
            roles: ['GM'],
        },
    }];

    onClick (context: ToolContext, elementId: string): void {
        OBR.popover.open({
            id: getId('settings-form'),
            height: 500,
            width: 350,
            url: URL_PREFIX + '/frame.html#settings-form',
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
