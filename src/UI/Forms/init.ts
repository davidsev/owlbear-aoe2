import { SquareSettingsForm } from './SquareSettingsForm';
import { grid } from '@davidsev/owlbear-utils';
import { HexSettingsForm } from './HexSettingsForm';
import styles from '../baseCSS.css';
import { StyleSettingsForm } from './StyleSettingsForm';
import { FormFooter } from '../Components/FormFooter';

export async function initSettingsForm () {
    // Load the page based on grid type
    if (grid.type === 'SQUARE')
        document.body.appendChild(new SquareSettingsForm());
    else
        document.body.appendChild(new HexSettingsForm());

    const styleSheet = document.createElement('style');
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);

    document.body.appendChild(new FormFooter());
}

export async function initStyleForm () {
    document.body.appendChild(new StyleSettingsForm());

    const styleSheet = document.createElement('style');
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);

    document.body.appendChild(new FormFooter());
}
