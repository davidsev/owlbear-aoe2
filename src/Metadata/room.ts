import { getId } from '../Utils/getId';
import { CachedRoomMetadata } from '@davidsev/owlbear-utils/js/Metadata/Cached/Room';

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
    hexCubeWidth: number = 60;
    hexCubeStartPoints: StartPoint[] = [StartPoint.CORNER];
    hexCubeOverlapThreshold: number = 0.1;
    hexCubeSizeSnapping: number = 1;
}

export const roomMetadata = new CachedRoomMetadata(getId(), new RoomMetadata);
