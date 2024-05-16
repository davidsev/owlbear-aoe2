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
}

export const roomMetadata = new CachedRoomMetadata(getId(), new RoomMetadata);
