<template>
  <div id="bookingDetailView">
    <!-- 返回按钮 -->
    <a-space class="back-btn">
      <a-button @click="router.back()">
        <template #icon><icon-left /></template>
        返回
      </a-button>
    </a-space>

    <!-- 加载状态 -->
    <a-skeleton v-if="loading" :loading="true" :animation="true">
      <a-space direction="vertical" size="large" fill>
        <a-skeleton-line :rows="3" />
        <a-skeleton-shape shape="rect" style="width: 100%; height: 200px" />
      </a-space>
    </a-skeleton>

    <!-- 主要内容 -->
    <template v-else>
      <!-- 标题区域 -->
      <a-card class="header-card" :bordered="false">
        <div class="header-content">
          <div class="title-section">
            <a-typography-title :heading="4">{{ bookingDetail?.title }}</a-typography-title>
            <a-tag :color="getStatusColor(bookingDetail?.status)" size="large">
              {{ getStatusText(bookingDetail?.status) }}
            </a-tag>
          </div>
          <div class="action-section">
            <a-space>
              <a-button
                  v-if="bookingDetail?.status === 0 && isCurrentUserBooker"
                  type="primary"
                  status="danger"
                  @click="onCancel"
              >
                <template #icon><icon-close /></template>
                取消预定
              </a-button>
              <a-button
                  v-if="bookingDetail?.status === 0 && isCurrentUserAttendee && myAttendeeStatus === 0"
                  type="primary"
                  status="success"
                  @click="onConfirmAttendee"
              >
                <template #icon><icon-check /></template>
                确认参会
              </a-button>
              <a-button
                  v-if="bookingDetail?.status === 0 && isCurrentUserAttendee && myAttendeeStatus === 0"
                  status="danger"
                  @click="onRejectAttendee"
              >
                <template #icon><icon-close /></template>
                拒绝参会
              </a-button>
              <a-button
                  v-if="bookingDetail?.status === 1 && isCurrentUserBooker"
                  type="primary"
                  @click="onComplete"
              >
                <template #icon><icon-check-circle /></template>
                结束会议
              </a-button>
              <a-button
                  v-if="bookingDetail?.status === 0 && isCurrentUserBooker"
                  type="primary"
                  @click="onSignIn"
              >
                <template #icon><icon-check /></template>
                签到
              </a-button>
            </a-space>
          </div>
        </div>
      </a-card>

      <!-- 基本信息 -->
      <a-row :gutter="16">
        <a-col :span="16">
          <a-card title="会议信息" :bordered="false">
            <a-descriptions :column="2" bordered>
              <a-descriptions-item label="会议主题" :span="2">
                {{ bookingDetail?.title }}
              </a-descriptions-item>
              <a-descriptions-item label="会议室">
                <a-link @click="goToRoomDetail(bookingDetail?.roomId)">
                  {{ bookingDetail?.roomName }}
                </a-link>
                <div class="text-muted">{{ bookingDetail?.roomLocation }}</div>
              </a-descriptions-item>
              <a-descriptions-item label="容纳人数">
                {{ bookingDetail?.roomCapacity }}人
              </a-descriptions-item>
              <a-descriptions-item label="预定时间" :span="2">
                {{ formatDateTime(bookingDetail?.startTime) }} - {{ formatDateTime(bookingDetail?.endTime) }}
                <span class="text-muted">(时长: {{ bookingDetail?.durationMinutes }}分钟)</span>
              </a-descriptions-item>
              <a-descriptions-item label="预定人">
                {{ bookingDetail?.userName }} ({{ bookingDetail?.userAccount }})
              </a-descriptions-item>
              <a-descriptions-item label="提前提醒">
                {{ bookingDetail?.remindBefore || 15 }}分钟
              </a-descriptions-item>
              <a-descriptions-item label="创建时间" :span="2">
                {{ formatDateTime(bookingDetail?.createTime) }}
              </a-descriptions-item>
              <a-descriptions-item label="会议描述" :span="2">
                {{ bookingDetail?.description || '无' }}
              </a-descriptions-item>
            </a-descriptions>

            <!-- 实际时间（如果已签到/结束） -->
            <a-collapse v-if="bookingDetail?.actualStart || bookingDetail?.actualEnd" style="margin-top: 16px">
              <a-collapse-item header="实际时间记录" :key="1">
                <a-descriptions :column="2">
                  <a-descriptions-item label="实际签到时间">
                    {{ formatDateTime(bookingDetail?.actualStart) || '-' }}
                  </a-descriptions-item>
                  <a-descriptions-item label="实际结束时间">
                    {{ formatDateTime(bookingDetail?.actualEnd) || '-' }}
                  </a-descriptions-item>
                </a-descriptions>
              </a-collapse-item>
            </a-collapse>
          </a-card>
        </a-col>

        <!-- 参会人员 -->
        <a-col :span="8">
          <a-card title="参会人员" :bordered="false">
            <template #extra>
              <a-badge :count="bookingDetail?.attendeeCount || 0" />
            </template>

            <a-list>
              <a-list-item v-for="attendee in bookingDetail?.attendeeList" :key="attendee.userId">
                <a-list-item-meta>
                  <template #title>
                    <a-space>
                      <span>{{ attendee.userName }}</span>
                      <span class="text-muted">({{ attendee.userAccount }})</span>
                      <a-tag v-if="attendee.userId === currentUserId" size="small" color="arcoblue">我</a-tag>
                    </a-space>
                  </template>
                  <template #description>
                    <a-space direction="vertical" size="mini">
                      <span>{{ attendee.email }}</span>
                      <span>{{ attendee.phone }}</span>
                    </a-space>
                  </template>
                </a-list-item-meta>
                <template #actions>
                  <!-- 如果是当前登录用户且状态为待确认 -->
                  <template v-if="attendee.userId === currentUserId && attendee.status === 0 && bookingDetail?.status === 0">
                    <a-space>
                      <a-button type="text" size="small" status="success" @click="onConfirmAttendee">
                        <icon-check /> 确认
                      </a-button>
                      <a-button type="text" size="small" status="danger" @click="onRejectAttendee">
                        <icon-close /> 拒绝
                      </a-button>
                    </a-space>
                  </template>
                  <a-tag v-else-if="attendee.status === 1" color="green">已确认</a-tag>
                  <a-tag v-else-if="attendee.status === 2" color="red">已拒绝</a-tag>
                  <a-tag v-else-if="attendee.status === 0" color="orange">待确认</a-tag>
                </template>
              </a-list-item>

              <a-list-item v-if="!bookingDetail?.attendeeList?.length">
                <a-empty description="暂无参会人员" />
              </a-list-item>
            </a-list>

            <!-- 参会统计 -->
            <a-divider style="margin: 16px 0" />
            <a-space direction="vertical" fill>
              <a-progress
                  :percent="getAttendeeStats().confirmedRate"
                  :color="{ '0%': 'rgb(var(--green-6))', '100%': 'rgb(var(--green-6))' }"
              >
                <span>已确认: {{ getAttendeeStats().confirmed }}人</span>
              </a-progress>
              <a-progress
                  :percent="getAttendeeStats().pendingRate"
                  :color="{ '0%': 'rgb(var(--orange-6))', '100%': 'rgb(var(--orange-6))' }"
              >
                <span>待确认: {{ getAttendeeStats().pending }}人</span>
              </a-progress>
            </a-space>
          </a-card>
        </a-col>
      </a-row>
    </template>

    <!-- 取消预定确认弹窗 -->
    <a-modal
        :visible="cancelModalVisible"
        title="取消预定"
        @ok="handleCancelOk"
        @cancel="cancelModalVisible = false"
        :ok-loading="cancelLoading"
    >
      <a-alert type="warning" show-icon>
        确定要取消会议 "{{ bookingDetail?.title }}" 吗？取消后不可恢复。
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
import { ref, onMounted, computed } from 'vue';
import { Message, Modal } from '@arco-design/web-vue';
import {
  IconLeft,
  IconCheck,
  IconClose,
  IconCheckCircle,
  IconEye
} from '@arco-design/web-vue/es/icon';
import { useRouter, useRoute } from 'vue-router';
import dayjs from 'dayjs';

