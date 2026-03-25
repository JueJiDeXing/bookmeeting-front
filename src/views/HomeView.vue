<template>
  <div id="homeView">

    <!-- 智能推荐卡片 -->
    <RecommendCard @select-room="onRecommendSelect" />

    <!-- 筛选卡片 -->
    <a-card class="filter-card">
      <a-row :gutter="18">
        <a-col :span="4">
          <a-input
              v-model="searchParams.roomName"
              placeholder="会议室名称"
              allow-clear
              @press-enter="onSearch"
          >
            <template #prefix>
              <icon-search />
            </template>
          </a-input>
        </a-col>
        <a-col :span="3">
          <a-select
              v-model="searchParams.building"
              placeholder="全部楼栋"
              allow-clear
              :loading="buildingLoading"
              @change="onBuildingChange"
          >
            <a-option v-for="item in buildingList" :key="item" :value="item">
              {{ item }}
            </a-option>
          </a-select>
        </a-col>
        <a-col :span="3">
          <a-select
              v-model="searchParams.floor"
              placeholder="全部楼层"
              allow-clear
              :disabled="!searchParams.building"
              @change="onSearch"
          >
            <a-option v-for="item in floorList" :key="item" :value="item">
              {{ item }} 楼
            </a-option>
          </a-select>
        </a-col>
        <a-col :span="3">
          <a-select
              v-model="searchParams.minCapacity"
              placeholder="容纳人数"
              allow-clear
              @change="onSearch"
          >
            <a-option :value="5">5人以上</a-option>
            <a-option :value="10">10人以上</a-option>
            <a-option :value="20">20人以上</a-option>
            <a-option :value="50">50人以上</a-option>
          </a-select>
        </a-col>
        <a-col :span="4">
          <a-select
              v-model="searchParams.categoryIds"
              placeholder="设备要求"
              allow-clear
              :loading="categoryLoading"
              @change="onSearch"
              multiple
              :max-tag-count="2"
          >
            <a-option v-for="item in categoryList" :key="item.id" :value="item.id">
              {{ item.categoryName }}
            </a-option>
          </a-select>
        </a-col>
        <a-col :span="3">
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

    <!-- 日期选择 + 刷新 -->
    <a-card class="date-card">
      <a-row :gutter="16" align="center">
        <a-col :span="3">
          <a-space>
            <icon-calendar />
            <span style="font-weight: 500">选择日期</span>
          </a-space>
        </a-col>
        <a-col :span="5">
          <a-date-picker
              v-model="selectedDate"
              :disabled-date="disabledDate"
              style="width: 100%"
              @change="onDateChange"
          />
        </a-col>
        <a-col :span="3">
          <a-button type="primary" @click="loadRoomList">
            <template #icon><icon-refresh /></template>
            刷新占用
          </a-button>
        </a-col>
        <a-col :span="13" class="legend">
          <a-space>
            <span><span class="legend-box available"></span> 可预定</span>
            <span><span class="legend-box booked"></span> 已占用</span>
            <span><span class="legend-box past"></span> 已过期</span>
            <span><span class="legend-box selected"></span> 当前选择</span>
          </a-space>
        </a-col>
      </a-row>
    </a-card>

    <!-- 会议室时间方格列表（滚动） -->
    <div class="room-grid-container">
      <!-- 表头：时间刻度 -->
      <div class="time-header">
        <div class="room-info-placeholder">会议室</div>
        <div class="time-slots">
          <div
              v-for="slot in timeSlots"
              :key="slot.hour + ':' + slot.minute"
              class="time-slot-label"
              :style="{ width: slotWidth + 'px' }"
          >
            {{ slot.label }}
          </div>
        </div>
      </div>

      <!-- 每个会议室一行 -->
      <div
          v-for="room in filteredRoomList"
          :key="room.id"
          class="room-row"
          :class="{ 'is-selecting': selectingRoomId === room.id }"
          :data-room-id="room.id"
      >
        <!-- 会议室信息 -->
        <div class="room-info">
          <a-space direction="vertical" size="mini">
            <a-link @click="goToRoomDetail(room.id)" strong>{{ room.roomName }}</a-link>
            <span class="room-location">
              <icon-location /> {{ room.locationDesc }}
            </span>
            <span class="room-capacity">
              <icon-user /> {{ room.capacity }}人
            </span>
            <a-space wrap class="room-equipment-tags">
              <a-tag
                  v-for="eq in room.equipmentList?.slice(0, 3)"
                  :key="eq.id"
                  size="small"
                  color="arcoblue"
              >
                {{ eq.equipmentName }}
              </a-tag>
              <span v-if="room.equipmentList?.length > 3" class="more-equipment">
                +{{ room.equipmentList.length - 3 }}
              </span>
            </a-space>
          </a-space>
        </div>

        <!-- 时间方格条（24个方格：8:00-20:00） -->
        <div
            class="time-slots"
            @mousedown="startSelection($event, room.id)"
            @mousemove="updateSelection($event, room.id)"
            @mouseup="endSelection(room.id)"
            @mouseleave="cancelSelection(room.id)"
            ref="slotContainers"
            :data-room-id="room.id"
        >
          <div
              v-for="(slot, index) in room.slots"
              :key="index"
              class="time-slot"
              :class="{
                'available': slot.status === 'available',
                'booked': slot.status === 'booked',
                'past': slot.status === 'past',
                'selected': slot.selected,
                'selectable': slot.status === 'available'
              }"
              :style="{ width: slotWidth + 'px' }"
              :data-index="index"
              :data-room-id="room.id"
              @click.stop="toggleSlot(room.id, index, $event)"
          >
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="filteredRoomList.length === 0 && !loading" class="empty-state">
        <a-empty description="暂无符合条件的会议室" />
      </div>
    </div>

    <!-- 底部操作栏 -->
    <a-affix :offset-bottom="0" v-if="hasSelection">
      <div class="bottom-bar">
        <a-space size="large">
          <a-alert type="info" show-icon style="margin-bottom: 0">
            已选择 <strong>{{ selectedCount }}</strong> 个时间段（{{ selectedDuration }}分钟）
          </a-alert>
          <a-space>
            <a-button type="primary" @click="showBookingModal" :loading="bookingLoading">
              <template #icon><icon-check /></template>
              立即预定 ({{ selectedCount }}段)
            </a-button>
            <a-button @click="clearSelection">取消选择</a-button>
          </a-space>
        </a-space>
      </div>
    </a-affix>

    <!-- 预定弹窗 -->
    <a-modal
        :visible="bookingModalVisible"
        title="填写预定信息"
        @ok="handleBooking"
        @cancel="bookingModalVisible = false"
        :ok-loading="bookingLoading"
        :width="600"
    >
      <a-form :model="bookingForm" :rules="bookingRules" ref="bookingFormRef" auto-label-width>
        <a-form-item label="会议室">
          <span>{{ currentRoom?.roomName }} ({{ currentRoom?.locationDesc }})</span>
        </a-form-item>
        <a-form-item label="日期">
          <span>{{ dayjs(selectedDate).format('YYYY-MM-DD') }}</span>
        </a-form-item>
        <a-form-item label="时间段">
          <span>{{ selectedTimeRange }}</span>
          <span class="text-muted" style="margin-left: 8px">(共 {{ selectedDuration }} 分钟)</span>
        </a-form-item>
        <a-form-item field="title" label="会议主题" required>
          <a-input v-model="bookingForm.title" placeholder="请输入会议主题" />
        </a-form-item>
        <a-form-item field="attendeeIds" label="参会人员">
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
        <a-form-item field="remindBefore" label="提前提醒">
          <a-select v-model="bookingForm.remindBefore" style="width: 100%">
            <a-option :value="0">不提醒</a-option>
            <a-option :value="15">提前15分钟</a-option>
            <a-option :value="30">提前30分钟</a-option>
            <a-option :value="60">提前1小时</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="description" label="会议描述">
          <a-textarea v-model="bookingForm.description" placeholder="请输入会议描述" :max-length="500" :auto-size="{ minRows: 2 }" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { Message } from '@arco-design/web-vue';
