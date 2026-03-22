/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EquipmentLogVO } from './EquipmentLogVO';
import type { OrderItem } from './OrderItem';
export type Page_EquipmentLogVO_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: Array<OrderItem>;
    pages?: number;
    records?: Array<EquipmentLogVO>;
    searchCount?: boolean;
    size?: number;
    total?: number;
};

