import OBR from '@owlbear-rodeo/sdk';
import type { ObUITabBar } from '@davidsev/owlbear-ui';
import { getId } from '../../Utils/getId';

const TAB_ID_BY_TOOL: Record<string, string> = {
    [getId('cone')]: 'coneTab',
    [getId('circle')]: 'circleTab',
    [getId('cube')]: 'cubeTab',
};

/** If one of our own tools is active, switch the settings form's tab bar to match it. */
export async function selectTabForActiveTool(tabBar: ObUITabBar) {
    const [activeTool] = await Promise.all([OBR.tool.getActiveToolMode(), tabBar.updateComplete]);
    const tabId = activeTool && TAB_ID_BY_TOOL[activeTool];
    if (tabId) tabBar.selectTab(tabId);
}
