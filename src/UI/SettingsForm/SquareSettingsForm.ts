import { customElement, query } from 'lit/decorators.js';
import { html, PropertyValueMap, unsafeCSS } from 'lit';
import { BaseElement } from '../BaseElement';
import { SelectEnum } from '../Components/SelectEnum';
import { roomMetadata, SquareConeStyle, SquareCubeStyle, SquareDirection, StartPoint } from '../../Metadata/room';
import { MultiSelectEnum } from '../Components/MultiSelectEnum';
import style from './SettingsForm.css';

@customElement('square-settings-form')
export class SquareSettingsForm extends BaseElement {

    static styles = [
        ...BaseElement.styles,
        unsafeCSS(style),
    ];

    private readonly inputs = {
        coneStyle: new SelectEnum({
            [SquareConeStyle.TEMPLATE]: 'D&D 5e (Template Method)',
            [SquareConeStyle.PATHFINDER]: 'Pathfinder / D&D 3.5',
            [SquareConeStyle.TOKEN]: 'D&D 5e (Token Method)',
        }),
        coneWidth: document.createElement('input'),
        coneStartPoints: new MultiSelectEnum({
            [StartPoint.CORNER]: 'Corners',
            [StartPoint.CENTER]: 'Center',
            [StartPoint.EDGE]: 'Edges',
        }),
        coneOverlapThreshold: document.createElement('input'),
        coneSizeSnapping: document.createElement('input'),
        coneDirection: new SelectEnum({
            [SquareDirection.ALL]: 'Unrestricted',
            [SquareDirection.FOUR]: '4 Compass Points',
            [SquareDirection.EIGHT]: '8 Compass Points',
        }),
        circleStartPoints: new MultiSelectEnum({
            [StartPoint.CORNER]: 'Corners',
            [StartPoint.CENTER]: 'Center',
            [StartPoint.EDGE]: 'Edges',
        }),
        circleSizeSnapping: document.createElement('input'),
        cubeStyle: new SelectEnum({
            [SquareCubeStyle.SQUARE]: 'Default',
            [SquareCubeStyle.TEMPLATE]: 'Template',
        }),
        cubeStartPoints: new MultiSelectEnum({
            [StartPoint.CORNER]: 'Corners',
            [StartPoint.CENTER]: 'Center',
            [StartPoint.EDGE]: 'Edges',
        }),
        cubeSizeSnapping: document.createElement('input'),
        cubeOverlapThreshold: document.createElement('input'),
        cubeDirection: new SelectEnum({
            [SquareDirection.ALL]: 'Unrestricted',
            [SquareDirection.FOUR]: '4 Compass Points',
            [SquareDirection.EIGHT]: '8 Compass Points',
        }),
    };

