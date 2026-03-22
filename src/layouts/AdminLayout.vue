<template>
  <div id="adminLayout">
    <a-layout class="layout-demo">
      <a-layout-sider collapsible breakpoint="xl">
        <!-- 侧边栏内容 -->
        <div class="title-bar">
          <img class="logo" src="@/assets/X.svg" alt="logo"/>
          <div class="title">X-Meeting</div>
        </div>

        <!-- 菜单 - 使用 v-model 双向绑定 -->
        <a-menu
            v-model:selected-keys="selectedKeys"
            v-model:open-keys="openKeys"
            @menu-item-click="onClickMenuItem"
            :style="{ width: '100%' }"
        >
          <!-- 用户管理子菜单 -->
          <a-sub-menu key="user">
            <template #icon><IconUser /></template>
            <template #title>用户管理</template>
            <a-menu-item key="/admin/user">用户列表</a-menu-item>
            <a-menu-item key="/admin/user/add">新增用户</a-menu-item>
          </a-sub-menu>

          <!-- 会议室管理子菜单 -->
          <a-sub-menu key="room">
            <template #icon><IconHome /></template>
            <template #title>会议室管理</template>
            <a-menu-item key="/admin/room">会议室列表</a-menu-item>
            <a-menu-item key="/admin/room/add">新增会议室</a-menu-item>
          </a-sub-menu>

          <!-- 设备管理子菜单 -->
          <a-sub-menu key="equipment">
            <template #icon><IconTool /></template>
            <template #title>设备管理</template>
            <a-menu-item key="/admin/equipment">设备列表</a-menu-item>
            <a-menu-item key="/admin/equipment/category">设备分类</a-menu-item>
            <a-menu-item key="/admin/equipment/log">设备操作日志</a-menu-item>
          </a-sub-menu>

          <!-- 预定管理子菜单 -->
          <a-sub-menu key="booking">
            <template #icon><IconCalendar /></template>
            <template #title>预定管理</template>
            <a-menu-item key="/admin/booking">预定记录</a-menu-item>
            <a-menu-item key="/admin/booking/statistics">使用统计</a-menu-item>
          </a-sub-menu>
        </a-menu>

        <!-- trigger -->
        <template #trigger="{ collapsed }">
          <IconCaretRight v-if="collapsed" />
          <IconCaretLeft v-else />
        </template>
      </a-layout-sider>

      <a-layout>
        <a-layout-header style="padding-left: 20px; display: flex; justify-content: space-between; align-items: center;">
          <div>欢迎使用会议室预定系统</div>
          <a-space>
            <a-avatar :size="32">
              <img src="@/assets/default-avatar.png" alt="avatar" />
            </a-avatar>
            <a-dropdown @select="handleUserMenu">
              <a-button type="text">
                {{ userInfo?.userName || '管理员' }}
                <icon-down />
              </a-button>
              <template #content>
                <a-doption value="profile">
                  <icon-user /> 个人信息
                </a-doption>
                <a-doption value="password">
                  <icon-lock /> 修改密码
                </a-doption>
                <a-doption value="logout">
                  <icon-export /> 退出登录
                </a-doption>
              </template>
            </a-dropdown>
          </a-space>
        </a-layout-header>

        <a-layout>
          <a-layout-content class="layout-content">
            <router-view/>
          </a-layout-content>
        </a-layout>
      </a-layout>
    </a-layout>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Message } from '@arco-design/web-vue';
import { useStore } from 'vuex';
import {
  IconUser,
  IconHome,
  IconTool,
  IconCalendar,
  IconCaretRight,
  IconCaretLeft,
  IconDown
} from '@arco-design/web-vue/es/icon';

const router = useRouter();
const route = useRoute();
const store = useStore();

// 选中的菜单项
const selectedKeys = ref<string[]>([]);

// 展开的子菜单
const openKeys = ref<string[]>([]);

// 用户信息
const userInfo = computed(() => store.state.user?.loginUser);

// 根据路由更新选中状态和展开状态
const updateMenuByRoute = (path: string) => {
  // 更新选中项
  selectedKeys.value = [path];

  // 更新展开项
  if (path.startsWith('/admin/user')) {
    if (!openKeys.value.includes('user')) {
      openKeys.value = ['user'];
    }
  } else if (path.startsWith('/admin/room')) {
    if (!openKeys.value.includes('room')) {
      openKeys.value = ['room'];
    }
  } else if (path.startsWith('/admin/equipment')) {
    if (!openKeys.value.includes('equipment')) {
      openKeys.value = ['equipment'];
    }
  } else if (path.startsWith('/admin/booking')) {
    if (!openKeys.value.includes('booking')) {
      openKeys.value = ['booking'];
    }
  } else {
    // 如果不在任何管理页面，清空展开项
    openKeys.value = [];
  }
};

// 监听路由变化
watch(() => route.path, (newPath) => {
  updateMenuByRoute(newPath);
}, { immediate: true });

// 点击菜单项
const onClickMenuItem = (key: string) => {
  router.push(key);
};

// 用户菜单处理
const handleUserMenu = (key: string) => {
  switch (key) {
    case 'profile':
      router.push('/user/profile');
      break;
    case 'password':
      router.push('/user/password');
      break;
    case 'logout':
      store.dispatch('user/logout').then(() => {
        Message.success('已退出登录');
        router.push('/user/login');
      });
      break;
  }
};
</script>

<style scoped lang="less">
.title-bar {
  display: flex;
  align-items: center;
  padding: 12px 16px;

  .logo {
    height: 32px;
    margin-right: 8px;
  }

  .title {
    font-size: 18px;
    font-weight: bold;
    color: var(--color-text-1);
  }
}

.layout-demo {
  height: 100vh;
  background: var(--color-fill-2);
  border: 1px solid var(--color-border);
}

.layout-demo :deep(.arco-layout-sider) .logo {
  height: 32px;
  margin: 12px 8px;
  background: rgba(255, 255, 255, 0.2);
}

.layout-demo :deep(.arco-layout-sider-light) .logo {
  background: var(--color-fill-2);
}

.layout-demo :deep(.arco-layout-header) {
  height: 64px;
  line-height: 64px;
  background: var(--color-bg-3);
  border-bottom: 1px solid var(--color-border-2);
}

.layout-demo :deep(.layout-content) {
  margin: 16px;
  padding: 16px;
  background: var(--color-bg-3);
  border-radius: 4px;
  overflow: auto;
}

// 菜单样式优化
:deep(.arco-menu) {
  .arco-menu-item {
    &.arco-menu-selected {
      background-color: var(--color-primary-light-1);
      color: rgb(var(--primary-6));

      .arco-icon {
        color: rgb(var(--primary-6));
      }
    }

    &:hover {
      background-color: var(--color-fill-2);
    }
  }

  .arco-menu-inline-header {
    &.arco-menu-selected {
      background-color: var(--color-primary-light-1);
      color: rgb(var(--primary-6));

      .arco-icon {
        color: rgb(var(--primary-6));
      }
    }
  }
}
</style>
