import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { BaseElement } from '../BaseElement';

@customElement('form-control')
export class FormControl extends BaseElement {

    // Declare reactive properties
    @property()
    accessor label: string = '';

    // Render the UI as a function of component state
    render () {
        return html`
            <div class="mb-3">
                <label for="input">
                    <div class="block text-sm text-text-secondary">${this.label}</div>
                    <slot></slot>
                </label>
            </div>
        `;
    }
}
