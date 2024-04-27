import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { BaseElement } from '../BaseElement';

@customElement('select-enum')
export class SelectEnum<T extends Record<string, string>> extends BaseElement {

    constructor (options: T) {
        super();
        this.options = options;

        // Make sure we have a tabindex so onblur works
        if (this.tabIndex < 0)
            this.tabIndex = 0;

        this.addEventListener('focus', this.show.bind(this));
        this.addEventListener('blur', this.hide.bind(this));
    }

    // Declare reactive properties
    @property()
    accessor options: T;
    @property()
    accessor value: keyof T = '';
    @property()
    accessor active: boolean = false;

    // Render the UI as a function of component state
    render () {
        return html`
            <div class="relative">
                <div class="${this.active ? 'hidden' : 'input'}" @click="${this.show}">
                    ${this.options[this.value]}
                </div>
                <div class="${this.active ? 'input active' : 'hidden'}" @click="${this.hide}">
                    ${this.options[this.value]}
                </div>
                <div id="dropdown" class="mt-1.5 dropdown ${this.active ? '' : 'hidden'}">
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

    private show () {
        this.active = true;
    }

    private hide () {
        this.active = false;
    }

    private selectItem (item: string) {
        this.value = item;
        this.dispatchEvent(new Event('change'));
    }
}
