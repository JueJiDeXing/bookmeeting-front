<template>
  <div id="userManageView">
    <!-- 操作按钮区域 -->
    <div class="operation-bar">
      <a-space>
        <a-button type="primary" @click="onAdd">
          <template #icon>
            <icon-plus />
          </template>
          新增用户
        </a-button>
        <a-button type="primary" status="danger" @click="onBatchDelete" :disabled="selectedKeys.length === 0">
          <template #icon>
            <icon-delete />
          </template>
          批量删除
        </a-button>
      </a-space>
    </div>

    <!-- 搜索区域 -->
    <a-form :model="searchParams" layout="inline" class="search-form">
      <a-form-item field="id" label="用户ID">
        <a-input v-model="searchParams.id" placeholder="请输入用户ID" allow-clear />
      </a-form-item>
      <a-form-item field="userAccount" label="用户账号">
        <a-input v-model="searchParams.userAccount" placeholder="请输入用户账号" allow-clear />
      </a-form-item>
      <a-form-item field="userName" label="用户名">
        <a-input v-model="searchParams.userName" placeholder="请输入用户名" allow-clear />
      </a-form-item>
      <a-form-item field="role" label="权限">
        <a-select v-model="searchParams.role" placeholder="请选择权限" allow-clear style="width: 120px">
          <a-option value="admin">管理员</a-option>
          <a-option value="user">普通用户</a-option>
          <a-option value="ban">禁用</a-option>
        </a-select>
      </a-form-item>
      <a-form-item field="email" label="邮箱">
        <a-input v-model="searchParams.email" placeholder="请输入邮箱" allow-clear />
      </a-form-item>
      <a-form-item field="phone" label="手机号">
        <a-input v-model="searchParams.phone" placeholder="请输入手机号" allow-clear />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" @click="onSearch">
          <template #icon>
            <icon-search />
          </template>
          搜索
        </a-button>
        <a-button @click="onReset">
          <template #icon>
            <icon-refresh />
          </template>
          重置
        </a-button>
      </a-form-item>
    </a-form>

    <!-- 用户列表 -->
    <a-table
        :columns="columns"
        :data="dataList"
        :pagination="{
        showTotal: true,
        pageSize: searchParams.pageSize,
        current: searchParams.current,
        total: total,
        showJumper: true,
        showPageSize: true,
        pageSizeOptions: [5, 10, 20, 50]
      }"
        @page-change="onPageChange"
        @page-size-change="onPageSizeChange"
        :loading="loading"
        row-key="id"
        :row-selection="rowSelection"
        v-model:selectedKeys="selectedKeys"
    >
      <template #columns>
        <a-table-column title="用户ID" data-index="id" :width="80" />
        <a-table-column title="用户账号" data-index="userAccount" :width="120" />
        <a-table-column title="用户名称" data-index="userName" :width="120" />
        <a-table-column title="用户角色" data-index="role" :width="100">
          <template #cell="{ record }">
            <a-tag :color="getRoleColor(record.role)">
              {{ getRoleText(record.role) }}
            </a-tag>
          </template>
        </a-table-column>
        <a-table-column title="邮箱" data-index="email" :width="180" />
        <a-table-column title="手机号" data-index="phone" :width="120" />
        <a-table-column title="创建时间" data-index="createTime" :width="180" />
        <a-table-column title="操作" :width="200" fixed="right">
          <template #cell="{ record }">
            <a-space>
              <a-button type="text" size="small" @click="onEdit(record)">
                <template #icon>
                  <icon-edit />
                </template>
                编辑
              </a-button>
              <a-button type="text" size="small" status="danger" @click="onDelete(record)">
                <template #icon>
                  <icon-delete />
                </template>
                删除
              </a-button>
              <a-dropdown @select="(key) => onMoreAction(key, record)">
                <a-button type="text" size="small">
                  <template #icon>
                    <icon-more />
                  </template>
                  更多
                </a-button>
                <template #content>
                  <a-doption value="resetPwd">
                    <icon-lock />
                    重置密码
                  </a-doption>
                  <a-doption value="changeRole">
                    <icon-user />
                    修改权限
                  </a-doption>
                  <a-doption v-if="record.role !== 'ban'" value="ban">
                    <icon-stop />
                    禁用账号
                  </a-doption>
                  <a-doption v-else value="unban">
                    <icon-play-arrow />
                    启用账号
                  </a-doption>
                </template>
              </a-dropdown>
            </a-space>
          </template>
        </a-table-column>
      </template>
    </a-table>

    <!-- 新增/编辑用户弹窗 -->
    <a-modal
        :visible="modalVisible"
        :title="modalTitle"
        @ok="handleModalOk"
        @cancel="handleModalCancel"
        :mask-closable="false"
        :ok-loading="modalLoading"
    >
      <a-form :model="formData" :rules="formRules" ref="formRef" auto-label-width>
        <a-form-item field="userAccount" label="用户账号" required>
          <a-input v-model="formData.userAccount" placeholder="请输入用户账号" :disabled="modalType === 'edit'" />
        </a-form-item>
        <a-form-item v-if="modalType === 'add'" field="password" label="密码" required>
          <a-input-password v-model="formData.password" placeholder="请输入密码" />
        </a-form-item>
        <a-form-item field="userName" label="用户名称">
          <a-input v-model="formData.userName" placeholder="请输入用户名称" />
        </a-form-item>
        <a-form-item field="role" label="用户角色" required>
          <a-select v-model="formData.role" placeholder="请选择用户角色">
            <a-option value="admin">管理员</a-option>
            <a-option value="user">普通用户</a-option>
            <a-option value="ban">禁用</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="email" label="邮箱">
          <a-input v-model="formData.email" placeholder="请输入邮箱" />
        </a-form-item>
        <a-form-item field="phone" label="手机号">
          <a-input v-model="formData.phone" placeholder="请输入手机号" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 修改权限弹窗 -->
    <a-modal
        :visible="roleModalVisible"
        title="修改用户权限"
        @ok="handleRoleModalOk"
        @cancel="roleModalVisible = false"
        :ok-loading="roleModalLoading"
    >
      <a-form>
        <a-form-item label="用户名">
          <span>{{ currentUser?.userName }} ({{ currentUser?.userAccount }})</span>
        </a-form-item>
        <a-form-item label="当前权限">
          <a-tag :color="getRoleColor(currentUser?.role)">
            {{ getRoleText(currentUser?.role) }}
          </a-tag>
        </a-form-item>
        <a-form-item label="新权限" required>
          <a-select v-model="newRole" placeholder="请选择新权限">
            <a-option value="admin">管理员</a-option>
            <a-option value="user">普通用户</a-option>
            <a-option value="ban">禁用</a-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 重置密码确认弹窗 -->
    <a-modal
        :visible="resetPwdModalVisible"
        title="重置密码"
        @ok="handleResetPwdOk"
        @cancel="resetPwdModalVisible = false"
        :ok-loading="resetPwdLoading"
    >
      <a-alert type="warning" show-icon>
        确定要重置用户 "{{ currentUser?.userName }}" 的密码吗？重置后的默认密码为：123456
      </a-alert>
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
  IconLock,
  IconUser,
  IconStop,
  IconPlayArrow
} from '@arco-design/web-vue/es/icon';
import {
  AdminUserControllerService,
  UserQueryRequest,
  UserAddRequest,
  UserUpdateRequest,
  UserVO
} from "../../../generated";
import { useRouter } from "vue-router";
import isLogin from "@/access/isLogin";

