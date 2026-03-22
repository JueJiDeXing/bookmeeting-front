<template>
  <div id="roomAddView">
    <a-card>
      <template #title>
        <a-space>
          <icon-left @click="goBack" class="back-icon" />
          <span>{{ isEdit ? '编辑会议室' : '新增会议室' }}</span>
        </a-space>
      </template>

      <a-form
          :model="formData"
          :rules="formRules"
          ref="formRef"
          auto-label-width
          :label-col-props="{ span: 4 }"
          :wrapper-col-props="{ span: 18 }"
          class="room-form"
      >
        <a-form-item field="roomName" label="会议室名称" required>
          <a-input v-model="formData.roomName" placeholder="请输入会议室名称" />
        </a-form-item>

        <a-form-item field="capacity" label="容纳人数" required>
          <a-input-number v-model="formData.capacity" placeholder="请输入容纳人数" :min="1" :max="500" style="width: 100%" />
        </a-form-item>

        <a-form-item label="位置信息" required class="location-group">
          <a-row :gutter="16">
            <a-col :span="8">
              <a-form-item field="building" hide-label>
                <a-input v-model="formData.building" placeholder="楼栋（如：A栋）" />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item field="floor" hide-label>
                <a-input-number v-model="formData.floor" placeholder="楼层" :min="1" :max="100" style="width: 100%" />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item field="roomNumber" hide-label>
                <a-input v-model="formData.roomNumber" placeholder="房间号（如：301）" />
              </a-form-item>
            </a-col>
          </a-row>
        </a-form-item>

        <a-form-item field="description" label="会议室描述">
          <a-textarea
              v-model="formData.description"
              placeholder="请输入会议室描述，包括设施、布局等信息"
              :max-length="500"
              show-word-limit
              :auto-size="{ minRows: 4, maxRows: 8 }"
          />
        </a-form-item>

        <a-form-item field="imageUrl" label="会议室图片">
          <a-input v-model="formData.imageUrl" placeholder="请输入图片URL" />
          <div v-if="formData.imageUrl" class="image-preview">
            <img :src="formData.imageUrl" alt="会议室预览" @error="handleImageError" />
          </div>
        </a-form-item>

        <a-form-item field="equipmentIds" label="设备配置">
          <a-select
              v-model="formData.equipmentIds"
              placeholder="请选择会议室设备"
              multiple
              :loading="equipmentLoading"
              allow-clear
          >
            <a-option v-for="item in equipmentList" :key="item.id" :value="item.id">
              <a-space>
                <icon-tool />
                {{ item.equipmentName }}
              </a-space>
            </a-option>
          </a-select>
        </a-form-item>

        <a-form-item field="status" label="状态">
          <a-radio-group v-model="formData.status" type="button">
            <a-radio :value="0">
              <icon-check-circle />
              可用
            </a-radio>
            <a-radio :value="1">
              <icon-pause-circle />
              维护中
            </a-radio>
          </a-radio-group>
        </a-form-item>

        <a-divider />

        <a-form-item :wrapper-col-props="{ span: 18, offset: 4 }">
          <a-space size="large">
            <a-button type="primary" @click="handleSubmit" :loading="submitting">
              <template #icon>
                <icon-save />
              </template>
              {{ isEdit ? '保存修改' : '提交' }}
            </a-button>
            <a-button @click="goBack">
              <template #icon>
                <icon-close />
              </template>
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
import {
  IconLeft,
  IconSave,
  IconClose,
  IconTool,
  IconCheckCircle,
  IconPauseCircle
} from '@arco-design/web-vue/es/icon';
import { useRouter, useRoute } from 'vue-router';
import { AdminRoomControllerService } from '../../../generated';
import type { RoomAddRequest, RoomUpdateRequest, Equipment } from '../../../generated';

const router = useRouter();
const route = useRoute();
const formRef = ref();
const submitting = ref(false);
const equipmentLoading = ref(false);
const equipmentList = ref<Equipment[]>([]);

// 判断是否是编辑模式
const isEdit = computed(() => !!route.query.id);

// 表单数据
const formData = reactive<RoomAddRequest & { id?: number }>({
  id: undefined,
  roomName: '',
  building: '',
  floor: undefined,
  roomNumber: '',
  capacity: undefined,
  description: '',
  imageUrl: '',
  status: 0,
  equipmentIds: []
});