import {
  IconSearch,
  IconRefresh,
  IconUser,
  IconLocation,
  IconCalendar,
  IconCheck
} from '@arco-design/web-vue/es/icon';
import { useRouter } from 'vue-router';
import dayjs from 'dayjs';

import {
  UserRoomControllerService,
  UserBookingControllerService,
  UserUserControllerService,
  UserEquipmentCategoryControllerService
} from '/generated';
import type { RoomVO, UserVO, EquipmentCategory } from '/generated';
import RecommendCard from "@/components/RecommendCard.vue";

const router = useRouter();

// ==================== 基础数据 ====================
const roomList = ref<any[]>([]);
const filteredRoomList = ref<any[]>([]);
const loading = ref(false);
const userList = ref<UserVO[]>([]);
const userLoading = ref(false);
const selectedDate = ref(dayjs().format('YYYY-MM-DD'));

// 设备分类
const categoryList = ref<EquipmentCategory[]>([]);
const categoryLoading = ref(false);

// 楼栋和楼层
const buildingList = ref<string[]>([]);
const floorList = ref<number[]>([]);
const buildingLoading = ref(false);

// 时间配置
const START_HOUR = 8;
const END_HOUR = 20;
const TOTAL_SLOTS = (END_HOUR - START_HOUR) * 2;  // 24个格子（8:00-20:00）
const slotWidth = 40;

