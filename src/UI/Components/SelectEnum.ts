import { html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { BaseElement } from '../BaseElement';

@customElement('select-enum')
export class SelectEnum<T extends Record<string, string>> extends BaseElement {

    constructor (options: T) {
        super();
        this.options = options;

        // Make sure we have a tabindex so onblur works
        if (this.tabIndex < 0)
            this.tabIndex = 0;
    }

    // Declare reactive properties
    @property()
    accessor options: T;
    @property()
    accessor value: keyof T = '';
    @property()
    accessor active: boolean = false;

    @query('div#input')
    private accessor input!: HTMLDivElement;
    @query('div#dropdown')
    private accessor dropdown!: HTMLDivElement;

    // Render the UI as a function of component state
    render () {
        return html`
            <div class="relative">
                <div id="input" class="input ${this.active ? 'active' : ''}" @click="${this.toggleDropdown}">
                    ${this.options[this.value]}
                </div>
                <div id="dropdown" class="dropdown ${this.active ? '' : 'hidden'}">
                    ${Object.entries(this.options).map(([value, label]) => html`
                        <div @click="${this.selectItem.bind(this, value)}"
                             class="item ${value === this.value ? 'active' : ''}">
                            ${label}
                        </div>
                    `)}
                </div>
            </div>
        `;
    }

    connectedCallback () {
        super.connectedCallback();
        this.addEventListener('blur', () => this.active = false);
    }

    private toggleDropdown () {
        this.active = !this.active;
    }

    private selectItem (item: string) {
        this.value = item;
        this.dispatchEvent(new Event('change'));
    }
}
