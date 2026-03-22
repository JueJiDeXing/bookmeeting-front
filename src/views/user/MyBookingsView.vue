<template>
  <div id="myBookingsView">
    <!-- 状态标签页 -->
    <a-tabs :active-key="activeTab" @change="onTabChange">
      <a-tab-pane key="all" title="全部" />
      <a-tab-pane key="0" title="待签到" />
      <a-tab-pane key="1" title="进行中" />
      <a-tab-pane key="2" title="已完成" />
      <a-tab-pane key="3" title="已取消" />
      <a-tab-pane key="4" title="超时未签到" />
    </a-tabs>

    <!-- 搜索区域 -->
    <a-card class="search-card">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-input
              v-model="searchParams.title"
              placeholder="会议主题"
              allow-clear
              @press-enter="onSearch"
          >
            <template #prefix>
              <icon-search />
            </template>
          </a-input>
        </a-col>
        <a-col :span="4">
          <a-select
              v-model="searchParams.roomId"
              placeholder="全部会议室"
              allow-clear
              :loading="roomLoading"
              @change="onSearch"
          >
            <a-option v-for="room in roomList" :key="room.id" :value="room.id">
              {{ room.roomName }}
            </a-option>
          </a-select>
        </a-col>
        <a-col :span="8">
          <a-range-picker
              v-model="dateRange"
              style="width: 100%"
              @change="onDateRangeChange"
          />
        </a-col>
        <a-col :span="6">
          <a-space>
            <a-button type="primary" @click="onSearch">
              <template #icon><icon-search /></template>
              搜索
            </a-button>
            <a-button @click="onReset">
              <template #icon><icon-refresh /></template>
              重置
            </a-button>
          </a-space>
        </a-col>
      </a-row>
    </a-card>

    <!-- 预定列表 -->
    <a-table
        :columns="columns"
        :data="dataList"
        :pagination="pagination"
        @page-change="onPageChange"
        @page-size-change="onPageSizeChange"
        :loading="loading"
        row-key="id"
        :bordered="false"
    >
      <template #columns>
        <a-table-column title="会议主题" data-index="title" :width="160">
          <template #cell="{ record }">
            <a-link @click="goToDetail(record.id)">{{ record.title }}</a-link>
          </template>
        </a-table-column>
        <a-table-column title="会议室" data-index="roomName" :width="150" />
        <a-table-column title="会议时间" :width="300">
          <template #cell="{ record }">
            <a-space direction="vertical" size="mini">
              <span>{{ formatDateTime(record.startTime) }} - {{ formatDateTime(record.endTime) }}</span>
              <span class="text-muted">时长: {{ getDuration(record.startTime, record.endTime) }}</span>
            </a-space>
          </template>
        </a-table-column>
        <a-table-column title="状态" data-index="status" :width="90">
          <template #cell="{ record }">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>
        </a-table-column>
        <a-table-column title="我的状态" :width="90">
          <template #cell="{ record }">
            <a-tag v-if="getMyAttendeeStatus(record) === 0" color="orange">待确认</a-tag>
            <a-tag v-else-if="getMyAttendeeStatus(record) === 1" color="green">已确认</a-tag>
            <a-tag v-else-if="getMyAttendeeStatus(record) === 2" color="red">已拒绝</a-tag>
            <span v-else class="text-muted">-</span>
          </template>
        </a-table-column>
        <a-table-column title="参会人数" :width="90">
          <template #cell="{ record }">
            {{ record.attendeeCount || 1 }}人
          </template>
        </a-table-column>
        <a-table-column title="创建时间" data-index="createTime" :width="180" />
        <a-table-column title="操作" :width="200" fixed="right">
          <template #cell="{ record }">
            <a-space>
              <a-button type="text" size="small" @click="goToDetail(record.id)">
                <icon-eye /> 详情
              </a-button>
              <a-button
                  v-if="record.status === 0 && (record.userId === currentUserId || getMyAttendeeStatus(record) === 0)"
                  type="text"
                  size="small"
                  status="danger"
                  @click="onCancel(record)"
              >
                <icon-close /> 取消
              </a-button>
              <a-button
                  v-if="record.status === 0 && (record.userId === currentUserId || getMyAttendeeStatus(record) === 0)"
                  type="text"
                  size="small"
                  status="success"
                  @click="onSignIn(record)"
              >
                <icon-check /> 签到
              </a-button>
              <a-button
                  v-if="getMyAttendeeStatus(record) === 0 && record.status === 0 && record.userId !== currentUserId"
                  type="text"
                  size="small"
                  status="success"
                  @click="onConfirmAttendee(record)"
              >
                <icon-check /> 确认
              </a-button>
              <a-button
                  v-if="getMyAttendeeStatus(record) === 0 && record.status === 0 && record.userId !== currentUserId"
                  type="text"
                  size="small"
                  status="danger"
                  @click="onRejectAttendee(record)"
              >
                <icon-close /> 拒绝
              </a-button>
            </a-space>
          </template>
        </a-table-column>
      </template>

      <!-- 空状态 -->
      <template #empty>
        <a-empty description="暂无预定记录" />
      </template>
    </a-table>

    <!-- 取消预定确认弹窗 -->
    <a-modal
        :visible="cancelModalVisible"
        title="取消预定"
        @ok="handleCancelOk"
        @cancel="cancelModalVisible = false"
        :ok-loading="cancelLoading"
    >
      <a-alert type="warning" show-icon>
        确定要取消会议 "{{ currentBooking?.title }}" 吗？取消后不可恢复。
      </a-alert>
    </a-modal>

    <!-- 拒绝参会弹窗 -->
    <a-modal
        :visible="rejectModalVisible"
        title="拒绝参会"
        @ok="handleRejectOk"
        @cancel="rejectModalVisible = false"
        :ok-loading="rejectLoading"
    >
      <a-form>
        <a-form-item label="拒绝原因">
          <a-textarea
              v-model="rejectRemark"
              placeholder="请输入拒绝原因（可选）"
              :max-length="200"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { Message, Modal } from '@arco-design/web-vue';
