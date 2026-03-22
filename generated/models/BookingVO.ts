/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AttendeeVO } from './AttendeeVO';
export type BookingVO = {
    actualEnd?: string;
    actualStart?: string;
    /**
     * 参会人数
     */
    attendeeCount?: number;
    /**
     * 参会人员列表
     */
    attendeeList?: Array<AttendeeVO>;
    attendeesId?: string;
    createTime?: string;
    description?: string;
    /**
     * 会议时长（分钟）
     */
    durationMinutes?: number;
    endTime?: string;
    id?: number;
    remindBefore?: number;
    /**
     * 会议室容纳人数
     */
    roomCapacity?: number;
    roomId?: number;
    /**
     * 会议室位置描述
     */
    roomLocation?: string;
    /**
     * 会议室名称
     */
    roomName?: string;
    startTime?: string;
    status?: number;
    title?: string;
    updateTime?: string;
    /**
     * 预定人账号
     */
    userAccount?: string;
    /**
     * 预定人邮箱
     */
    userEmail?: string;
    userId?: number;
    /**
     * 预定人姓名
     */
    userName?: string;
};

