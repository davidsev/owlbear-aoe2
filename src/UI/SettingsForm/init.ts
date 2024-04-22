import { SettingsForm } from './index';

export async function initSettingsForm () {
    // Laad the page.
    document.body.replaceChildren(new SettingsForm());
}

