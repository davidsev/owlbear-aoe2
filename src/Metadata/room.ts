import { CachedRoomMetadata, RoomMetadataMapper } from '@davidsev/owlbear-utils';
import { getId } from '../Utils/getId';
import type { Metadata } from '@owlbear-rodeo/sdk';

export enum SquareConeStyle {
    TEMPLATE = 'TEMPLATE',
    PATHFINDER = 'PATHFINDER',
    TOKEN = 'TOKEN',
}

export enum SquareCubeStyle {
    TEMPLATE = 'TEMPLATE',
    SQUARE = 'SQUARE',
}

export enum SquareCircleStyle {
    TEMPLATE = 'TEMPLATE',
    PATHFINDER = 'PATHFINDER',
}

export enum StartPoint {
    CORNER = 'CORNER',
    CENTER = 'CENTER',
    EDGE = 'EDGE',
}

export enum SquareDirection {
    ALL = 'ALL',
    FOUR = 'FOUR',
    EIGHT = 'EIGHT',
}

export enum HexConeStyle {
    TEMPLATE = 'TEMPLATE',
    EQUILATERAL = 'EQUILATERAL',
}

export class RoomMetadata {
    debugIntersection: boolean = false;
    squareConeStyle: SquareConeStyle = SquareConeStyle.TEMPLATE;
    squareConeWidth: number | null = null;
    squareConeStartPoints: StartPoint[] = [StartPoint.CORNER];
    squareConeOverlapThreshold: number = 0.1;
    squareConeSizeSnapping: number = 1;
    squareConeDirection: SquareDirection = SquareDirection.ALL;
    squareCircleStyle: SquareCircleStyle = SquareCircleStyle.TEMPLATE;
    squareCircleStartPoints: StartPoint[] = [StartPoint.CORNER];
    squareCircleSizeSnapping: number = 1;
    squareCubeStyle: SquareCubeStyle = SquareCubeStyle.SQUARE;
    squareCubeStartPoints: StartPoint[] = [StartPoint.CORNER];
    squareCubeSizeSnapping: number = 1;
    squareCubeOverlapThreshold: number = 0.1;
    squareCubeDirection: SquareDirection = SquareDirection.ALL;
    hexConeStyle: HexConeStyle = HexConeStyle.TEMPLATE;
    hexConeWidth: number = 60;
    hexConeStartPoints: StartPoint[] = [StartPoint.CORNER];
    hexConeOverlapThreshold: number = 0.1;
    hexConeSizeSnapping: number = 1;
    hexCircleStartPoints: StartPoint[] = [StartPoint.CORNER];
    hexCircleSizeSnapping: number = 1;
    hexCubeStartPoints: StartPoint[] = [StartPoint.CORNER];
    hexCubeOverlapThreshold: number = 0.1;
    hexCubeSizeSnapping: number = 1;
    axonometricConeStyle: SquareConeStyle = SquareConeStyle.TEMPLATE;
    axonometricConeWidth: number | null = null;
    axonometricConeStartPoints: StartPoint[] = [StartPoint.CORNER];
    axonometricConeOverlapThreshold: number = 0.1;
    axonometricConeSizeSnapping: number = 1;
    axonometricConeDirection: SquareDirection = SquareDirection.ALL;
    axonometricCircleStyle: SquareCircleStyle = SquareCircleStyle.TEMPLATE;
    axonometricCircleStartPoints: StartPoint[] = [StartPoint.CORNER];
    axonometricCircleSizeSnapping: number = 1;
    axonometricCubeStyle: SquareCubeStyle = SquareCubeStyle.SQUARE;
    axonometricCubeStartPoints: StartPoint[] = [StartPoint.CORNER];
    axonometricCubeOverlapThreshold: number = 0.1;
    axonometricCubeSizeSnapping: number = 1;
    axonometricCubeDirection: SquareDirection = SquareDirection.ALL;
}

const nameMap: [name: string, letter: string][] = [
    ['squareConeStyle', 'a'],
    ['squareConeWidth', 'b'],
    ['squareConeStartPoints', 'c'],
    ['squareConeOverlapThreshold', 'd'],
    ['squareConeSizeSnapping', 'e'],
    ['squareConeDirection', 'f'],
    ['squareCircleStyle', 'x'],
    ['squareCircleStartPoints', 'g'],
    ['squareCircleSizeSnapping', 'h'],
    ['squareCubeStyle', 'i'],
    ['squareCubeStartPoints', 'j'],
    ['squareCubeSizeSnapping', 'k'],
    ['squareCubeOverlapThreshold', 'l'],
    ['squareCubeDirection', 'm'],
    ['hexConeStyle', 'n'],
    ['hexConeWidth', 'o'],
    ['hexConeStartPoints', 'p'],
    ['hexConeOverlapThreshold', 'q'],
    ['hexConeSizeSnapping', 'r'],
    ['hexCircleStartPoints', 's'],
    ['hexCircleSizeSnapping', 't'],
    ['hexCubeStartPoints', 'u'],
    ['hexCubeOverlapThreshold', 'v'],
    ['hexCubeSizeSnapping', 'w'],
    ['squareCircleStyle', 'x'],
    ['axonometricConeStyle', 'A'],
    ['axonometricConeWidth', 'B'],
    ['axonometricConeStartPoints', 'C'],
    ['axonometricConeOverlapThreshold', 'D'],
    ['axonometricConeSizeSnapping', 'E'],
    ['axonometricConeDirection', 'F'],
    ['axonometricCircleStyle', 'G'],
    ['axonometricCircleStartPoints', 'H'],
    ['axonometricCircleSizeSnapping', 'I'],
    ['axonometricCubeStyle', 'J'],
    ['axonometricCubeStartPoints', 'K'],
    ['axonometricCubeOverlapThreshold', 'L'],
    ['axonometricCubeSizeSnapping', 'M'],
    ['axonometricCubeDirection', 'N'],
];

class MyRoomMetadataMapper extends RoomMetadataMapper<RoomMetadata> {
    protected transformLoadingValues(values: Metadata): Metadata {
        const newValues: Metadata = {};

        // Foreach letter key, replace it with the name key.
        for (const [key, value] of Object.entries(values)) {
            const newName = nameMap.find(([, letter]) => letter === key);
            if (newName) newValues[newName[0]] = value;
            else newValues[key] = value;
        }

        return newValues;
    }

    protected transformSavingValues(values: Metadata): Metadata {
        const newValues: Metadata = {};
        for (const [key, value] of Object.entries(values)) {
            // Only save debugIntersection if it's true.
            if (key === 'debugIntersection' && value === true) {
                newValues.debugIntersection = value;
            }
            // Otherwise, save the value under the letter key.
            const newKey = nameMap.find(([name]) => name === key);
            if (newKey) newValues[newKey[1]] = value;
            else newValues[key] = value;
        }
        return newValues;
    }
}

const roomMetadataMapper = new MyRoomMetadataMapper(getId(), new RoomMetadata());
export const roomMetadata = new CachedRoomMetadata(roomMetadataMapper);