import {
  IconSearch,
  IconRefresh,
  IconEye,
  IconClose,
  IconCheck
} from '@arco-design/web-vue/es/icon';
import { useRouter } from 'vue-router';
import dayjs from 'dayjs';

import {
  UserBookingControllerService,
  UserRoomControllerService,
  UserAttendeeControllerService
} from '/generated';
import type { BookingVO, RoomVO } from '/generated';
import { useStore } from 'vuex';

const router = useRouter();
const store = useStore();
const dataList = ref<BookingVO[]>([]);
const loading = ref(false);
const roomList = ref<RoomVO[]>([]);
const roomLoading = ref(false);
const activeTab = ref('all');
const currentUserId = ref<number>();

// 获取当前登录用户ID
const getCurrentUserId = () => {
  const loginUser = store.state.user.loginUser;
  if (loginUser && loginUser.id) {
    currentUserId.value = loginUser.id;
  } else {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        currentUserId.value = parseInt(payload.id);
      } catch (e) {
        console.error('解析token失败', e);
      }
    }
  }
};

// 获取当前用户对某个会议的参会状态
const getMyAttendeeStatus = (booking: any) => {
  if (!currentUserId.value) return null;
  const attendee = booking.attendeeList?.find((a: any) => a.userId === currentUserId.value);
  return attendee?.status;
};

// 日期范围
const dateRange = ref<dayjs.Dayjs[]>([]);

// 搜索参数
const searchParams = reactive({
  title: undefined,
  roomId: undefined,
  status: undefined,
  startTimeBegin: undefined,
  startTimeEnd: undefined,
  current: 1,
  pageSize: 10
});

