import { customElement, query } from 'lit/decorators.js';
import { html, type PropertyValueMap } from 'lit';
import { BaseElement, baseCSS } from '@davidsev/owlbear-ui';
import { roomMetadata, SquareCircleStyle, SquareConeStyle, SquareCubeStyle, SquareDirection, StartPoint } from '../../Metadata/room';
import { MAX_CONE_WIDTH_DEGREES, MIN_CONE_WIDTH_DEGREES } from '../../Tool/ConeTool';
import { enumMultiSelect, enumSelect, numberInput } from '../Components/controls';
import style from './SettingsForm.css';
import { inputsAreValid, nullableNumberValue, numberValue, percentString, percentValue } from './inputValue';

@customElement('square-settings-form')
export class SquareSettingsForm extends BaseElement {
    static styles = baseCSS(style);

    private readonly inputs = {
        coneStyle: enumSelect({
            [SquareConeStyle.TEMPLATE]: 'D&D 5e (Template Method)',
            [SquareConeStyle.PATHFINDER]: 'Pathfinder / D&D 3.5',
            [SquareConeStyle.TOKEN]: 'D&D 5e (Token Method)',
            [SquareConeStyle.HYBRID]: 'D&D 5e (Hybrid Method)',
        }),
        coneWidth: numberInput({ placeholder: 'Width = Height', min: MIN_CONE_WIDTH_DEGREES.toString(), max: MAX_CONE_WIDTH_DEGREES.toString() }),
        coneStartPoints: enumMultiSelect({
            [StartPoint.CORNER]: 'Corners',
            [StartPoint.CENTER]: 'Center',
            [StartPoint.EDGE]: 'Edges',
        }),
        coneOverlapThreshold: numberInput(),
        coneSizeSnapping: numberInput({ step: '0.1' }),
        coneDirection: enumSelect({
            [SquareDirection.ALL]: 'Unrestricted',
            [SquareDirection.FOUR]: '4 Compass Points',
            [SquareDirection.EIGHT]: '8 Compass Points',
        }),
        circleStyle: enumSelect({
            [SquareCircleStyle.TEMPLATE]: 'D&D 5e (Template Method)',
            [SquareCircleStyle.PATHFINDER]: 'Pathfinder / D&D 3.5',
        }),
        circleStartPoints: enumMultiSelect({
            [StartPoint.CORNER]: 'Corners',
            [StartPoint.CENTER]: 'Center',
            [StartPoint.EDGE]: 'Edges',
        }),
        circleSizeSnapping: numberInput({ step: '0.1' }),
        cubeStyle: enumSelect({
            [SquareCubeStyle.SQUARE]: 'Default',
            [SquareCubeStyle.TEMPLATE]: 'Template',
        }),
        cubeStartPoints: enumMultiSelect({
            [StartPoint.CORNER]: 'Corners',
            [StartPoint.CENTER]: 'Center',
            [StartPoint.EDGE]: 'Edges',
        }),
        cubeSizeSnapping: numberInput({ step: '0.1' }),
        cubeOverlapThreshold: numberInput(),
        cubeDirection: enumSelect({
            [SquareDirection.ALL]: 'Unrestricted',
            [SquareDirection.FOUR]: '4 Compass Points',
            [SquareDirection.EIGHT]: '8 Compass Points',
        }),
    };

    @query('div#templateConeFields', true)
    private accessor templateConeFields!: HTMLDivElement;
    @query('div#coneWidthField', true)
    private accessor coneWidthField!: HTMLDivElement;
    @query('div#coneOverlapThresholdField', true)
    private accessor coneOverlapThresholdField!: HTMLDivElement;
    @query('div#templateCircleFields', true)
    private accessor templateCircleFields!: HTMLDivElement;
    @query('div#templateCubeFields', true)
    private accessor templateCubeFields!: HTMLDivElement;

