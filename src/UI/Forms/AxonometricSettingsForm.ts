import { customElement, query } from 'lit/decorators.js';
import { html, type PropertyValueMap } from 'lit';
import { BaseElement } from '../BaseElement';
import { SelectEnum } from '../Components/SelectEnum';
import { roomMetadata, SquareCircleStyle, SquareConeStyle, SquareCubeStyle, SquareDirection, StartPoint } from '../../Metadata/room';
import { MultiSelectEnum } from '../Components/MultiSelectEnum';
import style from './SettingsForm.css';
import { baseCSS } from '../baseCSS';

@customElement('axonometric-settings-form')
export class AxonometricSettingsForm extends BaseElement {
    static styles = baseCSS(style);

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
        circleStyle: new SelectEnum({
            [SquareCircleStyle.TEMPLATE]: 'D&D 5e (Template Method)',
            [SquareCircleStyle.PATHFINDER]: 'Pathfinder / D&D 3.5',
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
    @query('div#templateCircleFields', true)
    private accessor templateCircleFields!: HTMLDivElement;
    @query('div#templateCubeFields', true)
    private accessor templateCubeFields!: HTMLDivElement;

    @query('div#coneForm', true)
    private accessor coneForm!: HTMLDivElement;
    @query('div#circleForm', true)
    private accessor circleForm!: HTMLDivElement;
    @query('div#cubeForm', true)
    private accessor cubeForm!: HTMLDivElement;

    constructor() {
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
        for (const [, input] of Object.entries(this.inputs)) {
            input.addEventListener('change', this.formChanged.bind(this));
        }

        // Load the metadata into the form.
        this.inputs.coneStyle.value = roomMetadata.data.axonometricConeStyle;
        this.inputs.coneWidth.value = (roomMetadata.data.axonometricConeWidth || '').toString();
        this.inputs.coneStartPoints.value = roomMetadata.data.axonometricConeStartPoints;
        this.inputs.coneOverlapThreshold.valueAsNumber = roomMetadata.data.axonometricConeOverlapThreshold * 100;
        this.inputs.coneSizeSnapping.valueAsNumber = roomMetadata.data.axonometricConeSizeSnapping;
        this.inputs.coneDirection.value = roomMetadata.data.axonometricConeDirection;
        this.inputs.circleStyle.value = roomMetadata.data.axonometricCircleStyle;
        this.inputs.circleStartPoints.value = roomMetadata.data.axonometricCircleStartPoints;
        this.inputs.circleSizeSnapping.valueAsNumber = roomMetadata.data.axonometricCircleSizeSnapping;
        this.inputs.cubeStyle.value = roomMetadata.data.axonometricCubeStyle;
        this.inputs.cubeStartPoints.value = roomMetadata.data.axonometricCubeStartPoints;
        this.inputs.cubeOverlapThreshold.valueAsNumber = roomMetadata.data.axonometricCubeOverlapThreshold * 100;
        this.inputs.cubeSizeSnapping.valueAsNumber = roomMetadata.data.axonometricCubeSizeSnapping;
        this.inputs.cubeDirection.value = roomMetadata.data.axonometricCubeDirection;
    }

    private formChanged(e?: Event) {
        // Only run if the form is valid.
        if (e && e.target instanceof HTMLInputElement && !e.target.form?.checkValidity()) {
            return;
        }

        // Save the data
        roomMetadata.set({
            axonometricConeStyle: this.inputs.coneStyle.value,
            axonometricConeWidth: this.inputs.coneWidth.valueAsNumber,
            axonometricConeStartPoints: this.inputs.coneStartPoints.value,
            axonometricConeOverlapThreshold: parseInt(this.inputs.coneOverlapThreshold.value, 10) / 100,
            axonometricConeSizeSnapping: parseFloat(this.inputs.coneSizeSnapping.value),
            axonometricConeDirection: this.inputs.coneDirection.value,
            axonometricCircleStyle: this.inputs.circleStyle.value,
            axonometricCircleStartPoints: this.inputs.circleStartPoints.value,
            axonometricCircleSizeSnapping: parseFloat(this.inputs.circleSizeSnapping.value),
            axonometricCubeStyle: this.inputs.cubeStyle.value,
            axonometricCubeStartPoints: this.inputs.cubeStartPoints.value,
            axonometricCubeOverlapThreshold: parseInt(this.inputs.cubeOverlapThreshold.value, 10) / 100,
            axonometricCubeSizeSnapping: parseFloat(this.inputs.cubeSizeSnapping.value),
            axonometricCubeDirection: this.inputs.cubeDirection.value,
        });

        this.showOrHideFields();
    }

    private showOrHideFields() {
        this.templateConeFields.style.display = roomMetadata.data.axonometricConeStyle === SquareConeStyle.TEMPLATE ? 'initial' : 'none';
        this.templateCircleFields.style.display = roomMetadata.data.axonometricCircleStyle === SquareCircleStyle.TEMPLATE ? 'initial' : 'none';
        this.templateCubeFields.style.display = roomMetadata.data.axonometricCubeStyle === SquareCubeStyle.TEMPLATE ? 'initial' : 'none';
    }

    protected firstUpdated(_changedProperties: PropertyValueMap<unknown> | Map<PropertyKey, unknown>) {
        super.firstUpdated(_changedProperties);
        this.showOrHideFields();

        // Trigger a refresh, the first render won't have had the tab targets set.
        this.requestUpdate();
    }

    private setConeDefaults() {
        this.inputs.coneStyle.value = roomMetadata.defaultValues.axonometricConeStyle;
        this.inputs.coneWidth.value = (roomMetadata.defaultValues.axonometricConeWidth || '').toString();
        this.inputs.coneStartPoints.value = roomMetadata.defaultValues.axonometricConeStartPoints;
        this.inputs.coneOverlapThreshold.value = (roomMetadata.defaultValues.axonometricConeOverlapThreshold * 100).toString();
        this.inputs.coneSizeSnapping.value = roomMetadata.defaultValues.axonometricConeSizeSnapping.toString();
        this.inputs.coneDirection.value = roomMetadata.defaultValues.axonometricConeDirection;
        this.formChanged();
    }

    private setCircleDefaults() {
        this.inputs.circleStyle.value = roomMetadata.defaultValues.axonometricCircleStyle;
        this.inputs.circleStartPoints.value = roomMetadata.defaultValues.axonometricCircleStartPoints;
        this.inputs.circleSizeSnapping.value = roomMetadata.defaultValues.axonometricCircleSizeSnapping.toString();
        this.formChanged();
    }

    private setCubeDefaults() {
        this.inputs.cubeStyle.value = roomMetadata.defaultValues.axonometricCubeStyle;
        this.inputs.cubeStartPoints.value = roomMetadata.defaultValues.axonometricCubeStartPoints;
        this.inputs.cubeOverlapThreshold.value = (roomMetadata.defaultValues.axonometricCubeOverlapThreshold * 100).toString();
        this.inputs.cubeSizeSnapping.value = roomMetadata.defaultValues.axonometricCubeSizeSnapping.toString();
        this.inputs.cubeDirection.value = roomMetadata.defaultValues.axonometricCubeDirection;
        this.formChanged();
    }

    // Render the UI as a function of component state
    render() {
        return html`
            <tab-bar>
                <tab-button .target=${this.coneForm}>Cone</tab-button>
                <tab-button .target=${this.circleForm}>Circle</tab-button>
                <tab-button .target=${this.cubeForm}>Cube</tab-button>
            </tab-bar>
            <form>
                <div id="coneForm">
                    <form-control id="coneStyle" label="Cone Type">
                        <div class="flex">
                            ${this.inputs.coneStyle}
                            <help-tooltip>
                                <dl>
                                    <dt>D&D 5e (Template Method):</dt>
                                    <dd>The official rules for D&D 5e.&emsp;Draw a triangle, place it on the map
                                        somewhere, and see which cells it overlaps.
                                    </dd>
                                    <dt>Pathfinder / D&D 3.5:</dt>
                                    <dd>Uses the official shapes from the PHB.</dd>
                                    <dt>D&D 5e (Token Method)</dt>
                                    <dd>Variant method from XGtE, which guarantees a consistent number of cells hit at
                                        the cost of wonky shapes.
                                    </dd>
                                </dl>
                            </help-tooltip>
                        </div>
                    </form-control>
                    <div id="templateConeFields">
                        <form-control label="Width">
                            <div class="flex">
                                ${this.inputs.coneWidth}
                                <help-tooltip>
                                    The width of the cone, in degrees.<br>
                                    Leave it blank to use the D&D 5e "Width = Height" method.
                                </help-tooltip>
                            </div>
                        </form-control>
                        <form-control label="Restrict Starting Point">
                            <div class="flex">
                                ${this.inputs.coneStartPoints}
                                <help-tooltip>
                                    Select where on the map you can start drawing a cone from.<br/>
                                    For D&D 5e RAW this should be only corners.<br/>
                                    Leave it blank to allow a cone to start anywhere.
                                </help-tooltip>
                            </div>
                        </form-control>
                        <form-control label="Cell Overlap Threshold">
                            <div class="flex">
                                ${this.inputs.coneOverlapThreshold}
                                <help-tooltip>
                                    How much of a cell needs to be covered for it to be considered "hit" by the
                                    cone.<br/>
                                    By D&D 5e RAW this should be 0%, although I recommend using a minimum of 1.
                                </help-tooltip>
                            </div>
                        </form-control>
                        <form-control label="Size Snapping">
                            <div class="flex">
                                ${this.inputs.coneSizeSnapping}
                                <help-tooltip>
                                    Set what sizes of cone you want to snap to.<br/>
                                    If set to 0 then any size is allowed.<br/>
                                    If set to 1 then the cone must be a whole number of cells.<br/>
                                    0.5 will allow half-cells, etc.
                                </help-tooltip>
                            </div>
                        </form-control>
                        <form-control label="Restrict Direction">
                            <div class="flex">
                                ${this.inputs.coneDirection}
                                <help-tooltip>
                                    Choose which directions the cone can face.
                                </help-tooltip>
                            </div>
                        </form-control>
                    </div>
                    <div class="resetButton">
                        <button class="btn" type="button" @click=${this.setConeDefaults}>Reset to default</button>
                    </div>
                </div>
                <div id="circleForm">
                    <form-control id="circleStyle" label="Circle Type">
                        <div class="flex">
                            ${this.inputs.circleStyle}
                            <help-tooltip>
                                <dl>
                                    <dt>D&D 5e (Template Method):</dt>
                                    <dd>The official rules for D&D 5e.&emsp;Draw a circle, place it on the map
                                        somewhere, and see which cells are 50% covered.
                                    </dd>
                                    <dt>Pathfinder / D&D 3.5:</dt>
                                    <dd>Highlight all cells within range as per the alternating diagonals
                                        measurement.
                                    </dd>
                                </dl>
                            </help-tooltip>
                        </div>
                    </form-control>
                    <div id="templateCircleFields">
                        <form-control label="Restrict Starting Point">
                            <div class="flex">
                                ${this.inputs.circleStartPoints}
                                <help-tooltip>
                                    Select where on the map you can start drawing a circle from.<br/>
                                    For D&D 5e RAW this should be only corners.<br/>
                                    Leave it blank to allow a circle to start anywhere.
                                </help-tooltip>
                            </div>
                        </form-control>
                        <form-control label="Size Snapping">
                            <div class="flex">
                                ${this.inputs.circleSizeSnapping}
                                <help-tooltip>
                                    Set what sizes of circle you want to snap to.<br/>
                                    If set to 0 then any size is allowed.<br/>
                                    If set to 1 then the circle must be a whole number of cells.<br/>
                                    0.5 will allow half-cells, etc.
                                </help-tooltip>
                            </div>
                        </form-control>
                    </div>
                    <div class="resetButton">
                        <button class="btn" type="button" @click=${this.setCircleDefaults}>Reset to default</button>
                    </div>
                </div>
                <div id="cubeForm">
                    <form-control id="cubeStyle" label="Cube Type">
                        <div class="flex">
                            ${this.inputs.cubeStyle}
                            <help-tooltip>
                                <dl>
                                    <dt>Default:</dt>
                                    <dd>The official rules for D&D & Pathfinder.&emsp;A simple grid-aligned square.
                                    </dd>
                                    <dt>Template Method</dt>
                                    <dd>Draw a square on the map and see which cells it hits.
                                    </dd>
                                </dl>
                            </help-tooltip>
                        </div>
                    </form-control>
                    <div id="templateCubeFields">
                        <form-control label="Restrict Starting Point">
                            <div class="flex">
                                ${this.inputs.cubeStartPoints}
                                <help-tooltip>
                                    Select where on the map you can start drawing a cube from.<br/>
                                    Leave it blank to allow a cube to start anywhere.
                                </help-tooltip>
                            </div>
                        </form-control>
                        <form-control label="Cell Overlap Threshold">
                            <div class="flex">
                                ${this.inputs.cubeOverlapThreshold}
                                <help-tooltip>
                                    How much of a cell needs to be covered for it to be considered "hit" by the
                                    cube.<br/>
                                </help-tooltip>
                            </div>
                        </form-control>
                        <form-control label="Size Snapping">
                            <div class="flex">
                                ${this.inputs.cubeSizeSnapping}
                                <help-tooltip>
                                    Set what sizes of cube you want to snap to.<br/>
                                    If set to 0 then any size is allowed.<br/>
                                    If set to 1 then the cube must be a whole number of cells.<br/>
                                    0.5 will allow half-cells, etc.
                                </help-tooltip>
                            </div>
                        </form-control>
                        <form-control label="Restrict Direction">
                            <div class="flex">
                                ${this.inputs.cubeDirection}
                                <help-tooltip>
                                    Choose which directions the cube can face.<br/>
                                    Note this is the direction to the oppisite corner of the cube, so selecting 4
                                    compass points results in cubes 45° from the axis.
                                </help-tooltip>
                            </div>
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