// 分页
const pagination = ref({
  showTotal: true,
  pageSize: 10,
  current: 1,
  total: 0,
  showJumper: true,
  showPageSize: true,
  pageSizeOptions: [5, 10, 20, 50]
});

// 表格列配置
const columns = [
  { title: '会议主题', width: 160, slotName: 'title' },
  { title: '会议室', dataIndex: 'roomName', width: 150 },
  { title: '会议时间', width: 300, slotName: 'time' },
  { title: '状态', width: 90, slotName: 'status' },
  { title: '我的状态', width: 90, slotName: 'myStatus' },
  { title: '参会人数', width: 90, slotName: 'attendeeCount' },
  { title: '创建时间', dataIndex: 'createTime', width: 180 },
  { title: '操作', width: 200, fixed: 'right', slotName: 'operation' }
];

// 获取状态颜色
const getStatusColor = (status: number) => {
  switch (status) {
    case 0: return 'blue';
    case 1: return 'green';
    case 2: return 'gray';
    case 3: return 'orange';
    case 4: return 'red';
    default: return 'blue';
  }
};

// 获取状态文本
const getStatusText = (status: number) => {
  switch (status) {
    case 0: return '待签到';
    case 1: return '进行中';
    case 2: return '已完成';
    case 3: return '已取消';
    case 4: return '超时未签到';
    default: return '未知';
  }
};

// 格式化日期时间
const formatDateTime = (date: string) => {
  if (!date) return '-';
  return dayjs(date).format('YYYY-MM-DD HH:mm');
};