    constructor() {
        super();

        // Update the metadata when the form changes.
        for (const [, input] of Object.entries(this.inputs)) {
            input.addEventListener('change', this.formChanged.bind(this));
        }

        // Load the metadata into the form.
        this.inputs.coneStyle.value = roomMetadata.data.squareConeStyle;
        this.inputs.coneWidth.value = (roomMetadata.data.squareConeWidth || '').toString();
        this.inputs.coneStartPoints.value = roomMetadata.data.squareConeStartPoints;
        this.inputs.coneOverlapThreshold.value = percentString(roomMetadata.data.squareConeOverlapThreshold);
        this.inputs.coneSizeSnapping.value = roomMetadata.data.squareConeSizeSnapping.toString();
        this.inputs.coneDirection.value = roomMetadata.data.squareConeDirection;
        this.inputs.circleStyle.value = roomMetadata.data.squareCircleStyle;
        this.inputs.circleStartPoints.value = roomMetadata.data.squareCircleStartPoints;
        this.inputs.circleSizeSnapping.value = roomMetadata.data.squareCircleSizeSnapping.toString();
        this.inputs.cubeStyle.value = roomMetadata.data.squareCubeStyle;
        this.inputs.cubeStartPoints.value = roomMetadata.data.squareCubeStartPoints;
        this.inputs.cubeOverlapThreshold.value = percentString(roomMetadata.data.squareCubeOverlapThreshold);
        this.inputs.cubeSizeSnapping.value = roomMetadata.data.squareCubeSizeSnapping.toString();
        this.inputs.cubeDirection.value = roomMetadata.data.squareCubeDirection;
    }

    private formChanged(e?: Event) {
        // Only run if the form is valid.
        if (e && !inputsAreValid(this.inputs)) {
            return;
        }

        // Save the data
        roomMetadata.set({
            squareConeStyle: this.inputs.coneStyle.value,
            squareConeWidth: nullableNumberValue(this.inputs.coneWidth),
            squareConeStartPoints: this.inputs.coneStartPoints.value,
            squareConeOverlapThreshold: percentValue(this.inputs.coneOverlapThreshold, roomMetadata.defaultValues.squareConeOverlapThreshold),
            squareConeSizeSnapping: numberValue(this.inputs.coneSizeSnapping, roomMetadata.defaultValues.squareConeSizeSnapping),
            squareConeDirection: this.inputs.coneDirection.value,
            squareCircleStyle: this.inputs.circleStyle.value,
            squareCircleStartPoints: this.inputs.circleStartPoints.value,
            squareCircleSizeSnapping: numberValue(this.inputs.circleSizeSnapping, roomMetadata.defaultValues.squareCircleSizeSnapping),
            squareCubeStyle: this.inputs.cubeStyle.value,
            squareCubeStartPoints: this.inputs.cubeStartPoints.value,
            squareCubeOverlapThreshold: percentValue(this.inputs.cubeOverlapThreshold, roomMetadata.defaultValues.squareCubeOverlapThreshold),
            squareCubeSizeSnapping: numberValue(this.inputs.cubeSizeSnapping, roomMetadata.defaultValues.squareCubeSizeSnapping),
            squareCubeDirection: this.inputs.cubeDirection.value,
        });

        this.showOrHideFields();
    }

    private showOrHideFields() {
        const coneStyle = roomMetadata.data.squareConeStyle;
        this.templateConeFields.style.display = coneStyle === SquareConeStyle.TEMPLATE || coneStyle === SquareConeStyle.HYBRID ? '' : 'none';
        // The hybrid method takes a fixed number of squares, which is only defined for the default width,
        // and means the threshold does nothing.
        this.coneWidthField.style.display = coneStyle === SquareConeStyle.TEMPLATE ? '' : 'none';
        this.coneOverlapThresholdField.style.display = coneStyle === SquareConeStyle.TEMPLATE ? '' : 'none';
        this.templateCircleFields.style.display = roomMetadata.data.squareCircleStyle === SquareCircleStyle.TEMPLATE ? '' : 'none';
        this.templateCubeFields.style.display = roomMetadata.data.squareCubeStyle === SquareCubeStyle.TEMPLATE ? '' : 'none';
    }

    protected firstUpdated(_changedProperties: PropertyValueMap<unknown> | Map<PropertyKey, unknown>) {
        super.firstUpdated(_changedProperties);
        this.showOrHideFields();
    }