// 搜索参数
const searchParams = reactive({
  roomName: undefined as string | undefined,
  building: undefined as string | undefined,
  floor: undefined as number | undefined,
  minCapacity: undefined as number | undefined,
  categoryIds: [] as number[],
  current: 1,
  pageSize: 100
});

// 生成时间刻度标签（8:00 - 20:00）
const timeSlots = computed(() => {
  const slots = [];
  for (let hour = START_HOUR; hour < END_HOUR; hour++) {
    slots.push({ hour, minute: 0, label: `${hour.toString().padStart(2, '0')}:00` });
    slots.push({ hour, minute: 30, label: `${hour.toString().padStart(2, '0')}:30` });
  }
  // 最后一个时间点 20:00
  slots.push({ hour: 20, minute: 0, label: '20:00' });
  return slots;
});

// ==================== 选择状态 ====================
const selectingRoomId = ref<number | null>(null);
const selectStartIndex = ref<number>(-1);
const selectEndIndex = ref<number>(-1);
const isDragging = ref(false);

// ==================== 计算属性 ====================
const hasSelection = computed(() => {
  return filteredRoomList.value.some(room => room.slots?.some((s: any) => s.selected));
});

const selectedCount = computed(() => {
  let count = 0;
  filteredRoomList.value.forEach(room => {
    if (room.slots) {
      count += room.slots.filter((s: any) => s.selected).length;
    }
  });
  return count;
});

const selectedDuration = computed(() => selectedCount.value * 30);

const currentRoom = computed(() => {
  return filteredRoomList.value.find(room => room.slots?.some((s: any) => s.selected));
});

const selectedTimeRange = computed(() => {
  if (!currentRoom.value) return '';
  const slots = currentRoom.value.slots;
  const selectedIndices = slots
      .map((s: any, idx: number) => s.selected ? idx : -1)
      .filter((idx: number) => idx !== -1);

  if (selectedIndices.length === 0) return '';

  const first = selectedIndices[0];
  const last = selectedIndices[selectedIndices.length - 1];
  const startSlot = timeSlots.value[first];
  // 结束时间：如果是最后一个格子，结束时间为20:00；否则取下个格子
  let endSlot;
  if (last === TOTAL_SLOTS - 1) {
    endSlot = { hour: 20, minute: 0 };
  } else {
    endSlot = timeSlots.value[last + 1];
  }

  return `${startSlot.label} - ${endSlot.label}`;
});

