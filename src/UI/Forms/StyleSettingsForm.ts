import { customElement } from 'lit/decorators.js';
import { html } from 'lit';
import { BaseElement } from '../BaseElement';
import style from './StyleForm.css';
import { baseCSS } from '../baseCSS';
import { ColorPicker } from '../Components/ColorPicker';
import { LabelDisplayMode, ShapeDisplayMode, ToolMetadata, toolMetadata } from '../../Metadata/tool';
import { SelectEnum } from '../Components/SelectEnum';

@customElement('style-settings-form')
export class StyleSettingsForm extends BaseElement {

    static styles = baseCSS(style);

    private readonly inputs = {
        areaFill: new ColorPicker(),
        areaStroke: new ColorPicker(),
        shapeFill: new ColorPicker(),
        shapeStroke: new ColorPicker(),
        shapeMode: new SelectEnum({
            [ShapeDisplayMode.NEVER]: 'Never Show',
            [ShapeDisplayMode.DRAWING]: 'Show While Drawing',
            [ShapeDisplayMode.ALWAYS]: 'Always Show',
        }),
        labelMode: new SelectEnum({
            [LabelDisplayMode.NEVER]: 'Never Show',
            [LabelDisplayMode.DRAWING]: 'Show While Drawing',
            [LabelDisplayMode.ALWAYS]: 'Always Show',
        }),
    };

    constructor () {
        super();

        // Update the metadata when the form changes.
        for (const [key, input] of Object.entries(this.inputs)) {
            input.addEventListener('change', this.formChanged.bind(this));
        }

        // Load the metadata into the form.
        toolMetadata.get().then((metadata) => this.setFromMetadata(metadata));
    }

    private setFromMetadata (metadata: ToolMetadata) {
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

    private async formChanged (e?: Event) {
        // Only run if the form is valid.
        if (e && e.target instanceof HTMLInputElement && !e.target.form?.checkValidity()) {
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

    private setDefaults () {
        this.setFromMetadata(toolMetadata.defaultValues);
        this.formChanged();
    }

    render () {
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
                    <button class="btn" type="button" @click=${this.setDefaults}>Reset to default</button>
                </div>
            </form>
        `;
    }
}

