<template>
  <div id="roomDetailView">
    <a-page-header
        title="会议室详情"
        @back="router.back()"
    >
      <template #subtitle>
        <a-tag :color="getStatusColor(roomInfo?.status)">
          {{ getStatusText(roomInfo?.status) }}
        </a-tag>
      </template>
    </a-page-header>

    <a-row :gutter="24">
      <!-- 左侧：会议室信息 -->
      <a-col :span="16">
        <a-card class="info-card" :bordered="false">
          <template #title>
            <a-space>
              <icon-home />
              <span>{{ roomInfo?.roomName }}</span>
            </a-space>
          </template>

          <a-descriptions :column="2">
            <a-descriptions-item label="位置">
              {{ roomInfo?.locationDesc }}
            </a-descriptions-item>
            <a-descriptions-item label="容纳人数">
              <icon-user /> {{ roomInfo?.capacity }}人
            </a-descriptions-item>
            <a-descriptions-item label="楼栋">
              {{ roomInfo?.building }}
            </a-descriptions-item>
            <a-descriptions-item label="楼层">
              {{ roomInfo?.floor }}楼
            </a-descriptions-item>
            <a-descriptions-item label="房间号">
              {{ roomInfo?.roomNumber }}
            </a-descriptions-item>
            <a-descriptions-item label="创建时间">
              {{ roomInfo?.createTime }}
            </a-descriptions-item>
          </a-descriptions>

          <a-divider orientation="left">会议室描述</a-divider>
          <p class="room-desc">{{ roomInfo?.description || '暂无描述' }}</p>

          <a-divider orientation="left">设备配置</a-divider>
          <a-space wrap size="medium">
            <a-tag
                v-for="eq in roomInfo?.equipmentList"
                :key="eq.id"
                color="arcoblue"
                size="large"
            >
              <icon-tool />
              {{ eq.equipmentName }}
            </a-tag>
            <span v-if="!roomInfo?.equipmentList?.length" class="no-equipment">
              暂无设备
            </span>
          </a-space>
        </a-card>
      </a-col>

      <!-- 右侧：预定表单 -->
      <a-col :span="8">
        <a-card class="booking-card" :bordered="false">
          <template #title>
            <a-space>
              <icon-calendar />
              <span>预定会议室</span>
            </a-space>
          </template>

          <a-form :model="bookingForm" auto-label-width>
            <a-form-item label="会议主题" required>
              <a-input
                  v-model="bookingForm.title"
                  placeholder="请输入会议主题"
                  :max-length="100"
              />
            </a-form-item>

            <a-form-item label="日期" required>
              <a-date-picker
                  v-model="bookingForm.date"
                  :disabled-date="disabledDate"
                  style="width: 100%"
                  @change="onDateChange"
              />
            </a-form-item>

            <a-form-item label="时间" required>
              <a-space>
                <a-time-picker
                    v-model="bookingForm.startTime"
                    format="HH:mm"
                    placeholder="开始时间"
                    :disabled-hours="disabledStartHours"
                    :disabled-minutes="disabledStartMinutes"
                    style="width: 110px"
                    @change="onTimeChange"
                />
                <span>-</span>
                <a-time-picker
                    v-model="bookingForm.endTime"
                    format="HH:mm"
                    placeholder="结束时间"
                    :disabled-hours="disabledEndHours"
                    :disabled-minutes="disabledEndMinutes"
                    style="width: 110px"
                />
              </a-space>
            </a-form-item>

            <!-- 实时占用提示 -->
            <a-alert
                v-if="conflictMessage"
                :type="conflictType"
                show-icon
                style="margin-bottom: 16px"
            >
              {{ conflictMessage }}
            </a-alert>

            <a-form-item label="参会人员">
              <a-select
                  v-model="bookingForm.attendeeIds"
                  placeholder="请选择参会人员"
                  multiple
                  :loading="userLoading"
                  allow-clear
                  allow-search
              >
                <a-option v-for="user in userList" :key="user.id" :value="user.id">
                  {{ user.userName }} ({{ user.userAccount }})
                </a-option>
              </a-select>
            </a-form-item>

            <a-form-item label="提前提醒">
              <a-select v-model="bookingForm.remindBefore" style="width: 100%">
                <a-option :value="0">不提醒</a-option>
                <a-option :value="15">提前15分钟</a-option>
                <a-option :value="30">提前30分钟</a-option>
                <a-option :value="60">提前1小时</a-option>
                <a-option :value="120">提前2小时</a-option>
              </a-select>
            </a-form-item>

            <a-form-item label="会议描述">
              <a-textarea
                  v-model="bookingForm.description"
                  placeholder="请输入会议描述（可选）"
                  :max-length="500"
                  :auto-size="{ minRows: 3 }"
              />
            </a-form-item>

            <a-divider />

            <a-space direction="vertical" fill>
              <a-button
                  type="primary"
                  long
                  size="large"
                  :loading="bookingLoading"
                  @click="handleBooking"
              >
                <template #icon><icon-check /></template>
                提交预定
              </a-button>
              <a-button long @click="checkAvailability">
                <template #icon><icon-search /></template>
                检查占用
              </a-button>
            </a-space>
          </a-form>
        </a-card>
      </a-col>
    </a-row>

    <!-- 该会议室其他预定 -->
    <a-card class="bookings-card" :bordered="false">
      <template #title>
        <a-space>
          <icon-list />
          <span>该会议室其他预定</span>
        </a-space>
      </template>

      <a-table
          :columns="bookingColumns"
          :data="roomBookings"
          :pagination="false"
          :scroll="{ y: 200 }"
      >
        <template #columns>
          <a-table-column title="会议主题" data-index="title" />
          <a-table-column title="预定人" data-index="userName" />
          <a-table-column title="开始时间" data-index="startTime" />
          <a-table-column title="结束时间" data-index="endTime" />
          <a-table-column title="状态" data-index="status">
            <template #cell="{ record }">
              <a-tag :color="getBookingStatusColor(record.status)">
                {{ getBookingStatusText(record.status) }}
              </a-tag>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue';
