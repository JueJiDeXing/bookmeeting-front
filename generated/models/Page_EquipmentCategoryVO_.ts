/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EquipmentCategoryVO } from './EquipmentCategoryVO';
import type { OrderItem } from './OrderItem';
export type Page_EquipmentCategoryVO_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: Array<OrderItem>;
    pages?: number;
    records?: Array<EquipmentCategoryVO>;
    searchCount?: boolean;
    size?: number;
    total?: number;
};

