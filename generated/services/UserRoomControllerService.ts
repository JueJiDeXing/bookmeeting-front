/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseResponse_List_int_ } from '../models/BaseResponse_List_int_';
import type { BaseResponse_List_string_ } from '../models/BaseResponse_List_string_';
import type { BaseResponse_Page_RoomVO_ } from '../models/BaseResponse_Page_RoomVO_';
import type { BaseResponse_RoomVO_ } from '../models/BaseResponse_RoomVO_';
import type { UserRoomQueryRequest } from '../models/UserRoomQueryRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UserRoomControllerService {
    /**
     * getAllBuildings
     * @returns BaseResponse_List_string_ OK
     * @throws ApiError
     */
    public static getAllBuildingsUsingGet(): CancelablePromise<BaseResponse_List_string_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/user/room/buildings',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * getFloorsByBuilding
     * @param building building
     * @returns BaseResponse_List_int_ OK
     * @throws ApiError
     */
    public static getFloorsByBuildingUsingGet(
        building: string,
    ): CancelablePromise<BaseResponse_List_int_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/user/room/floors',
            query: {
                'building': building,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * getRoomVOById
     * @param id id
     * @returns BaseResponse_RoomVO_ OK
     * @throws ApiError
     */
    public static getRoomVoByIdUsingGet1(
        id: number,
    ): CancelablePromise<BaseResponse_RoomVO_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/user/room/get/vo',
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
     * listAvailableRooms
     * @param queryRequest queryRequest
     * @returns BaseResponse_Page_RoomVO_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static listAvailableRoomsUsingPost(
        queryRequest: UserRoomQueryRequest,
    ): CancelablePromise<BaseResponse_Page_RoomVO_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/user/room/list/page',
            body: queryRequest,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
}
