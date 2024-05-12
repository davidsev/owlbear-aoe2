import { getId } from '../Utils/getId';
import { CachedRoomMetadata } from '@davidsev/owlbear-utils/js/Metadata/Cached/Room';

export enum ConeStyle {
    TEMPLATE = 'TEMPLATE',
    PATHFINDER = 'PATHFINDER',
    TOKEN = 'TOKEN',
}

export enum CubeStyle {
    TEMPLATE = 'TEMPLATE',
    SQUARE = 'SQUARE',
}

export enum StartPoint {
    CORNER = 'CORNER',
    CENTER = 'CENTER',
    EDGE = 'EDGE',
}

export class RoomMetadata {
    debugIntersection: boolean = false;
    squareConeStyle: ConeStyle = ConeStyle.TEMPLATE;
    squareConeWidth: number | null = null;
    squareConeStartPoints: StartPoint[] = [StartPoint.CORNER];
    squareConeOverlapThreshold: number = 0.1;
    squareConeSizeSnapping: number = 1;
    squareCircleStartPoints: StartPoint[] = [StartPoint.CORNER];
    squareCircleSizeSnapping: number = 1;
    squareCubeStyle: CubeStyle = CubeStyle.SQUARE;
    squareCubeStartPoints: StartPoint[] = [StartPoint.CORNER];
    squareCubeSizeSnapping: number = 1;
    squareCubeOverlapThreshold: number = 0.1;
}

export const roomMetadata = new CachedRoomMetadata(getId(), new RoomMetadata);
