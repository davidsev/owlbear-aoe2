import { customElement, query } from 'lit/decorators.js';
import { html, PropertyValueMap } from 'lit';
import { BaseElement } from '../BaseElement';
import { SelectEnum } from '../Components/SelectEnum';
import { roomMetadata, SquareConeStyle, SquareCubeStyle, SquareDirection, StartPoint } from '../../Metadata/room';
import { MultiSelectEnum } from '../Components/MultiSelectEnum';
import style from './SettingsForm.css';
import { baseCSS } from '../baseCSS';

@customElement('square-settings-form')
export class SquareSettingsForm extends BaseElement {

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

    private formChanged (e?: Event) {
        // Only run if the form is valid.
        if (e && e.target instanceof HTMLInputElement && !e.target.form?.checkValidity()) {
            return;
        }

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
                        <div class="flex">
                            ${this.inputs.coneStyle}
                            <help-tooltip>
                                <dl>
                                    <dt>D&D 5e (Template Method):</dt>
                                    <dd>The official rules for D&D 5e.&emsp;Draw a triangle, place it on the map
                                        somewhere, and see which squares it overlaps.
                                    </dd>
                                    <dt>Pathfinder / D&D 3.5:</dt>
                                    <dd>Uses the official shapes from the PHB.</dd>
                                    <dt>D&D 5e (Token Method)</dt>
                                    <dd>Variant method from XGtE, which guarantees a consistent number of squares hit at
                                        the cost of wonky shapes.
                                    </dd>
                                </dl>
                            </help-tooltip>
                        </div>
                    </form-control>
                    <div id="templateConeFields">
                        <form-control label="Cone Width">
                            <div class="flex">
                                ${this.inputs.coneWidth}
                                <help-tooltip>
                                    The width of the cone, in degrees.<br>
                                    Leave it blank to use the D&D 5e "Width = Height" method.
                                </help-tooltip>
                            </div>
                        </form-control>
                        <form-control label="Cone Start Point(s)">
                            <div class="flex">
                                ${this.inputs.coneStartPoints}
                                <help-tooltip>
                                    Select where on the map you can start drawing a cone from.<br/>
                                    For D&D 5e RAW this should be only corners.<br/>
                                    Leave it blank to allow a cone to start anywhere.
                                </help-tooltip>
                            </div>
                        </form-control>
                        <form-control label="Cone Overlap Threshold">
                            <div class="flex">
                                ${this.inputs.coneOverlapThreshold}
                                <help-tooltip>
                                    How much of a square needs to be covered for it to be considered "hit" by the
                                    cone.<br/>
                                    By D&D 5e RAW this should be 0%, although I recommend using 1 instead.
                                </help-tooltip>
                            </div>
                        </form-control>
                        <form-control label="Cone Size Snapping">
                            <div class="flex">
                                ${this.inputs.coneSizeSnapping}
                                <help-tooltip>
                                    Set what sizes of cone you want to snap to.<br/>
                                    If set to 0 then any size is allowed.<br/>
                                    If set to 1 then the cone must be a whole number of squares.<br/>
                                    0.5 will allow half-squares, etc.
                                </help-tooltip>
                            </div>
                        </form-control>
                        <form-control label="Cone Direction">
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
                    <form-control label="Circle Start Point(s)">
                        <div class="flex">
                            ${this.inputs.circleStartPoints}
                            <help-tooltip>
                                Select where on the map you can start drawing a circle from.<br/>
                                For D&D 5e RAW this should be only corners.<br/>
                                Leave it blank to allow a circle to start anywhere.
                            </help-tooltip>
                        </div>
                    </form-control>
                    <form-control label="Circle Size Snapping">
                        <div class="flex">
                            ${this.inputs.circleSizeSnapping}
                            <help-tooltip>
                                Set what sizes of circle you want to snap to.<br/>
                                If set to 0 then any size is allowed.<br/>
                                If set to 1 then the circle must be a whole number of squares.<br/>
                                0.5 will allow half-squares, etc.
                            </help-tooltip>
                        </div>
                    </form-control>
                    <div class="resetButton">
                        <button class="btn" type="button" @click=${this.setCircleDefaults}>Reset to default</button>
                    </div>
                </div>
                <div id="cubeForm">
                    <form-control id="cubeStyle" label="Cube Style">
                        <div class="flex">
                            ${this.inputs.cubeStyle}
                            <help-tooltip>
                                <dl>
                                    <dt>Default:</dt>
                                    <dd>The official rules for D&D & Pathfinder.&emsp;A simple axis-aligned square.
                                    </dd>
                                    <dt>Template Method</dt>
                                    <dd>Draw a square on the map and see which squares it hits.
                                    </dd>
                                </dl>
                            </help-tooltip>
                        </div>
                    </form-control>
                    <div id="templateCubeFields">
                        <form-control label="Cube Start Point(s)">
                            <div class="flex">
                                ${this.inputs.cubeStartPoints}
                                <help-tooltip>
                                    Select where on the map you can start drawing a cube from.<br/>
                                    Leave it blank to allow a cube to start anywhere.
                                </help-tooltip>
                            </div>
                        </form-control>
                        <form-control label="Cube Overlap Threshold">
                            <div class="flex">
                                ${this.inputs.cubeOverlapThreshold}
                                <help-tooltip>
                                    How much of a square needs to be covered for it to be considered "hit" by the
                                    cube.<br/>
                                </help-tooltip>
                            </div>
                        </form-control>
                        <form-control label="Cube Size Snapping">
                            <div class="flex">
                                ${this.inputs.cubeSizeSnapping}
                                <help-tooltip>
                                    Set what sizes of cube you want to snap to.<br/>
                                    If set to 0 then any size is allowed.<br/>
                                    If set to 1 then the cube must be a whole number of squares.<br/>
                                    0.5 will allow half-squares, etc.
                                </help-tooltip>
                            </div>
                        </form-control>
                        <form-control label="Cube Direction">
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

