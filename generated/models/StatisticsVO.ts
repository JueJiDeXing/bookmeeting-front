/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { OverviewData } from './OverviewData';
import type { RoomDetailData } from './RoomDetailData';
import type { RoomRankData } from './RoomRankData';
import type { TimeHeatData } from './TimeHeatData';
import type { TrendData } from './TrendData';
import type { UserRankData } from './UserRankData';
export type StatisticsVO = {
    dailyTrend?: Array<TrendData>;
    overview?: OverviewData;
    roomDetails?: Array<RoomDetailData>;
    roomRank?: Array<RoomRankData>;
    timeHeat?: Array<TimeHeatData>;
    userRank?: Array<UserRankData>;
};

