/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EquipmentVO } from './EquipmentVO';
import type { OrderItem } from './OrderItem';
export type Page_EquipmentVO_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: Array<OrderItem>;
    pages?: number;
    records?: Array<EquipmentVO>;
    searchCount?: boolean;
    size?: number;
    total?: number;
};

