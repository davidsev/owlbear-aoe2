import { html } from 'lit';
import { customElement, property, queryAssignedElements } from 'lit/decorators.js';
import { BaseElement } from '../BaseElement';

@customElement('form-control')
export class FormControl extends BaseElement {

    // Declare reactive properties
    @property()
    accessor label: string = '';

    @queryAssignedElements()
    accessor inputs!: HTMLElement[];

    // Render the UI as a function of component state
    render () {
        return html`
            <div class="mb-3">
                <label @click="${this.labelClicked}" class="block text-sm text-text-secondary">${this.label}</label>
                <slot></slot>
            </div>
        `;
    }

    private labelClicked () {
        if (!this.inputs.length)
            return;

        this.inputs[0].focus();
    }
}
