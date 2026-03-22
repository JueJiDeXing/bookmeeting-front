/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseResponse_BookingVO_ } from '../models/BaseResponse_BookingVO_';
import type { BaseResponse_boolean_ } from '../models/BaseResponse_boolean_';
import type { BaseResponse_List_BookingRecord_ } from '../models/BaseResponse_List_BookingRecord_';
import type { BaseResponse_List_BookingVO_ } from '../models/BaseResponse_List_BookingVO_';
import type { BaseResponse_long_ } from '../models/BaseResponse_long_';
import type { BaseResponse_Page_BookingVO_ } from '../models/BaseResponse_Page_BookingVO_';
import type { DateRangeRequest } from '../models/DateRangeRequest';
import type { RoomBookingsRequest } from '../models/RoomBookingsRequest';
import type { UserBookingAddRequest } from '../models/UserBookingAddRequest';
import type { UserBookingCancelRequest } from '../models/UserBookingCancelRequest';
import type { UserBookingCheckRequest } from '../models/UserBookingCheckRequest';
import type { UserBookingCompleteRequest } from '../models/UserBookingCompleteRequest';
import type { UserBookingQueryRequest } from '../models/UserBookingQueryRequest';
import type { UserBookingSignInRequest } from '../models/UserBookingSignInRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UserBookingControllerService {
    /**
     * addBooking
     * @param addRequest addRequest
     * @returns BaseResponse_long_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static addBookingUsingPost1(
        addRequest: UserBookingAddRequest,
    ): CancelablePromise<BaseResponse_long_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/user/booking/add',
            body: addRequest,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * cancelBooking
     * @param cancelRequest cancelRequest
     * @returns BaseResponse_boolean_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static cancelBookingUsingPost1(
        cancelRequest: UserBookingCancelRequest,
    ): CancelablePromise<BaseResponse_boolean_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/user/booking/cancel',
            body: cancelRequest,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * checkAvailability
     * @param checkRequest checkRequest
     * @returns BaseResponse_boolean_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static checkAvailabilityUsingPost(
        checkRequest: UserBookingCheckRequest,
    ): CancelablePromise<BaseResponse_boolean_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/user/booking/check/availability',
            body: checkRequest,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * completeBooking
     * @param completeRequest completeRequest
     * @returns BaseResponse_boolean_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static completeBookingUsingPost1(
        completeRequest: UserBookingCompleteRequest,
    ): CancelablePromise<BaseResponse_boolean_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/user/booking/complete',
            body: completeRequest,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * getBookingVOById
     * @param id id
     * @returns BaseResponse_BookingVO_ OK
     * @throws ApiError
     */
    public static getBookingVoByIdUsingGet1(
        id: number,
    ): CancelablePromise<BaseResponse_BookingVO_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/user/booking/get/vo',
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
     * listBookingsByDate
     * @param request request
     * @returns BaseResponse_List_BookingRecord_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static listBookingsByDateUsingPost(
        request: DateRangeRequest,
    ): CancelablePromise<BaseResponse_List_BookingRecord_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/user/booking/list/by-date',
            body: request,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * listBookingsByRoomId
     * @param roomBookingsRequest roomBookingsRequest
     * @returns BaseResponse_List_BookingVO_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static listBookingsByRoomIdUsingPost(
        roomBookingsRequest: RoomBookingsRequest,
    ): CancelablePromise<BaseResponse_List_BookingVO_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/user/booking/list/by-room',
            body: roomBookingsRequest,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * listMyBookings
     * @param queryRequest queryRequest
     * @returns BaseResponse_Page_BookingVO_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static listMyBookingsUsingPost(
        queryRequest: UserBookingQueryRequest,
    ): CancelablePromise<BaseResponse_Page_BookingVO_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/user/booking/list/my/page',
            body: queryRequest,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * signIn
     * @param signInRequest signInRequest
     * @returns BaseResponse_boolean_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static signInUsingPost1(
        signInRequest: UserBookingSignInRequest,
    ): CancelablePromise<BaseResponse_boolean_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/user/booking/signin',
            body: signInRequest,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
}
