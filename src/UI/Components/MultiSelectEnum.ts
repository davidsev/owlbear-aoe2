import { html } from 'lit';
import { customElement, property, queryAll } from 'lit/decorators.js';
import { BaseElement } from '../BaseElement';

@customElement('multi-select-enum')
export class MultiSelectEnum<T extends Record<string, string>> extends BaseElement {

    constructor (options: T) {
        super();
        this.options = options;
    }

    // Declare reactive properties
    @property()
    accessor options: T;
    @property()
    accessor value: (keyof T)[] = [];

    @queryAll('input[type="checkbox"]')
    accessor checkboxes!: NodeListOf<HTMLInputElement>;

    // Render the UI as a function of component state
    render () {
        return html`
            <div>
                ${Object.entries(this.options).map(([value, label]) => html`
                    <div>
                        <input id="${value}" type="checkbox" value="${value}" @change="${this.changeHandler}"
                               .checked=${this.value.includes(value)}>
                        <label for="${value}">${label}</label>
                    </div>
                `)}
            </div>
        `;
    }

    private changeHandler () {
        this.value = [...this.checkboxes].map(cb => cb.checked ? cb.value : null).filter(v => v) as (keyof T)[];
        this.dispatchEvent(new Event('change'));
    }
}
