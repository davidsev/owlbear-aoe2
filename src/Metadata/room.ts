import { getId } from '../Utils/getId';
import { CachedRoomMetadata } from '@davidsev/owlbear-utils/js/Metadata/Cached/Room';

export enum ConeStyle {
    TEMPLATE = 'TEMPLATE',
    CUSTOM_TEMPLATE = 'CUSTOM_TEMPLATE',
    PATHFINDER = 'PATHFINDER',
    TOKEN = 'TOKEN',
}

export enum StartPoint {
    CORNER = 'CORNER',
    CENTER = 'CENTER',
    EDGE = 'EDGE',
}

export class RoomMetadata {
    coneStyle: ConeStyle = ConeStyle.TEMPLATE;
    coneWidth: number = 53.1;
    coneStartPoints: StartPoint[] = [StartPoint.CORNER];
    coneOverlapThreshold: number = 0.1;
    coneSizeSnapping: number = 1;
}

export const roomMetadata = new CachedRoomMetadata(getId(), new RoomMetadata);
