import { html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { BaseElement } from '../BaseElement';
import style from './ColorPicker.css';
import { baseCSS } from '../baseCSS';
import 'vanilla-colorful/hex-alpha-color-picker.js';
import { HexAlphaColorPicker } from 'vanilla-colorful/hex-alpha-color-picker';

export class ColorPickerChangeEvent extends Event {
    constructor (
        public readonly color: string,
        public readonly opacity: number,
        public readonly rgba: string,
    ) {
        super('change');
    }
}

@customElement('color-picker')
export class ColorPicker extends BaseElement {

    static styles = baseCSS(style);

    @property({ type: String })
    accessor color: string = '#000000';
    @property({ type: Number })
    accessor opacity: number = 1;

    @query('dialog', true)
    private accessor dialog!: HTMLDialogElement;
    @query('hex-alpha-color-picker', true)
    private accessor picker!: HexAlphaColorPicker;

    // Render the UI as a function of component state
    render () {
        return html`
            <button @click=${this.showDialog} style="background-color: ${this.rgba}; border-color: ${this.color}">
                <div style="color: ${this.color}">${(this.opacity * 100).toFixed(0)}%</div>
            </button>
            <dialog @click=${this.hideDialog}>
                <div>
                    <hex-alpha-color-picker
                            .color="${this.color}${Math.floor(this.opacity * 255).toString(16).padStart(2, '0')}"
                            @color-changed="${this.colorChanged}"></hex-alpha-color-picker>
                </div>
            </dialog>
        `;
    }

    private showDialog () {
        this.dialog.showModal();
    }

    private hideDialog (e: PointerEvent) {
        // Clicks within the dialog should have target set to the div or one of its children.
        // If the target is the dalog itself, then the click was on the backdrop.
        if (e.target == this.dialog)
            this.dialog.close();
    }

    public get rgba (): string {
        return `${this.color}${Math.floor(this.opacity * 255).toString(16).padStart(2, '0')}`;
    }

    private colorChanged (e: CustomEvent<{ value: string }>) {
        this.color = e.detail.value.slice(0, 7);
        const opacity = parseInt(e.detail.value.slice(7), 16) / 255;
        this.opacity = Number.isFinite(opacity) ? opacity : 1;

        this.dispatchEvent(new ColorPickerChangeEvent(this.color, this.opacity, this.rgba));
    }
}
