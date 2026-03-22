/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BookingRecord } from './BookingRecord';
import type { OrderItem } from './OrderItem';
export type Page_BookingRecord_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: Array<OrderItem>;
    pages?: number;
    records?: Array<BookingRecord>;
    searchCount?: boolean;
    size?: number;
    total?: number;
};

