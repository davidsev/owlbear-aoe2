import OBR from '@owlbear-rodeo/sdk';
import { getId } from './Utils/getId';
import { ConeTool } from './Tool/ConeTool';
import { CircleTool } from './Tool/CircleTool';
import { CubeTool } from './Tool/CubeTool';
import { SettingsForm } from './Tool/SettingsForm';

export function initBackground () {
    OBR.onReady(async () => {
        OBR.tool.create({
            id: getId('tool'),
            shortcut: 'A',
            icons: [{
                icon: '/icons/cone.svg',
                label: 'AoE',
            }],
            defaultMode: getId('cone'),
            //    defaultMetadata: toolMetadata.defaultValues,
        });

        OBR.tool.createMode(new ConeTool());
        OBR.tool.createMode(new CircleTool());
        OBR.tool.createMode(new CubeTool());

        OBR.tool.createAction(new SettingsForm());
    });
}