// ==================== 筛选逻辑 ====================
const applyFilters = () => {
  filteredRoomList.value = roomList.value.filter(room => {
    if (searchParams.roomName && !room.roomName.toLowerCase().includes(searchParams.roomName.toLowerCase())) {
      return false;
    }
    if (searchParams.building && room.building !== searchParams.building) {
      return false;
    }
    if (searchParams.floor && room.floor !== searchParams.floor) {
      return false;
    }
    if (searchParams.minCapacity && room.capacity < searchParams.minCapacity) {
      return false;
    }
    if (searchParams.categoryIds.length > 0) {
      const roomCategoryIds = room.equipmentList?.map((eq: any) => eq.categoryId) || [];
      const hasAll = searchParams.categoryIds.every(cid => roomCategoryIds.includes(cid));
      if (!hasAll) return false;
    }
    return true;
  });
};

// ==================== 加载数据 ====================

const loadBuildings = async () => {
  buildingLoading.value = true;
  try {
    const res = await UserRoomControllerService.getAllBuildingsUsingGet();
    if (res.code === 0) {
      buildingList.value = res.data || [];
    }
  } catch (error) {
    console.error('加载楼栋列表失败', error);
  } finally {
    buildingLoading.value = false;
  }
};

const onBuildingChange = async (building: string) => {
  if (!building) {
    floorList.value = [];
    searchParams.floor = undefined;
    onSearch();
    return;
  }

  try {
    const res = await UserRoomControllerService.getFloorsByBuildingUsingGet(building);
    if (res.code === 0) {
      floorList.value = res.data || [];
    }
    searchParams.floor = undefined;
    onSearch();
  } catch (error) {
    console.error('加载楼层列表失败', error);
  }
};

const loadCategoryList = async () => {
  categoryLoading.value = true;
  try {
    const res = await UserEquipmentCategoryControllerService.listAllCategoriesUsingGet1();
    if (res.code === 0) {
      categoryList.value = res.data || [];
    }
  } catch (error) {
    console.error('加载设备分类失败', error);
  } finally {
    categoryLoading.value = false;
  }
};

const loadRoomList = async () => {
  loading.value = true;
  try {
    const roomRes = await UserRoomControllerService.listAvailableRoomsUsingPost({
      status: 0,
      pageSize: 100,
      current: 1
    });

    if (roomRes.code !== 0 || !roomRes.data) {
      Message.error('加载会议室失败');
      return;
    }

    const rooms = roomRes.data.records || [];

    // 获取当天8:00-20:00的预定记录
    const startOfDay = dayjs(selectedDate.value).hour(START_HOUR).minute(0).second(0).format('YYYY-MM-DD HH:mm:ss');
    const endOfDay = dayjs(selectedDate.value).hour(END_HOUR).minute(0).second(0).format('YYYY-MM-DD HH:mm:ss');

    const bookingRes = await UserBookingControllerService.listBookingsByDateUsingPost({
      startTime: startOfDay,
      endTime: endOfDay
    });

    const bookings = bookingRes.code === 0 ? bookingRes.data || [] : [];

    roomList.value = rooms.map((room: RoomVO) => {
      const slots = generateTimeSlots(room.id, bookings, selectedDate.value);
      return { ...room, slots };
    });

    applyFilters();

  } catch (error: any) {
    Message.error('加载失败: ' + error.message);
  } finally {
    loading.value = false;
  }
};

const generateTimeSlots = (roomId: number, bookings: any[], date: string) => {
  const slots = [];
  const now = dayjs();

  for (let i = 0; i < TOTAL_SLOTS; i++) {
    const hour = START_HOUR + Math.floor(i / 2);
    const minute = i % 2 === 0 ? 0 : 30;

    let slotTime;
    // 最后一个格子是20:00
    if (hour === END_HOUR) {
      slotTime = dayjs(date).hour(END_HOUR).minute(0).second(0);
    } else {
      slotTime = dayjs(date).hour(hour).minute(minute).second(0);
    }

    let status = 'available';

    // 判断是否已过去（只对今天的日期判断）
    if (date === now.format('YYYY-MM-DD') && slotTime.isBefore(now)) {
      status = 'past';
    }

    // 判断是否被预定
    if (status !== 'past') {
      const isBooked = bookings.some((booking: any) => {
        if (booking.roomId !== roomId) return false;
        const start = dayjs(booking.startTime);
        const end = dayjs(booking.endTime);
        return slotTime.isBetween(start, end, null, '[)');
      });
      if (isBooked) {
        status = 'booked';
      }
    }

    slots.push({
      time: slotTime,
      status,
      selected: false
    });
  }

  return slots;
};

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

