<!-- views/admin/BookingStatistics.vue -->
<template>
  <div id="bookingStatisticsView">
    <!-- 操作按钮区域 -->
    <div class="operation-bar">
      <a-space>
        <a-button @click="router.push('/admin/booking')">
          <template #icon><icon-arrow-left /></template>
          返回预定列表
        </a-button>
        <a-button type="primary" @click="onExport" :loading="exportLoading">
          <template #icon><icon-download /></template>
          导出报表
        </a-button>
      </a-space>
    </div>

    <!-- 时间筛选 -->
    <a-card class="filter-card">
      <a-space size="large" wrap>
        <a-radio-group v-model="timeRange" type="button" @change="onTimeRangeChange">
          <a-radio value="day">今日</a-radio>
          <a-radio value="week">本周</a-radio>
          <a-radio value="month">本月</a-radio>
          <a-radio value="quarter">本季度</a-radio>
          <a-radio value="year">本年</a-radio>
          <a-radio value="custom">自定义</a-radio>
        </a-radio-group>

        <a-range-picker
            v-if="timeRange === 'custom'"
            v-model="customDateRange"
            @change="loadData"
            style="width: 260px"
            show-time
        />
      </a-space>
    </a-card>

    <!-- 统计卡片 -->
    <a-row :gutter="16" class="stat-cards">
      <a-col :span="6">
        <a-card class="stat-card" hoverable>
          <template #title>
            <icon-calendar />
            总预定次数
          </template>
          <div class="stat-number">{{ statistics.totalBookings || 0 }}</div>
          <div class="stat-trend" :class="{ up: statistics.bookingTrend > 0, down: statistics.bookingTrend < 0 }">
            <icon-caret-up v-if="statistics.bookingTrend > 0" />
            <icon-caret-down v-if="statistics.bookingTrend < 0" />
            {{ Math.abs(statistics.bookingTrend || 0) }}% 较上期
          </div>
        </a-card>
      </a-col>

      <a-col :span="6">
        <a-card class="stat-card" hoverable>
          <template #title>
            <icon-clock-circle />
            总会议时长
          </template>
          <div class="stat-number">{{ statistics.totalHours || 0 }}小时</div>
          <div class="stat-desc">平均 {{ statistics.avgHoursPerBooking || 0 }}小时/场</div>
        </a-card>
      </a-col>

      <a-col :span="6">
        <a-card class="stat-card" hoverable>
          <template #title>
            <icon-user />
            参会总人次
          </template>
          <div class="stat-number">{{ statistics.totalAttendees || 0 }}</div>
          <div class="stat-desc">平均 {{ statistics.avgAttendeesPerBooking || 0 }}人/场</div>
        </a-card>
      </a-col>

      <a-col :span="6">
        <a-card class="stat-card" hoverable>
          <template #title>
            <icon-home />
            会议室使用率
          </template>
          <div class="stat-number">{{ statistics.utilizationRate || 0 }}%</div>
          <div class="stat-desc">高峰期: {{ statistics.peakHours || '-' }}</div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 图表区域 -->
    <a-row :gutter="16" class="chart-row">
      <a-col :span="12">
        <a-card title="会议室使用排行" :bordered="false">
          <div id="roomRankChart" style="height: 320px"></div>
        </a-card>
      </a-col>

      <a-col :span="12">
        <a-card title="时间段热度分布" :bordered="false">
          <div id="timeHeatChart" style="height: 320px"></div>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="16" class="chart-row">
      <a-col :span="12">
        <a-card title="每日预定趋势" :bordered="false">
          <div id="dailyTrendChart" style="height: 320px"></div>
        </a-card>
      </a-col>

      <a-col :span="12">
        <a-card title="预定人排行" :bordered="false">
          <div id="userRankChart" style="height: 320px"></div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 详细数据表格 -->
    <a-card title="会议室使用详情" class="detail-table" :bordered="false">
      <a-table
          :columns="roomColumns"
          :data="roomDetailList"
          :pagination="false"
          :loading="loading"
          :bordered="false"
          stripe
      >
        <template #columns>
          <a-table-column title="会议室" data-index="roomName" />
          <a-table-column title="预定次数" data-index="bookingCount" sortable />
          <a-table-column title="使用时长" data-index="totalHours" sortable>
            <template #cell="{ record }">{{ record.totalHours }}小时</template>
          </a-table-column>
          <a-table-column title="使用率" data-index="utilizationRate" sortable>
            <template #cell="{ record }">
              <a-progress :percent="record.utilizationRate" :width="60" size="small" />
            </template>
          </a-table-column>
          <a-table-column title="最常用时间段" data-index="peakTime" />
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { Message } from '@arco-design/web-vue';
import {
  IconArrowLeft,
  IconDownload,
  IconCalendar,
  IconClockCircle,
  IconUser,
  IconCaretUp,
  IconCaretDown,
  IconHome
} from '@arco-design/web-vue/es/icon';
import { useRouter } from 'vue-router';
import * as echarts from 'echarts';
import dayjs from 'dayjs';

