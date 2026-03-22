/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseResponse_boolean_ } from '../models/BaseResponse_boolean_';
import type { BaseResponse_int_ } from '../models/BaseResponse_int_';
import type { BaseResponse_List_MessageVO_ } from '../models/BaseResponse_List_MessageVO_';
import type { MessageBatchReadRequest } from '../models/MessageBatchReadRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UserMessageControllerService {
    /**
     * getMessages
     * @param current current
     * @param pageSize pageSize
     * @returns BaseResponse_List_MessageVO_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static getMessagesUsingPost(
        current: number = 1,
        pageSize: number = 20,
    ): CancelablePromise<BaseResponse_List_MessageVO_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/user/message/list',
            query: {
                'current': current,
                'pageSize': pageSize,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * batchMarkAsRead
     * @param request request
     * @returns BaseResponse_boolean_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static batchMarkAsReadUsingPost(
        request: MessageBatchReadRequest,
    ): CancelablePromise<BaseResponse_boolean_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/user/message/read/batch',
            body: request,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * markAsRead
     * @param id id
     * @returns BaseResponse_boolean_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static markAsReadUsingPost(
        id: number,
    ): CancelablePromise<BaseResponse_boolean_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/user/message/read/{id}',
            path: {
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
     * getUnreadMessages
     * @returns BaseResponse_List_MessageVO_ OK
     * @throws ApiError
     */
    public static getUnreadMessagesUsingGet(): CancelablePromise<BaseResponse_List_MessageVO_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/user/message/unread',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * getUnreadCount
     * @returns BaseResponse_int_ OK
     * @throws ApiError
     */
    public static getUnreadCountUsingGet(): CancelablePromise<BaseResponse_int_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/user/message/unread/count',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
}
