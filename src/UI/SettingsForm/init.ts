import { SquareSettingsForm } from './Square';

export async function initSettingsForm () {
    // Load the page.
    document.body.replaceChildren(new SquareSettingsForm());
}

