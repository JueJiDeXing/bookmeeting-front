/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseResponse_List_UserVO_ } from '../models/BaseResponse_List_UserVO_';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UserUserControllerService {
    /**
     * listAllUsers
     * @returns BaseResponse_List_UserVO_ OK
     * @throws ApiError
     */
    public static listAllUsersUsingGet(): CancelablePromise<BaseResponse_List_UserVO_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/user/user/list/all',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
}