import { AdminStatisticsControllerService } from '/generated';
import type { StatisticsVO, RoomRankData, TimeHeatData, TrendData, UserRankData, RoomDetailData } from '/generated';

const router = useRouter();
const loading = ref(false);
const exportLoading = ref(false);
const timeRange = ref('month');
const customDateRange = ref<dayjs.Dayjs[]>([]);

// 统计数据
const statistics = ref<StatisticsVO['overview']>({});
const roomRankList = ref<RoomRankData[]>([]);
const timeHeatList = ref<TimeHeatData[]>([]);
const dailyTrendList = ref<TrendData[]>([]);
const userRankList = ref<UserRankData[]>([]);
const roomDetailList = ref<RoomDetailData[]>([]);

// ECharts 实例
let roomRankChart: echarts.ECharts | null = null;
let timeHeatChart: echarts.ECharts | null = null;
let dailyTrendChart: echarts.ECharts | null = null;
let userRankChart: echarts.ECharts | null = null;

// 表格列
const roomColumns = [
  { title: '会议室', dataIndex: 'roomName' },
  { title: '预定次数', dataIndex: 'bookingCount', sortable: true },
  { title: '使用时长', dataIndex: 'totalHours', sortable: true },
  { title: '使用率', dataIndex: 'utilizationRate', sortable: true },
  { title: '最常用时间段', dataIndex: 'peakTime' }
];

// 加载数据
const loadData = async () => {
  loading.value = true;
  try {
    const request: any = { type: timeRange.value };

    if (timeRange.value === 'custom' && customDateRange.value.length === 2) {
      request.startTime = customDateRange.value[0].format('YYYY-MM-DD HH:mm:ss');
      request.endTime = customDateRange.value[1].format('YYYY-MM-DD HH:mm:ss');
    }

    const res = await AdminStatisticsControllerService.getStatisticsUsingPost(request);

    if (res.code === 0 && res.data) {
      statistics.value = res.data.overview || {};
      roomRankList.value = res.data.roomRank || [];
      timeHeatList.value = res.data.timeHeat || [];
      dailyTrendList.value = res.data.dailyTrend || [];
      userRankList.value = res.data.userRank || [];
      roomDetailList.value = res.data.roomDetails || [];

      updateCharts();
    } else {
      Message.error(res.message || '加载失败');
    }
  } catch (error: any) {
    Message.error('加载失败: ' + error.message);
  } finally {
    loading.value = false;
  }
};

// 初始化图表
const initCharts = () => {
  const roomChartDom = document.getElementById('roomRankChart');
  const timeChartDom = document.getElementById('timeHeatChart');
  const dailyChartDom = document.getElementById('dailyTrendChart');
  const userChartDom = document.getElementById('userRankChart');

  if (roomChartDom) {
    roomRankChart = echarts.init(roomChartDom);
  }
  if (timeChartDom) {
    timeHeatChart = echarts.init(timeChartDom);
  }
  if (dailyChartDom) {
    dailyTrendChart = echarts.init(dailyChartDom);
  }
  if (userChartDom) {
    userRankChart = echarts.init(userChartDom);
  }

  window.addEventListener('resize', handleResize);
};

