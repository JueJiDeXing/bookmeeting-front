/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BookingVO } from './BookingVO';
import type { OrderItem } from './OrderItem';
export type Page_BookingVO_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: Array<OrderItem>;
    pages?: number;
    records?: Array<BookingVO>;
    searchCount?: boolean;
    size?: number;
    total?: number;
};