// 表单校验规则
const formRules = {
  roomName: [
    { required: true, message: '会议室名称不能为空' },
    { maxLength: 100, message: '会议室名称不能超过100个字符' }
  ],
  building: [
    { required: true, message: '楼栋不能为空' },
    { maxLength: 100, message: '楼栋不能超过100个字符' }
  ],
  floor: [
    { required: true, message: '楼层不能为空' },
    { type: 'number', min: 1, max: 100, message: '楼层必须在1-100之间' }
  ],
  roomNumber: [
    { required: true, message: '房间号不能为空' },
    { maxLength: 100, message: '房间号不能超过100个字符' }
  ],
  capacity: [
    { required: true, message: '容纳人数不能为空' },
    { type: 'number', min: 1, max: 500, message: '容纳人数必须在1-500之间' }
  ]
};

// 加载设备列表
const loadEquipmentList = async () => {
  equipmentLoading.value = true;
  try {
    // TODO: 调用获取设备列表接口
    // const res = await EquipmentControllerService.listAllEquipmentUsingGet();
    // equipmentList.value = res.data;

    // 模拟数据
    equipmentList.value = [
      { id: 1, equipmentName: '投影仪', equipmentCode: 'PROJ', status: 0 },
      { id: 2, equipmentName: '白板', equipmentCode: 'BOARD', status: 0 },
      { id: 3, equipmentName: '视频会议设备', equipmentCode: 'VIDEO', status: 0 },
      { id: 4, equipmentName: '音响系统', equipmentCode: 'SOUND', status: 0 },
      { id: 5, equipmentName: '无线麦克风', equipmentCode: 'MIC', status: 0 },
      { id: 6, equipmentName: '电视机', equipmentCode: 'TV', status: 0 }
    ];
  } catch (error: any) {
    Message.error('加载设备列表失败: ' + error.message);
  } finally {
    equipmentLoading.value = false;
  }
};

// 加载会议室信息（编辑模式）
const loadRoomInfo = async (id: number) => {
  try {
    const res = await AdminRoomControllerService.getRoomVOByIdUsingGet({ id });
    if (res.code === 0 && res.data) {
      const room = res.data;
      Object.assign(formData, {
        id: room.id,
        roomName: room.roomName,
        building: room.building,
        floor: room.floor,
        roomNumber: room.roomNumber,
        capacity: room.capacity,
        description: room.description,
        imageUrl: room.imageUrl,
        status: room.status,
        equipmentIds: room.equipmentList?.map((e: Equipment) => e.id) || []
      });
    } else {
      Message.error('加载会议室信息失败: ' + (res.message || '未知错误'));
    }
  } catch (error: any) {
    Message.error('加载会议室信息失败: ' + error.message);
  }
};

// 图片加载失败处理
const handleImageError = (e: Event) => {
  const img = e.target as HTMLImageElement;
  img.src = 'https://via.placeholder.com/400x200?text=No+Image';
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
      const updateRequest: RoomUpdateRequest = {
        id: formData.id!,
        roomName: formData.roomName,
        building: formData.building,
        floor: formData.floor,
        roomNumber: formData.roomNumber,
        capacity: formData.capacity,
        description: formData.description,
        imageUrl: formData.imageUrl,
        status: formData.status,
        equipmentIds: formData.equipmentIds
      };
      const result = await AdminRoomControllerService.updateRoomUsingPost(updateRequest);
      if (result.code === 0) {
        Message.success('会议室信息更新成功');
        router.push('/admin/room');
      } else {
        Message.error(result.message || '更新失败');
      }
    } else {
      const addRequest: RoomAddRequest = {
        roomName: formData.roomName,
        building: formData.building,
        floor: formData.floor!,
        roomNumber: formData.roomNumber,
        capacity: formData.capacity!,
        description: formData.description,
        imageUrl: formData.imageUrl,
        status: formData.status,
        equipmentIds: formData.equipmentIds
      };
      const result = await AdminRoomControllerService.addRoomUsingPost(addRequest);
      if (result.code === 0) {
        Message.success('会议室新增成功');
        router.push('/admin/room');
      } else {
        Message.error(result.message || '新增失败');
      }
    }
  } catch (error: any) {
    Message.error('操作失败: ' + error.message);
  } finally {
    submitting.value = false;
  }
};

// 初始化
onMounted(() => {
  loadEquipmentList();

  const id = route.query.id;
  if (id) {
    loadRoomInfo(Number(id));
  }
});
</script>

<style scoped lang="less">
#roomAddView {
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

  .room-form {
    margin-top: 24px;
    max-width: 800px;
  }

  .location-group {
    :deep(.arco-form-item) {
      margin-bottom: 0;
    }
  }

  .image-preview {
    margin-top: 12px;
    padding: 8px;
    border: 1px dashed var(--color-border-2);
    border-radius: 4px;
    max-width: 400px;

    img {
      max-width: 100%;
      max-height: 200px;
      border-radius: 4px;
    }
  }
}
</style>
