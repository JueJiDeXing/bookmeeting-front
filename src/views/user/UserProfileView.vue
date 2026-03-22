<template>
  <div id="userProfileView">
    <a-card :bordered="false">
      <template #title>
        <a-space>
          <icon-user />
          <span>个人信息</span>
        </a-space>
      </template>

      <a-row :gutter="24">
        <a-col :span="8">
          <a-space direction="vertical" align="center" fill>
            <a-avatar :size="100" shape="square">
              <img :src="userInfo.avatar || 'https://avatars.githubusercontent.com/u/1?v=4'" />
            </a-avatar>
            <a-upload
                action="/api/user/avatar"
                :show-file-list="false"
                @success="onAvatarUploadSuccess"
            >
              <a-button type="primary" size="small">
                <icon-upload />
                上传头像
              </a-button>
            </a-upload>
          </a-space>
        </a-col>

        <a-col :span="16">
          <a-form :model="userInfo" :rules="formRules" ref="formRef" :label-col-props="{ span: 4 }">
            <a-form-item field="userName" label="用户名称">
              <a-input v-model="userInfo.userName" placeholder="请输入用户名称" />
            </a-form-item>
            <a-form-item field="email" label="邮箱">
              <a-input v-model="userInfo.email" placeholder="请输入邮箱" />
            </a-form-item>
            <a-form-item field="phone" label="手机号">
              <a-input v-model="userInfo.phone" placeholder="请输入手机号" />
            </a-form-item>
            <a-form-item label="账号">
              <span>{{ userInfo.userAccount }}</span>
            </a-form-item>
            <a-form-item label="角色">
              <a-tag :color="getRoleColor(userInfo.role)">
                {{ getRoleText(userInfo.role) }}
              </a-tag>
            </a-form-item>
            <a-form-item label="创建时间">
              <span>{{ userInfo.createTime }}</span>
            </a-form-item>
            <a-form-item :wrapper-col-props="{ span: 18, offset: 4 }">
              <a-space>
                <a-button type="primary" @click="handleUpdate" :loading="updating">
                  <icon-save />
                  保存修改
                </a-button>
                <a-button @click="router.push('/user/password')">
                  <icon-lock />
                  修改密码
                </a-button>
              </a-space>
            </a-form-item>
          </a-form>
        </a-col>
      </a-row>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { Message } from '@arco-design/web-vue';
import { IconUser, IconSave, IconLock, IconUpload } from '@arco-design/web-vue/es/icon';
import { useRouter } from 'vue-router';
import { UserControllerService, UserUpdateMyRequest } from '../../../generated';

const router = useRouter();
const formRef = ref();
const updating = ref(false);

const userInfo = reactive({
  id: undefined,
  userAccount: '',
  userName: '',
  avatar: '',
  email: '',
  phone: '',
  role: 'user',
  createTime: ''
});

const formRules = {
  userName: [
    { maxLength: 50, message: '用户名称不能超过50个字符' }
  ],
  email: [
    { type: 'email', message: '请输入有效的邮箱地址' }
  ],
  phone: [
    { match: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' }
  ]
};

// 获取角色颜色
const getRoleColor = (role: string) => {
  switch (role) {
    case 'admin': return 'red';
    case 'user': return 'blue';
    case 'ban': return 'gray';
    default: return 'blue';
  }
};

// 获取角色文本
const getRoleText = (role: string) => {
  switch (role) {
    case 'admin': return '管理员';
    case 'user': return '普通用户';
    case 'ban': return '已禁用';
    default: return role;
  }
};

// 加载个人信息
const loadUserInfo = async () => {
  try {
    const res = await UserControllerService.getLoginUserUsingGet();
    if (res.code === 0 && res.data) {
      Object.assign(userInfo, res.data);
    } else {
      Message.error('获取用户信息失败');
    }
  } catch (error) {
    Message.error('加载失败: ' + error.message);
  }
};

// 更新个人信息
const handleUpdate = async () => {
  const errors = await formRef.value?.validate();
  if (errors) return;

  updating.value = true;
  try {
    const updateRequest: UserUpdateMyRequest = {
      userName: userInfo.userName,
      email: userInfo.email,
      phone: userInfo.phone
    };
    const res = await UserControllerService.updateMyUserUsingPost(updateRequest);
    if (res.code === 0) {
      Message.success('修改成功');
    } else {
      Message.error(res.message);
    }
  } catch (error) {
    Message.error('操作失败: ' + error.message);
  } finally {
    updating.value = false;
  }
};

// 头像上传成功
const onAvatarUploadSuccess = () => {
  Message.success('头像上传成功');
  loadUserInfo(); // 重新加载信息
};

onMounted(() => {
  loadUserInfo();
});
</script>

<style scoped lang="less">
#userProfileView {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}
</style>
