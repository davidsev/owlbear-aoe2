import { customElement, query } from 'lit/decorators.js';
import { html, type PropertyValueMap } from 'lit';
import { BaseElement, baseCSS } from '@davidsev/owlbear-ui';
import { HexConeStyle, roomMetadata, StartPoint } from '../../Metadata/room';
import { enumMultiSelect, enumSelect, numberInput } from '../Components/controls';
import style from './SettingsForm.css';
import { inputsAreValid, numberValue, percentString, percentValue } from './inputValue';

@customElement('hex-settings-form')
export class HexSettingsForm extends BaseElement {
    static styles = baseCSS(style);

    private readonly inputs = {
        coneStyle: enumSelect({
            [HexConeStyle.TEMPLATE]: 'D&D 5e (Template Method)',
            [HexConeStyle.EQUILATERAL]: 'Equilateral Triangle',
        }),
        coneWidth: numberInput(),
        coneStartPoints: enumMultiSelect({
            [StartPoint.CORNER]: 'Corners',
            [StartPoint.CENTER]: 'Center',
            [StartPoint.EDGE]: 'Edges',
        }),
        coneOverlapThreshold: numberInput(),
        coneSizeSnapping: numberInput({ step: '0.1' }),
        circleStartPoints: enumMultiSelect({
            [StartPoint.CORNER]: 'Corners',
            [StartPoint.CENTER]: 'Center',
            [StartPoint.EDGE]: 'Edges',
        }),
        circleSizeSnapping: numberInput({ step: '0.1' }),
        cubeStartPoints: enumMultiSelect({
            [StartPoint.CORNER]: 'Corners',
            [StartPoint.CENTER]: 'Center',
            [StartPoint.EDGE]: 'Edges',
        }),
        cubeSizeSnapping: numberInput({ step: '0.1' }),
        cubeOverlapThreshold: numberInput(),
    };

    @query('div#templateConeFields', true)
    private accessor templateConeFields!: HTMLDivElement;

    constructor() {
        super();

        // Update the metadata when the form changes.
        for (const [, input] of Object.entries(this.inputs)) {
            input.addEventListener('change', this.formChanged.bind(this));
        }

        // Load the metadata into the form.
        this.inputs.coneStyle.value = roomMetadata.data.hexConeStyle;
        this.inputs.coneWidth.value = (roomMetadata.data.hexConeWidth || '').toString();
        this.inputs.coneStartPoints.value = roomMetadata.data.hexConeStartPoints;
        this.inputs.coneOverlapThreshold.value = percentString(roomMetadata.data.hexConeOverlapThreshold);
        this.inputs.coneSizeSnapping.value = roomMetadata.data.hexConeSizeSnapping.toString();
        this.inputs.circleStartPoints.value = roomMetadata.data.hexCircleStartPoints;
        this.inputs.circleSizeSnapping.value = roomMetadata.data.hexCircleSizeSnapping.toString();
        this.inputs.cubeStartPoints.value = roomMetadata.data.hexCubeStartPoints;
        this.inputs.cubeOverlapThreshold.value = percentString(roomMetadata.data.hexCubeOverlapThreshold);
        this.inputs.cubeSizeSnapping.value = roomMetadata.data.hexCubeSizeSnapping.toString();
    }

    private formChanged(e?: Event) {
        // Only run if the form is valid.
        if (e && !inputsAreValid(this.inputs)) {
            return;
        }

        // Save the data
        roomMetadata.set({
            hexConeStyle: this.inputs.coneStyle.value,
            hexConeWidth: numberValue(this.inputs.coneWidth, roomMetadata.defaultValues.hexConeWidth),
            hexConeStartPoints: this.inputs.coneStartPoints.value,
            hexConeOverlapThreshold: percentValue(this.inputs.coneOverlapThreshold, roomMetadata.defaultValues.hexConeOverlapThreshold),
            hexConeSizeSnapping: numberValue(this.inputs.coneSizeSnapping, roomMetadata.defaultValues.hexConeSizeSnapping),
            hexCircleStartPoints: this.inputs.circleStartPoints.value,
            hexCircleSizeSnapping: numberValue(this.inputs.circleSizeSnapping, roomMetadata.defaultValues.hexCircleSizeSnapping),
            hexCubeStartPoints: this.inputs.cubeStartPoints.value,
            hexCubeOverlapThreshold: percentValue(this.inputs.cubeOverlapThreshold, roomMetadata.defaultValues.hexCubeOverlapThreshold),
            hexCubeSizeSnapping: numberValue(this.inputs.cubeSizeSnapping, roomMetadata.defaultValues.hexCubeSizeSnapping),
        });

        this.showOrHideFields();
    }

    private showOrHideFields() {
        this.templateConeFields.style.display = roomMetadata.data.hexConeStyle === HexConeStyle.TEMPLATE ? '' : 'none';
    }