// 更新图表
const updateCharts = () => {
  // 会议室使用排行
  if (roomRankChart && roomRankList.value.length > 0) {
    roomRankChart.setOption({
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'value', name: '使用次数' },
      yAxis: {
        type: 'category',
        data: roomRankList.value.map(item => item.roomName),
        axisLabel: { rotate: 0 }
      },
      series: [{
        data: roomRankList.value.map(item => item.bookingCount),
        type: 'bar',
        itemStyle: { color: '#165DFF', borderRadius: [0, 4, 4, 0] }
      }]
    });
  }

  // 时间段热度分布
  if (timeHeatChart && timeHeatList.value.length > 0) {
    timeHeatChart.setOption({
      tooltip: { trigger: 'axis' },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: timeHeatList.value.map(item => item.timeSlot),
        axisLabel: { rotate: 45 }
      },
      yAxis: { type: 'value', name: '预定次数' },
      series: [{
        data: timeHeatList.value.map(item => item.count),
        type: 'line',
        smooth: true,
        areaStyle: { color: 'rgba(22, 93, 255, 0.1)' },
        lineStyle: { color: '#165DFF', width: 2 },
        symbol: 'circle',
        symbolSize: 6
      }]
    });
  }

  // 每日预定趋势
  if (dailyTrendChart && dailyTrendList.value.length > 0) {
    dailyTrendChart.setOption({
      tooltip: { trigger: 'axis' },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: dailyTrendList.value.map(item => item.date),
        axisLabel: { rotate: 45, interval: Math.floor(dailyTrendList.value.length / 10) }
      },
      yAxis: { type: 'value', name: '预定次数' },
      series: [{
        data: dailyTrendList.value.map(item => item.count),
        type: 'line',
        smooth: true,
        lineStyle: { color: '#722ED1', width: 2 },
        areaStyle: { color: 'rgba(114, 46, 209, 0.1)' }
      }]
    });
  }

  // 预定人排行
  if (userRankChart && userRankList.value.length > 0) {
    userRankChart.setOption({
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'value', name: '预定次数' },
      yAxis: {
        type: 'category',
        data: userRankList.value.slice(0, 10).map(item => item.userName || item.userAccount),
        axisLabel: { rotate: 0 }
      },
      series: [{
        data: userRankList.value.slice(0, 10).map(item => item.bookingCount),
        type: 'bar',
        itemStyle: { color: '#F7BA1E', borderRadius: [0, 4, 4, 0] }
      }]
    });
  }
};

// 窗口大小变化
const handleResize = () => {
  roomRankChart?.resize();
  timeHeatChart?.resize();
  dailyTrendChart?.resize();
  userRankChart?.resize();
};

// 时间范围变化
const onTimeRangeChange = () => {
  if (timeRange.value !== 'custom') {
    loadData();
  }
};

// 导出报表
const onExport = async () => {
  exportLoading.value = true;
  try {
    const request: any = { type: timeRange.value };

    if (timeRange.value === 'custom' && customDateRange.value.length === 2) {
      request.startTime = customDateRange.value[0].format('YYYY-MM-DD HH:mm:ss');
      request.endTime = customDateRange.value[1].format('YYYY-MM-DD HH:mm:ss');
    }

    // 创建隐藏链接下载
    const response = await AdminStatisticsControllerService.exportStatisticsUsingPost(request, {
      responseType: 'blob'
    });

    const blob = new Blob([response as any], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', `statistics_${dayjs().format('YYYYMMDD_HHmmss')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    Message.success('导出成功');
  } catch (error: any) {
    Message.error('导出失败: ' + error.message);
  } finally {
    exportLoading.value = false;
  }
};

onMounted(() => {
  initCharts();
  loadData();
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  roomRankChart?.dispose();
  timeHeatChart?.dispose();
  dailyTrendChart?.dispose();
  userRankChart?.dispose();
});
</script>

<style scoped lang="less">
#bookingStatisticsView {
  padding: 20px;

  .operation-bar {
    margin-bottom: 20px;
    display: flex;
    justify-content: flex-end;
  }

  .filter-card {
    margin-bottom: 20px;
  }

  .stat-cards {
    margin-bottom: 20px;

    .stat-card {
      text-align: center;
      transition: all 0.2s;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      :deep(.arco-card__title) {
        display: flex;
        justify-content: center;
        gap: 8px;
      }

      .stat-number {
        font-size: 32px;
        font-weight: 600;
        color: var(--color-text-1);
        margin: 12px 0 8px;
      }

      .stat-trend {
        font-size: 14px;

        &.up {
          color: rgb(var(--green-6));
        }

        &.down {
          color: rgb(var(--red-6));
        }
      }

      .stat-desc {
        font-size: 14px;
        color: var(--color-text-3);
      }
    }
  }

  .chart-row {
    margin-bottom: 20px;
  }

  .detail-table {
    margin-top: 20px;
  }
}
</style>