import {
  UserBookingControllerService,
  UserAttendeeControllerService
} from '/generated';
import type { BookingVO, AttendeeVO } from '/generated';
import { useStore } from 'vuex';

const router = useRouter();
const route = useRoute();
const store = useStore();
const bookingId = computed(() => parseInt(route.params.id as string));

const loading = ref(false);
const bookingDetail = ref<BookingVO>();
const currentUserId = ref<number>();

const cancelModalVisible = ref(false);
const cancelLoading = ref(false);

// 拒绝相关
const rejectModalVisible = ref(false);
const rejectLoading = ref(false);
const rejectRemark = ref('');

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

// 判断当前用户是否是预定人
const isCurrentUserBooker = computed(() => {
  return bookingDetail.value?.userId === currentUserId.value;
});

// 判断当前用户是否是参会人员
const isCurrentUserAttendee = computed(() => {
  return bookingDetail.value?.attendeeList?.some(a => a.userId === currentUserId.value);
});

// 获取当前用户的参会状态
const myAttendeeStatus = computed(() => {
  const attendee = bookingDetail.value?.attendeeList?.find(a => a.userId === currentUserId.value);
  return attendee?.status;
});

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

// 获取参会人员状态颜色
const getAttendeeStatusColor = (status: number) => {
  switch (status) {
    case 0: return 'orange';
    case 1: return 'green';
    case 2: return 'red';
    default: return 'gray';
  }
};

