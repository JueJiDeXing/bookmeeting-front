<template>
  <div id="pendingMeetingsView">
    <a-card :bordered="false">
      <template #title>
        <a-space>
          <icon-message />
          <span>待响应会议</span>
          <a-badge :count="pendingCount" v-if="pendingCount > 0" />
        </a-space>
      </template>
      <template #extra>
        <a-tabs :active-key="activeTab" @change="onTabChange">
          <a-tab-pane key="pending" title="待响应">
            <template #title>
              <a-space>
                <span>待响应</span>
                <a-badge :count="pendingCount" v-if="pendingCount > 0" />
              </a-space>
            </template>
          </a-tab-pane>
          <a-tab-pane key="responded" title="已响应" />
        </a-tabs>
      </template>

      <!-- 待响应列表 -->
      <div class="meeting-list" v-if="activeTab === 'pending'">
        <div
            v-for="meeting in pendingList"
            :key="meeting.bookingId"
            class="meeting-card"
        >
          <div class="meeting-card-header">
            <span class="meeting-title">{{ meeting.bookingTitle }}</span>
            <a-tag :color="getStatusColor(meeting.status)">
              {{ getStatusText(meeting.status) }}
            </a-tag>
          </div>
          <div class="meeting-info">
            <div class="info-item">
              <icon-calendar />
              <span>{{ formatDateTime(meeting.bookingStartTime) }} - {{ formatDateTime(meeting.bookingEndTime) }}</span>
            </div>
            <div class="info-item">
              <icon-location />
              <span>会议室 ID: {{ meeting.roomId }}</span>
            </div>
          </div>
          <div class="meeting-actions">
            <a-space>
              <a-button type="primary" @click="onConfirm(meeting)">
                <template #icon><icon-check /></template>
                确认参会
              </a-button>
              <a-button status="danger" @click="onReject(meeting)">
                <template #icon><icon-close /></template>
                拒绝参会
              </a-button>
              <a-button @click="goToDetail(meeting.bookingId)">
                <template #icon><icon-eye /></template>
                查看详情
              </a-button>
            </a-space>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="!loading && pendingList.length === 0" class="empty-state">
          <a-empty description="暂无待响应的会议邀请" />
        </div>
      </div>

      <!-- 已响应列表 -->
      <div class="meeting-list" v-else>
        <div
            v-for="meeting in respondedList"
            :key="meeting.bookingId"
            class="meeting-card"
            :class="{ rejected: meeting.status === 2 }"
        >
          <div class="meeting-card-header">
            <span class="meeting-title">{{ meeting.bookingTitle }}</span>
            <a-tag :color="getStatusColor(meeting.status)">
              {{ getStatusText(meeting.status) }}
            </a-tag>
          </div>
          <div class="meeting-info">
            <div class="info-item">
              <icon-calendar />
              <span>{{ formatDateTime(meeting.bookingStartTime) }} - {{ formatDateTime(meeting.bookingEndTime) }}</span>
            </div>
            <div class="info-item">
              <icon-location />
              <span>会议室 ID: {{ meeting.roomId }}</span>
            </div>
            <div class="info-item" v-if="meeting.remark">
              <icon-info-circle />
              <span>备注：{{ meeting.remark }}</span>
            </div>
          </div>
          <div class="meeting-actions">
            <a-button @click="goToDetail(meeting.bookingId)">
              <template #icon><icon-eye /></template>
              查看详情
            </a-button>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="!loading && respondedList.length === 0" class="empty-state">
          <a-empty description="暂无已响应的会议" />
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <a-spin />
      </div>
    </a-card>

    <!-- 拒绝原因弹窗 -->
    <a-modal
        :visible="rejectModalVisible"
        title="拒绝参会"
        @ok="handleRejectConfirm"
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
import { ref, onMounted } from 'vue';
import { Message, Modal } from '@arco-design/web-vue';
import {
  IconMessage,
  IconCalendar,
  IconLocation,
  IconCheck,
  IconClose,
  IconEye,
  IconInfoCircle
} from '@arco-design/web-vue/es/icon';
import { useRouter } from 'vue-router';
import { UserAttendeeControllerService } from '/generated';
import dayjs from 'dayjs';

