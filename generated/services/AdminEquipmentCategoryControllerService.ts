/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseResponse_boolean_ } from '../models/BaseResponse_boolean_';
import type { BaseResponse_EquipmentCategory_ } from '../models/BaseResponse_EquipmentCategory_';
import type { BaseResponse_List_EquipmentCategory_ } from '../models/BaseResponse_List_EquipmentCategory_';
import type { BaseResponse_long_ } from '../models/BaseResponse_long_';
import type { BaseResponse_Page_EquipmentCategoryVO_ } from '../models/BaseResponse_Page_EquipmentCategoryVO_';
import type { DeleteRequest } from '../models/DeleteRequest';
import type { EquipmentCategoryAddRequest } from '../models/EquipmentCategoryAddRequest';
import type { EquipmentCategoryBatchAddRequest } from '../models/EquipmentCategoryBatchAddRequest';
import type { EquipmentCategoryBatchDeleteRequest } from '../models/EquipmentCategoryBatchDeleteRequest';
import type { EquipmentCategoryQueryRequest } from '../models/EquipmentCategoryQueryRequest';
import type { EquipmentCategoryUpdateRequest } from '../models/EquipmentCategoryUpdateRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AdminEquipmentCategoryControllerService {
    /**
     * addCategory
     * @param addRequest addRequest
     * @returns BaseResponse_long_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static addCategoryUsingPost(
        addRequest: EquipmentCategoryAddRequest,
    ): CancelablePromise<BaseResponse_long_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/admin/equipment/category/add',
            body: addRequest,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * batchAddCategory
     * @param batchRequest batchRequest
     * @returns BaseResponse_boolean_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static batchAddCategoryUsingPost(
        batchRequest: EquipmentCategoryBatchAddRequest,
    ): CancelablePromise<BaseResponse_boolean_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/admin/equipment/category/add/batch',
            body: batchRequest,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * deleteCategory
     * @param deleteRequest deleteRequest
     * @returns BaseResponse_boolean_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static deleteCategoryUsingPost(
        deleteRequest: DeleteRequest,
    ): CancelablePromise<BaseResponse_boolean_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/admin/equipment/category/delete',
            body: deleteRequest,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * batchDeleteCategory
     * @param batchDeleteRequest batchDeleteRequest
     * @returns BaseResponse_boolean_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static batchDeleteCategoryUsingPost(
        batchDeleteRequest: EquipmentCategoryBatchDeleteRequest,
    ): CancelablePromise<BaseResponse_boolean_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/admin/equipment/category/delete/batch',
            body: batchDeleteRequest,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * getCategoryById
     * @param id id
     * @returns BaseResponse_EquipmentCategory_ OK
     * @throws ApiError
     */
    public static getCategoryByIdUsingGet(
        id: number,
    ): CancelablePromise<BaseResponse_EquipmentCategory_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/admin/equipment/category/get',
            query: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * listAllCategories
     * @returns BaseResponse_List_EquipmentCategory_ OK
     * @throws ApiError
     */
    public static listAllCategoriesUsingGet(): CancelablePromise<BaseResponse_List_EquipmentCategory_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/admin/equipment/category/list/all',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * listCategoryByPage
     * @param queryRequest queryRequest
     * @returns BaseResponse_Page_EquipmentCategoryVO_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static listCategoryByPageUsingPost(
        queryRequest: EquipmentCategoryQueryRequest,
    ): CancelablePromise<BaseResponse_Page_EquipmentCategoryVO_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/admin/equipment/category/list/page',
            body: queryRequest,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * updateCategory
     * @param updateRequest updateRequest
     * @returns BaseResponse_boolean_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static updateCategoryUsingPost(
        updateRequest: EquipmentCategoryUpdateRequest,
    ): CancelablePromise<BaseResponse_boolean_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/admin/equipment/category/update',
            body: updateRequest,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
}