    protected firstUpdated(_changedProperties: PropertyValueMap<unknown> | Map<PropertyKey, unknown>) {
        super.firstUpdated(_changedProperties);
        this.showOrHideFields();
    }

    private setConeDefaults() {
        this.inputs.coneStyle.value = roomMetadata.defaultValues.hexConeStyle;
        this.inputs.coneWidth.value = (roomMetadata.defaultValues.hexConeWidth || '').toString();
        this.inputs.coneStartPoints.value = roomMetadata.defaultValues.hexConeStartPoints;
        this.inputs.coneOverlapThreshold.value = percentString(roomMetadata.defaultValues.hexConeOverlapThreshold);
        this.inputs.coneSizeSnapping.value = roomMetadata.defaultValues.hexConeSizeSnapping.toString();
        this.formChanged();
    }

    private setCircleDefaults() {
        this.inputs.circleStartPoints.value = roomMetadata.defaultValues.hexCircleStartPoints;
        this.inputs.circleSizeSnapping.value = roomMetadata.defaultValues.hexCircleSizeSnapping.toString();
        this.formChanged();
    }

    private setCubeDefaults() {
        this.inputs.cubeStartPoints.value = roomMetadata.defaultValues.hexCubeStartPoints;
        this.inputs.cubeOverlapThreshold.value = percentString(roomMetadata.defaultValues.hexCubeOverlapThreshold);
        this.inputs.cubeSizeSnapping.value = roomMetadata.defaultValues.hexCubeSizeSnapping.toString();
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
                                        somewhere, and see which hex's it overlaps.
                                    </dd>
                                    <dt>Equilateral:</dt>
                                    <dd>An equilateral triangle aligned to the grid.</dd>
                                </dl>
                            </obui-help-tooltip>
                        </div>
                    </form-control>
                    <div id="templateConeFields">
                        <form-control label="Width">
                            <div class="flex">
                                ${this.inputs.coneWidth}
                                <obui-help-tooltip>The width of the cone, in degrees.</obui-help-tooltip>
                            </div>
                        </form-control>
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
                        <form-control label="Hex Overlap Threshold">
                            <div class="flex">
                                ${this.inputs.coneOverlapThreshold}
                                <obui-help-tooltip>
                                    How much of a hex needs to be covered for it to be considered "hit" by the
                                    cone.<br/>
                                    By D&D 5e RAW this should be 0%, although I recommend using a minimum of 1.
                                </obui-help-tooltip>
                            </div>
                        </form-control>
                        <form-control label="Size Snapping">
                            <div class="flex">
                                ${this.inputs.coneSizeSnapping}
                                <obui-help-tooltip>
                                    Set what sizes of cone you want to snap to.<br/>
                                    If set to 0 then any size is allowed.<br/>
                                    If set to 1 then the cone must be a whole number of hexes.<br/>
                                    0.5 will allow half-hexes, etc.
                                </obui-help-tooltip>
                            </div>
                        </form-control>
                    </div>
                    <div class="resetButton">
                        <obui-button @click=${this.setConeDefaults}>Reset to default</obui-button>
                    </div>
                </div>
                <div id="circleForm" style="display: none">
                    <form-control label="Restrict Starting Point">
                        <div class="flex">
                            ${this.inputs.circleStartPoints}
                            <obui-help-tooltip>
                                Select where on the map you can start drawing a circle from.<br/>
                                For D&D 5e RAW this should be only center.<br/>
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
                                If set to 1 then the circle must be a whole number of hexes.<br/>
                                0.5 will allow half-hexes, etc.
                            </obui-help-tooltip>
                        </div>
                    </form-control>
                    <div class="resetButton">
                        <obui-button @click=${this.setCircleDefaults}>Reset to default</obui-button>
                    </div>
                </div>
                <div id="cubeForm" style="display: none">
                    <form-control label="Restrict Starting Point">
                        <div class="flex">
                            ${this.inputs.cubeStartPoints}
                            <obui-help-tooltip>
                                Select where on the map you can start drawing a cube from.<br/>
                                Leave it blank to allow a cube to start anywhere.
                            </obui-help-tooltip>
                        </div>
                    </form-control>
                    <form-control label="Hex Overlap Threshold">
                        <div class="flex">
                            ${this.inputs.cubeOverlapThreshold}
                            <obui-help-tooltip>
                                How much of a hex needs to be covered for it to be considered "hit" by the
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
                                If set to 1 then the cube must be a whole number of hexes.<br/>
                                0.5 will allow half-hexes, etc.
                            </obui-help-tooltip>
                        </div>
                    </form-control>
                    <div class="resetButton">
                        <obui-button @click=${this.setCubeDefaults}>Reset to default</obui-button>
                    </div>
                </div>
            </form>
        `;
    }
}
