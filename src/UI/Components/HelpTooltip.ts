import { html } from 'lit';
import { customElement, query } from 'lit/decorators.js';
import { BaseElement } from '../BaseElement';
import style from './HelpTooltip.css';
import { baseCSS } from '../baseCSS';

@customElement('help-tooltip')
export class HelpTooltip extends BaseElement {

    static styles = baseCSS(style);

    @query('dialog', true)
    private accessor dialog!: HTMLDialogElement;

    // Render the UI as a function of component state
    render () {
        return html`
            <button @click=${this.showDialog}>?</button>
            <dialog @click=${this.hideDialog}>
                <div>
                    <slot></slot>
                </div>
            </dialog>
        `;
    }

    private showDialog () {
        this.dialog.showModal();

        // If the bottom of the dialog is off the screen, move it up.
        const rect = this.dialog.getBoundingClientRect();
        if (rect.bottom > window.innerHeight)
            this.dialog.style.bottom = '1em';
    }

    private hideDialog (e: PointerEvent) {
        // Clicks within the dialog should have target set to the div or one of its children.
        // If the target is the dalog itself, then the click was on the backdrop.
        if (e.target == this.dialog)
            this.dialog.close();
    }
}
