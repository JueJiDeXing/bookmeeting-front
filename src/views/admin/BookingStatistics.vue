<template>
  <div id="bookingStatisticsView">
    <!-- 操作按钮区域 -->
    <div class="operation-bar">
      <a-space>
        <a-button @click="router.push('/admin/booking')">
          <template #icon><icon-arrow-left /></template>
          返回预定列表
        </a-button>
        <a-button type="primary" @click="onExport">
          <template #icon><icon-download /></template>
          导出报表
        </a-button>
      </a-space>
    </div>

    <!-- 时间筛选 -->
    <a-card class="filter-card">
      <a-space size="large" wrap>
        <a-radio-group v-model="timeRange" type="button" @change="onTimeRangeChange">
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
            style="width: 240px"
        />
      </a-space>
    </a-card>

    <!-- 统计卡片 -->
    <a-row :gutter="16" class="stat-cards">
      <a-col :span="6">
        <a-card class="stat-card">
          <template #title>
            <icon-calendar />
            总预定次数
          </template>
          <div class="stat-number">{{ statistics.totalBookings }}</div>
          <div class="stat-trend" :class="{ up: statistics.bookingTrend > 0, down: statistics.bookingTrend < 0 }">
            <icon-caret-up v-if="statistics.bookingTrend > 0" />
            <icon-caret-down v-if="statistics.bookingTrend < 0" />
            {{ Math.abs(statistics.bookingTrend) }}% 较上期
          </div>
        </a-card>
      </a-col>

      <a-col :span="6">
        <a-card class="stat-card">
          <template #title>
            <icon-clock-circle />
            总会议时长
          </template>
          <div class="stat-number">{{ statistics.totalHours }}小时</div>
          <div class="stat-desc">平均 {{ statistics.avgHoursPerBooking }}小时/场</div>
        </a-card>
      </a-col>

      <a-col :span="6">
        <a-card class="stat-card">
          <template #title>
            <icon-user />
            参会总人次
          </template>
          <div class="stat-number">{{ statistics.totalAttendees }}</div>
          <div class="stat-desc">平均 {{ statistics.avgAttendeesPerBooking }}人/场</div>
        </a-card>
      </a-col>

      <a-col :span="6">
        <a-card class="stat-card">
          <template #title>
            <icon-percent />
            会议室使用率
          </template>
          <div class="stat-number">{{ statistics.utilizationRate }}%</div>
          <div class="stat-desc">高峰期: {{ statistics.peakHours }}</div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 图表区域 -->
    <a-row :gutter="16" class="chart-row">
      <a-col :span="12">
        <a-card title="会议室使用排行">
          <div id="roomRankChart" style="height: 300px"></div>
        </a-card>
      </a-col>

      <a-col :span="12">
        <a-card title="时间段热度分布">
          <div id="timeHeatChart" style="height: 300px"></div>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="16" class="chart-row">
      <a-col :span="12">
        <a-card title="每日预定趋势">
          <div id="dailyTrendChart" style="height: 300px"></div>
        </a-card>
      </a-col>

      <a-col :span="12">
        <a-card title="预定人排行">
          <div id="userRankChart" style="height: 300px"></div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 详细数据表格 -->
    <a-card title="会议室使用详情" class="detail-table">
      <a-table
          :columns="roomColumns"
          :data="roomDetailList"
          :pagination="false"
          :loading="loading"
      >
        <template #columns>
          <a-table-column title="会议室" data-index="roomName" />
          <a-table-column title="预定次数" data-index="bookingCount" sortable />
          <a-table-column title="使用时长" data-index="totalHours" sortable>
            <template #cell="{ record }">{{ record.totalHours }}小时</template>
          </a-table-column>
          <a-table-column title="使用率" data-index="utilizationRate" sortable>
            <template #cell="{ record }">{{ record.utilizationRate }}%</template>
          </a-table-column>
          <a-table-column title="最常用时间段" data-index="peakTime" />
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue';
import { Message } from '@arco-design/web-vue';
import {
  IconArrowLeft,
  IconDownload,
  IconCalendar,
  IconClockCircle,
  IconUser,
  IconCaretUp,
  IconCaretDown
} from '@arco-design/web-vue/es/icon';
import { useRouter } from 'vue-router';
import * as echarts from 'echarts';

const router = useRouter();
const loading = ref(false);
const timeRange = ref('month');
const customDateRange = ref([]);

