/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseResponse_BookingRecord_ } from '../models/BaseResponse_BookingRecord_';
import type { BaseResponse_BookingVO_ } from '../models/BaseResponse_BookingVO_';
import type { BaseResponse_boolean_ } from '../models/BaseResponse_boolean_';
import type { BaseResponse_List_BookingVO_ } from '../models/BaseResponse_List_BookingVO_';
import type { BaseResponse_long_ } from '../models/BaseResponse_long_';
import type { BaseResponse_Page_BookingRecord_ } from '../models/BaseResponse_Page_BookingRecord_';
import type { BaseResponse_Page_BookingVO_ } from '../models/BaseResponse_Page_BookingVO_';
import type { BookingAddRequest } from '../models/BookingAddRequest';
import type { BookingBatchCancelRequest } from '../models/BookingBatchCancelRequest';
import type { BookingBatchDeleteRequest } from '../models/BookingBatchDeleteRequest';
import type { BookingCalendarRequest } from '../models/BookingCalendarRequest';
import type { BookingCancelRequest } from '../models/BookingCancelRequest';
import type { BookingCompleteRequest } from '../models/BookingCompleteRequest';
import type { BookingQueryRequest } from '../models/BookingQueryRequest';
import type { BookingRemindRequest } from '../models/BookingRemindRequest';
import type { BookingSignInRequest } from '../models/BookingSignInRequest';
import type { BookingUpdateRequest } from '../models/BookingUpdateRequest';
import type { DeleteRequest } from '../models/DeleteRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AdminBookingControllerService {
    /**
     * addBooking
     * @param addRequest addRequest
     * @returns BaseResponse_long_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static addBookingUsingPost(
        addRequest: BookingAddRequest,
    ): CancelablePromise<BaseResponse_long_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/admin/booking/add',
            body: addRequest,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * getCalendarBookings
     * @param calendarRequest calendarRequest
     * @returns BaseResponse_List_BookingVO_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static getCalendarBookingsUsingPost(
        calendarRequest: BookingCalendarRequest,
    ): CancelablePromise<BaseResponse_List_BookingVO_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/admin/booking/calendar',
            body: calendarRequest,
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
    public static cancelBookingUsingPost(
        cancelRequest: BookingCancelRequest,
    ): CancelablePromise<BaseResponse_boolean_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/admin/booking/cancel',
            body: cancelRequest,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * batchCancelBooking
     * @param batchCancelRequest batchCancelRequest
     * @returns BaseResponse_boolean_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static batchCancelBookingUsingPost(
        batchCancelRequest: BookingBatchCancelRequest,
    ): CancelablePromise<BaseResponse_boolean_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/admin/booking/cancel/batch',
            body: batchCancelRequest,
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
    public static completeBookingUsingPost(
        completeRequest: BookingCompleteRequest,
    ): CancelablePromise<BaseResponse_boolean_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/admin/booking/complete',
            body: completeRequest,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * deleteBooking
     * @param deleteRequest deleteRequest
     * @returns BaseResponse_boolean_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static deleteBookingUsingPost(
        deleteRequest: DeleteRequest,
    ): CancelablePromise<BaseResponse_boolean_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/admin/booking/delete',
            body: deleteRequest,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * batchDeleteBooking
     * @param batchDeleteRequest batchDeleteRequest
     * @returns BaseResponse_boolean_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static batchDeleteBookingUsingPost(
        batchDeleteRequest: BookingBatchDeleteRequest,
    ): CancelablePromise<BaseResponse_boolean_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/admin/booking/delete/batch',
            body: batchDeleteRequest,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * getBookingById
     * @param id id
     * @returns BaseResponse_BookingRecord_ OK
     * @throws ApiError
     */
    public static getBookingByIdUsingGet(
        id: number,
    ): CancelablePromise<BaseResponse_BookingRecord_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/admin/booking/get',
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
     * getBookingVOById
     * @param id id
     * @returns BaseResponse_BookingVO_ OK
     * @throws ApiError
     */
    public static getBookingVoByIdUsingGet(
        id: number,
    ): CancelablePromise<BaseResponse_BookingVO_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/admin/booking/get/vo',
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
     * listBookingByPage
     * @param queryRequest queryRequest
     * @returns BaseResponse_Page_BookingRecord_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static listBookingByPageUsingPost(
        queryRequest: BookingQueryRequest,
    ): CancelablePromise<BaseResponse_Page_BookingRecord_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/admin/booking/list/page',
            body: queryRequest,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * listBookingVOByPage
     * @param queryRequest queryRequest
     * @returns BaseResponse_Page_BookingVO_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static listBookingVoByPageUsingPost(
        queryRequest: BookingQueryRequest,
    ): CancelablePromise<BaseResponse_Page_BookingVO_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/admin/booking/list/page/vo',
            body: queryRequest,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * sendRemind
     * @param remindRequest remindRequest
     * @returns BaseResponse_boolean_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static sendRemindUsingPost(
        remindRequest: BookingRemindRequest,
    ): CancelablePromise<BaseResponse_boolean_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/admin/booking/remind',
            body: remindRequest,
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
    public static signInUsingPost(
        signInRequest: BookingSignInRequest,
    ): CancelablePromise<BaseResponse_boolean_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/admin/booking/signin',
            body: signInRequest,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * updateBooking
     * @param updateRequest updateRequest
     * @returns BaseResponse_boolean_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static updateBookingUsingPost(
        updateRequest: BookingUpdateRequest,
    ): CancelablePromise<BaseResponse_boolean_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/admin/booking/update',
            body: updateRequest,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
}
