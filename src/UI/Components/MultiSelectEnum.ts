import { html } from 'lit';
import { customElement, property, queryAll } from 'lit/decorators.js';
import { BaseElement } from '../BaseElement';
import style from './MultiSelectEnum.css';
import { baseCSS } from '../baseCSS';

@customElement('multi-select-enum')
export class MultiSelectEnum<T extends Record<string, string>> extends BaseElement {

    static styles = baseCSS(style);

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
    accessor value: (keyof T)[] = [];
    @property()
    accessor active: boolean = false;

    @queryAll('input[type="checkbox"]')
    accessor checkboxes!: NodeListOf<HTMLInputElement>;

    // Render the UI as a function of component state
    render () {
        return html`
            <main>
                <div class="${this.active ? 'hidden' : 'input'}" @click="${this.show}">
                    ${this.valuesString}
                </div>
                <div class="${this.active ? 'input active' : 'hidden'}" @click="${this.hide}">
                    ${this.valuesString}
                </div>
                <div id="dropdown" class="${this.active ? '' : 'hidden'}">
                    ${Object.entries(this.options).map(([value, label]) => html`
                        <label>
                            <input type="checkbox" value="${value}" @change="${this.changeHandler}"
                                   .checked=${this.value.includes(value)}>
                            ${label}
                        </label>
                    `)}
                </div>
            </main>
        `;
    }

    get valuesString (): string {
        if (this.value.length)
            return this.value.map(v => this.options[v]).join(', ');
        else return 'None';
    }

    private show () {
        this.active = true;
    }

    private hide () {
        this.active = false;
    }

    private changeHandler () {
        this.value = [...this.checkboxes].map(cb => cb.checked ? cb.value : null).filter(v => v) as (keyof T)[];
        this.dispatchEvent(new Event('change'));
    }
}
