<template>
  <div id="bookingManageView">
    <!-- 操作按钮区域 -->
    <div class="operation-bar">
      <a-space>
        <a-button type="primary" @click="onAdd">
          <template #icon><icon-plus /></template>
          新增预定
        </a-button>
        <a-button type="primary" status="danger" @click="onBatchCancel" :disabled="selectedKeys.length === 0">
          <template #icon><icon-delete /></template>
          批量取消
        </a-button>
        <a-button @click="router.push('/admin/booking/statistics')">
          <template #icon><icon-bar-chart /></template>
          使用统计
        </a-button>
      </a-space>
    </div>

    <!-- 搜索区域 -->
    <a-form :model="searchParams" layout="inline" class="search-form">
      <a-form-item field="title" label="会议主题">
        <a-input v-model="searchParams.title" placeholder="请输入会议主题" allow-clear />
      </a-form-item>
      <a-form-item field="roomId" label="会议室">
        <a-select
            v-model="searchParams.roomId"
            placeholder="请选择会议室"
            allow-clear
            style="width: 150px"
            :loading="roomLoading"
        >
          <a-option v-for="room in roomList" :key="room.id" :value="room.id">
            {{ room.roomName }}
          </a-option>
        </a-select>
      </a-form-item>
      <a-form-item field="userName" label="预定人">
        <a-input v-model="searchParams.userName" placeholder="请输入预定人" allow-clear />
      </a-form-item>
      <a-form-item field="status" label="会议状态">
        <a-select v-model="searchParams.status" placeholder="请选择" allow-clear style="width: 120px">
          <a-option :value="0">待签到</a-option>
          <a-option :value="1">进行中</a-option>
          <a-option :value="2">已完成</a-option>
          <a-option :value="3">已取消</a-option>
          <a-option :value="4">超时未签到</a-option>
        </a-select>
      </a-form-item>
      <a-form-item field="dateRange" label="会议时间">
        <a-range-picker v-model="dateRange" style="width: 240px" show-time @change="onDateRangeChange" />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" @click="onSearch">
          <template #icon><icon-search /></template>搜索
        </a-button>
        <a-button @click="onReset">
          <template #icon><icon-refresh /></template>重置
        </a-button>
      </a-form-item>
    </a-form>

    <!-- 预定列表 -->
    <a-table
        :columns="columns"
        :data="dataList"
        :pagination="pagination"
        @page-change="onPageChange"
        @page-size-change="onPageSizeChange"
        :loading="loading"
        row-key="id"
        :row-selection="rowSelection"
        v-model:selectedKeys="selectedKeys"
        :scroll="{ x: 1500 }"
    >
      <template #columns>
        <a-table-column title="ID" data-index="id" :width="60" fixed="left" />
        <a-table-column title="会议主题" data-index="title" :width="120" fixed="left">
          <template #cell="{ record }">
            <a-link @click="onViewDetail(record)">{{ record.title }}</a-link>
          </template>
        </a-table-column>
        <a-table-column title="会议室" data-index="roomName" :width="120" />
        <a-table-column title="预定人" data-index="userName" :width="100" />
        <a-table-column title="参会人数" :width="90">
          <template #cell="{ record }">
            {{ record.attendeeCount || 0 }}人
          </template>
        </a-table-column>
        <a-table-column title="会议时间" :width="300">
          <template #cell="{ record }">
            <a-space direction="vertical" size="mini">
              <span>{{ formatDateTime(record.startTime) }} - {{ formatDateTime(record.endTime) }}</span>
              <span class="text-muted">时长: {{ getDuration(record.startTime, record.endTime) }}</span>
            </a-space>
          </template>
        </a-table-column>
        <a-table-column title="状态" data-index="status" :width="100">
          <template #cell="{ record }">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>
        </a-table-column>
        <a-table-column title="实际时间" :width="200">
          <template #cell="{ record }">
            <a-space direction="vertical" size="mini">
              <span>签到: {{ formatDateTime(record.actualStart) || '-' }}</span>
              <span>结束: {{ formatDateTime(record.actualEnd) || '-' }}</span>
            </a-space>
          </template>
        </a-table-column>
        <a-table-column title="创建时间" data-index="createTime" :width="160">
          <template #cell="{ record }">
            {{ formatDateTime(record.createTime) }}
          </template>
        </a-table-column>
        <a-table-column title="操作" :width="220" fixed="right">
          <template #cell="{ record }">
            <a-space>
              <a-button type="text" size="small" @click="onEdit(record)">
                <icon-edit />编辑
              </a-button>
              <a-button type="text" size="small" status="danger" @click="onCancel(record)">
                <icon-delete />取消
              </a-button>
              <a-dropdown @select="(key) => onMoreAction(key, record)">
                <a-button type="text" size="small">
                  <icon-more />更多
                </a-button>
                <template #content>
                  <a-doption value="attendees">参会人员</a-doption>
                  <a-doption value="remind">发送提醒</a-doption>
                  <a-doption value="checkin" v-if="record.status === 0">手动签到</a-doption>
                  <a-doption value="complete" v-if="record.status === 1">手动结束</a-doption>
                </template>
              </a-dropdown>
            </a-space>
          </template>
        </a-table-column>
      </template>
    </a-table>

    <!-- 预定详情弹窗 -->
    <a-modal
        :visible="detailModalVisible"
        title="预定详情"
        @cancel="detailModalVisible = false"
        :footer="false"
        :width="700"
    >
      <a-descriptions v-if="currentBooking" :column="2" bordered>
        <a-descriptions-item label="预定ID" :span="2">{{ currentBooking.id }}</a-descriptions-item>
        <a-descriptions-item label="会议主题" :span="2">{{ currentBooking.title }}</a-descriptions-item>
        <a-descriptions-item label="会议室">{{ currentBooking.roomName }}</a-descriptions-item>
        <a-descriptions-item label="预定人">{{ currentBooking.userName }}</a-descriptions-item>
        <a-descriptions-item label="会议时间" :span="2">
          {{ formatDateTime(currentBooking.startTime) }} - {{ formatDateTime(currentBooking.endTime) }}
        </a-descriptions-item>
        <a-descriptions-item label="会议状态" :span="2">
          <a-tag :color="getStatusColor(currentBooking.status)">
            {{ getStatusText(currentBooking.status) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="签到时间">{{ formatDateTime(currentBooking.actualStart) || '-' }}</a-descriptions-item>
        <a-descriptions-item label="结束时间">{{ formatDateTime(currentBooking.actualEnd) || '-' }}</a-descriptions-item>
        <a-descriptions-item label="提前提醒">{{ currentBooking.remindBefore || 15 }}分钟</a-descriptions-item>
        <a-descriptions-item label="创建时间">{{ formatDateTime(currentBooking.createTime) }}</a-descriptions-item>
        <a-descriptions-item label="会议描述" :span="2">{{ currentBooking.description || '-' }}</a-descriptions-item>
      </a-descriptions>

      <a-divider>参会人员</a-divider>
      <a-table
          :data="attendeeList"
          :pagination="false"
          :bordered="false"
          :scroll="{ y: 200 }"
          :loading="attendeeLoading"
      >
        <a-table-column title="姓名" data-index="userName" />
        <a-table-column title="账号" data-index="userAccount" />
        <a-table-column title="邮箱" data-index="email" />
        <a-table-column title="手机" data-index="phone" />
        <a-table-column title="响应状态" data-index="status" :width="100">
          <template #cell="{ record }">
            <a-tag :color="getAttendeeStatusColor(record.status)">
              {{ getAttendeeStatusText(record.status) }}
            </a-tag>
          </template>
        </a-table-column>
        <a-table-column title="响应时间" data-index="responseTime" :width="160">
          <template #cell="{ record }">
            {{ formatDateTime(record.responseTime) || '-' }}
          </template>
        </a-table-column>
      </a-table>
    </a-modal>

    <!-- 新增/编辑预定弹窗 -->
    <a-modal
        :visible="bookingModalVisible"
        :title="bookingModalTitle"
        @ok="handleBookingModalOk"
        @cancel="bookingModalVisible = false"
        :ok-loading="bookingModalLoading"
        :width="700"
    >
      <a-form :model="bookingForm" :rules="bookingRules" ref="bookingFormRef" auto-label-width>
        <a-form-item field="title" label="会议主题" required>
          <a-input v-model="bookingForm.title" placeholder="请输入会议主题" />
        </a-form-item>
        <a-form-item field="roomId" label="会议室" required>
          <a-select
              v-model="bookingForm.roomId"
              placeholder="请选择会议室"
              :loading="roomLoading"
              @change="onRoomChange"
          >
            <a-option v-for="room in roomList" :key="room.id" :value="room.id">
              {{ room.roomName }} ({{ room.capacity }}人)
            </a-option>
          </a-select>
        </a-form-item>

        <!-- 修改后的时间选择区域 -->
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="startTime" label="开始时间" required>
              <div style="display: flex; gap: 8px;">
                <a-date-picker
                    v-model="startDateValue"
                    format="YYYY-MM-DD"
                    placeholder="选择日期"
                    style="width: 60%"
                    :disabled-date="disabledDate"
                    @change="onStartDateChange"
                />
                <a-time-picker
                    v-model="startTimeValue"
                    format="HH:mm"
                    placeholder="时间"
                    style="width: 40%"
                    :disabled-hours="disabledStartHours"
                    :disabled-minutes="disabledStartMinutes"
                    :hide-disabled-options="true"
                    @change="onStartTimeChange"
                    @select="onStartTimeSelect"
                />
              </div>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="endTime" label="结束时间" required>
              <div style="display: flex; gap: 8px;">
                <a-date-picker
                    v-model="endDateValue"
                    format="YYYY-MM-DD"
                    placeholder="选择日期"
                    style="width: 60%"
                    :disabled-date="disabledEndDate"
                    @change="onEndDateChange"
                />
                <a-time-picker
                    v-model="endTimeValue"
                    format="HH:mm"
                    placeholder="时间"
                    style="width: 40%"
                    :disabled-hours="disabledEndHours"
                    :disabled-minutes="disabledEndMinutes"
                    :hide-disabled-options="true"
                    @change="onEndTimeChange"
                />
              </div>
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item field="userId" label="预定人" required>
          <a-select
              v-model="bookingForm.userId"
              placeholder="请选择预定人"
              :loading="userLoading"
              allow-search
              :filter-option="filterUserOption"
          >
            <a-option v-for="user in userList" :key="user.id" :value="user.id">
              {{ user.userName }} ({{ user.userAccount }})
            </a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="attendeeIds" label="参会人员">
          <a-select
              v-model="bookingForm.attendeeIds"
              placeholder="请选择参会人员"
              multiple
              :loading="userLoading"
              allow-clear
              allow-search
              :filter-option="filterUserOption"
          >
            <a-option v-for="user in userList" :key="user.id" :value="user.id">
              {{ user.userName }} ({{ user.userAccount }})
            </a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="remindBefore" label="提前提醒">
          <a-input-number v-model="bookingForm.remindBefore" :min="0" :max="1440" :default-value="15">
            <template #append>分钟</template>
          </a-input-number>
        </a-form-item>
        <a-form-item field="description" label="会议描述">
          <a-textarea v-model="bookingForm.description" placeholder="请输入会议描述" :max-length="500" show-word-limit />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 参会人员管理弹窗 -->
    <a-modal
        :visible="attendeeModalVisible"
        title="参会人员管理"
        @ok="handleAttendeeModalOk"
        @cancel="attendeeModalVisible = false"
        :ok-loading="attendeeModalLoading"
        :width="600"
    >
      <a-alert type="info" show-icon style="margin-bottom: 16px">
        为会议 "{{ currentBooking?.title }}" 管理参会人员
      </a-alert>
      <a-transfer
          :data="allUserList"
          :model-value="selectedAttendees"
          :simple="false"
          :show-search="true"
          :title="['可选人员', '已选人员']"
          @change="onAttendeeChange"
      />
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { Message, Modal } from '@arco-design/web-vue';
import {
  IconPlus,
  IconDelete,
  IconSearch,
  IconRefresh,
  IconEdit,
  IconMore,
  IconBarChart
} from '@arco-design/web-vue/es/icon';
import { useRouter } from 'vue-router';
import dayjs from 'dayjs';

// 导入 openapi 生成的 API
import {
  AdminBookingControllerService,
  AdminRoomControllerService,
  AdminUserControllerService,
  type BookingAddRequest,
  type BookingQueryRequest,
  type BookingUpdateRequest,
  type BookingVO,
  type RoomVO,
  type UserVO,
  type AttendeeVO
} from '/generated';

const router = useRouter();
const dataList = ref<BookingVO[]>([]);
const loading = ref(false);
const selectedKeys = ref<number[]>([]);
const roomList = ref<RoomVO[]>([]);
const roomLoading = ref(false);
const userList = ref<UserVO[]>([]);
const allUserList = ref<any[]>([]);
const userLoading = ref(false);

// 拆分日期和时间
const startDateValue = ref<string>('');
const startTimeValue = ref<string>('');
const endDateValue = ref<string>('');
const endTimeValue = ref<string>('');

// 日期范围
const dateRange = ref<dayjs.Dayjs[]>([]);

// 搜索参数
const searchParams = ref<BookingQueryRequest>({
  title: undefined,
  roomId: undefined,
  userName: undefined,
  status: undefined,
  pageSize: 10,
  current: 1
});

// 分页 - 确保数字类型
const pagination = ref({
  showTotal: true,
  pageSize: 10,
  current: 1,
  total: 0,
  showJumper: true,
  showPageSize: true,
  pageSizeOptions: [10, 20, 50]
});

// 表格列配置
const columns = [
  { title: 'ID', dataIndex: 'id', width: 60, fixed: 'left' },
  { title: '会议主题', width: 100, fixed: 'left', slotName: 'title' },
  { title: '会议室', dataIndex: 'roomName', width: 120 },
  { title: '预定人', dataIndex: 'userName', width: 100 },
  { title: '参会人数', width: 90, slotName: 'attendeeCount' },
  { title: '会议时间', width: 300, slotName: 'timeRange' },
  { title: '状态', width: 100, slotName: 'status' },
  { title: '实际时间', width: 200, slotName: 'actualTime' },
  { title: '创建时间', width: 160, dataIndex: 'createTime' },
  { title: '操作', width: 220, fixed: 'right', slotName: 'operation' }
];

// 行选择配置
const rowSelection = {
  type: 'checkbox' as const,
  showCheckedAll: true,
  onlyCurrent: false
};

// ==================== 工具函数 ====================

const formatDateTime = (date: string | null) => {
  if (!date) return null;
  return dayjs(date).format('YYYY-MM-DD HH:mm');
};

const getStatusColor = (status: number) => {
  switch (status) {
    case 0: return 'blue';      // 待签到
    case 1: return 'green';      // 进行中
    case 2: return 'gray';       // 已完成
    case 3: return 'orange';     // 已取消
    case 4: return 'red';        // 超时未签到
    default: return 'blue';
  }
};

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

const getAttendeeStatusColor = (status: number) => {
  switch (status) {
    case 0: return 'orange';
    case 1: return 'green';
    case 2: return 'red';
    default: return 'gray';
  }
};

const getAttendeeStatusText = (status: number) => {
  switch (status) {
    case 0: return '待确认';
    case 1: return '已确认';
    case 2: return '已拒绝';
    default: return '未知';
  }
};

const getDuration = (start: string, end: string) => {
  if (!start || !end) return '-';
  const startTime = dayjs(start);
  const endTime = dayjs(end);
  const duration = endTime.diff(startTime, 'minute');
  if (duration < 60) return `${duration}分钟`;
  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;
  return `${hours}小时${minutes > 0 ? minutes + '分钟' : ''}`;
};

const filterUserOption = (inputValue: string, option: any) => {
  return option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1;
};

// ==================== 时间处理函数 ====================

// 监听开始日期变化
const onStartDateChange = (date: string) => {
  if (date && startTimeValue.value) {
    bookingForm.startTime = `${date} ${startTimeValue.value}:00`;
  } else {
    bookingForm.startTime = undefined;
  }

  // 如果结束日期早于开始日期，清空结束时间
  if (endDateValue.value && date && dayjs(endDateValue.value).isBefore(dayjs(date))) {
    endDateValue.value = '';
    endTimeValue.value = '';
    bookingForm.endTime = undefined;
  }
};

// 监听开始时间变化
const onStartTimeChange = (time: string) => {
  if (startDateValue.value && time) {
    bookingForm.startTime = `${startDateValue.value} ${time}:00`;
  } else {
    bookingForm.startTime = undefined;
  }
};

// 监听结束日期变化
const onEndDateChange = (date: string) => {
  if (date && endTimeValue.value) {
    bookingForm.endTime = `${date} ${endTimeValue.value}:00`;
  } else {
    bookingForm.endTime = undefined;
  }
};

// 监听结束时间变化
const onEndTimeChange = (time: string) => {
  if (endDateValue.value && time) {
    bookingForm.endTime = `${endDateValue.value} ${time}:00`;
  } else {
    bookingForm.endTime = undefined;
  }
};

// 开始时间选择时的回调
const onStartTimeSelect = (time: string) => {
  // 如果结束时间早于开始时间，清空结束时间
  if (bookingForm.endTime && bookingForm.startTime) {
    const start = dayjs(bookingForm.startTime);
    const end = dayjs(bookingForm.endTime);
    if (end.isBefore(start)) {
      bookingForm.endTime = undefined;
      endDateValue.value = '';
      endTimeValue.value = '';
    }
  }
};

// 禁用过去的日期
const disabledDate = (current: Date) => {
  return dayjs(current).isBefore(dayjs().startOf('day'));
};

// 结束日期不能早于开始日期
const disabledEndDate = (current: Date) => {
  if (!bookingForm.startTime) return dayjs(current).isBefore(dayjs().startOf('day'));
  const startDate = dayjs(bookingForm.startTime).format('YYYY-MM-DD');
  return dayjs(current).isBefore(dayjs(startDate));
};

// 禁用的小时 - 开始时间
const disabledStartHours = () => {
  const hours: number[] = [];
  const now = dayjs();
  const selectedDate = startDateValue.value;

  // 如果选择的是今天，禁用已经过去的小时
  if (selectedDate === now.format('YYYY-MM-DD')) {
    for (let i = 0; i < now.hour(); i++) {
      hours.push(i);
    }
  }
  return hours;
};

// 禁用的分钟 - 开始时间
const disabledStartMinutes = (hour: number) => {
  const minutes: number[] = [];
  const available = [0, 30];
  const now = dayjs();
  const selectedDate = startDateValue.value;

  // 把所有不在 available 中的分钟都禁用
  for (let i = 0; i < 60; i++) {
    if (!available.includes(i)) {
      minutes.push(i);
    }
  }

  // 如果选择的是今天且是当前小时，禁用已经过去的分钟
  if (selectedDate === now.format('YYYY-MM-DD') && hour === now.hour()) {
    for (let i = 0; i < now.minute(); i++) {
      if (!minutes.includes(i)) {
        minutes.push(i);
      }
    }
  }

  return minutes.sort();
};

// 禁用的小时 - 结束时间
const disabledEndHours = () => {
  if (!bookingForm.startTime) return [];

  const hours: number[] = [];
  const start = dayjs(bookingForm.startTime);
  const endDate = endDateValue.value;

  // 如果是同一天，不能选早于开始时间的小时
  if (endDate === start.format('YYYY-MM-DD')) {
    for (let i = 0; i < start.hour(); i++) {
      hours.push(i);
    }
  }

  return hours;
};

// 禁用的分钟 - 结束时间
const disabledEndMinutes = (hour: number) => {
  const minutes: number[] = [];
  const available = [0, 30];

  // 把所有不在 available 中的分钟都禁用
  for (let i = 0; i < 60; i++) {
    if (!available.includes(i)) {
      minutes.push(i);
    }
  }

  if (!bookingForm.startTime) return minutes.sort();

  const start = dayjs(bookingForm.startTime);
  const endDate = endDateValue.value;

  // 如果是同一天且是同一小时，分钟必须大于开始分钟的分钟
  if (endDate === start.format('YYYY-MM-DD') && hour === start.hour()) {
    for (let i = 0; i <= start.minute(); i++) {
      if (!minutes.includes(i)) {
        minutes.push(i);
      }
    }
  }

  return minutes.sort();
};

// ==================== 数据加载 ====================

const onDateRangeChange = () => {
  if (dateRange.value && dateRange.value.length === 2) {
    searchParams.value.startTimeBegin = dayjs(dateRange.value[0]).format('YYYY-MM-DD HH:mm:ss');
    searchParams.value.endTimeEnd = dayjs(dateRange.value[1]).format('YYYY-MM-DD HH:mm:ss');
  } else {
    searchParams.value.startTimeBegin = undefined;
    searchParams.value.endTimeEnd = undefined;
  }
};

const loadRoomList = async () => {
  roomLoading.value = true;
  try {
    const res = await AdminRoomControllerService.listRoomVoByPageUsingPost({
      pageSize: 10,
      current: 1
    });

    if (res.code === 0 && res.data) {
      if (Array.isArray(res.data)) {
        roomList.value = res.data;
      } else if (res.data.records) {
        roomList.value = res.data.records;
      } else {
        roomList.value = [];
      }
    } else {
      Message.error('加载会议室列表失败: ' + (res.message || '未知错误'));
    }
  } catch (error: any) {
    Message.error('加载会议室列表失败: ' + error.message);
  } finally {
    roomLoading.value = false;
  }
};

const loadUserList = async () => {
  userLoading.value = true;
  try {
    const res = await AdminUserControllerService.listUserByPageUsingPost({
      pageSize: 10,
      current: 1
    });

    if (res.code === 0 && res.data) {
      if (Array.isArray(res.data)) {
        userList.value = res.data;
      } else if (res.data.records) {
        userList.value = res.data.records;
      } else {
        userList.value = [];
      }

      allUserList.value = userList.value.map(u => ({
        key: u.id,
        value: u.id?.toString() || '',
        label: u.userName ? `${u.userName} (${u.userAccount})` : u.userAccount,
        disabled: false
      }));
    } else {
      Message.error('加载用户列表失败: ' + (res.message || '未知错误'));
    }
  } catch (error: any) {
    Message.error('加载用户列表失败: ' + error.message);
  } finally {
    userLoading.value = false;
  }
};

const loadData = async () => {
  loading.value = true;
  try {
    const params: BookingQueryRequest = {
      current: pagination.value.current,
      pageSize: pagination.value.pageSize,
      title: searchParams.value.title,
      roomId: searchParams.value.roomId,
      userName: searchParams.value.userName,
      status: searchParams.value.status,
      startTimeBegin: searchParams.value.startTimeBegin,
      endTimeEnd: searchParams.value.endTimeEnd
    };

    const res = await AdminBookingControllerService.listBookingVoByPageUsingPost(params);
    if (res.code === 0 && res.data) {
      dataList.value = res.data.records || [];
      pagination.value.total = Number(res.data.total) || 0;
      pagination.value.current = Number(res.data.current) || 1;
    } else {
      Message.error('加载失败: ' + (res.message || '未知错误'));
    }
  } catch (error: any) {
    Message.error('加载失败: ' + error.message);
  } finally {
    loading.value = false;
  }
};

// ==================== 事件处理 ====================

const onSearch = () => {
  pagination.value.current = 1;
  loadData();
};

const onReset = () => {
  dateRange.value = [];
  searchParams.value = {
    title: undefined,
    roomId: undefined,
    userName: undefined,
    status: undefined,
    startTimeBegin: undefined,
    endTimeEnd: undefined,
    pageSize: 10,
    current: 1
  };
  pagination.value.current = 1;
  loadData();
};

const onPageChange = (page: number) => {
  pagination.value.current = page;
  loadData();
};

const onPageSizeChange = (pageSize: number) => {
  pagination.value.pageSize = pageSize;
  pagination.value.current = 1;
  loadData();
};

// 预定详情
const detailModalVisible = ref(false);
const currentBooking = ref<BookingVO>();
const attendeeList = ref<AttendeeVO[]>([]);
const attendeeLoading = ref(false);

const onViewDetail = async (record: BookingVO) => {
  currentBooking.value = record;
  detailModalVisible.value = true;
  await loadAttendeeList(record.id!);
};

const loadAttendeeList = async (bookingId: number) => {
  attendeeLoading.value = true;
  try {
    if (currentBooking.value?.attendeeList) {
      attendeeList.value = currentBooking.value.attendeeList;
    } else {
      attendeeList.value = [];
    }
  } catch (error) {
    Message.error('加载参会人员失败');
  } finally {
    attendeeLoading.value = false;
  }
};

// 新增/编辑预定
const bookingModalVisible = ref(false);
const bookingModalTitle = ref('');
const bookingModalType = ref<'add' | 'edit'>('add');
const bookingModalLoading = ref(false);
const bookingFormRef = ref();
const bookingForm = reactive<BookingAddRequest & { id?: number }>({
  id: undefined,
  title: '',
  roomId: undefined,
  startTime: undefined,
  endTime: undefined,
  userId: undefined,
  attendeeIds: [],
  remindBefore: 15,
  description: ''
});

const bookingRules = {
  title: [{ required: true, message: '会议主题不能为空' }],
  roomId: [{ required: true, message: '请选择会议室' }],
  startTime: [{ required: true, message: '请选择开始时间' }],
  endTime: [{ required: true, message: '请选择结束时间' }],
  userId: [{ required: true, message: '请选择预定人' }]
};

const onAdd = () => {
  bookingModalType.value = 'add';
  bookingModalTitle.value = '新增预定';
  Object.assign(bookingForm, {
    id: undefined,
    title: '',
    roomId: undefined,
    startTime: undefined,
    endTime: undefined,
    userId: undefined,
    attendeeIds: [],
    remindBefore: 15,
    description: ''
  });
  // 重置拆分的时间
  startDateValue.value = '';
  startTimeValue.value = '';
  endDateValue.value = '';
  endTimeValue.value = '';
  bookingModalVisible.value = true;
};

const onEdit = async (record: BookingVO) => {
  bookingModalType.value = 'edit';
  bookingModalTitle.value = '编辑预定';

  const attendeeIds = record.attendeeList?.map(a => a.userId!) || [];

  Object.assign(bookingForm, {
    id: record.id,
    title: record.title,
    roomId: record.roomId,
    startTime: record.startTime,
    endTime: record.endTime,
    userId: record.userId,
    attendeeIds: attendeeIds,
    remindBefore: record.remindBefore || 15,
    description: record.description || ''
  });

  // 拆分时间
  if (record.startTime) {
    const start = dayjs(record.startTime);
    startDateValue.value = start.format('YYYY-MM-DD');
    startTimeValue.value = start.format('HH:mm');
  }
  if (record.endTime) {
    const end = dayjs(record.endTime);
    endDateValue.value = end.format('YYYY-MM-DD');
    endTimeValue.value = end.format('HH:mm');
  }

  bookingModalVisible.value = true;
};

const handleBookingModalOk = async () => {
  const errors = await bookingFormRef.value?.validate();
  if (errors) return;

  // 校验是否选择了完整的时间
  if (!bookingForm.startTime || !bookingForm.endTime) {
    Message.error('请选择完整的会议时间');
    return;
  }

  // 校验时间是否合法
  const start = dayjs(bookingForm.startTime);
  const end = dayjs(bookingForm.endTime);
  const diffMinutes = end.diff(start, 'minute');

  // 校验是否以30分钟为单位
  const startMinute = start.minute();
  const endMinute = end.minute();
  if (startMinute !== 0 && startMinute !== 30) {
    Message.error('开始时间必须为整点或半点（如 14:00 或 14:30）');
    return;
  }
  if (endMinute !== 0 && endMinute !== 30) {
    Message.error('结束时间必须为整点或半点（如 15:00 或 15:30）');
    return;
  }

  // 校验时长是否为30分钟的倍数
  if (diffMinutes % 30 !== 0) {
    Message.error('会议时长必须为30分钟的倍数');
    return;
  }

  // 校验时长是否小于30分钟
  if (diffMinutes < 30) {
    Message.error('会议时长不能少于30分钟');
    return;
  }

  bookingModalLoading.value = true;
  try {
    const submitData = { ...bookingForm };

    // 格式化时间为标准格式
    if (submitData.startTime) {
      submitData.startTime = submitData.startTime.replace(' ', 'T');
    }
    if (submitData.endTime) {
      submitData.endTime = submitData.endTime.replace(' ', 'T');
    }

    if (bookingModalType.value === 'add') {
      const res = await AdminBookingControllerService.addBookingUsingPost(submitData);
      if (res.code === 0) {
        Message.success('新增成功');
        bookingModalVisible.value = false;
        loadData();
      } else {
        Message.error(res.message || '新增失败');
      }
    } else {
      const updateRequest: BookingUpdateRequest = {
        id: submitData.id,
        title: submitData.title,
        roomId: submitData.roomId,
        startTime: submitData.startTime,
        endTime: submitData.endTime,
        userId: submitData.userId,
        attendeeIds: submitData.attendeeIds,
        remindBefore: submitData.remindBefore,
        description: submitData.description
      };
      const res = await AdminBookingControllerService.updateBookingUsingPost(updateRequest);
      if (res.code === 0) {
        Message.success('更新成功');
        bookingModalVisible.value = false;
        loadData();
      } else {
        Message.error(res.message || '更新失败');
      }
    }
  } catch (error: any) {
    Message.error('操作失败: ' + error.message);
  } finally {
    bookingModalLoading.value = false;
  }
};

const onCancel = (record: BookingVO) => {
  Modal.warning({
    title: '确认取消',
    content: `确定要取消会议 "${record.title}" 吗？`,
    hideCancel: false,
    onOk: async () => {
      try {
        const res = await AdminBookingControllerService.cancelBookingUsingPost({ id: record.id! });
        if (res.code === 0) {
          Message.success('已取消');
          loadData();
        } else {
          Message.error(res.message || '取消失败');
        }
      } catch (error: any) {
        Message.error('操作失败: ' + error.message);
      }
    }
  });
};

const onBatchCancel = () => {
  if (selectedKeys.value.length === 0) return;
  Modal.warning({
    title: '确认批量取消',
    content: `确定要取消选中的 ${selectedKeys.value.length} 个会议吗？`,
    hideCancel: false,
    onOk: async () => {
      try {
        const res = await AdminBookingControllerService.batchCancelBookingUsingPost({
          ids: selectedKeys.value
        });
        if (res.code === 0) {
          Message.success(`已取消 ${selectedKeys.value.length} 个会议`);
          selectedKeys.value = [];
          loadData();
        } else {
          Message.error(res.message || '批量取消失败');
        }
      } catch (error: any) {
        Message.error('操作失败: ' + error.message);
      }
    }
  });
};

// 参会人员管理
const attendeeModalVisible = ref(false);
const attendeeModalLoading = ref(false);
const selectedAttendees = ref<number[]>([]);

const onMoreAction = (key: string, record: BookingVO) => {
  currentBooking.value = record;

  switch (key) {
    case 'attendees':
      selectedAttendees.value = record.attendeeList?.map(a => a.userId!) || [];
      attendeeModalVisible.value = true;
      break;
    case 'remind':
      handleSendRemind(record);
      break;
    case 'checkin':
      handleManualCheckin(record);
      break;
    case 'complete':
      handleManualComplete(record);
      break;
  }
};

const onAttendeeChange = (newValue: string[]) => {
  selectedAttendees.value = newValue.map(v => parseInt(v));
};

const handleAttendeeModalOk = async () => {
  if (!currentBooking.value?.id) return;

  attendeeModalLoading.value = true;
  try {
    const res = await AdminBookingControllerService.updateBookingUsingPost({
      id: currentBooking.value.id,
      attendeeIds: selectedAttendees.value
    });
    if (res.code === 0) {
      Message.success('参会人员更新成功');
      attendeeModalVisible.value = false;
      loadData();
    } else {
      Message.error(res.message || '更新失败');
    }
  } catch (error: any) {
    Message.error('操作失败: ' + error.message);
  } finally {
    attendeeModalLoading.value = false;
  }
};

const handleSendRemind = (record: BookingVO) => {
  Modal.info({
    title: '发送提醒',
    content: `确定向参会人员发送会议提醒吗？`,
    hideCancel: false,
    onOk: async () => {
      try {
        const res = await AdminBookingControllerService.sendRemindUsingPost({ id: record.id! });
        if (res.code === 0) {
          Message.success('提醒已发送');
        } else {
          Message.error(res.message || '发送失败');
        }
      } catch (error: any) {
        Message.error('操作失败: ' + error.message);
      }
    }
  });
};

const handleManualCheckin = (record: BookingVO) => {
  Modal.info({
    title: '手动签到',
    content: `确定手动签到会议 "${record.title}" 吗？`,
    hideCancel: false,
    onOk: async () => {
      try {
        const res = await AdminBookingControllerService.signInUsingPost({ id: record.id! });
        if (res.code === 0) {
          Message.success('签到成功');
          loadData();
        } else {
          Message.error(res.message || '签到失败');
        }
      } catch (error: any) {
        Message.error('操作失败: ' + error.message);
      }
    }
  });
};

const handleManualComplete = (record: BookingVO) => {
  Modal.info({
    title: '手动结束',
    content: `确定手动结束会议 "${record.title}" 吗？`,
    hideCancel: false,
    onOk: async () => {
      try {
        const res = await AdminBookingControllerService.completeBookingUsingPost({ id: record.id! });
        if (res.code === 0) {
          Message.success('会议已结束');
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

const onRoomChange = (roomId: number) => {
  console.log('选中会议室:', roomId);
};

// 初始化加载
onMounted(() => {
  loadData();
  loadRoomList();
  loadUserList();
});
</script>

<style scoped lang="less">
#bookingManageView {
  padding: 20px;

  .operation-bar {
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
  }

  .search-form {
    margin-bottom: 20px;
    padding: 20px;
    background-color: var(--color-bg-2);
    border-radius: 4px;
  }

  .text-muted {
    color: var(--color-text-3);
    font-size: 12px;
  }
}
</style>
