<template>
  <a-row class="Header" align="center" :wrap="false">
    <!-- 菜单栏 -->
    <a-col class="headerLeft" flex="auto">
      <a-menu
          mode="horizontal"
          :selectedKeys="selectedKeys"
          :default-selected-keys="['1']"
          @menu-item-click="doMenuClick"
          class="custom-menu"
      >
        <a-menu-item key="0" :style="{ padding: 0, marginRight: '38px' }" disabled>
          <div class="title-bar">
            <img class="logo" src="../../assets/X.svg" alt="logo"/>
            <div class="title">X-Meeting</div>
          </div>
        </a-menu-item>
        <a-menu-item
            class="menu-item"
            v-for="item in visibleRoutes"
            :key="item.path"
        >
          <template #icon v-if="item.meta?.icon">
            <component :is="item.meta.icon"/>
          </template>
          {{ item.name }}
        </a-menu-item>
      </a-menu>
    </a-col>
    <!-- 用户信息 -->
    <a-col class="headerRight">
      <!-- 未登录状态 -->
      <div v-if="store.state.user.loginUser.role === AccessEnum.NOT_LOGIN" class="auth-buttons">
        <a-button @click="toLogin" class="login-btn">
          登录
        </a-button>
        或
        <a-button @click="toRegister" class="register-btn">
          注册
        </a-button>

      </div>
      <!-- 已登录状态 -->
      <div v-else class="user-profile">
        <!-- 消息中心 -->
        <div class="message-center">
          <a-popover
              trigger="click"
              position="bottom"
              :popup-visible="messagePopoverVisible"
              @popup-visible-change="onMessageVisibleChange"
              :content-style="{ padding: 0, width: '360px', maxHeight: '420px' }"
          >
            <a-badge :count="unreadCount" :offset="[10, 0]" class="message-badge">
              <icon-notification class="message-icon" />
            </a-badge>
            <template #content>
              <div class="message-dropdown">
                <div class="message-header">
                  <span>消息通知</span>
                  <a-button type="text" size="small" @click="markAllAsRead" :disabled="messageList.length === 0">
                    全部已读
                  </a-button>
                </div>
                <div class="message-list" v-if="messageList.length > 0">
                  <div
                      v-for="msg in messageList"
                      :key="msg.id"
                      class="message-item"
                      :class="{ unread: msg.status === 0 }"
                      @click="onMessageClick(msg)"
                  >
                    <div class="message-title">{{ msg.title }}</div>
                    <div class="message-content">{{ msg.content }}</div>
                    <div class="message-time">{{ formatTime(msg.createTime) }}</div>
                  </div>
                </div>
                <div class="message-empty" v-else>
                  <a-empty description="暂无消息" />
                </div>
                <div class="message-footer" v-if="messageList.length > 0">
                  <a-link @click="goToMessages">查看更多</a-link>
                </div>
              </div>
            </template>
          </a-popover>
        </div>

        <!-- 待响应入口 -->
        <div class="pending-center">
          <a-badge :count="pendingCount" :offset="[-5, 5]" v-if="pendingCount > 0">
            <a-button type="text" @click="goToPendingMeetings" class="pending-btn">
              <icon-message />
            </a-button>
          </a-badge>
          <a-button type="text" @click="goToPendingMeetings" class="pending-btn" v-else>
            <icon-message />
          </a-button>
        </div>

        <UserCardPopover
            :user-avatar="avatar"
            :user-name="store.state.user.loginUser.userName"
            @to-user-profile="toUserProfile"
            @login-out="loginOut"
        >
          <a-avatar
              :size="40"
              :image-url="avatar"
              class="avatar-hover"
              :style="{ backgroundColor: '#14a9f8', cursor: 'pointer' }"
          >
            {{ store.state.user.loginUser.userName?.charAt(0) }}
          </a-avatar>
        </UserCardPopover>
      </div>
    </a-col>
  </a-row>
</template>

