import { CachedRoomMetadata, RoomMetadataMapper } from '@davidsev/owlbear-utils';
import { getId } from '../Utils/getId';
import { Metadata } from '@owlbear-rodeo/sdk';

export enum SquareConeStyle {
    TEMPLATE = 'TEMPLATE',
    PATHFINDER = 'PATHFINDER',
    TOKEN = 'TOKEN',
}

export enum SquareCubeStyle {
    TEMPLATE = 'TEMPLATE',
    SQUARE = 'SQUARE',
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
    squareCircleStartPoints: StartPoint[] = [StartPoint.CENTER];
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
    hexCircleStartPoints: StartPoint[] = [StartPoint.CENTER];
    hexCircleSizeSnapping: number = 1;
    hexCubeStartPoints: StartPoint[] = [StartPoint.CORNER];
    hexCubeOverlapThreshold: number = 0.1;
    hexCubeSizeSnapping: number = 1;
}

const nameMap: [name: string, letter: string][] = [
    ['squareConeStyle', 'a'],
    ['squareConeWidth', 'b'],
    ['squareConeStartPoints', 'c'],
    ['squareConeOverlapThreshold', 'd'],
    ['squareConeSizeSnapping', 'e'],
    ['squareConeDirection', 'f'],
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
];

class MyRoomMetadataMapper extends RoomMetadataMapper<RoomMetadata> {
    protected transformLoadingValues (values: Metadata): Metadata {
        const newValues: Metadata = {};

        // Foreach letter key, replace it with the name key.
        for (const [key, value] of Object.entries(values)) {
            const newName = nameMap.find(([name, letter]) => letter == key);
            if (newName)
                newValues[newName[0]] = value;
            else
                newValues[key] = value;
        }

        return newValues;
    }

    protected transformSavingValues (values: Metadata): Metadata {
        const newValues: Metadata = {};
        for (const [key, value] of Object.entries(values)) {
            // Only save debugIntersection if it's true.
            if (key === 'debugIntersection' && value === true) {
                newValues['debugIntersection'] = value;
            }
            // Otherwise, save the value under the letter key.
            const newKey = nameMap.find(([name, letter]) => name == key);
            if (newKey)
                newValues[newKey[1]] = value;
            else
                newValues[key] = value;
        }
        return newValues;
    }
}

const roomMetadataMapper = new MyRoomMetadataMapper(getId(), new RoomMetadata);
export const roomMetadata = new CachedRoomMetadata(roomMetadataMapper);
