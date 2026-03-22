/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseResponse_List_EquipmentCategory_ } from '../models/BaseResponse_List_EquipmentCategory_';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UserEquipmentCategoryControllerService {
    /**
     * listAllCategories
     * @returns BaseResponse_List_EquipmentCategory_ OK
     * @throws ApiError
     */
    public static listAllCategoriesUsingGet1(): CancelablePromise<BaseResponse_List_EquipmentCategory_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/user/equipment/category/list/all',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
}