import { Message } from '@arco-design/web-vue';
import {
  IconHome,
  IconUser,
  IconTool,
  IconImage,
  IconCalendar,
  IconCheck,
  IconSearch,
  IconList
} from '@arco-design/web-vue/es/icon';
import { useRouter, useRoute } from 'vue-router';
import dayjs from 'dayjs';

import {
  UserRoomControllerService,
  UserBookingControllerService,
  UserUserControllerService
} from '/generated';
import type { RoomVO, BookingVO, UserVO } from '/generated';

const router = useRouter();
const route = useRoute();
const roomId = ref(Number(route.params.id));

const roomInfo = ref<RoomVO>();
const roomBookings = ref<BookingVO[]>([]);
const userList = ref<UserVO[]>([]);
const userLoading = ref(false);
const bookingLoading = ref(false);

// 冲突检查
const conflictMessage = ref('');
const conflictType = ref<'info' | 'warning' | 'error'>('info');

// 预定表单
const bookingForm = reactive({
  title: '',
  date: '',
  startTime: '',
  endTime: '',
  attendeeIds: [] as number[],
  remindBefore: 15,
  description: ''
});

// 其他预定表格列
const bookingColumns = [
  { title: '会议主题', dataIndex: 'title' },
  { title: '预定人', dataIndex: 'userName' },
  { title: '开始时间', dataIndex: 'startTime' },
  { title: '结束时间', dataIndex: 'endTime' },
  { title: '状态', slotName: 'status' }
];

// 获取状态颜色
const getStatusColor = (status: number) => {
  switch (status) {
    case 0: return 'green';
    case 1: return 'orange';
    case 2: return 'red';
    default: return 'blue';
  }
};

const getStatusText = (status: number) => {
  switch (status) {
    case 0: return '可用';
    case 1: return '维护中';
    case 2: return '占用';
    default: return '未知';
  }
};

const getBookingStatusColor = (status: number) => {
  switch (status) {
    case 0: return 'blue';
    case 1: return 'green';
    case 2: return 'gray';
    case 3: return 'orange';
    case 4: return 'red';
    default: return 'blue';
  }
};

const getBookingStatusText = (status: number) => {
  switch (status) {
    case 0: return '待签到';
    case 1: return '进行中';
    case 2: return '已完成';
    case 3: return '已取消';
    case 4: return '超时未签到';
    default: return '未知';
  }
};

// 加载会议室信息
const loadRoomInfo = async () => {
  try {
    const res = await UserRoomControllerService.getRoomVoByIdUsingGet1( roomId.value );
    if (res.code === 0 && res.data) {
      roomInfo.value = res.data;
    } else {
      Message.error('加载会议室信息失败');
    }
  } catch (error: any) {
    Message.error('加载失败: ' + error.message);
  }
};

// 加载该会议室的其他预定
const loadRoomBookings = async () => {
  try {
    console.log('UserBookingControllerService:', UserBookingControllerService);
    console.log('Available methods:', Object.keys(UserBookingControllerService));
    const res = await UserBookingControllerService.listBookingsByRoomIdUsingPost({
      roomId: roomId.value,
      date: dayjs().format('YYYY-MM-DD')
    });
    if (res.code === 0) {
      roomBookings.value = res.data || [];
    }
  } catch (error) {
    console.error('加载预定列表失败', error);
  }
};

// 加载用户列表
const loadUserList = async () => {
  userLoading.value = true;
  try {
    const res = await UserUserControllerService.listAllUsersUsingGet();
    if (res.code === 0) {
      userList.value = res.data || [];
    }
  } catch (error) {
    console.error('加载用户列表失败', error);
  } finally {
    userLoading.value = false;
  }
};