    private setConeDefaults() {
        this.inputs.coneStyle.value = roomMetadata.defaultValues.squareConeStyle;
        this.inputs.coneWidth.value = (roomMetadata.defaultValues.squareConeWidth || '').toString();
        this.inputs.coneStartPoints.value = roomMetadata.defaultValues.squareConeStartPoints;
        this.inputs.coneOverlapThreshold.value = percentString(roomMetadata.defaultValues.squareConeOverlapThreshold);
        this.inputs.coneSizeSnapping.value = roomMetadata.defaultValues.squareConeSizeSnapping.toString();
        this.inputs.coneDirection.value = roomMetadata.defaultValues.squareConeDirection;
        this.formChanged();
    }

    private setCircleDefaults() {
        this.inputs.circleStyle.value = roomMetadata.defaultValues.squareCircleStyle;
        this.inputs.circleStartPoints.value = roomMetadata.defaultValues.squareCircleStartPoints;
        this.inputs.circleSizeSnapping.value = roomMetadata.defaultValues.squareCircleSizeSnapping.toString();
        this.formChanged();
    }

    private setCubeDefaults() {
        this.inputs.cubeStyle.value = roomMetadata.defaultValues.squareCubeStyle;
        this.inputs.cubeStartPoints.value = roomMetadata.defaultValues.squareCubeStartPoints;
        this.inputs.cubeOverlapThreshold.value = percentString(roomMetadata.defaultValues.squareCubeOverlapThreshold);
        this.inputs.cubeSizeSnapping.value = roomMetadata.defaultValues.squareCubeSizeSnapping.toString();
        this.inputs.cubeDirection.value = roomMetadata.defaultValues.squareCubeDirection;
        this.formChanged();
    }

