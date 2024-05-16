import { SquareSettingsForm } from './SquareSettingsForm';
import { grid } from '@davidsev/owlbear-utils';
import { HexSettingsForm } from './HexSettingsForm';

export async function initSettingsForm () {
    // Load the page based on grid type
    if (grid.type === 'SQUARE')
        document.body.replaceChildren(new SquareSettingsForm());
    else
        document.body.replaceChildren(new HexSettingsForm());
}

