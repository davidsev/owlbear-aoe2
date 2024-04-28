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
        this.style.setProperty('--background-color', theme.background.default);
        this.style.setProperty('--paper-color', theme.background.paper);
        this.style.setProperty('--primary-color', theme.primary.main);
        this.style.setProperty('--primary-color-light', theme.primary.light);
        this.style.setProperty('--primary-color-dark', theme.primary.dark);
        this.style.setProperty('--primary-color-contrast', theme.primary.contrastText);
        this.style.setProperty('--secondary-color', theme.secondary.main);
        this.style.setProperty('--secondary-color-light', theme.secondary.light);
        this.style.setProperty('--secondary-color-dark', theme.secondary.dark);
        this.style.setProperty('--secondary-color-contrast', theme.secondary.contrastText);
        this.style.setProperty('--text-color', theme.text.primary);
        this.style.setProperty('--text-color-secondary', theme.text.secondary);
        this.style.setProperty('--text-color-disabled', theme.text.disabled);

        this.setAttribute('data-theme', theme.mode === 'DARK' ? 'dark' : 'light');
    }
}
