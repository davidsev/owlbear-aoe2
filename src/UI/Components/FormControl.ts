import { html } from 'lit';
import { customElement, property, queryAssignedElements } from 'lit/decorators.js';
import { BaseElement } from '../BaseElement';
import style from './FormControl.css';
import { baseCSS } from '../baseCSS';

@customElement('form-control')
export class FormControl extends BaseElement {

    static styles = baseCSS(style);

    // Declare reactive properties
    @property()
    accessor label: string = '';

    @queryAssignedElements()
    accessor inputs!: HTMLElement[];

    // Render the UI as a function of component state
    render () {
        return html`
            <main>
                <label @click="${this.labelClicked}">${this.label}</label>
                <slot></slot>
            </main>
        `;
    }

    private labelClicked () {
        if (!this.inputs.length)
            return;

        this.inputs[0].focus();
    }
}
