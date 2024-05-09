import { customElement, query } from 'lit/decorators.js';
import { html, PropertyValueMap } from 'lit';
import { BaseElement } from '../BaseElement';
import { SelectEnum } from '../Components/SelectEnum';
import { ConeStyle, roomMetadata, StartPoint } from '../../Metadata/room';
import { MultiSelectEnum } from '../Components/MultiSelectEnum';

@customElement('square-settings-form')
export class SquareSettingsForm extends BaseElement {

    private readonly inputs = {
        coneStyle: new SelectEnum({
            [ConeStyle.TEMPLATE]: 'D&D 5e (Template Method)',
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
        circleStartPoints: new MultiSelectEnum({
            [StartPoint.CORNER]: 'Corners',
            [StartPoint.CENTER]: 'Center',
            [StartPoint.EDGE]: 'Edges',
        }),
        circleSizeSnapping: document.createElement('input'),
    };

    @query('div#templateConeFields', true)
    private accessor templateConeFields!: HTMLDivElement;

    @query('div#coneForm', true)
    private accessor coneForm!: HTMLDivElement;
    @query('div#circleForm', true)
    private accessor circleForm!: HTMLDivElement;
    @query('div#cubeForm', true)
    private accessor cubeForm!: HTMLDivElement;

    constructor () {
        super();

        // Set up the inputs.
        this.inputs.coneWidth.type = 'number';
        this.inputs.coneWidth.setAttribute('placeholder', 'Width = Height');
        this.inputs.coneOverlapThreshold.type = 'number';
        this.inputs.coneSizeSnapping.type = 'number';
        this.inputs.coneSizeSnapping.step = '0.1';
        this.inputs.circleSizeSnapping.type = 'number';
        this.inputs.circleSizeSnapping.step = '0.1';

        // Update the metadata when the form changes.
        for (const [key, input] of Object.entries(this.inputs)) {
            input.addEventListener('change', this.formChanged.bind(this));
        }

        // Load the metadata into the form.
        this.inputs.coneStyle.value = roomMetadata.data.squareConeStyle;
        this.inputs.coneWidth.value = (roomMetadata.data.squareConeWidth || '').toString();
        this.inputs.coneStartPoints.value = roomMetadata.data.squareConeStartPoints;
        this.inputs.coneOverlapThreshold.valueAsNumber = roomMetadata.data.squareConeOverlapThreshold * 100;
        this.inputs.coneSizeSnapping.valueAsNumber = roomMetadata.data.squareConeSizeSnapping;
        this.inputs.circleStartPoints.value = roomMetadata.data.squareCircleStartPoints;
        this.inputs.circleSizeSnapping.valueAsNumber = roomMetadata.data.squareCircleSizeSnapping;
    }

    private formChanged () {
        // Save the data
        roomMetadata.set({
            squareConeStyle: this.inputs.coneStyle.value,
            squareConeWidth: this.inputs.coneWidth.valueAsNumber,
            squareConeStartPoints: this.inputs.coneStartPoints.value,
            squareConeOverlapThreshold: parseInt(this.inputs.coneOverlapThreshold.value) / 100,
            squareConeSizeSnapping: parseFloat(this.inputs.coneSizeSnapping.value),
            squareCircleStartPoints: this.inputs.circleStartPoints.value,
            squareCircleSizeSnapping: parseFloat(this.inputs.circleSizeSnapping.value),
        });

        this.showOrHideFields();
    }

    private showOrHideFields () {
        // Show or hide fields
        this.templateConeFields.style.display = roomMetadata.data.squareConeStyle == ConeStyle.TEMPLATE ? 'initial' : 'none';
    }

    protected firstUpdated (_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>) {
        super.firstUpdated(_changedProperties);
        this.showOrHideFields();

        // Trigger a refresh, the first render won't have had the tab targets set.
        this.requestUpdate();
    }

    private setConeDefaults () {
        this.inputs.coneStyle.value = roomMetadata.defaultValues.squareConeStyle;
        this.inputs.coneWidth.value = (roomMetadata.defaultValues.squareConeWidth || '').toString();
        this.inputs.coneStartPoints.value = roomMetadata.defaultValues.squareConeStartPoints;
        this.inputs.coneOverlapThreshold.value = (roomMetadata.defaultValues.squareConeOverlapThreshold * 100).toString();
        this.inputs.coneSizeSnapping.value = roomMetadata.defaultValues.squareConeSizeSnapping.toString();
        this.formChanged();
    }

    private setCircleDefaults () {
        this.inputs.circleStartPoints.value = roomMetadata.defaultValues.squareCircleStartPoints;
        this.inputs.circleSizeSnapping.value = roomMetadata.defaultValues.squareCircleSizeSnapping.toString();
        this.formChanged();
    }

    // Render the UI as a function of component state
    render () {
        return html`
            <form class="p-2">
                <tab-bar class="mb-2">
                    <tab-button .target=${this.coneForm}>Cone</tab-button>
                    <tab-button .target=${this.circleForm}>Circle</tab-button>
                    <tab-button .target=${this.cubeForm}>Cube</tab-button>
                </tab-bar>
                <div id="coneForm">
                    <form-control id="coneStyle" label="Cone Style">
                        ${this.inputs.coneStyle}
                    </form-control>
                    <div id="templateConeFields">
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
                        <div class="flex justify-end">
                            <button type="button" @click=${this.setConeDefaults}>Reset to default</button>
                        </div>
                    </div>
                </div>
                <div id="circleForm">
                    <form-control label="Circle Start Point(s)">
                        ${this.inputs.circleStartPoints}
                    </form-control>
                    <form-control label="Circle Size Snapping">
                        ${this.inputs.circleSizeSnapping}
                    </form-control>
                    <div class="flex justify-end">
                        <button type="button" @click=${this.setCircleDefaults}>Reset to default</button>
                    </div>
                </div>
                <div id="cubeForm"></div>
            </form>
        `;
    }
}

