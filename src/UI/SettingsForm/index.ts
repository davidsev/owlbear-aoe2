import { customElement } from 'lit/decorators.js';
import { html } from 'lit';
import { BaseElement } from '../BaseElement';
import { SelectEnum } from '../Components/SelectEnum';
import { ConeShape, ConeWidth, roomMetadata, StartPoint } from '../../Metadata/room';
import { MultiSelectEnum } from '../Components/MultiSelectEnum';

@customElement('settings-form')
export class SettingsForm extends BaseElement {

    private readonly inputs = {
        coneShape: new SelectEnum({
            [ConeShape.TRIANGLE]: 'Triangle (5e)',
            [ConeShape.SEMICIRCLE]: 'Semicircle (pathfinder)',
        }),
        coneWidth: new SelectEnum({
            [ConeWidth.SQUARE]: 'Width = Height (5e)',
            [ConeWidth.NINETY]: '90° (pathfinder / 3.5)',
            [ConeWidth.EQUILATERAL]: 'Equilateral',
        }),
        coneStartPoints: new MultiSelectEnum({
            [StartPoint.CORNER]: 'Corners',
            [StartPoint.CENTER]: 'Center',
            [StartPoint.EDGE]: 'Edges',
        }),
        coneOverlapThreshold: document.createElement('input'),
        coneSizeSnapping: document.createElement('input'),
    };

    constructor () {
        super();

        // Set up the inputs.
        this.inputs.coneOverlapThreshold.type = 'number';
        this.inputs.coneSizeSnapping.type = 'number';
        this.inputs.coneSizeSnapping.step = '0.1';

        // Update the metadata when the form changes.
        for (const [key, input] of Object.entries(this.inputs)) {
            input.addEventListener('change', this.formChanged.bind(this));
        }

        // Load the metadata into the form.
        console.log('coneWidth', roomMetadata.data.coneWidth);
        this.inputs.coneShape.value = roomMetadata.data.coneShape;
        this.inputs.coneWidth.value = roomMetadata.data.coneWidth;
        this.inputs.coneStartPoints.value = roomMetadata.data.coneStartPoints;
        this.inputs.coneOverlapThreshold.valueAsNumber = roomMetadata.data.coneOverlapThreshold * 100;
        this.inputs.coneSizeSnapping.valueAsNumber = roomMetadata.data.coneSizeSnapping;
    }

    private formChanged () {
        roomMetadata.set({
            coneShape: this.inputs.coneShape.value,
            coneWidth: this.inputs.coneWidth.value,
            coneStartPoints: this.inputs.coneStartPoints.value,
            coneOverlapThreshold: parseInt(this.inputs.coneOverlapThreshold.value) / 100,
            coneSizeSnapping: parseFloat(this.inputs.coneSizeSnapping.value),
        });
    }

    // Render the UI as a function of component state
    render () {
        return html`
            <form class="p-2">
                <form-control label="Cone Shape">
                    ${this.inputs.coneShape}
                </form-control>
                <form-control label="Cone Width">
                    ${this.inputs.coneWidth}
                </form-control>
                <form-control label="Cone Start Point(s)">
                    ${this.inputs.coneStartPoints}
                </form-control>
                <form-control label="Cone Overlap Threshold">
                    ${this.inputs.coneOverlapThreshold}
                </form-control>
                <form-control label="Cone Size Snapping">
                    ${this.inputs.coneSizeSnapping}
                </form-control>
            </form>

            <!--
            <div class="block w-full bg-background">background</div>
            <div class="block w-full bg-paper">paper</div>
            <div class="block w-full bg-primary">primary</div>
            <div class="block w-full bg-primary-light">primary light</div>
            <div class="block w-full bg-primary-dark">primary dark</div>
            <div class="block w-full bg-primary-contrast">primary contrast</div>
            <div class="block w-full bg-secondary">secondary</div>
            <div class="block w-full bg-secondary-light">secondary light</div>
            <div class="block w-full bg-secondary-dark">secondary dark</div>
            <div class="block w-full bg-secondary-contrast">secondary contrast</div>
            <div class="block w-full bg-text">text</div>
            <div class="block w-full bg-text-secondary">text secondary</div>
            <div class="block w-full bg-text-disabled">text disabled</div>
            -->
        `;
    }
}