const router = useRouter();
const loading = ref(false);
const activeTab = ref('pending');
const pendingList = ref([]);
const respondedList = ref([]);
const pendingCount = ref(0);

// 拒绝弹窗
const rejectModalVisible = ref(false);
const rejectLoading = ref(false);
const currentMeeting = ref(null);
const rejectRemark = ref('');

// 格式化日期时间
const formatDateTime = (date: string) => {
  if (!date) return '-';
  return dayjs(date).format('YYYY-MM-DD HH:mm');
};

// 获取状态颜色
const getStatusColor = (status: number) => {
  switch (status) {
    case 0: return 'orange';
    case 1: return 'green';
    case 2: return 'red';
    default: return 'gray';
  }
};

// 获取状态文本
const getStatusText = (status: number) => {
  switch (status) {
    case 0: return '待确认';
    case 1: return '已确认';
    case 2: return '已拒绝';
    default: return '未知';
  }
};

// 加载待响应列表
const loadPendingList = async () => {
  try {
    const res = await UserAttendeeControllerService.getPendingMeetingsUsingGet();
    if (res.code === 0) {
      pendingList.value = res.data || [];
      pendingCount.value = pendingList.value.length;
    }
  } catch (error) {
    console.error('加载待响应列表失败', error);
    Message.error('加载待响应列表失败');
  }
};

// 加载已响应列表
const loadRespondedList = async () => {
  try {
    const res = await UserAttendeeControllerService.getRespondedMeetingsUsingGet();
    if (res.code === 0) {
      respondedList.value = res.data || [];
    }
  } catch (error) {
    console.error('加载已响应列表失败', error);
    Message.error('加载已响应列表失败');
  }
};

// 标签页切换
const onTabChange = (key: string) => {
  activeTab.value = key;
  if (key === 'pending') {
    loadPendingList();
  } else {
    loadRespondedList();
  }
};

// 确认参会
const onConfirm = (meeting: any) => {
  Modal.info({
    title: '确认参会',
    content: `确定要确认参加 "${meeting.bookingTitle}" 吗？`,
    onOk: async () => {
      try {
        const res = await UserAttendeeControllerService.confirmMeetingUsingPost({
          bookingId: meeting.bookingId
        });
        if (res.code === 0) {
          Message.success('已确认参会');
          loadPendingList();
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
const onReject = (meeting: any) => {
  currentMeeting.value = meeting;
  rejectRemark.value = '';
  rejectModalVisible.value = true;
};

// 确认拒绝
const handleRejectConfirm = async () => {
  if (!currentMeeting.value) return;

  rejectLoading.value = true;
  try {
    const res = await UserAttendeeControllerService.rejectMeetingUsingPost({
      bookingId: currentMeeting.value.bookingId,
      remark: rejectRemark.value
    });
    if (res.code === 0) {
      Message.success('已拒绝参会');
      rejectModalVisible.value = false;
      loadPendingList();
    } else {
      Message.error(res.message || '操作失败');
    }
  } catch (error: any) {
    Message.error('操作失败: ' + error.message);
  } finally {
    rejectLoading.value = false;
  }
};

// 跳转到会议详情
const goToDetail = (bookingId: number) => {
  router.push(`/booking/${bookingId}`);
};

onMounted(() => {
  loadPendingList();
  loadRespondedList();
});
</script>

<style scoped lang="less">
#pendingMeetingsView {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.meeting-list {
  margin-top: 16px;
}

.meeting-card {
  padding: 16px;
  margin-bottom: 16px;
  border: 1px solid var(--color-border-2);
  border-radius: 8px;
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  &.rejected {
    background-color: var(--color-fill-1);
    opacity: 0.8;
  }

  .meeting-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    .meeting-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--color-text-1);
    }
  }

  .meeting-info {
    margin-bottom: 16px;

    .info-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: var(--color-text-2);
      margin-bottom: 8px;

      .arco-icon {
        font-size: 14px;
        color: var(--color-text-3);
      }
    }
  }

  .meeting-actions {
    display: flex;
    justify-content: flex-end;
  }
}

.empty-state {
  padding: 60px 20px;
  text-align: center;
}

.loading-state {
  padding: 40px;
  text-align: center;
}
</style>