const router = useRouter();
const tableRef = ref();
const dataList = ref<UserVO[]>([]);
const total = ref(0);
const loading = ref(false);
const selectedKeys = ref([]);

// 搜索参数
const searchParams = ref<UserQueryRequest>({
  id: undefined,
  userAccount: undefined,
  userName: undefined,
  role: undefined,
  email: undefined,
  phone: undefined,
  pageSize: 10,
  current: 1
});

// 表格列配置
const columns = [
  { title: '用户ID', dataIndex: 'id', width: 80 },
  { title: '用户账号', dataIndex: 'userAccount', width: 120 },
  { title: '用户名称', dataIndex: 'userName', width: 120 },
  { title: '用户角色', dataIndex: 'role', width: 100, slotName: 'role' },
  { title: '邮箱', dataIndex: 'email', width: 180 },
  { title: '手机号', dataIndex: 'phone', width: 120 },
  { title: '创建时间', dataIndex: 'createTime', width: 180 },
  { title: '操作', width: 200, fixed: 'right', slotName: 'operation' }
];

// 行选择配置
const rowSelection = {
  type: 'checkbox',
  showCheckedAll: true,
  onlyCurrent: false
};

// 获取角色颜色
const getRoleColor = (role: string) => {
  switch (role) {
    case 'admin':
      return 'red';
    case 'user':
      return 'blue';
    case 'ban':
      return 'gray';
    default:
      return 'blue';
  }
};

