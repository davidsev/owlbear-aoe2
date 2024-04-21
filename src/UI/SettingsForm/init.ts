import { SettingsForm } from './index';

export function initSettingsForm () {
    // Laad the page.
    document.body.replaceChildren(new SettingsForm());
}

