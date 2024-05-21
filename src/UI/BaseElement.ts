import { LitElement, PropertyValueMap, unsafeCSS } from 'lit';
import OBR, { Theme } from '@owlbear-rodeo/sdk';
import style from './style.css';
import { awaitScene } from '@davidsev/owlbear-utils/js/awaitScene';

export class BaseElement extends LitElement {
    // Define scoped styles right with your component, in plain CSS
    static styles = [
        unsafeCSS(style),
    ];

    protected firstUpdated (_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
        super.firstUpdated(_changedProperties);

        // Update the theme to match OBR
        awaitScene().then(() => {
            OBR.theme.onChange(this.updateTheme.bind(this));
            OBR.theme.getTheme().then(this.updateTheme.bind(this));
        });
    }

    private updateTheme (theme: Theme): void {
        this.setAttribute('data-theme', theme.mode === 'DARK' ? 'dark' : 'light');
    }
}
