import { SquareSettingsForm } from './SquareSettingsForm';
import { grid } from '@davidsev/owlbear-utils';
import { HexSettingsForm } from './HexSettingsForm';
import styles from '../baseCSS.css';

export async function initSettingsForm () {
    // Load the page based on grid type
    if (grid.type === 'SQUARE')
        document.body.appendChild(new SquareSettingsForm());
    else
        document.body.appendChild(new HexSettingsForm());

    const styleSheet = document.createElement('style');
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
}