<script setup lang="ts">
import { routes } from '@/router/routes';
import { useRouter } from 'vue-router';
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useStore } from "vuex";
import checkAccess from "@/access/checkAccess";
import AccessEnum from "@/access/accessEnum";
import UserCardPopover from "@/components/BasicHeader/UserCardPopover.vue";
import { IconNotification, IconMessage } from '@arco-design/web-vue/es/icon';
import message from "@arco-design/web-vue/es/message";
import { UserMessageControllerService, UserAttendeeControllerService } from '/generated';

const selectedKeys = ref(["/"]);
const router = useRouter();
const store = useStore();
const avatar = ref("");
const unreadCount = ref(0);
const messageList = ref<any[]>([]);
const pendingCount = ref(0);
const messagePopoverVisible = ref(false);
let timer: number | null = null;

// 路由变化时更新菜单高亮
router.afterEach((to) => {
  console.log("跳转:", to.path);
  selectedKeys.value = [to.path];
});

const doMenuClick = (key: string) => {
  router.push({ path: key });
};

const toUserProfile = () => {
  router.push({ path: "/user/profile" });
};

// 计算可见路由
const visibleRoutes = computed(() => {
  return routes
      .filter((item) => {
        if (item?.meta?.hideInMenu) return false;
        return checkAccess(store.state.user.loginUser, item?.meta?.access);
      })
      .sort((a, b) => {
        const orderA = a.meta?.order || 0;
        const orderB = b.meta?.order || 0;
        return orderA - orderB;
      });
});

// ==================== 消息相关 ====================

// 加载未读消息数量
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

// 加载未读消息列表（只取前5条）
const loadUnreadMessages = async () => {
  try {
    // 获取未读消息列表
    const res = await UserMessageControllerService.getUnreadMessagesUsingGet();
    if (res.code === 0) {
      // 只显示前5条
      messageList.value = (res.data || []).slice(0, 5);
    }
  } catch (error) {
    console.error('加载消息失败', error);
  }
};

// 下拉框展开/收起时触发
const onMessageVisibleChange = async (visible: boolean) => {
  messagePopoverVisible.value = visible;
  if (visible) {
    // 打开时加载最新消息
    await loadUnreadMessages();
  }
};

// 点击消息
const onMessageClick = async (msg: any) => {
  if (msg.status === 0) {
    try {
      // 标记为已读
      const res = await UserMessageControllerService.markAsReadUsingPost(msg.id);
      if (res.code === 0) {
        unreadCount.value = Math.max(0, unreadCount.value - 1);
        msg.status = 1;
        // 更新列表中的状态
        const index = messageList.value.findIndex(m => m.id === msg.id);
        if (index !== -1) {
          messageList.value[index].status = 1;
        }
      }
    } catch (error) {
      console.error('标记已读失败', error);
    }
  }
  // 关闭弹窗
  messagePopoverVisible.value = false;
  // 跳转到会议详情
  if (msg.bookingId) {
    router.push(`/booking/${msg.bookingId}`);
  }
};

// 全部已读
const markAllAsRead = async () => {
  const unreadIds = messageList.value.filter(m => m.status === 0).map(m => m.id);
  if (unreadIds.length === 0) return;

  try {
    const res = await UserMessageControllerService.batchMarkAsReadUsingPost({ ids: unreadIds });
    if (res.code === 0) {
      messageList.value.forEach(m => {
        if (m.status === 0) {
          m.status = 1;
        }
      });
      unreadCount.value = 0;
      message.success('已全部标记为已读');
    } else {
      message.error(res.message || '操作失败');
    }
  } catch (error) {
    console.error('全部已读失败', error);
    message.error('操作失败');
  }
};

// 查看更多
const goToMessages = () => {
  messagePopoverVisible.value = false;
  router.push('/messages');
};

// ==================== 待响应相关 ====================

// 加载待响应数量
const loadPendingCount = async () => {
  try {
    const res = await UserAttendeeControllerService.getPendingMeetingsUsingGet();
    if (res.code === 0) {
      pendingCount.value = res.data?.length || 0;
    }
  } catch (error) {
    console.error('加载待响应数量失败', error);
  }
};

// 跳转到待响应页面
const goToPendingMeetings = () => {
  router.push('/pending-meetings');
};

// ==================== 工具函数 ====================