// ==================== 搜索/重置 ====================

const onSearch = () => {
  applyFilters();
};

const onReset = () => {
  searchParams.roomName = undefined;
  searchParams.building = undefined;
  searchParams.floor = undefined;
  searchParams.minCapacity = undefined;
  searchParams.categoryIds = [];
  floorList.value = [];
  applyFilters();
};

const onDateChange = () => {
  loadRoomList();
  clearSelection();
};

const disabledDate = (current: Date) => {
  return dayjs(current).isBefore(dayjs().startOf('day'));
};

// ==================== 推荐卡片选择 ====================
const onRecommendSelect = (roomId: number) => {
  const room = filteredRoomList.value.find(r => r.id === roomId);
  if (room) {
    Message.info(`已定位到会议室: ${room.roomName}`);
    const roomElement = document.querySelector(`.room-row[data-room-id="${roomId}"]`);
    if (roomElement) {
      roomElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  } else {
    Message.info('该会议室可能被筛选条件过滤，已重置筛选');
    onReset();
    setTimeout(() => {
      const roomElement = document.querySelector(`.room-row[data-room-id="${roomId}"]`);
      if (roomElement) {
        roomElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }
};

// ==================== 方格选择逻辑 ====================

const startSelection = (e: MouseEvent, roomId: number) => {
  if (e.button !== 0) return;

  const target = e.target as HTMLElement;
  if (!target.classList.contains('time-slot')) return;

  const index = parseInt(target.dataset.index || '-1');
  if (index === -1) return;

  const room = filteredRoomList.value.find(r => r.id === roomId);
  if (!room || room.slots[index].status !== 'available') return;

  if (!e.ctrlKey) {
    clearSelection();
  }

  selectingRoomId.value = roomId;
  selectStartIndex.value = index;
  selectEndIndex.value = index;
  isDragging.value = true;

  updateSlotSelection(roomId, index, index);
};

const updateSelection = (e: MouseEvent, roomId: number) => {
  if (!isDragging.value || selectingRoomId.value !== roomId) return;

  const target = e.target as HTMLElement;
  if (!target.classList.contains('time-slot')) return;

  const index = parseInt(target.dataset.index || '-1');
  if (index === -1) return;

  selectEndIndex.value = index;

  const start = Math.min(selectStartIndex.value, index);
  const end = Math.max(selectStartIndex.value, index);

  updateSlotSelection(roomId, start, end);
};

const endSelection = (roomId: number) => {
  if (!isDragging.value) return;
  isDragging.value = false;
  selectingRoomId.value = null;
};

const cancelSelection = (roomId: number) => {
  if (selectingRoomId.value === roomId) {
    isDragging.value = false;
    selectingRoomId.value = null;
  }
};

const toggleSlot = (roomId: number, index: number, e: MouseEvent) => {
  const room = filteredRoomList.value.find(r => r.id === roomId);
  if (!room) return;

  const slot = room.slots[index];
  if (slot.status !== 'available') return;

  if (e.ctrlKey) {
    slot.selected = !slot.selected;
    checkSelectionContinuity(roomId);
  } else {
    clearSelection();
    slot.selected = true;
  }
};

const updateSlotSelection = (roomId: number, start: number, end: number) => {
  filteredRoomList.value.forEach(r => {
    if (r.id === roomId && r.slots) {
      r.slots.forEach((s: any) => { s.selected = false; });
    }
  });

  const room = filteredRoomList.value.find(r => r.id === roomId);
  if (!room) return;

  for (let i = start; i <= end; i++) {
    if (room.slots[i] && room.slots[i].status === 'available') {
      room.slots[i].selected = true;
    }
  }
};

const checkSelectionContinuity = (roomId: number) => {
  const room = filteredRoomList.value.find(r => r.id === roomId);
  if (!room) return true;

  const selectedIndices = room.slots
      .map((s: any, idx: number) => s.selected ? idx : -1)
      .filter((idx: number) => idx !== -1);

  if (selectedIndices.length <= 1) return true;

  for (let i = 1; i < selectedIndices.length; i++) {
    if (selectedIndices[i] !== selectedIndices[i-1] + 1) {
      Message.warning('只能选择连续的时间段，请重新选择');
      selectedIndices.forEach(idx => {
        room.slots[idx].selected = false;
      });
      return false;
    }
  }
  return true;
};

const clearSelection = () => {
  filteredRoomList.value.forEach(room => {
    if (room.slots) {
      room.slots.forEach((s: any) => { s.selected = false; });
    }
  });
  selectingRoomId.value = null;
  selectStartIndex.value = -1;
  selectEndIndex.value = -1;
};

// ==================== 预定逻辑 ====================

const bookingModalVisible = ref(false);
const bookingLoading = ref(false);
const bookingFormRef = ref();
const bookingForm = reactive({
  title: '',
  attendeeIds: [] as number[],
  remindBefore: 15,
  description: ''
});

const bookingRules = {
  title: [{ required: true, message: '会议主题不能为空' }]
};

const showBookingModal = () => {
  if (!currentRoom.value) {
    Message.warning('请先选择会议室和时间段');
    return;
  }

  if (!checkSelectionContinuity(currentRoom.value.id)) {
    return;
  }

  bookingModalVisible.value = true;
};

const handleBooking = async () => {
  const errors = await bookingFormRef.value?.validate();
  if (errors) return;

  if (!currentRoom.value) return;

  const slots = currentRoom.value.slots;
  const selectedIndices = slots
      .map((s: any, idx: number) => s.selected ? idx : -1)
      .filter((idx: number) => idx !== -1);

  if (selectedIndices.length === 0) return;

  const firstIdx = selectedIndices[0];
  const lastIdx = selectedIndices[selectedIndices.length - 1];

  const startSlot = timeSlots.value[firstIdx];
  let endSlot;
  if (lastIdx === TOTAL_SLOTS - 1) {
    endSlot = { hour: END_HOUR, minute: 0 };
  } else {
    endSlot = timeSlots.value[lastIdx + 1];
  }

  const startTime = dayjs(selectedDate.value)
      .hour(startSlot.hour)
      .minute(startSlot.minute)
      .second(0);

  let endTime;
  if (endSlot.hour === END_HOUR && endSlot.minute === 0) {
    endTime = dayjs(selectedDate.value).hour(END_HOUR).minute(0).second(0);
  } else {
    endTime = dayjs(selectedDate.value)
        .hour(endSlot.hour)
        .minute(endSlot.minute)
        .second(0);
  }

  bookingLoading.value = true;
  try {
    const res = await UserBookingControllerService.addBookingUsingPost1({
      roomId: currentRoom.value.id,
      title: bookingForm.title,
      startTime: startTime.format('YYYY-MM-DDTHH:mm:ss'),
      endTime: endTime.format('YYYY-MM-DDTHH:mm:ss'),
      attendeeIds: bookingForm.attendeeIds,
      remindBefore: bookingForm.remindBefore,
      description: bookingForm.description
    });

    if (res.code === 0) {
      Message.success('预定成功');
      bookingModalVisible.value = false;
      clearSelection();
      loadRoomList();
    } else {
      Message.error(res.message || '预定失败');
    }
  } catch (error: any) {
    Message.error('预定失败: ' + error.message);
  } finally {
    bookingLoading.value = false;
  }
};

// ==================== 其他函数 ====================

const goToRoomDetail = (roomId: number) => {
  router.push(`/room/${roomId}`);
};

// ==================== 生命周期 ====================

onMounted(() => {
  loadBuildings();
  loadCategoryList();
  loadRoomList();
  loadUserList();
});
</script>

<style scoped lang="less">
#homeView {
  padding: 20px;
  min-height: 100vh;

  .filter-card {
    margin-bottom: 16px;
  }

  .date-card {
    margin-bottom: 16px;

    .legend {
      display: flex;
      justify-content: flex-end;

      .legend-box {
        display: inline-block;
        width: 16px;
        height: 16px;
        border-radius: 4px;
        margin-right: 4px;
        vertical-align: middle;

        &.available {
          background-color: rgb(var(--green-2));
          border: 1px solid rgb(var(--green-6));
        }
        &.booked {
          background-color: rgb(var(--red-2));
          border: 1px solid rgb(var(--red-6));
        }
        &.past {
          background-color: rgb(var(--gray-2));
          border: 1px solid rgb(var(--gray-6));
        }
        &.selected {
          background-color: rgb(var(--primary-4));
          border: 2px solid rgb(var(--primary-6));
        }
      }
    }
  }

  .room-grid-container {
    height: calc(100vh - 380px);
    min-height: 400px;
    overflow-y: auto;
    border: 1px solid var(--color-border-2);
    border-radius: 4px;
    background-color: var(--color-bg-2);

    .time-header {
      display: flex;
      position: sticky;
      top: 0;
      background-color: var(--color-bg-2);
      z-index: 10;
      border-bottom: 2px solid var(--color-border-2);

      .room-info-placeholder {
        width: 160px;
        flex-shrink: 0;
        padding: 10px;
        font-weight: 600;
        border-right: 1px solid var(--color-border-2);
      }

      .time-slots {
        display: flex;
        overflow-x: auto;

        .time-slot-label {
          flex-shrink: 0;
          text-align: center;
          font-size: 11px;
          color: var(--color-text-3);
          padding: 4px 0;
          border-right: 1px solid var(--color-border-2);
        }
      }
    }

    .room-row {
      display: flex;
      border-bottom: 1px solid var(--color-border-2);
      transition: background-color 0.2s;

      &.is-selecting {
        background-color: var(--color-fill-2);
      }

      .room-info {
        width: 160px;
        flex-shrink: 0;
        padding: 5px 10px;
        border-right: 1px solid var(--color-border-2);
        background-color: var(--color-bg-2);

        .room-location, .room-capacity {
          font-size: 12px;
          color: var(--color-text-3);
        }

        .room-equipment-tags {
          margin-top: 4px;
        }

        .more-equipment {
          font-size: 11px;
          color: var(--color-text-3);
        }
      }

      .time-slots {
        display: flex;
        flex: 1;
        overflow-x: auto;
        user-select: none;

        .time-slot {
          flex-shrink: 0;
          height: 80px;
          border-right: 1px solid var(--color-border-2);
          border-bottom: 1px solid var(--color-border-2);
          cursor: pointer;
          transition: all 0.1s;

          &.available {
            background-color: rgb(var(--green-1));

            &:hover {
              background-color: rgb(var(--green-2));
              transform: scaleY(1.02);
            }
          }

          &.booked {
            background-color: rgb(var(--red-1));
            cursor: not-allowed;
            opacity: 0.7;
          }

          &.past {
            background-color: rgb(var(--gray-1));
            cursor: not-allowed;
            opacity: 0.5;
          }

          &.selected {
            background-color: rgb(var(--primary-3));
            border: 2px solid rgb(var(--primary-6));
            box-shadow: inset 0 0 0 1px white;
          }
        }
      }
    }

    .empty-state {
      padding: 40px;
      text-align: center;
    }
  }

  .bottom-bar {
    background-color: var(--color-bg-2);
    padding: 16px 24px;
    border-top: 1px solid var(--color-border-2);
    box-shadow: 0 -4px 10px rgba(0, 0, 0, 0.05);
    display: flex;
    justify-content: center;
  }

  .text-muted {
    color: var(--color-text-3);
    font-size: 12px;
  }
}
</style>
