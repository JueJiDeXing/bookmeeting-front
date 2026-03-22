/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Equipment } from './Equipment';
export type RecommendRoomVO = {
    building?: string;
    capacity?: number;
    capacityMatch?: number;
    createTime?: string;
    description?: string;
    equipmentList?: Array<Equipment>;
    equipmentMatch?: number;
    floor?: number;
    historyMatch?: number;
    id?: number;
    imageUrl?: string;
    locationDesc?: string;
    matchReason?: string;
    roomName?: string;
    roomNumber?: string;
    score?: number;
    status?: number;
    timeMatch?: number;
    updateTime?: string;
};