// 日期变化
const onDateChange = () => {
  bookingForm.startTime = '';
  bookingForm.endTime = '';
  conflictMessage.value = '';
};

// 时间变化时检查冲突
const onTimeChange = () => {
  if (bookingForm.startTime && bookingForm.endTime && bookingForm.date) {
    checkAvailability();
  }
};

// 检查占用
const checkAvailability = async () => {
  if (!bookingForm.date || !bookingForm.startTime || !bookingForm.endTime) {
    Message.warning('请先选择完整的时间');
    return;
  }

  const start = dayjs(`${bookingForm.date} ${bookingForm.startTime}`);
  const end = dayjs(`${bookingForm.date} ${bookingForm.endTime}`);

  if (start.isAfter(end) || start.isSame(end)) {
    conflictMessage.value = '开始时间必须小于结束时间';
    conflictType.value = 'error';
    return;
  }

  try {
    const res = await UserBookingControllerService.checkAvailabilityUsingPost({
      roomId: roomId.value,
      startTime: start.format('YYYY-MM-DD HH:mm:ss'),
      endTime: end.format('YYYY-MM-DD HH:mm:ss')
    });

    if (res.code === 0) {
      if (res.data) {
        conflictMessage.value = '该时间段已被占用，请选择其他时间';
        conflictType.value = 'error';
      } else {
        conflictMessage.value = '该时间段可预定';
        conflictType.value = 'success';
      }
    }
  } catch (error: any) {
    console.error('检查占用失败', error);
  }
};

// 提交预定
const handleBooking = async () => {
  if (!bookingForm.title) {
    Message.warning('请输入会议主题');
    return;
  }
  if (!bookingForm.date || !bookingForm.startTime || !bookingForm.endTime) {
    Message.warning('请选择完整的时间');
    return;
  }

  bookingLoading.value = true;
  try {
    const start = dayjs(`${bookingForm.date} ${bookingForm.startTime}`);
    const end = dayjs(`${bookingForm.date} ${bookingForm.endTime}`);

    const res = await UserBookingControllerService.addBookingUsingPost1({
      roomId: roomId.value,
      title: bookingForm.title,
      startTime: start.format('YYYY-MM-DD HH:mm:ss'),
      endTime: end.format('YYYY-MM-DD HH:mm:ss'),
      attendeeIds: bookingForm.attendeeIds,
      remindBefore: bookingForm.remindBefore,
      description: bookingForm.description
    });

    if (res.code === 0) {
      Message.success('预定成功');
      router.push('/my-bookings');
    } else {
      Message.error(res.message || '预定失败');
    }
  } catch (error: any) {
    Message.error('预定失败: ' + error.message);
  } finally {
    bookingLoading.value = false;
  }
};

// 禁用过去的日期
const disabledDate = (current: Date) => {
  return dayjs(current).isBefore(dayjs().startOf('day'));
};

// 禁用的小时 - 开始时间
const disabledStartHours = () => {
  const hours: number[] = [];
  const now = dayjs();
  const selectedDate = bookingForm.date;

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
  const now = dayjs();
  const selectedDate = bookingForm.date;

  for (let i = 0; i < 60; i++) {
    if (i !== 0 && i !== 30) {
      minutes.push(i);
    }
  }

  if (selectedDate === now.format('YYYY-MM-DD') && hour === now.hour()) {
    for (let i = 0; i <= now.minute(); i++) {
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
  const startHour = parseInt(bookingForm.startTime.split(':')[0]);

  for (let i = 0; i <= startHour; i++) {
    hours.push(i);
  }
  return hours;
};

// 禁用的分钟 - 结束时间
const disabledEndMinutes = (hour: number) => {
  const minutes: number[] = [];
  for (let i = 0; i < 60; i++) {
    if (i !== 0 && i !== 30) {
      minutes.push(i);
    }
  }

  if (bookingForm.startTime && hour === parseInt(bookingForm.startTime.split(':')[0])) {
    const startMinute = parseInt(bookingForm.startTime.split(':')[1]);
    for (let i = 0; i <= startMinute; i++) {
      if (!minutes.includes(i)) {
        minutes.push(i);
      }
    }
  }

  return minutes.sort();
};

onMounted(() => {
  loadRoomInfo();
  loadRoomBookings();
  loadUserList();
});
</script>

<style scoped lang="less">
#roomDetailView {
  padding: 20px;

  .info-card, .booking-card, .bookings-card {
    margin-bottom: 20px;
  }

  .room-desc {
    color: var(--color-text-2);
    line-height: 1.8;
  }

  .no-equipment {
    color: var(--color-text-3);
  }
}
</style>
