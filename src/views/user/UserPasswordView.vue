<template>
  <div id="userPasswordView">
    <a-card :bordered="false">
      <template #title>
        <a-space>
          <icon-lock />
          <span>修改密码</span>
        </a-space>
      </template>

      <a-form
          :model="formData"
          :rules="formRules"
          ref="formRef"
          :label-col-props="{ span: 6 }"
          :wrapper-col-props="{ span: 16 }"
          style="max-width: 500px; margin-top: 30px"
      >
        <a-form-item field="oldPassword" label="原密码" required>
          <a-input-password v-model="formData.oldPassword" placeholder="请输入原密码" />
        </a-form-item>

        <a-form-item field="newPassword" label="新密码" required>
          <a-input-password v-model="formData.newPassword" placeholder="请输入新密码" />
          <template #extra>
            <span class="password-tip">密码不少于8位，包含字母和数字</span>
          </template>
        </a-form-item>

        <a-form-item field="checkPassword" label="确认密码" required>
          <a-input-password v-model="formData.checkPassword" placeholder="请再次输入新密码" />
        </a-form-item>

        <a-form-item :wrapper-col-props="{ span: 16, offset: 6 }">
          <a-space>
            <a-button type="primary" @click="handleSubmit" :loading="submitting">
              <icon-save />
              确认修改
            </a-button>
            <a-button @click="router.back()">
              <icon-close />
              取消
            </a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { Message } from '@arco-design/web-vue';
import { IconLock, IconSave, IconClose } from '@arco-design/web-vue/es/icon';
import { useRouter } from 'vue-router';
import { UserControllerService, UserUpdatePasswordRequest } from '../../../generated';

const router = useRouter();
const formRef = ref();
const submitting = ref(false);

const formData = reactive({
  oldPassword: '',
  newPassword: '',
  checkPassword: ''
});

// 自定义验证：确认密码
const checkPassword = (value: string, callback: (error?: string) => void) => {
  if (value !== formData.newPassword) {
    callback('两次输入的密码不一致');
  } else {
    callback();
  }
};

const formRules = {
  oldPassword: [
    { required: true, message: '原密码不能为空' }
  ],
  newPassword: [
    { required: true, message: '新密码不能为空' },
    { minLength: 8, message: '密码不能少于8位' },
    { match: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, message: '密码必须包含字母和数字' }
  ],
  checkPassword: [
    { required: true, message: '请再次输入新密码' },
    { validator: checkPassword }
  ]
};

const handleSubmit = async () => {
  const errors = await formRef.value?.validate();
  if (errors) return;

  submitting.value = true;
  try {
    const updateRequest: UserUpdatePasswordRequest = {
      oldPassword: formData.oldPassword,
      newPassword: formData.newPassword,
      checkPassword: formData.checkPassword
    };
    const res = await UserControllerService.updatePasswordUsingPost(updateRequest);
    if (res.code === 0) {
      Message.success('密码修改成功，请重新登录');
      // 清除token，跳转到登录页
      localStorage.removeItem('token');
      setTimeout(() => {
        router.push('/user/login');
      }, 1500);
    } else {
      Message.error(res.message);
    }
  } catch (error) {
    Message.error('操作失败: ' + error.message);
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped lang="less">
#userPasswordView {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;

  .password-tip {
    font-size: 12px;
    color: var(--color-text-3);
  }
}
</style>
