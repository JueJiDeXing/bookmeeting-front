/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseResponse_boolean_ } from '../models/BaseResponse_boolean_';
import type { BaseResponse_List_MeetingRoom_ } from '../models/BaseResponse_List_MeetingRoom_';
import type { BaseResponse_long_ } from '../models/BaseResponse_long_';
import type { BaseResponse_MeetingRoom_ } from '../models/BaseResponse_MeetingRoom_';
import type { BaseResponse_Page_MeetingRoom_ } from '../models/BaseResponse_Page_MeetingRoom_';
import type { BaseResponse_Page_RoomVO_ } from '../models/BaseResponse_Page_RoomVO_';
import type { BaseResponse_RoomVO_ } from '../models/BaseResponse_RoomVO_';
import type { DeleteRequest } from '../models/DeleteRequest';
import type { RoomAddRequest } from '../models/RoomAddRequest';
import type { RoomBatchDeleteRequest } from '../models/RoomBatchDeleteRequest';
import type { RoomQueryRequest } from '../models/RoomQueryRequest';
import type { RoomUpdateEquipmentRequest } from '../models/RoomUpdateEquipmentRequest';
import type { RoomUpdateRequest } from '../models/RoomUpdateRequest';
import type { RoomUpdateStatusRequest } from '../models/RoomUpdateStatusRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AdminRoomControllerService {
    /**
     * addRoom
     * @param roomAddRequest roomAddRequest
     * @returns BaseResponse_long_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static addRoomUsingPost(
        roomAddRequest: RoomAddRequest,
    ): CancelablePromise<BaseResponse_long_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/admin/room/add',
            body: roomAddRequest,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * deleteRoom
     * @param deleteRequest deleteRequest
     * @returns BaseResponse_boolean_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static deleteRoomUsingPost(
        deleteRequest: DeleteRequest,
    ): CancelablePromise<BaseResponse_boolean_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/admin/room/delete',
            body: deleteRequest,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * batchDeleteRoom
     * @param batchDeleteRequest batchDeleteRequest
     * @returns BaseResponse_boolean_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static batchDeleteRoomUsingPost(
        batchDeleteRequest: RoomBatchDeleteRequest,
    ): CancelablePromise<BaseResponse_boolean_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/admin/room/delete/batch',
            body: batchDeleteRequest,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * getRoomById
     * @param id id
     * @returns BaseResponse_MeetingRoom_ OK
     * @throws ApiError
     */
    public static getRoomByIdUsingGet(
        id: number,
    ): CancelablePromise<BaseResponse_MeetingRoom_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/admin/room/get',
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
     * getRoomVOById
     * @param id id
     * @returns BaseResponse_RoomVO_ OK
     * @throws ApiError
     */
    public static getRoomVoByIdUsingGet(
        id: number,
    ): CancelablePromise<BaseResponse_RoomVO_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/admin/room/get/vo',
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
     * listAllAvailableRooms
     * @returns BaseResponse_List_MeetingRoom_ OK
     * @throws ApiError
     */
    public static listAllAvailableRoomsUsingGet(): CancelablePromise<BaseResponse_List_MeetingRoom_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/admin/room/list/all',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * listRoomByPage
     * @param roomQueryRequest roomQueryRequest
     * @returns BaseResponse_Page_MeetingRoom_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static listRoomByPageUsingPost(
        roomQueryRequest: RoomQueryRequest,
    ): CancelablePromise<BaseResponse_Page_MeetingRoom_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/admin/room/list/page',
            body: roomQueryRequest,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * listRoomVOByPage
     * @param roomQueryRequest roomQueryRequest
     * @returns BaseResponse_Page_RoomVO_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static listRoomVoByPageUsingPost(
        roomQueryRequest: RoomQueryRequest,
    ): CancelablePromise<BaseResponse_Page_RoomVO_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/admin/room/list/page/vo',
            body: roomQueryRequest,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * updateRoom
     * @param roomUpdateRequest roomUpdateRequest
     * @returns BaseResponse_boolean_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static updateRoomUsingPost(
        roomUpdateRequest: RoomUpdateRequest,
    ): CancelablePromise<BaseResponse_boolean_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/admin/room/update',
            body: roomUpdateRequest,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * updateRoomEquipment
     * @param equipmentRequest equipmentRequest
     * @returns BaseResponse_boolean_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static updateRoomEquipmentUsingPost(
        equipmentRequest: RoomUpdateEquipmentRequest,
    ): CancelablePromise<BaseResponse_boolean_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/admin/room/update/equipment',
            body: equipmentRequest,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * updateRoomStatus
     * @param statusRequest statusRequest
     * @returns BaseResponse_boolean_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static updateRoomStatusUsingPost(
        statusRequest: RoomUpdateStatusRequest,
    ): CancelablePromise<BaseResponse_boolean_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/admin/room/update/status',
            body: statusRequest,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
}
