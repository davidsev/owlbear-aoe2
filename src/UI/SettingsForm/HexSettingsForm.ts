import { customElement, query } from 'lit/decorators.js';
import { html, PropertyValueMap } from 'lit';
import { BaseElement } from '../BaseElement';
import { SelectEnum } from '../Components/SelectEnum';
import { HexConeStyle, roomMetadata, StartPoint } from '../../Metadata/room';
import { MultiSelectEnum } from '../Components/MultiSelectEnum';
import style from './SettingsForm.css';
import { baseCSS } from '../baseCSS';

@customElement('hex-settings-form')
export class HexSettingsForm extends BaseElement {

    static styles = baseCSS(style);

    private readonly inputs = {
        coneStyle: new SelectEnum({
            [HexConeStyle.TEMPLATE]: 'D&D 5e (Template Method)',
            [HexConeStyle.EQUILATERAL]: 'Equilateral Triangle',
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
        cubeStartPoints: new MultiSelectEnum({
            [StartPoint.CORNER]: 'Corners',
            [StartPoint.CENTER]: 'Center',
            [StartPoint.EDGE]: 'Edges',
        }),
        cubeSizeSnapping: document.createElement('input'),
        cubeOverlapThreshold: document.createElement('input'),
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
        this.inputs.coneStyle.value = roomMetadata.data.hexConeStyle;
        this.inputs.coneWidth.value = (roomMetadata.data.hexConeWidth || '').toString();
        this.inputs.coneStartPoints.value = roomMetadata.data.hexConeStartPoints;
        this.inputs.coneOverlapThreshold.valueAsNumber = roomMetadata.data.hexConeOverlapThreshold * 100;
        this.inputs.coneSizeSnapping.valueAsNumber = roomMetadata.data.hexConeSizeSnapping;
        this.inputs.circleStartPoints.value = roomMetadata.data.hexCircleStartPoints;
        this.inputs.circleSizeSnapping.valueAsNumber = roomMetadata.data.hexCircleSizeSnapping;
        this.inputs.cubeStartPoints.value = roomMetadata.data.hexCubeStartPoints;
        this.inputs.cubeOverlapThreshold.valueAsNumber = roomMetadata.data.hexCubeOverlapThreshold * 100;
        this.inputs.cubeSizeSnapping.valueAsNumber = roomMetadata.data.hexCubeSizeSnapping;
    }

    private formChanged (e?: Event) {
        // Only run if the form is valid.
        if (e && !(e.target instanceof HTMLInputElement && e.target.form?.checkValidity())) {
            return;
        }

        // Save the data
        roomMetadata.set({
            hexConeStyle: this.inputs.coneStyle.value,
            hexConeWidth: this.inputs.coneWidth.valueAsNumber,
            hexConeStartPoints: this.inputs.coneStartPoints.value,
            hexConeOverlapThreshold: parseInt(this.inputs.coneOverlapThreshold.value) / 100,
            hexConeSizeSnapping: parseFloat(this.inputs.coneSizeSnapping.value),
            hexCircleStartPoints: this.inputs.circleStartPoints.value,
            hexCircleSizeSnapping: parseFloat(this.inputs.circleSizeSnapping.value),
            hexCubeStartPoints: this.inputs.cubeStartPoints.value,
            hexCubeOverlapThreshold: parseInt(this.inputs.cubeOverlapThreshold.value) / 100,
            hexCubeSizeSnapping: parseFloat(this.inputs.cubeSizeSnapping.value),
        });

        this.showOrHideFields();
    }

    private showOrHideFields () {
        this.templateConeFields.style.display = roomMetadata.data.hexConeStyle == HexConeStyle.TEMPLATE ? 'initial' : 'none';
    }

    protected firstUpdated (_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>) {
        super.firstUpdated(_changedProperties);
        this.showOrHideFields();

        // Trigger a refresh, the first render won't have had the tab targets set.
        this.requestUpdate();
    }

    private setConeDefaults () {
        this.inputs.coneStyle.value = roomMetadata.defaultValues.hexConeStyle;
        this.inputs.coneWidth.value = (roomMetadata.defaultValues.hexConeWidth || '').toString();
        this.inputs.coneStartPoints.value = roomMetadata.defaultValues.hexConeStartPoints;
        this.inputs.coneOverlapThreshold.value = (roomMetadata.defaultValues.hexConeOverlapThreshold * 100).toString();
        this.inputs.coneSizeSnapping.value = roomMetadata.defaultValues.hexConeSizeSnapping.toString();
        this.formChanged();
    }

    private setCircleDefaults () {
        this.inputs.circleStartPoints.value = roomMetadata.defaultValues.hexCircleStartPoints;
        this.inputs.circleSizeSnapping.value = roomMetadata.defaultValues.hexCircleSizeSnapping.toString();
        this.formChanged();
    }

    private setCubeDefaults () {
        this.inputs.cubeStartPoints.value = roomMetadata.defaultValues.hexCubeStartPoints;
        this.inputs.cubeOverlapThreshold.value = (roomMetadata.defaultValues.hexCubeOverlapThreshold * 100).toString();
        this.inputs.cubeSizeSnapping.value = roomMetadata.defaultValues.hexCubeSizeSnapping.toString();
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
                                        somewhere, and see which hex's it overlaps.
                                    </dd>
                                    <dt>Equilateral:</dt>
                                    <dd>An equilateral triangle aligned to the grid.</dd>
                                </dl>
                            </help-tooltip>
                        </div>
                    </form-control>
                    <div id="templateConeFields">
                        <form-control label="Cone Width">
                            <div class="flex">
                                ${this.inputs.coneWidth}
                                <help-tooltip>The width of the cone, in degrees.</help-tooltip>
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
                                    How much of a hex needs to be covered for it to be considered "hit" by the
                                    cone.<br/>
                                    By D&D 5e RAW this should be 0%, although I recommend using a minimum of 1.
                                </help-tooltip>
                            </div>
                        </form-control>
                        <form-control label="Cone Size Snapping">
                            <div class="flex">
                                ${this.inputs.coneSizeSnapping}
                                <help-tooltip>
                                    Set what sizes of cone you want to snap to.<br/>
                                    If set to 0 then any size is allowed.<br/>
                                    If set to 1 then the cone must be a whole number of hexes.<br/>
                                    0.5 will allow half-hexes, etc.
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
                                For D&D 5e RAW this should be only center.<br/>
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
                                If set to 1 then the circle must be a whole number of hexes.<br/>
                                0.5 will allow half-hexes, etc.
                            </help-tooltip>
                        </div>
                    </form-control>
                    <div class="resetButton">
                        <button class="btn" type="button" @click=${this.setCircleDefaults}>Reset to default</button>
                    </div>
                </div>
                <div id="cubeForm">
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
                                How much of a hex needs to be covered for it to be considered "hit" by the
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
                                If set to 1 then the cube must be a whole number of hexes.<br/>
                                0.5 will allow half-hexes, etc.
                            </help-tooltip>
                        </div>
                    </form-control>
                    <div class="resetButton">
                        <button class="btn" type="button" @click=${this.setCubeDefaults}>Reset to default</button>
                    </div>
                </div>
            </form>
        `;
    }
}