// 获取参会人员状态文本
const getAttendeeStatusText = (status: number) => {
  switch (status) {
    case 0: return '待确认';
    case 1: return '已确认';
    case 2: return '已拒绝';
    default: return '未知';
  }
};

// 格式化日期时间
const formatDateTime = (date: string) => {
  if (!date) return '-';
  return dayjs(date).format('YYYY-MM-DD HH:mm');
};

// 参会统计
const getAttendeeStats = () => {
  const list = bookingDetail.value?.attendeeList || [];
  const total = list.length;
  const confirmed = list.filter(a => a.status === 1).length;
  const pending = list.filter(a => a.status === 0).length;

  return {
    total,
    confirmed,
    pending,
    confirmedRate: total ? (confirmed / total) * 100 : 0,
    pendingRate: total ? (pending / total) * 100 : 0
  };
};

// 加载预定详情
const loadBookingDetail = async () => {
  if (!bookingId.value) return;

  loading.value = true;
  try {
    const res = await UserBookingControllerService.getBookingVoByIdUsingGet1(bookingId.value);

    if (res.code === 0 && res.data) {
      bookingDetail.value = res.data;
    } else {
      Message.error('加载失败: ' + (res.message || '未知错误'));
      router.back();
    }
  } catch (error: any) {
    Message.error('加载失败: ' + error.message);
    router.back();
  } finally {
    loading.value = false;
  }
};

// 跳转到会议室详情
const goToRoomDetail = (roomId: number) => {
  if (roomId) {
    router.push(`/room/${roomId}`);
  }
};

// 签到
const onSignIn = () => {
  Modal.info({
    title: '确认签到',
    content: `确定要签到会议 "${bookingDetail.value?.title}" 吗？`,
    onOk: async () => {
      try {
        const res = await UserBookingControllerService.signInUsingPost1({
          id: bookingId.value
        });

        if (res.code === 0) {
          Message.success('签到成功');
          loadBookingDetail();
        } else {
          Message.error(res.message || '签到失败');
        }
      } catch (error: any) {
        Message.error('签到失败: ' + error.message);
      }
    }
  });
};

// 取消预定
const onCancel = () => {
  cancelModalVisible.value = true;
};

const handleCancelOk = async () => {
  cancelLoading.value = true;
  try {
    const res = await UserBookingControllerService.cancelBookingUsingPost1({
      id: bookingId.value
    });

    if (res.code === 0) {
      Message.success('取消成功');
      cancelModalVisible.value = false;
      loadBookingDetail();
    } else {
      Message.error(res.message || '取消失败');
    }
  } catch (error: any) {
    Message.error('取消失败: ' + error.message);
  } finally {
    cancelLoading.value = false;
  }
};

// 结束会议
const onComplete = () => {
  Modal.info({
    title: '确认结束',
    content: `确定要结束会议 "${bookingDetail.value?.title}" 吗？`,
    onOk: async () => {
      try {
        const res = await UserBookingControllerService.completeBookingUsingPost1({
          id: bookingId.value
        });

        if (res.code === 0) {
          Message.success('会议已结束');
          loadBookingDetail();
        } else {
          Message.error(res.message || '操作失败');
        }
      } catch (error: any) {
        Message.error('操作失败: ' + error.message);
      }
    }
  });
};

// 确认参会
const onConfirmAttendee = async () => {
  Modal.info({
    title: '确认参会',
    content: `确定要确认参加 "${bookingDetail.value?.title}" 吗？`,
    onOk: async () => {
      try {
        const res = await UserAttendeeControllerService.confirmMeetingUsingPost({
          bookingId: bookingId.value
        });
        if (res.code === 0) {
          Message.success('已确认参会');
          loadBookingDetail();
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
const onRejectAttendee = () => {
  rejectRemark.value = '';
  rejectModalVisible.value = true;
};

// 确认拒绝
const handleRejectOk = async () => {
  rejectLoading.value = true;
  try {
    const res = await UserAttendeeControllerService.rejectMeetingUsingPost({
      bookingId: bookingId.value,
      remark: rejectRemark.value
    });
    if (res.code === 0) {
      Message.success('已拒绝参会');
      rejectModalVisible.value = false;
      loadBookingDetail();
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
  loadBookingDetail();
});
</script>

<style scoped lang="less">
#bookingDetailView {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;

  .back-btn {
    margin-bottom: 16px;
    display: block;
  }

  .header-card {
    margin-bottom: 16px;

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .title-section {
        display: flex;
        align-items: center;
        gap: 12px;
      }
    }
  }

  .text-muted {
    color: var(--color-text-3);
    font-size: 12px;
  }

  :deep(.arco-card) {
    margin-bottom: 16px;
  }

  :deep(.arco-descriptions-item-label) {
    width: 100px;
    background-color: var(--color-fill-2);
  }

  :deep(.arco-list) {
    max-height: 400px;
    overflow-y: auto;
  }
}
</style>
