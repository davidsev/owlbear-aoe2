import { html, PropertyValues, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { BaseElement } from '../BaseElement';
import style from './TabButton.css';

@customElement('tab-button')
export class TabButton extends BaseElement {

    static styles = [
        ...BaseElement.styles,
        unsafeCSS(style),
    ];

    // Declare reactive properties
    @property({ type: Boolean, reflect: true })
    accessor active: boolean = false;
    @property({ type: HTMLElement })
    accessor target: HTMLElement | string = '';

    // Render the UI as a function of component state
    render () {
        return html`
            <div class="${this.active ? 'active' : ''}">
                <slot></slot>
            </div>
        `;
    }

    private getTarget (): HTMLElement | null {
        if (typeof this.target === 'string')
            return document.querySelector(this.target);
        return this.target;
    }

    protected update (changedProperties: PropertyValues) {
        super.update(changedProperties);

        const target = this.getTarget();
        if (!target)
            return;

        target.style.display = this.active ? 'initial' : 'none';
    }
}
