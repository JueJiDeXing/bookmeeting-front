/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseResponse_StatisticsVO_ } from '../models/BaseResponse_StatisticsVO_';
import type { StatisticsRequest } from '../models/StatisticsRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AdminStatisticsControllerService {
    /**
     * exportStatistics
     * @param request request
     * @returns any OK
     * @throws ApiError
     */
    public static exportStatisticsUsingPost(
        request: StatisticsRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/admin/statistics/export',
            body: request,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * getStatistics
     * @param request request
     * @returns BaseResponse_StatisticsVO_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static getStatisticsUsingPost(
        request: StatisticsRequest,
    ): CancelablePromise<BaseResponse_StatisticsVO_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/admin/statistics/get',
            body: request,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
}