// 格式化时间
const formatTime = (time: string) => {
  if (!time) return '';
  const date = new Date(time);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < 60 * 1000) return '刚刚';
  if (diff < 60 * 60 * 1000) return `${Math.floor(diff / 60000)}分钟前`;
  if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / 3600000)}小时前`;
  return `${date.getMonth() + 1}-${date.getDate()}`;
};

// 定时轮询（每30秒）
const startPolling = () => {
  timer = window.setInterval(() => {
    if (store.state.user.loginUser.role !== AccessEnum.NOT_LOGIN) {
      loadUnreadCount();
      loadPendingCount();
    }
  }, 30000);
};

const fetchAvatar = async () => {
  // const res = await FileRecordControllerService.getAvatarUsingGet();
  // if (res.code !== 0) {
  //   message.error('头像获取失败: ' + res.message)
  //   return;
  // }
  // avatar.value = `data:image/png;base64,${res.data}`
};

function loginOut() {
  console.log("退出登录");
  localStorage.removeItem('token');
  store.state.user.loginUser = {
    userName: "",
    role: AccessEnum.NOT_LOGIN
  };
  router.push('/');
}

function toLogin() {
  router.push({ path: "/user/login" });
}

function toRegister() {
  router.push({ path: "/user/register" });
}

onMounted(() => {
  fetchAvatar();
  loadUnreadCount();
  loadPendingCount();
  startPolling();
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<style scoped lang="less">
.Header {
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 100;

  .headerLeft {
    margin-top: 16px;

    :deep(.arco-menu-horizontal .arco-menu-inner ) {
      padding: 6px 20px !important;
    }
  }

  .headerRight {
    flex: 0;
    display: flex;
    align-items: center;
    gap: 16px;
  }
}

.title-bar {
  display: flex;
  align-items: center;

  .logo {
    width: 32px;
    height: 32px;
    transition: all 0.3s;
  }

  .title {
    color: var(--color-text-1);
    margin-left: 8px;
    font-size: 20px;
    font-weight: 600;
    background: linear-gradient(90deg, #3498db, #2ecc71);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
}

.custom-menu {
  :deep(.arco-menu-overflow-wrap) {
    height: 64px;
  }

  :deep(.arco-menu-item) {
    font-size: 16px;
    font-weight: 500;
    margin: 0 8px;
    padding: 0 16px;
    border-radius: 6px;
    transition: all 0.2s;

    &:hover {
      background-color: var(--color-primary-light-1);
      color: var(--color-primary);
    }

    &.arco-menu-selected {
      color: var(--color-primary);
      font-weight: 600;
    }
  }
}

.auth-buttons {
  display: flex;
  gap: 12px;
  align-items: center;

  .login-btn, .register-btn {
    border: none;
  }
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 16px;
}

.message-center, .pending-center {
  position: relative;
}

.message-icon, .pending-btn {
  font-size: 22px;
  cursor: pointer;
  color: var(--color-text-2);
  transition: color 0.2s;

  &:hover {
    color: var(--color-primary);
  }
}

.pending-btn {
  background: transparent;
  border: none;
  padding: 4px 8px;
  font-size: 20px;
}

.message-badge {
  cursor: pointer;

  :deep(.arco-badge-count) {
    font-size: 11px;
    line-height: 16px;
    height: 16px;
    min-width: 16px;
    padding: 0 4px;
  }
}

.message-dropdown {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border-2);
  font-weight: 500;
}

.message-list {
  flex: 1;
  overflow-y: auto;
  max-height: 320px;
}

.message-item {
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border-2);
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background-color: var(--color-fill-2);
  }

  &.unread {
    background-color: var(--color-primary-light-1);
  }
}

.message-title {
  font-weight: 500;
  margin-bottom: 4px;
  font-size: 14px;
}

.message-content {
  font-size: 12px;
  color: var(--color-text-3);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.message-time {
  font-size: 11px;
  color: var(--color-text-4);
  margin-top: 6px;
}

.message-empty {
  padding: 24px;
  text-align: center;
}

.message-footer {
  padding: 8px 16px;
  text-align: center;
  border-top: 1px solid var(--color-border-2);
}

.avatar-hover {
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}
</style>
