import { html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { BaseElement } from '../BaseElement';

@customElement('select-enum')
export class SelectEnum<T extends Record<string, string>> extends BaseElement {

    constructor (options: T) {
        super();
        this.options = options;
    }

    // Declare reactive properties
    @property()
    accessor options: T;
    @property()
    accessor value: keyof T = '';

    @query('select')
    accessor select!: HTMLSelectElement;

    // Render the UI as a function of component state
    render () {
        return html`
            <select @change="${this.changeHandler}">
                ${Object.entries(this.options).map(([value, label]) => html`
                    <option value="${value}" ?selected="${value === this.value}">
                        ${label}
                    </option>
                `)}
            </select>
        `;
    }

    private changeHandler () {
        this.value = this.select?.value || '';
        this.dispatchEvent(new Event('change'));
    }
}
