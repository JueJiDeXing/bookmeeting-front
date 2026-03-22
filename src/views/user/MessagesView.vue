<template>
  <div id="messagesView">
    <a-card :bordered="false">
      <template #title>
        <a-space>
          <icon-notification />
          <span>消息中心</span>
          <a-badge :count="unreadCount" v-if="unreadCount > 0" />
        </a-space>
      </template>

      <template #extra>
        <a-button
            v-if="unreadCount > 0"
            type="text"
            @click="markAllAsRead"
        >
          全部已读
        </a-button>
      </template>

      <!-- 标签页 -->
      <a-tabs :active-key="activeTab" @change="onTabChange">
        <a-tab-pane key="all" title="全部消息" />
        <a-tab-pane key="unread" title="未读消息">
          <template #title>
            <a-space>
              <span>未读消息</span>
              <a-badge :count="unreadCount" v-if="unreadCount > 0" />
            </a-space>
          </template>
        </a-tab-pane>
      </a-tabs>

      <!-- 消息列表 -->
      <div class="message-list">
        <div
            v-for="msg in messageList"
            :key="msg.id"
            class="message-card"
            :class="{ unread: msg.status === 0 }"
            @click="onMessageClick(msg)"
        >
          <div class="message-card-left">
            <div class="message-icon">
              <icon-check-circle-fill v-if="msg.type === 0" class="remind-icon" />
              <icon-info-circle-fill v-else class="system-icon" />
            </div>
          </div>
          <div class="message-card-content">
            <div class="message-header">
              <span class="message-title">{{ msg.title }}</span>
              <span class="message-time">{{ formatTime(msg.createTime) }}</span>
            </div>
            <div class="message-content">{{ msg.content }}</div>
            <div class="message-footer" v-if="msg.bookingId">
              <a-link>查看会议详情 →</a-link>
            </div>
          </div>
          <div class="message-card-right" v-if="msg.status === 0">
            <a-tag color="blue" size="small">未读</a-tag>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="!loading && messageList.length === 0" class="empty-state">
          <a-empty description="暂无消息" />
        </div>

        <!-- 加载更多 -->
        <div v-if="hasMore" class="load-more">
          <a-button type="outline" @click="loadMore" :loading="loadingMore">
            加载更多
          </a-button>
        </div>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Message } from '@arco-design/web-vue';
import {
  IconNotification,
  IconCheckCircleFill,
  IconInfoCircleFill
} from '@arco-design/web-vue/es/icon';
import { useRouter } from 'vue-router';
import { UserMessageControllerService } from '/generated';

const router = useRouter();
const activeTab = ref('all');
const messageList = ref([]);
const unreadCount = ref(0);
const loading = ref(false);
const loadingMore = ref(false);
const currentPage = ref(1);
const hasMore = ref(true);
const pageSize = 20;

// 加载消息列表
const loadMessages = async (isLoadMore = false) => {
  if (loading.value || loadingMore.value) return;

  if (isLoadMore) {
    loadingMore.value = true;
  } else {
    loading.value = true;
    currentPage.value = 1;
    hasMore.value = true;
  }

  try {
    const res = await UserMessageControllerService.getMessagesUsingPost(
        currentPage.value,
        pageSize
    );

    if (res.code === 0 && res.data) {
      if (isLoadMore) {
        messageList.value = [...messageList.value, ...res.data];
      } else {
        messageList.value = res.data;
      }

      // 判断是否还有更多
      hasMore.value = res.data.length === pageSize;
    }
  } catch (error) {
    console.error('加载消息失败', error);
    Message.error('加载消息失败');
  } finally {
    loading.value = false;
    loadingMore.value = false;
  }
};

// 加载未读数量
const loadUnreadCount = async () => {
  try {
    const res = await UserMessageControllerService.getUnreadCountUsingGet();
    if (res.code === 0) {
      unreadCount.value = res.data || 0;
    }
  } catch (error) {
    console.error('加载未读数量失败', error);
  }
};

// 标签页切换
const onTabChange = (key: string) => {
  activeTab.value = key;
  if (key === 'unread') {
    loadUnreadMessages();
  } else {
    loadMessages();
  }
};

// 加载未读消息列表
const loadUnreadMessages = async () => {
  loading.value = true;
  try {
    const res = await UserMessageControllerService.getUnreadMessagesUsingGet();
    if (res.code === 0) {
      messageList.value = res.data || [];
    }
  } catch (error) {
    console.error('加载未读消息失败', error);
  } finally {
    loading.value = false;
  }
};

// 加载更多
const loadMore = () => {
  currentPage.value++;
  loadMessages(true);
};

// 点击消息
const onMessageClick = async (msg: any) => {
  // 标记为已读
  if (msg.status === 0) {
    try {
      await UserMessageControllerService.markAsReadUsingPost(msg.id);
      msg.status = 1;
      unreadCount.value--;
    } catch (error) {
      console.error('标记已读失败', error);
    }
  }

  // 跳转到会议详情
  if (msg.bookingId) {
    router.push(`/booking/${msg.bookingId}`);
  }
};

// 全部已读
const markAllAsRead = async () => {
  const ids = messageList.value.map(m => m.id);
  if (ids.length === 0) return;

  try {
    await UserMessageControllerService.batchMarkAsReadUsingPost({ ids });
    messageList.value.forEach(m => m.status = 1);
    unreadCount.value = 0;
    Message.success('已全部标记为已读');
  } catch (error) {
    Message.error('操作失败');
  }
};

// 格式化时间
const formatTime = (time: string) => {
  if (!time) return '';
  const date = new Date(time);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < 60 * 1000) return '刚刚';
  if (diff < 60 * 60 * 1000) return `${Math.floor(diff / 60000)}分钟前`;
  if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / 3600000)}小时前`;
  if (diff < 7 * 24 * 60 * 60 * 1000) return `${Math.floor(diff / (24 * 3600000))}天前`;
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
};

onMounted(() => {
  loadMessages();
  loadUnreadCount();
});
</script>

<style scoped lang="less">
#messagesView {
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
}

.message-list {
  margin-top: 16px;
}

.message-card {
  display: flex;
  padding: 16px;
  border-bottom: 1px solid var(--color-border-2);
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background-color: var(--color-fill-1);
  }

  &.unread {
    background-color: var(--color-primary-light-1);

    &:hover {
      background-color: var(--color-primary-light-2);
    }
  }
}

.message-card-left {
  flex-shrink: 0;
  margin-right: 16px;

  .message-icon {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;

    .remind-icon {
      font-size: 24px;
      color: rgb(var(--orange-6));
    }

    .system-icon {
      font-size: 24px;
      color: rgb(var(--blue-6));
    }
  }
}

.message-card-content {
  flex: 1;

  .message-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;

    .message-title {
      font-weight: 600;
      font-size: 15px;
    }

    .message-time {
      font-size: 12px;
      color: var(--color-text-3);
    }
  }

  .message-content {
    font-size: 14px;
    color: var(--color-text-2);
    line-height: 1.5;
    margin-bottom: 8px;
  }

  .message-footer {
    font-size: 12px;
  }
}

.message-card-right {
  flex-shrink: 0;
  margin-left: 12px;
}

.empty-state {
  padding: 60px 20px;
  text-align: center;
}

.load-more {
  text-align: center;
  padding: 20px;
}
</style>