    @query('div#templateConeFields', true)
    private accessor templateConeFields!: HTMLDivElement;
    @query('div#templateCubeFields', true)
    private accessor templateCubeFields!: HTMLDivElement;

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
        this.inputs.cubeOverlapThreshold.type = 'number';
        this.inputs.cubeSizeSnapping.type = 'number';
        this.inputs.cubeSizeSnapping.step = '0.1';

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
        this.inputs.coneDirection.value = roomMetadata.data.squareConeDirection;
        this.inputs.circleStartPoints.value = roomMetadata.data.squareCircleStartPoints;
        this.inputs.circleSizeSnapping.valueAsNumber = roomMetadata.data.squareCircleSizeSnapping;
        this.inputs.cubeStyle.value = roomMetadata.data.squareCubeStyle;
        this.inputs.cubeStartPoints.value = roomMetadata.data.squareCubeStartPoints;
        this.inputs.cubeOverlapThreshold.valueAsNumber = roomMetadata.data.squareCubeOverlapThreshold * 100;
        this.inputs.cubeSizeSnapping.valueAsNumber = roomMetadata.data.squareCubeSizeSnapping;
        this.inputs.cubeDirection.value = roomMetadata.data.squareCubeDirection;
    }

    private formChanged () {
        // Save the data
        roomMetadata.set({
            squareConeStyle: this.inputs.coneStyle.value,
            squareConeWidth: this.inputs.coneWidth.valueAsNumber,
            squareConeStartPoints: this.inputs.coneStartPoints.value,
            squareConeOverlapThreshold: parseInt(this.inputs.coneOverlapThreshold.value) / 100,
            squareConeSizeSnapping: parseFloat(this.inputs.coneSizeSnapping.value),
            squareConeDirection: this.inputs.coneDirection.value,
            squareCircleStartPoints: this.inputs.circleStartPoints.value,
            squareCircleSizeSnapping: parseFloat(this.inputs.circleSizeSnapping.value),
            squareCubeStyle: this.inputs.cubeStyle.value,
            squareCubeStartPoints: this.inputs.cubeStartPoints.value,
            squareCubeOverlapThreshold: parseInt(this.inputs.cubeOverlapThreshold.value) / 100,
            squareCubeSizeSnapping: parseFloat(this.inputs.cubeSizeSnapping.value),
            squareCubeDirection: this.inputs.cubeDirection.value,
        });

        this.showOrHideFields();
    }

    private showOrHideFields () {
        this.templateConeFields.style.display = roomMetadata.data.squareConeStyle == SquareConeStyle.TEMPLATE ? 'initial' : 'none';
        this.templateCubeFields.style.display = roomMetadata.data.squareCubeStyle == SquareCubeStyle.TEMPLATE ? 'initial' : 'none';
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
        this.inputs.coneDirection.value = roomMetadata.defaultValues.squareConeDirection;
        this.formChanged();
    }

    private setCircleDefaults () {
        this.inputs.circleStartPoints.value = roomMetadata.defaultValues.squareCircleStartPoints;
        this.inputs.circleSizeSnapping.value = roomMetadata.defaultValues.squareCircleSizeSnapping.toString();
        this.formChanged();
    }

    private setCubeDefaults () {
        this.inputs.cubeStyle.value = roomMetadata.defaultValues.squareCubeStyle;
        this.inputs.cubeStartPoints.value = roomMetadata.defaultValues.squareCubeStartPoints;
        this.inputs.cubeOverlapThreshold.value = (roomMetadata.defaultValues.squareCubeOverlapThreshold * 100).toString();
        this.inputs.cubeSizeSnapping.value = roomMetadata.defaultValues.squareCubeSizeSnapping.toString();
        this.inputs.cubeDirection.value = roomMetadata.defaultValues.squareCubeDirection;
        this.formChanged();
    }

    // Render the UI as a function of component state
    render () {
        return html`
            <tab-bar>
                <tab-button .target=${this.coneForm}>Cone</tab-button>
                <tab-button .target=${this.circleForm}>Circle</tab-button>
                <tab-button .target=${this.cubeForm}>Cube</tab-button>
            </tab-bar>
            <form>
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
                        <form-control label="Cone Direction">
                            ${this.inputs.coneDirection}
                        </form-control>
                    </div>
                    <div class="resetButton">
                        <button class="btn" type="button" @click=${this.setConeDefaults}>Reset to default</button>
                    </div>
                </div>
                <div id="circleForm">
                    <form-control label="Circle Start Point(s)">
                        ${this.inputs.circleStartPoints}
                    </form-control>
                    <form-control label="Circle Size Snapping">
                        ${this.inputs.circleSizeSnapping}
                    </form-control>
                    <div class="resetButton">
                        <button class="btn" type="button" @click=${this.setCircleDefaults}>Reset to default</button>
                    </div>
                </div>
                <div id="cubeForm">
                    <form-control id="cubeStyle" label="Cube Style">
                        ${this.inputs.cubeStyle}
                    </form-control>
                    <div id="templateCubeFields">
                        <form-control label="Cube Start Point(s)">
                            ${this.inputs.cubeStartPoints}
                        </form-control>
                        <form-control label="Cube Overlap Threshold">
                            ${this.inputs.cubeOverlapThreshold}
                        </form-control>
                        <form-control label="Cube Size Snapping">
                            ${this.inputs.cubeSizeSnapping}
                        </form-control>
                        <form-control label="Cube Direction">
                            ${this.inputs.cubeDirection}
                        </form-control>
                    </div>
                    <div class="resetButton">
                        <button class="btn" type="button" @click=${this.setCubeDefaults}>Reset to default</button>
                    </div>
                </div>
            </form>
        `;
    }
}

