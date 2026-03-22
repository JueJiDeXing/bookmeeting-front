/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseResponse_List_RecommendRoomVO_ } from '../models/BaseResponse_List_RecommendRoomVO_';
import type { RecommendRequest } from '../models/RecommendRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UserRecommendControllerService {
    /**
     * getHotRooms
     * @param limit limit
     * @returns BaseResponse_List_RecommendRoomVO_ OK
     * @throws ApiError
     */
    public static getHotRoomsUsingGet(
        limit: number = 5,
    ): CancelablePromise<BaseResponse_List_RecommendRoomVO_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/user/recommend/hot',
            query: {
                'limit': limit,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * recommendRooms
     * @param request request
     * @returns BaseResponse_List_RecommendRoomVO_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static recommendRoomsUsingPost(
        request: RecommendRequest,
    ): CancelablePromise<BaseResponse_List_RecommendRoomVO_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/user/recommend/rooms',
            body: request,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * getSimilarRooms
     * @param roomId roomId
     * @param limit limit
     * @returns BaseResponse_List_RecommendRoomVO_ OK
     * @throws ApiError
     */
    public static getSimilarRoomsUsingGet(
        roomId: number,
        limit: number = 5,
    ): CancelablePromise<BaseResponse_List_RecommendRoomVO_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/user/recommend/similar/{roomId}',
            path: {
                'roomId': roomId,
            },
            query: {
                'limit': limit,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
}
