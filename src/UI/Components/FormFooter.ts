import { html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { BaseElement } from '../BaseElement';
import style from './FormFooter.css';
import { baseCSS } from '../baseCSS';

@customElement('form-footer')
export class FormFooter extends BaseElement {

    static styles = baseCSS(style);

    // Render the UI as a function of component state
    render () {
        return html`
            <main>
                <span>v${VERSION}</span>
                &nbsp;|&nbsp;
                <a href="https://github.com/davidsev/owlbear-aoe2" target="_blank">GitHub</a>
            </main>
        `;
    }
}
