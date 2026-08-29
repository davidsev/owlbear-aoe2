import { customElement } from 'lit/decorators.js';
import { html } from 'lit';
import { BaseElement, baseCSS } from '@davidsev/owlbear-ui';
import '@davidsev/owlbear-ui/color-picker';
import type { ObUIColorPicker } from '@davidsev/owlbear-ui/components/ColorPicker';
import style from './StyleForm.css';
import { LabelDisplayMode, ShapeDisplayMode, type ToolMetadata, toolMetadata } from '../../Metadata/tool';
import { enumSelect } from '../Components/controls';
import { inputsAreValid } from './inputValue';

function colorPicker(): ObUIColorPicker {
    return document.createElement('obui-color-picker');
}

@customElement('style-settings-form')
export class StyleSettingsForm extends BaseElement {
    static styles = baseCSS(style);

    private readonly inputs = {
        areaFill: colorPicker(),
        areaStroke: colorPicker(),
        shapeFill: colorPicker(),
        shapeStroke: colorPicker(),
        shapeMode: enumSelect({
            [ShapeDisplayMode.NEVER]: 'Never Show',
            [ShapeDisplayMode.DRAWING]: 'Show While Drawing',
            [ShapeDisplayMode.ALWAYS]: 'Always Show',
        }),
        labelMode: enumSelect({
            [LabelDisplayMode.NEVER]: 'Never Show',
            [LabelDisplayMode.DRAWING]: 'Show While Drawing',
            [LabelDisplayMode.ALWAYS]: 'Always Show',
        }),
    };

    constructor() {
        super();

        // Update the metadata when the form changes.
        for (const [, input] of Object.entries(this.inputs)) {
            input.addEventListener('change', this.formChanged.bind(this));
        }

        // Load the metadata into the form.
        toolMetadata.get().then(metadata => this.setFromMetadata(metadata));
    }

    private setFromMetadata(metadata: ToolMetadata) {
        this.inputs.areaFill.color = metadata.areaFillColor;
        this.inputs.areaFill.opacity = metadata.areaFillOpacity;
        this.inputs.areaStroke.color = metadata.areaStrokeColor;
        this.inputs.areaStroke.opacity = metadata.areaStrokeOpacity;
        this.inputs.shapeFill.color = metadata.shapeFillColor;
        this.inputs.shapeFill.opacity = metadata.shapeFillOpacity;
        this.inputs.shapeStroke.color = metadata.shapeStrokeColor;
        this.inputs.shapeStroke.opacity = metadata.shapeStrokeOpacity;
        this.inputs.shapeMode.value = metadata.shapeDisplayMode;
        this.inputs.labelMode.value = metadata.labelDisplayMode;
    }

    private async formChanged(e?: Event) {
        // Only run if the form is valid.
        if (e && !inputsAreValid(this.inputs)) {
            return;
        }

        // Save the data
        toolMetadata.set({
            areaFillColor: this.inputs.areaFill.color,
            areaFillOpacity: this.inputs.areaFill.opacity,
            areaStrokeColor: this.inputs.areaStroke.color,
            areaStrokeOpacity: this.inputs.areaStroke.opacity,
            shapeFillColor: this.inputs.shapeFill.color,
            shapeFillOpacity: this.inputs.shapeFill.opacity,
            shapeStrokeColor: this.inputs.shapeStroke.color,
            shapeStrokeOpacity: this.inputs.shapeStroke.opacity,
            shapeDisplayMode: this.inputs.shapeMode.value,
            labelDisplayMode: this.inputs.labelMode.value,
        });
    }

    private setDefaults() {
        this.setFromMetadata(toolMetadata.defaultValues);
        this.formChanged();
    }

    render() {
        return html`
            <form style="padding-top: 1em">

                <div class="row">
                    <label>Area:</label>
                    <form-control label="Fill">
                        ${this.inputs.areaFill}
                    </form-control>
                    <form-control label="Stroke">
                        ${this.inputs.areaStroke}
                    </form-control>
                </div>

                <div class="row">
                    <label>Guide Shape:</label>
                    <form-control label="Fill">
                        ${this.inputs.shapeFill}
                    </form-control>
                    <form-control label="Stroke">
                        ${this.inputs.shapeStroke}
                    </form-control>
                </div>
                <div class="row">
                    <label></label>
                    <form-control>
                        ${this.inputs.shapeMode}
                    </form-control>
                </div>

                <div class="row">
                    <label style="margin-top: 0.25em">Label:</label>
                    <form-control>
                        ${this.inputs.labelMode}
                    </form-control>
                </div>

                <div class="resetButton">
                    <obui-button @click=${this.setDefaults}>Reset to default</obui-button>
                </div>
            </form>
        `;
    }
}
