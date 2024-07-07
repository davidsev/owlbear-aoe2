import { html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { BaseElement } from '../BaseElement';
import style from './FormFooter.css';
import { baseCSS } from '../baseCSS';
import OBR, { Item } from '@owlbear-rodeo/sdk';
import { getId } from '../../Utils/getId';

@customElement('form-footer')
export class FormFooter extends BaseElement {

    static styles = baseCSS(style);

    // Render the UI as a function of component state
    render () {
        return html`
            <main>
                <a href="https://github.com/davidsev/owlbear-aoe2" target="_blank">AoE Shapes v${VERSION}</a>
                &nbsp;|&nbsp;
                <a @click="${this.deleteAll}">Delete All Shapes</a>
            </main>
        `;
    }

    async deleteAll () {
        const itemsToDelete = await OBR.scene.items.getItems((item: Item) => item.metadata?.createdBy === getId());
        const idsToDelete = itemsToDelete.map((item: Item) => item.id);
        await OBR.scene.items.deleteItems(idsToDelete);
    }
}