// 统计数据
const statistics = ref({
  totalBookings: 128,
  bookingTrend: 12.5,
  totalHours: 356,
  avgHoursPerBooking: 2.8,
  totalAttendees: 856,
  avgAttendeesPerBooking: 6.7,
  utilizationRate: 68,
  peakHours: '14:00-16:00'
});

// 会议室详情列表
const roomDetailList = ref([
  { roomName: '第一会议室', bookingCount: 45, totalHours: 112, utilizationRate: 75, peakTime: '10:00-12:00' },
  { roomName: '第二会议室', bookingCount: 38, totalHours: 95, utilizationRate: 63, peakTime: '14:00-16:00' },
  { roomName: '第三会议室', bookingCount: 32, totalHours: 82, utilizationRate: 55, peakTime: '09:00-11:00' },
  { roomName: '第四会议室', bookingCount: 28, totalHours: 67, utilizationRate: 45, peakTime: '15:00-17:00' }
]);

// 表格列
const roomColumns = [
  { title: '会议室', dataIndex: 'roomName' },
  { title: '预定次数', dataIndex: 'bookingCount', sortable: true },
  { title: '使用时长', dataIndex: 'totalHours', sortable: true },
  { title: '使用率', dataIndex: 'utilizationRate', sortable: true },
  { title: '最常用时间段', dataIndex: 'peakTime' }
];

// 初始化图表
const initCharts = () => {
  nextTick(() => {
    // 会议室使用排行
    const roomChart = echarts.init(document.getElementById('roomRankChart'));
    roomChart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: ['第一会议室', '第二会议室', '第三会议室', '第四会议室'] },
      yAxis: { type: 'value', name: '使用次数' },
      series: [{
        data: [45, 38, 32, 28],
        type: 'bar',
        itemStyle: { color: '#165DFF' }
      }]
    });

    // 时间段热度分布
    const timeChart = echarts.init(document.getElementById('timeHeatChart'));
    timeChart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: ['09-10', '10-11', '11-12', '14-15', '15-16', '16-17', '17-18']
      },
      yAxis: { type: 'value', name: '预定次数' },
      series: [{
        data: [12, 25, 18, 32, 28, 15, 8],
        type: 'line',
        smooth: true,
        areaStyle: { color: 'rgba(22, 93, 255, 0.1)' }
      }]
    });

    // 每日趋势
    const dailyChart = echarts.init(document.getElementById('dailyTrendChart'));
    dailyChart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
      },
      yAxis: { type: 'value', name: '预定次数' },
      series: [{
        data: [18, 22, 25, 20, 15, 8, 5],
        type: 'line',
        smooth: true
      }]
    });

    // 预定人排行
    const userChart = echarts.init(document.getElementById('userRankChart'));
    userChart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: ['张三', '李四', '王五', '赵六', '钱七']
      },
      yAxis: { type: 'value', name: '预定次数' },
      series: [{
        data: [28, 22, 18, 15, 12],
        type: 'bar',
        itemStyle: { color: '#722ED1' }
      }]
    });

    // 窗口大小变化自适应
    window.addEventListener('resize', () => {
      roomChart.resize();
      timeChart.resize();
      dailyChart.resize();
      userChart.resize();
    });
  });
};

// 时间范围变化
const onTimeRangeChange = () => {
  if (timeRange.value !== 'custom') {
    loadData();
  }
};

// 加载数据
const loadData = async () => {
  loading.value = true;
  try {
    // TODO: 调用统计接口
    // const res = await StatisticsControllerService.getBookingStatisticsUsingGet({
    //   timeRange: timeRange.value,
    //   startDate: customDateRange.value?.[0],
    //   endDate: customDateRange.value?.[1]
    // });
    // if (res.code === 0) {
    //   statistics.value = res.data.statistics;
    //   roomDetailList.value = res.data.roomDetails;
    //   更新图表数据...
    // }
    Message.success('数据加载成功');
  } catch (error) {
    Message.error('加载失败: ' + error.message);
  } finally {
    loading.value = false;
  }
};

// 导出报表
const onExport = () => {
  Message.info('正在导出报表...');
  // TODO: 调用导出接口
};

onMounted(() => {
  loadData();
  initCharts();
});
</script>

<style scoped lang="less">
#bookingStatisticsView {
  padding: 20px;

  .operation-bar {
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
  }

  .filter-card {
    margin-bottom: 20px;
  }

  .stat-cards {
    margin-bottom: 20px;

    .stat-card {
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
