import { grid } from '@davidsev/owlbear-utils';
import { ThemeManager } from '@davidsev/owlbear-ui';
import { SquareSettingsForm } from './SquareSettingsForm';
import { HexSettingsForm } from './HexSettingsForm';
import { AxonometricSettingsForm } from './AxonometricSettingsForm';
import { StyleSettingsForm } from './StyleSettingsForm';
import { FormFooter } from '../Components/FormFooter';

/** Put a form on the page, following the OBR theme and with the shared footer underneath. */
async function showForm(form: HTMLElement) {
    await ThemeManager.getInstance().connectOBR();
    document.body.appendChild(form);
    document.body.appendChild(new FormFooter());
}

export async function initSettingsForm() {
    // Load the page based on grid type
    if (grid.type === 'SQUARE') await showForm(new SquareSettingsForm());
    else if (grid.type === 'ISOMETRIC' || grid.type === 'DIMETRIC') await showForm(new AxonometricSettingsForm());
    else await showForm(new HexSettingsForm());
}

export async function initStyleForm() {
    await showForm(new StyleSettingsForm());
}
