<template>
  <div id="userUpdateView">
    <a-card>
      <template #title>
        <a-space>
          <icon-left @click="goBack" class="back-icon" />
          <span>{{ isEdit ? '编辑用户' : '新增用户' }}</span>
        </a-space>
      </template>

      <a-form
          :model="formData"
          :rules="formRules"
          ref="formRef"
          auto-label-width
          :label-col-props="{ span: 4 }"
          :wrapper-col-props="{ span: 16 }"
          class="user-form"
      >
        <a-form-item field="userAccount" label="用户账号" required>
          <a-input
              v-model="formData.userAccount"
              placeholder="请输入用户账号"
              :disabled="isEdit"
          />
        </a-form-item>

        <a-form-item v-if="!isEdit" field="password" label="密码" required>
          <a-input-password v-model="formData.password" placeholder="请输入密码" />
          <template #extra>
            <span class="password-tip">密码不少于8位，包含字母和数字</span>
          </template>
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

        <a-divider />

        <a-form-item :wrapper-col-props="{ span: 16, offset: 4 }">
          <a-space size="large">
            <a-button type="primary" @click="handleSubmit" :loading="submitting">
              <template #icon><icon-save /></template>
              {{ isEdit ? '保存修改' : '提交' }}
            </a-button>
            <a-button @click="goBack">
              <template #icon><icon-close /></template>
              取消
            </a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { Message } from '@arco-design/web-vue';
import { IconLeft, IconSave, IconClose } from '@arco-design/web-vue/es/icon';
import { useRouter, useRoute } from 'vue-router';
import { AdminUserControllerService, UserAddRequest, UserUpdateRequest } from '../../../generated';

const router = useRouter();
const route = useRoute();
const formRef = ref();
const submitting = ref(false);

// 判断是否是编辑模式
const isEdit = computed(() => !!route.query.id);

// 表单数据
const formData = reactive({
  id: undefined,
  userAccount: '',
  password: '',
  userName: '',
  role: 'user',
  email: '',
  phone: ''
});

// 表单校验规则
const formRules = {
  userAccount: [
    { required: true, message: '用户账号不能为空' },
    { maxLength: 100, message: '用户账号不能超过100个字符' }
  ],
  password: [
    { required: true, message: '密码不能为空' },
    { minLength: 8, message: '密码不能少于8位' },
    { match: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, message: '密码必须包含字母和数字' }
  ],
  role: [
    { required: true, message: '请选择用户角色' }
  ],
  email: [
    { type: 'email', message: '请输入有效的邮箱地址' }
  ],
  phone: [
    { match: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' }
  ]
};

// 加载用户信息（编辑模式）
const loadUserInfo = async (id: number) => {
  try {
    const res = await AdminUserControllerService.getUserByIdUsingGet({ id });
    if (res.code === 0 && res.data) {
      Object.assign(formData, {
        id: res.data.id,
        userAccount: res.data.userAccount,
        userName: res.data.userName,
        role: res.data.role,
        email: res.data.email,
        phone: res.data.phone
      });
      // 密码不填充，留空表示不修改
    } else {
      Message.error('加载用户信息失败');
    }
  } catch (error) {
    Message.error('加载失败: ' + error.message);
  }
};

// 返回上一页
const goBack = () => {
  router.back();
};

// 提交表单
const handleSubmit = async () => {
  const errors = await formRef.value?.validate();
  if (errors) {
    Message.error('请完善表单信息');
    return;
  }

  submitting.value = true;
  try {
    if (isEdit.value) {
      // 更新用户
      const updateRequest: UserUpdateRequest = {
        id: formData.id,
        userName: formData.userName,
        role: formData.role,
        email: formData.email,
        phone: formData.phone
      };
      const res = await AdminUserControllerService.updateUserUsingPost(updateRequest);
      if (res.code === 0) {
        Message.success('用户信息更新成功');
        router.push('/admin/user');
      } else {
        Message.error(res.message);
      }
    } else {
      // 新增用户
      const addRequest: UserAddRequest = {
        userAccount: formData.userAccount,
        password: formData.password,
        userName: formData.userName,
        role: formData.role,
        email: formData.email,
        phone: formData.phone
      };
      const res = await AdminUserControllerService.addUserUsingPost(addRequest);
      if (res.code === 0) {
        Message.success('用户新增成功');
        router.push('/admin/user');
      } else {
        Message.error(res.message);
      }
    }
  } catch (error) {
    Message.error('操作失败: ' + error.message);
  } finally {
    submitting.value = false;
  }
};

// 初始化
onMounted(() => {
  const id = route.query.id;
  if (id) {
    loadUserInfo(Number(id));
  }
});
</script>

<style scoped lang="less">
#userUpdateView {
  padding: 20px;

  .back-icon {
    cursor: pointer;
    font-size: 18px;
    color: var(--color-text-2);
    transition: color 0.2s;

    &:hover {
      color: rgb(var(--primary-6));
    }
  }

  .user-form {
    margin-top: 24px;
    max-width: 800px;
  }

  .password-tip {
    font-size: 12px;
    color: var(--color-text-3);
  }
}
</style>