// 获取角色文本
const getRoleText = (role: string) => {
  switch (role) {
    case 'admin':
      return '管理员';
    case 'user':
      return '普通用户';
    case 'ban':
      return '已禁用';
    default:
      return role;
  }
};

// 加载数据
const loadData = async () => {
  if (!isLogin()) {
    console.log("未登录/已过期");
    await router.push({ path: "/user/login" });
    return;
  }

  loading.value = true;
  try {
    const result = await AdminUserControllerService.listUserByPageUsingPost(searchParams.value);
    console.log(result);
    if (result.code === 0) {
      dataList.value = result.data.records;
      total.value = parseInt(result.data.total);
      Message.success(`查找到 ${result.data.records.length} 个用户`);
    } else {
      Message.error("加载失败: " + result.message);
    }
  } catch (error) {
    Message.error("加载失败: " + error.message);
  } finally {
    loading.value = false;
  }
};

// 搜索
const onSearch = () => {
  searchParams.value.current = 1;
  loadData();
};

// 重置搜索
const onReset = () => {
  searchParams.value = {
    id: undefined,
    userAccount: undefined,
    userName: undefined,
    role: undefined,
    email: undefined,
    phone: undefined,
    pageSize: 10,
    current: 1
  };
  loadData();
};

// 页码变化
const onPageChange = (page: number) => {
  searchParams.value.current = page;
  loadData();
};

// 每页条数变化
const onPageSizeChange = (pageSize: number) => {
  searchParams.value.pageSize = pageSize;
  searchParams.value.current = 1;
  loadData();
};

// 新增/编辑弹窗相关
const modalVisible = ref(false);
const modalTitle = ref('');
const modalType = ref<'add' | 'edit'>('add');
const modalLoading = ref(false);
const formRef = ref();
const formData = reactive({
  id: undefined,
  userAccount: '',
  password: '',
  userName: '',
  role: 'user',
  email: null,
  phone: null
});

const formRules = {
  userAccount: [{ required: true, message: '用户账号不能为空' }],
  password: [{ required: true, message: '密码不能为空' }],
  role: [{ required: true, message: '请选择用户角色' }]
};

// 新增用户
const onAdd = () => {
  modalType.value = 'add';
  modalTitle.value = '新增用户';
  Object.assign(formData, {
    id: undefined,
    userAccount: '',
    password: '',
    userName: '',
    role: 'user',
    email: null,
    phone: null
  });
  modalVisible.value = true;
};

// 编辑用户
const onEdit = (record: UserVO) => {
  modalType.value = 'edit';
  modalTitle.value = '编辑用户';
  Object.assign(formData, {
    id: record.id,
    userAccount: record.userAccount,
    password: '', // 密码不显示，留空表示不修改
    userName: record.userName,
    role: record.role,
    email: record.email,
    phone: record.phone
  });
  modalVisible.value = true;
};

// 弹窗确定
const handleModalOk = async () => {
  const errors = await formRef.value?.validate();
  if (errors) {
    return;
  }

  modalLoading.value = true;
  try {
    let result;
    if (modalType.value === 'add') {
      // 新增用户
      const addRequest: UserAddRequest = {
        userAccount: formData.userAccount,
        password: formData.password,
        userName: formData.userName,
        role: formData.role,
        email: formData.email,
        phone: formData.phone
      };
      result = await AdminUserControllerService.addUserUsingPost(addRequest);
    } else {
      // 更新用户
      const updateRequest: UserUpdateRequest = {
        id: formData.id,
        userName: formData.userName,
        role: formData.role,
        email: formData.email,
        phone: formData.phone
      };
      result = await AdminUserControllerService.updateUserUsingPost(updateRequest);
    }

    if (result.code === 0) {
      Message.success(modalType.value === 'add' ? '新增成功' : '更新成功');
      modalVisible.value = false;
      loadData();
    } else {
      Message.error(result.message);
    }
  } catch (error) {
    Message.error('操作失败: ' + error.message);
  } finally {
    modalLoading.value = false;
  }
};

// 弹窗取消
const handleModalCancel = () => {
  modalVisible.value = false;
  formRef.value?.resetFields();
};

// 删除单个用户
const onDelete = (record: UserVO) => {
  Modal.warning({
    title: '确认删除',
    content: `确定要删除用户 "${record.userName}" 吗？删除后不可恢复！`,
    hideCancel: false,
    okButtonProps: { status: 'danger' },
    onOk: async () => {
      try {
        const result = await AdminUserControllerService.deleteUserUsingPost({ id: record.id });
        if (result.code === 0) {
          Message.success('删除成功');
          loadData();
        } else {
          Message.error(result.message);
        }
      } catch (error) {
        Message.error('删除失败: ' + error.message);
      }
    }
  });
};

