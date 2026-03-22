/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MeetingRoom } from './MeetingRoom';
import type { OrderItem } from './OrderItem';
export type Page_MeetingRoom_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: Array<OrderItem>;
    pages?: number;
    records?: Array<MeetingRoom>;
    searchCount?: boolean;
    size?: number;
    total?: number;
};

