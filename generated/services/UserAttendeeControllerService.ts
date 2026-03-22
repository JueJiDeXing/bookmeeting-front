/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AttendeeResponseRequest } from '../models/AttendeeResponseRequest';
import type { BaseResponse_boolean_ } from '../models/BaseResponse_boolean_';
import type { BaseResponse_int_ } from '../models/BaseResponse_int_';
import type { BaseResponse_List_AttendeeVO_ } from '../models/BaseResponse_List_AttendeeVO_';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UserAttendeeControllerService {
    /**
     * batchRespond
     * @param requests requests
     * @returns BaseResponse_boolean_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static batchRespondUsingPost(
        requests: Array<AttendeeResponseRequest>,
    ): CancelablePromise<BaseResponse_boolean_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/user/attendee/batch',
            body: requests,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * confirmMeeting
     * @param request request
     * @returns BaseResponse_boolean_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static confirmMeetingUsingPost(
        request: AttendeeResponseRequest,
    ): CancelablePromise<BaseResponse_boolean_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/user/attendee/confirm',
            body: request,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * getPendingMeetings
     * @returns BaseResponse_List_AttendeeVO_ OK
     * @throws ApiError
     */
    public static getPendingMeetingsUsingGet(): CancelablePromise<BaseResponse_List_AttendeeVO_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/user/attendee/pending',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * rejectMeeting
     * @param request request
     * @returns BaseResponse_boolean_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static rejectMeetingUsingPost(
        request: AttendeeResponseRequest,
    ): CancelablePromise<BaseResponse_boolean_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/user/attendee/reject',
            body: request,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * getRespondedMeetings
     * @returns BaseResponse_List_AttendeeVO_ OK
     * @throws ApiError
     */
    public static getRespondedMeetingsUsingGet(): CancelablePromise<BaseResponse_List_AttendeeVO_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/user/attendee/responded',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * getAttendeeStatus
     * @param bookingId bookingId
     * @returns BaseResponse_int_ OK
     * @throws ApiError
     */
    public static getAttendeeStatusUsingGet(
        bookingId: number,
    ): CancelablePromise<BaseResponse_int_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/user/attendee/status',
            query: {
                'bookingId': bookingId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
}
