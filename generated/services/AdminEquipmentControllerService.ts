/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseResponse_boolean_ } from '../models/BaseResponse_boolean_';
import type { BaseResponse_Equipment_ } from '../models/BaseResponse_Equipment_';
import type { BaseResponse_EquipmentVO_ } from '../models/BaseResponse_EquipmentVO_';
import type { BaseResponse_List_Equipment_ } from '../models/BaseResponse_List_Equipment_';
import type { BaseResponse_long_ } from '../models/BaseResponse_long_';
import type { BaseResponse_Page_Equipment_ } from '../models/BaseResponse_Page_Equipment_';
import type { BaseResponse_Page_EquipmentLogVO_ } from '../models/BaseResponse_Page_EquipmentLogVO_';
import type { BaseResponse_Page_EquipmentVO_ } from '../models/BaseResponse_Page_EquipmentVO_';
import type { DeleteRequest } from '../models/DeleteRequest';
import type { EquipmentAddRequest } from '../models/EquipmentAddRequest';
import type { EquipmentBatchDeleteRequest } from '../models/EquipmentBatchDeleteRequest';
import type { EquipmentLogQueryRequest } from '../models/EquipmentLogQueryRequest';
import type { EquipmentMoveRequest } from '../models/EquipmentMoveRequest';
import type { EquipmentQueryRequest } from '../models/EquipmentQueryRequest';
import type { EquipmentUpdateRequest } from '../models/EquipmentUpdateRequest';
import type { EquipmentUpdateStatusRequest } from '../models/EquipmentUpdateStatusRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AdminEquipmentControllerService {
    /**
     * addEquipment
     * @param addRequest addRequest
     * @returns BaseResponse_long_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static addEquipmentUsingPost(
        addRequest: EquipmentAddRequest,
    ): CancelablePromise<BaseResponse_long_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/admin/equipment/add',
            body: addRequest,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * deleteEquipment
     * @param deleteRequest deleteRequest
     * @returns BaseResponse_boolean_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static deleteEquipmentUsingPost(
        deleteRequest: DeleteRequest,
    ): CancelablePromise<BaseResponse_boolean_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/admin/equipment/delete',
            body: deleteRequest,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * batchDeleteEquipment
     * @param batchDeleteRequest batchDeleteRequest
     * @returns BaseResponse_boolean_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static batchDeleteEquipmentUsingPost(
        batchDeleteRequest: EquipmentBatchDeleteRequest,
    ): CancelablePromise<BaseResponse_boolean_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/admin/equipment/delete/batch',
            body: batchDeleteRequest,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * getEquipmentById
     * @param id id
     * @returns BaseResponse_Equipment_ OK
     * @throws ApiError
     */
    public static getEquipmentByIdUsingGet(
        id: number,
    ): CancelablePromise<BaseResponse_Equipment_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/admin/equipment/get',
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
     * getEquipmentVOById
     * @param id id
     * @returns BaseResponse_EquipmentVO_ OK
     * @throws ApiError
     */
    public static getEquipmentVoByIdUsingGet(
        id: number,
    ): CancelablePromise<BaseResponse_EquipmentVO_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/admin/equipment/get/vo',
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
     * listAllAvailableEquipment
     * @returns BaseResponse_List_Equipment_ OK
     * @throws ApiError
     */
    public static listAllAvailableEquipmentUsingGet(): CancelablePromise<BaseResponse_List_Equipment_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/admin/equipment/list/all',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * listEquipmentByPage
     * @param queryRequest queryRequest
     * @returns BaseResponse_Page_Equipment_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static listEquipmentByPageUsingPost(
        queryRequest: EquipmentQueryRequest,
    ): CancelablePromise<BaseResponse_Page_Equipment_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/admin/equipment/list/page',
            body: queryRequest,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * listEquipmentVOByPage
     * @param queryRequest queryRequest
     * @returns BaseResponse_Page_EquipmentVO_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static listEquipmentVoByPageUsingPost(
        queryRequest: EquipmentQueryRequest,
    ): CancelablePromise<BaseResponse_Page_EquipmentVO_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/admin/equipment/list/page/vo',
            body: queryRequest,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * listEquipmentLogByPage
     * @param queryRequest queryRequest
     * @returns BaseResponse_Page_EquipmentLogVO_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static listEquipmentLogByPageUsingPost(
        queryRequest: EquipmentLogQueryRequest,
    ): CancelablePromise<BaseResponse_Page_EquipmentLogVO_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/admin/equipment/log/page',
            body: queryRequest,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * moveEquipmentIn
     * @param moveRequest moveRequest
     * @returns BaseResponse_boolean_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static moveEquipmentInUsingPost(
        moveRequest: EquipmentMoveRequest,
    ): CancelablePromise<BaseResponse_boolean_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/admin/equipment/move/in',
            body: moveRequest,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * moveEquipmentOut
     * @param moveRequest moveRequest
     * @returns BaseResponse_boolean_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static moveEquipmentOutUsingPost(
        moveRequest: EquipmentMoveRequest,
    ): CancelablePromise<BaseResponse_boolean_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/admin/equipment/move/out',
            body: moveRequest,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * scrapEquipment
     * @param moveRequest moveRequest
     * @returns BaseResponse_boolean_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static scrapEquipmentUsingPost(
        moveRequest: EquipmentMoveRequest,
    ): CancelablePromise<BaseResponse_boolean_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/admin/equipment/scrap',
            body: moveRequest,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * updateEquipment
     * @param updateRequest updateRequest
     * @returns BaseResponse_boolean_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static updateEquipmentUsingPost(
        updateRequest: EquipmentUpdateRequest,
    ): CancelablePromise<BaseResponse_boolean_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/admin/equipment/update',
            body: updateRequest,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * updateEquipmentStatus
     * @param statusRequest statusRequest
     * @returns BaseResponse_boolean_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static updateEquipmentStatusUsingPost(
        statusRequest: EquipmentUpdateStatusRequest,
    ): CancelablePromise<BaseResponse_boolean_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/admin/equipment/update/status',
            body: statusRequest,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
}
