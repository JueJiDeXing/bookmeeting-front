/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseResponse_List_Equipment_ } from '../models/BaseResponse_List_Equipment_';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UserEquipmentControllerService {
    /**
     * listAllAvailableEquipment
     * @returns BaseResponse_List_Equipment_ OK
     * @throws ApiError
     */
    public static listAllAvailableEquipmentUsingGet1(): CancelablePromise<BaseResponse_List_Equipment_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/user/equipment/list/all',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
}