    // Render the UI as a function of component state
    render() {
        return html`
            <obui-tab-bar>
                <obui-tab-button active target="#coneForm">Cone</obui-tab-button>
                <obui-tab-button target="#circleForm">Circle</obui-tab-button>
                <obui-tab-button target="#cubeForm">Cube</obui-tab-button>
            </obui-tab-bar>
            <form>
                <div id="coneForm">
                    <form-control id="coneStyle" label="Cone Type">
                        <div class="flex">
                            ${this.inputs.coneStyle}
                            <obui-help-tooltip>
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
                                    <dt>D&D 5e (Hybrid Method)</dt>
                                    <dd>Hits the same number of squares as the token method, but picks them by how much
                                        the template covers them, giving a more cone-like shape.
                                    </dd>
                                </dl>
                            </obui-help-tooltip>
                        </div>
                    </form-control>
                    <div id="templateConeFields">
                        <div id="coneWidthField">
                            <form-control label="Width">
                                <div class="flex">
                                    ${this.inputs.coneWidth}
                                    <obui-help-tooltip>
                                        The width of the cone, in degrees.<br>
                                        Leave it blank to use the D&D 5e "Width = Height" method.
                                    </obui-help-tooltip>
                                </div>
                            </form-control>
                        </div>
                        <form-control label="Restrict Starting Point">
                            <div class="flex">
                                ${this.inputs.coneStartPoints}
                                <obui-help-tooltip>
                                    Select where on the map you can start drawing a cone from.<br/>
                                    For D&D 5e RAW this should be only corners.<br/>
                                    Leave it blank to allow a cone to start anywhere.
                                </obui-help-tooltip>
                            </div>
                        </form-control>
                        <div id="coneOverlapThresholdField">
                            <form-control label="Square Overlap Threshold">
                                <div class="flex">
                                    ${this.inputs.coneOverlapThreshold}
                                    <obui-help-tooltip>
                                        How much of a square needs to be covered for it to be considered "hit" by the
                                        cone.<br/>
                                        By D&D 5e RAW this should be 0%, although I recommend using a minimum of 1.
                                    </obui-help-tooltip>
                                </div>
                            </form-control>
                        </div>
                        <form-control label="Size Snapping">
                            <div class="flex">
                                ${this.inputs.coneSizeSnapping}
                                <obui-help-tooltip>
                                    Set what sizes of cone you want to snap to.<br/>
                                    If set to 0 then any size is allowed.<br/>
                                    If set to 1 then the cone must be a whole number of squares.<br/>
                                    0.5 will allow half-squares, etc.
                                </obui-help-tooltip>
                            </div>
                        </form-control>
                        <form-control label="Restrict Direction">
                            <div class="flex">
                                ${this.inputs.coneDirection}
                                <obui-help-tooltip>
                                    Choose which directions the cone can face.
                                </obui-help-tooltip>
                            </div>
                        </form-control>
                    </div>
                    <div class="resetButton">
                        <obui-button @click=${this.setConeDefaults}>Reset to default</obui-button>
                    </div>
                </div>
                <div id="circleForm" style="display: none">
                    <form-control id="circleStyle" label="Circle Type">
                        <div class="flex">
                            ${this.inputs.circleStyle}
                            <obui-help-tooltip>
                                <dl>
                                    <dt>D&D 5e (Template Method):</dt>
                                    <dd>The official rules for D&D 5e.&emsp;Draw a circle, place it on the map
                                        somewhere, and see which squares are 50% covered.
                                    </dd>
                                    <dt>Pathfinder / D&D 3.5:</dt>
                                    <dd>Highlight all squares within range as per the alternating diagonals
                                        measurement.
                                    </dd>
                                </dl>
                            </obui-help-tooltip>
                        </div>
                    </form-control>
                    <div id="templateCircleFields">
                        <form-control label="Restrict Starting Point">
                            <div class="flex">
                                ${this.inputs.circleStartPoints}
                                <obui-help-tooltip>
                                    Select where on the map you can start drawing a circle from.<br/>
                                    For D&D 5e RAW this should be only corners.<br/>
                                    Leave it blank to allow a circle to start anywhere.
                                </obui-help-tooltip>
                            </div>
                        </form-control>
                        <form-control label="Size Snapping">
                            <div class="flex">
                                ${this.inputs.circleSizeSnapping}
                                <obui-help-tooltip>
                                    Set what sizes of circle you want to snap to.<br/>
                                    If set to 0 then any size is allowed.<br/>
                                    If set to 1 then the circle must be a whole number of squares.<br/>
                                    0.5 will allow half-squares, etc.
                                </obui-help-tooltip>
                            </div>
                        </form-control>
                    </div>
                    <div class="resetButton">
                        <obui-button @click=${this.setCircleDefaults}>Reset to default</obui-button>
                    </div>
                </div>
                <div id="cubeForm" style="display: none">
                    <form-control id="cubeStyle" label="Cube Type">
                        <div class="flex">
                            ${this.inputs.cubeStyle}
                            <obui-help-tooltip>
                                <dl>
                                    <dt>Default:</dt>
                                    <dd>The official rules for D&D & Pathfinder.&emsp;A simple axis-aligned square.
                                    </dd>
                                    <dt>Template Method</dt>
                                    <dd>Draw a square on the map and see which squares it hits.
                                    </dd>
                                </dl>
                            </obui-help-tooltip>
                        </div>
                    </form-control>
                    <div id="templateCubeFields">
                        <form-control label="Restrict Starting Point">
                            <div class="flex">
                                ${this.inputs.cubeStartPoints}
                                <obui-help-tooltip>
                                    Select where on the map you can start drawing a cube from.<br/>
                                    Leave it blank to allow a cube to start anywhere.
                                </obui-help-tooltip>
                            </div>
                        </form-control>
                        <form-control label="Square Overlap Threshold">
                            <div class="flex">
                                ${this.inputs.cubeOverlapThreshold}
                                <obui-help-tooltip>
                                    How much of a square needs to be covered for it to be considered "hit" by the
                                    cube.<br/>
                                </obui-help-tooltip>
                            </div>
                        </form-control>
                        <form-control label="Size Snapping">
                            <div class="flex">
                                ${this.inputs.cubeSizeSnapping}
                                <obui-help-tooltip>
                                    Set what sizes of cube you want to snap to.<br/>
                                    If set to 0 then any size is allowed.<br/>
                                    If set to 1 then the cube must be a whole number of squares.<br/>
                                    0.5 will allow half-squares, etc.
                                </obui-help-tooltip>
                            </div>
                        </form-control>
                        <form-control label="Restrict Direction">
                            <div class="flex">
                                ${this.inputs.cubeDirection}
                                <obui-help-tooltip>
                                    Choose which directions the cube can face.<br/>
                                    Note this is the direction to the oppisite corner of the cube, so selecting 4
                                    compass points results in cubes 45° from the axis.
                                </obui-help-tooltip>
                            </div>
                        </form-control>
                    </div>
                    <div class="resetButton">
                        <obui-button @click=${this.setCubeDefaults}>Reset to default</obui-button>
                    </div>
                </div>
            </form>
        `;
    }
}
