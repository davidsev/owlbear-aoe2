import { getId } from '../Utils/getId';
import { CachedRoomMetadata } from '../../../owlbear-utils/js/Metadata/Cached/Room';

export enum ConeShape {
    TRIANGLE = 'TRIANGLE',
    SEMICIRCLE = 'SEMICIRCLE',
}

export enum ConeWidth {
    SQUARE = 'SQUARE',
    NINETY = 'NINETY',
    EQUILATERAL = 'EQUILATERAL',
}

export enum StartPoint {
    CORNER = 'CORNER',
    CENTER = 'CENTER',
    EDGE = 'EDGE',
}

export class RoomMetadata {
    coneShape: ConeShape = ConeShape.TRIANGLE;
    coneWidth: ConeWidth = ConeWidth.SQUARE;
    coneStartPoints: StartPoint[] = [StartPoint.CORNER];
    coneOverlapThreshold: number = 0.1;
    coneSizeSnapping: number = 1;
}

export const roomMetadata = new CachedRoomMetadata(getId(), new RoomMetadata);
