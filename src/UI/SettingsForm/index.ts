import { customElement, query } from 'lit/decorators.js';
import { html, PropertyValueMap } from 'lit';
import { BaseElement } from '../BaseElement';
import { SelectEnum } from '../Components/SelectEnum';
import { ConeStyle, roomMetadata, StartPoint } from '../../Metadata/room';
import { MultiSelectEnum } from '../Components/MultiSelectEnum';
import { FormControl } from '../Components/FormControl';

@customElement('settings-form')
export class SettingsForm extends BaseElement {

    private readonly inputs = {
        coneStyle: new SelectEnum({
            [ConeStyle.TEMPLATE]: 'D&D 5e',
            [ConeStyle.PATHFINDER]: 'Pathfinder / D&D 3.5',
            [ConeStyle.TOKEN]: 'D&D 5e (Token Method)',
        }),
        coneWidth: document.createElement('input'),
        coneStartPoints: new MultiSelectEnum({
            [StartPoint.CORNER]: 'Corners',
            [StartPoint.CENTER]: 'Center',
            [StartPoint.EDGE]: 'Edges',
        }),
        coneOverlapThreshold: document.createElement('input'),
        coneSizeSnapping: document.createElement('input'),
    };

    @query('form-control#coneWidth', true)
    private accessor coneWidthWrapper!: FormControl;
    @query('form-control#coneStartPoints', true)
    private accessor coneStartPointsWrapper!: FormControl;
    @query('form-control#coneOverlapThreshold', true)
    private accessor coneOverlapThresholdWrapper!: FormControl;
    @query('form-control#coneSizeSnapping', true)
    private accessor coneSizeSnappingWrapper!: FormControl;

    constructor () {
        super();

        // Set up the inputs.
        this.inputs.coneWidth.type = 'number';
        this.inputs.coneWidth.setAttribute('placeholder', 'Width = Height');
        this.inputs.coneOverlapThreshold.type = 'number';
        this.inputs.coneSizeSnapping.type = 'number';
        this.inputs.coneSizeSnapping.step = '0.1';

        // Update the metadata when the form changes.
        for (const [key, input] of Object.entries(this.inputs)) {
            input.addEventListener('change', this.formChanged.bind(this));
        }

        // Load the metadata into the form.
        this.inputs.coneStyle.value = roomMetadata.data.coneStyle;
        this.inputs.coneWidth.value = (roomMetadata.data.coneWidth || '').toString();
        this.inputs.coneStartPoints.value = roomMetadata.data.coneStartPoints;
        this.inputs.coneOverlapThreshold.valueAsNumber = roomMetadata.data.coneOverlapThreshold * 100;
        this.inputs.coneSizeSnapping.valueAsNumber = roomMetadata.data.coneSizeSnapping;
    }

    private formChanged () {
        // Save the data
        roomMetadata.set({
            coneStyle: this.inputs.coneStyle.value,
            coneWidth: this.inputs.coneWidth.valueAsNumber,
            coneStartPoints: this.inputs.coneStartPoints.value,
            coneOverlapThreshold: parseInt(this.inputs.coneOverlapThreshold.value) / 100,
            coneSizeSnapping: parseFloat(this.inputs.coneSizeSnapping.value),
        });

        this.showOrHideFields();
    }

    private showOrHideFields () {
        // Show or hide fields
        this.coneWidthWrapper.style.display = roomMetadata.data.coneStyle == ConeStyle.TEMPLATE ? 'initial' : 'none';
        this.coneStartPointsWrapper.style.display = roomMetadata.data.coneStyle == ConeStyle.TEMPLATE ? 'initial' : 'none';
        this.coneOverlapThresholdWrapper.style.display = roomMetadata.data.coneStyle == ConeStyle.TEMPLATE ? 'initial' : 'none';
        this.coneSizeSnappingWrapper.style.display = roomMetadata.data.coneStyle == ConeStyle.TEMPLATE ? 'initial' : 'none';
    }

    firstUpdated (_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>) {
        super.firstUpdated(_changedProperties);
        this.showOrHideFields();
    }

    // Render the UI as a function of component state
    render () {
        return html`
            <form class="p-2">
                <form-control id="coneStyle" label="Cone Style">
                    ${this.inputs.coneStyle}
                </form-control>
                <form-control id="coneWidth" label="Cone Width">
                    ${this.inputs.coneWidth}
                </form-control>
                <form-control id="coneStartPoints" label="Cone Start Point(s)">
                    ${this.inputs.coneStartPoints}
                </form-control>
                <form-control id="coneOverlapThreshold" label="Cone Overlap Threshold">
                    ${this.inputs.coneOverlapThreshold}
                </form-control>
                <form-control id="coneSizeSnapping" label="Cone Size Snapping">
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

