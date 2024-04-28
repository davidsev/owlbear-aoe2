import { SquareSettingsForm } from './SquareSettingsForm';

export async function initSettingsForm () {
    // Load the page.
    document.body.replaceChildren(new SquareSettingsForm());
}