// 计算时长
const getDuration = (start: string, end: string) => {
  if (!start || !end) return '-';
  const startTime = dayjs(start);
  const endTime = dayjs(end);
  const minutes = endTime.diff(startTime, 'minute');
  if (minutes < 60) return `${minutes}分钟`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`;
};

// 加载会议室列表
const loadRoomList = async () => {
  roomLoading.value = true;
  try {
    const res = await UserRoomControllerService.listAvailableRoomsUsingPost({
      pageSize: 10,
      current: 1
    });
    if (res.code === 0 && res.data) {
      roomList.value = res.data.records || [];
    }
  } catch (error) {
    console.error('加载会议室列表失败', error);
  } finally {
    roomLoading.value = false;
  }
};

// 加载我的预定列表
const loadData = async () => {
  loading.value = true;
  try {
    const params = {
      ...searchParams,
      status: activeTab.value !== 'all' ? parseInt(activeTab.value) : undefined
    };

    const res = await UserBookingControllerService.listMyBookingsUsingPost({
      ...params,
      current: pagination.value.current,
      pageSize: pagination.value.pageSize
    });

    if (res.code === 0 && res.data) {
      dataList.value = res.data.records || [];
      pagination.value.total = res.data.total || 0;
    } else {
      Message.error('加载失败: ' + (res.message || '未知错误'));
    }
  } catch (error: any) {
    Message.error('加载失败: ' + error.message);
  } finally {
    loading.value = false;
  }
};

// 标签页变化
const onTabChange = (key: string) => {
  activeTab.value = key;
  pagination.value.current = 1;
  loadData();
};

// 日期范围变化
const onDateRangeChange = () => {
  if (dateRange.value && dateRange.value.length === 2) {
    searchParams.startTimeBegin = dayjs(dateRange.value[0]).format('YYYY-MM-DD HH:mm:ss');
    searchParams.startTimeEnd = dayjs(dateRange.value[1]).format('YYYY-MM-DD HH:mm:ss');
  } else {
    searchParams.startTimeBegin = undefined;
    searchParams.startTimeEnd = undefined;
  }
};

// 搜索
const onSearch = () => {
  pagination.value.current = 1;
  loadData();
};

// 重置
const onReset = () => {
  dateRange.value = [];
  searchParams.title = undefined;
  searchParams.roomId = undefined;
  searchParams.startTimeBegin = undefined;
  searchParams.startTimeEnd = undefined;
  pagination.value.current = 1;
  loadData();
};

// 页码变化
const onPageChange = (page: number) => {
  pagination.value.current = page;
  loadData();
};

// 每页条数变化
const onPageSizeChange = (pageSize: number) => {
  pagination.value.pageSize = pageSize;
  pagination.value.current = 1;
  loadData();
};

// 跳转到详情页
const goToDetail = (id: number) => {
  router.push(`/booking/${id}`);
};

// 取消预定弹窗
const cancelModalVisible = ref(false);
const cancelLoading = ref(false);
const currentBooking = ref<BookingVO>();

const onCancel = (record: BookingVO) => {
  currentBooking.value = record;
  cancelModalVisible.value = true;
};

const handleCancelOk = async () => {
  if (!currentBooking.value?.id) return;

  cancelLoading.value = true;
  try {
    const res = await UserBookingControllerService.cancelBookingUsingPost1({
      id: currentBooking.value.id
    });

    if (res.code === 0) {
      Message.success('取消成功');
      cancelModalVisible.value = false;
      loadData();
    } else {
      Message.error(res.message || '取消失败');
    }
  } catch (error: any) {
    Message.error('取消失败: ' + error.message);
  } finally {
    cancelLoading.value = false;
  }
};

// 签到
const onSignIn = (record: BookingVO) => {
  Modal.info({
    title: '确认签到',
    content: `确定要签到会议 "${record.title}" 吗？`,
    onOk: async () => {
      try {
        const res = await UserBookingControllerService.signInUsingPost1({
          id: record.id!
        });

        if (res.code === 0) {
          Message.success('签到成功');
          loadData();
        } else {
          Message.error(res.message || '签到失败');
        }
      } catch (error: any) {
        Message.error('签到失败: ' + error.message);
      }
    }
  });
};

// 拒绝相关
const rejectModalVisible = ref(false);
const rejectLoading = ref(false);
const rejectRemark = ref('');
const rejectBooking = ref<BookingVO>();

// 确认参会
const onConfirmAttendee = (record: BookingVO) => {
  Modal.info({
    title: '确认参会',
    content: `确定要确认参加 "${record.title}" 吗？`,
    onOk: async () => {
      try {
        const res = await UserAttendeeControllerService.confirmMeetingUsingPost({
          bookingId: record.id
        });
        if (res.code === 0) {
          Message.success('已确认参会');
          loadData();
        } else {
          Message.error(res.message || '操作失败');
        }
      } catch (error: any) {
        Message.error('操作失败: ' + error.message);
      }
    }
  });
};

// 拒绝参会（打开弹窗）
const onRejectAttendee = (record: BookingVO) => {
  rejectBooking.value = record;
  rejectRemark.value = '';
  rejectModalVisible.value = true;
};

// 确认拒绝
const handleRejectOk = async () => {
  if (!rejectBooking.value?.id) return;

  rejectLoading.value = true;
  try {
    const res = await UserAttendeeControllerService.rejectMeetingUsingPost({
      bookingId: rejectBooking.value.id,
      remark: rejectRemark.value
    });
    if (res.code === 0) {
      Message.success('已拒绝参会');
      rejectModalVisible.value = false;
      loadData();
    } else {
      Message.error(res.message || '操作失败');
    }
  } catch (error: any) {
    Message.error('操作失败: ' + error.message);
  } finally {
    rejectLoading.value = false;
  }
};

onMounted(() => {
  getCurrentUserId();
  loadRoomList();
  loadData();
});
</script>

<style scoped lang="less">
#myBookingsView {
  padding: 20px;

  .search-card {
    margin: 20px 0;
  }

  .text-muted {
    color: var(--color-text-3);
    font-size: 12px;
  }

  :deep(.arco-table) {
    background-color: var(--color-bg-2);
    border-radius: 4px;
  }
}
</style>