// 批量删除
const onBatchDelete = () => {
  if (selectedKeys.value.length === 0) {
    Message.warning('请选择要删除的用户');
    return;
  }

  Modal.warning({
    title: '确认批量删除',
    content: `确定要删除选中的 ${selectedKeys.value.length} 个用户吗？删除后不可恢复！`,
    hideCancel: false,
    okButtonProps: { status: 'danger' },
    onOk: async () => {
      try {
        // 假设后端支持批量删除接口
        const result = await AdminUserControllerService.batchDeleteUserUsingPost({ ids: selectedKeys.value });
        if (result.code === 0) {
          Message.success(`成功删除 ${selectedKeys.value.length} 个用户`);
          selectedKeys.value = [];
          loadData();
        } else {
          Message.error(result.message);
        }
      } catch (error) {
        Message.error('批量删除失败: ' + error.message);
      }
    }
  });
};

// 更多操作
const currentUser = ref<UserVO>();
const roleModalVisible = ref(false);
const roleModalLoading = ref(false);
const newRole = ref('');
const resetPwdModalVisible = ref(false);
const resetPwdLoading = ref(false);

const onMoreAction = (key: string, record: UserVO) => {
  currentUser.value = record;

  switch (key) {
    case 'resetPwd':
      resetPwdModalVisible.value = true;
      break;
    case 'changeRole':
      newRole.value = record.role;
      roleModalVisible.value = true;
      break;
    case 'ban':
      handleBanUser(record);
      break;
    case 'unban':
      handleUnbanUser(record);
      break;
  }
};

// 禁用用户
const handleBanUser = (record: UserVO) => {
  Modal.warning({
    title: '确认禁用',
    content: `确定要禁用用户 "${record.userName}" 吗？禁用后该用户将无法登录系统。`,
    onOk: async () => {
      try {
        const result = await AdminUserControllerService.updateUserUsingPost({
          id: record.id,
          role: 'ban'
        });
        if (result.code === 0) {
          Message.success('已禁用该用户');
          loadData();
        } else {
          Message.error(result.message);
        }
      } catch (error) {
        Message.error('操作失败: ' + error.message);
      }
    }
  });
};

// 启用用户
const handleUnbanUser = (record: UserVO) => {
  Modal.info({
    title: '确认启用',
    content: `确定要启用用户 "${record.userName}" 吗？`,
    onOk: async () => {
      try {
        const result = await AdminUserControllerService.updateUserUsingPost({
          id: record.id,
          role: 'user'
        });
        if (result.code === 0) {
          Message.success('已启用该用户');
          loadData();
        } else {
          Message.error(result.message);
        }
      } catch (error) {
        Message.error('操作失败: ' + error.message);
      }
    }
  });
};

// 修改权限弹窗确定
const handleRoleModalOk = async () => {
  if (!newRole.value) {
    Message.warning('请选择新权限');
    return;
  }

  roleModalLoading.value = true;
  try {
    const result = await AdminUserControllerService.updateUserUsingPost({
      id: currentUser.value?.id,
      role: newRole.value
    });
    if (result.code === 0) {
      Message.success('权限修改成功');
      roleModalVisible.value = false;
      loadData();
    } else {
      Message.error(result.message);
    }
  } catch (error) {
    Message.error('操作失败: ' + error.message);
  } finally {
    roleModalLoading.value = false;
  }
};

// 重置密码弹窗确定
const handleResetPwdOk = async () => {
  resetPwdLoading.value = true;
  try {
    const result = await AdminUserControllerService.resetPasswordUsingPost({
      id: currentUser.value?.id,
      password: '123456' // 默认密码
    });
    if (result.code === 0) {
      Message.success('密码已重置为: 123456');
      resetPwdModalVisible.value = false;
    } else {
      Message.error(result.message);
    }
  } catch (error) {
    Message.error('操作失败: ' + error.message);
  } finally {
    resetPwdLoading.value = false;
  }
};

// 初始化加载
onMounted(() => {
  loadData();
});
</script>

<style scoped lang="less">
#userManageView {
  padding: 20px;

  .operation-bar {
    margin-bottom: 20px;
  }

  .search-form {
    margin-bottom: 20px;
    padding: 20px;
    background-color: var(--color-bg-2);
    border-radius: 4px;
  }

  :deep(.arco-table) {
    background-color: var(--color-bg-2);
    border-radius: 4px;
  }
}
</style>
