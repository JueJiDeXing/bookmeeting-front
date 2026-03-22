<template>
  <div id="equipmentManageView">
    <!-- 操作按钮区域 -->
    <div class="operation-bar">
      <a-space>
        <a-button type="primary" @click="onAdd">
          <template #icon>
            <icon-plus/>
          </template>
          新增设备
        </a-button>
        <a-button type="primary" status="danger" @click="onBatchDelete" :disabled="selectedKeys.length === 0">
          <template #icon>
            <icon-delete/>
          </template>
          批量删除
        </a-button>
        <a-button @click="router.push('/admin/equipment/log')">
          <template #icon>
            <icon-history/>
          </template>
          操作日志
        </a-button>
        <a-button @click="router.push('/admin/equipment/category')">
          <template #icon>
            <icon-tag/>
          </template>
          分类管理
        </a-button>
      </a-space>
    </div>

    <!-- 搜索区域 -->
    <a-form :model="searchParams" layout="inline" class="search-form">
      <a-form-item field="equipmentName" label="设备名称">
        <a-input v-model="searchParams.equipmentName" placeholder="请输入设备名称" allow-clear/>
      </a-form-item>
      <a-form-item field="equipmentCode" label="设备代码">
        <a-input v-model="searchParams.equipmentCode" placeholder="请输入设备代码" allow-clear/>
      </a-form-item>
      <a-form-item field="categoryId" label="设备分类">
        <a-select
            v-model="searchParams.categoryId"
            placeholder="请选择分类"
            allow-clear
            :loading="categoryLoading"
            style="width: 120px"
        >
          <a-option v-for="item in categoryList" :key="item.id" :value="item.id">
            {{ item.categoryName }}
          </a-option>
        </a-select>
      </a-form-item>
      <a-form-item field="status" label="状态">
        <a-select v-model="searchParams.status" placeholder="请选择状态" allow-clear style="width: 120px">
          <a-option :value="0">正常</a-option>
          <a-option :value="1">不可用</a-option>
        </a-select>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" @click="onSearch">
          <template #icon>
            <icon-search/>
          </template>
          搜索
        </a-button>
        <a-button @click="onReset">
          <template #icon>
            <icon-refresh/>
          </template>
          重置
        </a-button>
      </a-form-item>
    </a-form>

    <!-- 设备列表 -->
    <a-table
        :columns="columns"
        :data="dataList"
        :pagination="pagination"
        @page-change="onPageChange"
        @page-size-change="onPageSizeChange"
        :loading="loading"
        row-key="id"
        :row-selection="rowSelection"
        v-model:selectedKeys="selectedKeys"
    >
      <template #columns>
        <a-table-column title="设备ID" data-index="id" :width="80"/>
        <a-table-column title="设备名称" data-index="equipmentName" :width="150"/>
        <a-table-column title="设备代码" data-index="equipmentCode" :width="120"/>
        <a-table-column title="分类" data-index="categoryName" :width="100">
          <template #cell="{ record }">
            <a-tag color="arcoblue">{{ record.categoryName || '未分类' }}</a-tag>
          </template>
        </a-table-column>
        <a-table-column title="图标" data-index="icon" :width="80">
          <template #cell="{ record }">
            <img v-if="record.icon" :src="record.icon" alt="icon"
                 style="width: 32px; height: 32px; object-fit: contain"/>
            <span v-else>-</span>
          </template>
        </a-table-column>
        <a-table-column title="状态" data-index="status" :width="100">
          <template #cell="{ record }">
            <a-tag :color="record.status === 0 ? 'green' : 'red'">
              {{ record.status === 0 ? '正常' : '不可用' }}
            </a-tag>
          </template>
        </a-table-column>
        <a-table-column title="所在会议室" :width="150">
          <template #cell="{ record }">
            <span v-if="record.currentRoom">{{ record.currentRoom.roomName }}</span>
            <span v-else class="text-muted">未分配</span>
          </template>
        </a-table-column>
        <a-table-column title="创建时间" data-index="createTime" :width="180"/>
        <a-table-column title="操作" :width="250" fixed="right">
          <template #cell="{ record }">
            <a-space>
              <a-button type="text" size="small" @click="onEdit(record)">
                <template #icon>
                  <icon-edit/>
                </template>
                编辑
              </a-button>
              <a-button type="text" size="small" status="danger" @click="onDelete(record)">
                <template #icon>
                  <icon-delete/>
                </template>
                删除
              </a-button>
              <a-dropdown @select="(key) => onMoreAction(key, record)">
                <a-button type="text" size="small">
                  <template #icon>
                    <icon-more/>
                  </template>
                  更多
                </a-button>
                <template #content>
                  <template v-if="record.status === 0">
                    <a-doption value="move">
                      <icon-export/>
                      {{ record.currentRoom ? '移出' : '移入' }}
                    </a-doption>
                    <a-doption value="maintain">
                      <icon-pause/>
                      设为维修
                    </a-doption>
                    <a-doption value="scrap">
                      <icon-delete/>
                      报废
                    </a-doption>
                  </template>
                  <template v-else-if="record.status === 1">
                    <a-doption value="recover">
                      <icon-play-arrow/>
                      恢复可用
                    </a-doption>
                    <a-doption value="scrap">
                      <icon-delete/>
                      报废
                    </a-doption>
                  </template>
                  <template v-else>
                    <a-doption value="scrap">
                      <icon-delete/>
                      报废
                    </a-doption>
                  </template>
                </template>
              </a-dropdown>
            </a-space>
          </template>
        </a-table-column>
      </template>
    </a-table>

    <!-- 新增/编辑设备弹窗 -->
    <a-modal
        :visible="modalVisible"
        :title="modalTitle"
        @ok="handleModalOk"
        @cancel="handleModalCancel"
        :mask-closable="false"
        :ok-loading="modalLoading"
        :width="500"
    >
      <a-form :model="formData" :rules="formRules" ref="formRef" auto-label-width>
        <a-form-item field="equipmentName" label="设备名称" required>
          <a-input v-model="formData.equipmentName" placeholder="请输入设备名称"/>
        </a-form-item>
        <a-form-item field="equipmentCode" label="设备代码" required>
          <a-input v-model="formData.equipmentCode" placeholder="请输入设备代码"/>
        </a-form-item>
        <!-- ✅ 新增分类选择 -->
        <a-form-item field="categoryId" label="设备分类" required>
          <a-select
              v-model="formData.categoryId"
              placeholder="请选择设备分类"
              :loading="categoryLoading"
          >
            <a-option v-for="item in categoryList" :key="item.id" :value="item.id">
              {{ item.categoryName }}
            </a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="icon" label="设备图标">
          <a-input v-model="formData.icon" placeholder="请输入图标URL"/>
        </a-form-item>
        <a-form-item field="status" label="状态">
          <a-radio-group v-model="formData.status" type="button">
            <a-radio :value="0">正常</a-radio>
            <a-radio :value="1">不可用</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 在 EquipmentManage.vue 的末尾，新增/编辑设备弹窗之后添加 -->
    <!-- 设备移入/移出/报废弹窗 -->
    <a-modal
        :visible="moveModalVisible"
        :title="getMoveModalTitle()"
        @ok="handleMoveOk"
        @cancel="moveModalVisible = false"
        :ok-loading="moveLoading"
        :width="800"
    >
      <template v-if="moveType === 'in'">
        <a-alert type="info" show-icon style="margin-bottom: 16px">
          请选择目标会议室
        </a-alert>

        <!-- 会议室搜索区域 -->
        <a-row :gutter="16" style="margin-bottom: 16px">
          <a-col :span="8">
            <a-input
                v-model="roomSearchParams.roomName"
                placeholder="会议室名称"
                allow-clear
                @change="onRoomSearch"
            >
              <template #prefix><icon-search /></template>
            </a-input>
          </a-col>
          <a-col :span="8">
            <a-input
                v-model="roomSearchParams.building"
                placeholder="楼栋"
                allow-clear
                @change="onRoomSearch"
            />
          </a-col>
        </a-row>

        <!-- 会议室列表表格 -->
        <a-table
            :columns="roomColumns"
            :data="filteredRoomList"
            :pagination="roomPagination"
            @page-change="onRoomPageChange"
            @page-size-change="onRoomPageSizeChange"
            :loading="roomLoading"
            row-key="id"
            :row-selection="roomRowSelection"
            v-model:selectedKeys="selectedRoomKeys"
            :scroll="{ y: 300 }"
        >
          <template #columns>
            <a-table-column title="会议室ID" data-index="id" :width="80" />
            <a-table-column title="会议室名称" data-index="roomName" :width="150" />
            <a-table-column title="位置" data-index="locationDesc" :width="200" />
            <a-table-column title="容纳人数" data-index="capacity" :width="100" />
            <a-table-column title="状态" :width="100">
              <template #cell="{ record }">
                <a-tag :color="record.status === 0 ? 'green' : 'orange'">
                  {{ record.status === 0 ? '可用' : '维护中' }}
                </a-tag>
              </template>
            </a-table-column>
          </template>
        </a-table>
      </template>

      <template v-else-if="moveType === 'out'">
        <a-alert type="warning" show-icon>
          确定要将设备 "{{ currentEquipment?.equipmentName }}" 从当前会议室移出吗？
        </a-alert>
      </template>

      <template v-else-if="moveType === 'scrap'">
        <a-alert type="error" show-icon>
          确定要报废设备 "{{ currentEquipment?.equipmentName }}" 吗？此操作不可恢复！
        </a-alert>
      </template>

      <a-form-item v-if="moveType !== 'in'" label="备注" style="margin-top: 16px">
        <a-textarea v-model="moveRemark" placeholder="请输入备注（可选）" :max-length="500" />
      </a-form-item>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import {onMounted, reactive, ref} from 'vue';
import {Message, Modal} from '@arco-design/web-vue';
import {
  IconDelete,
  IconEdit,
  IconExport,
  IconHistory,
  IconMore,
  IconPause,
  IconPlayArrow,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconTag
} from '@arco-design/web-vue/es/icon';
import {useRouter} from 'vue-router';
import type {
  EquipmentAddRequest,
  EquipmentMoveRequest,
  EquipmentQueryRequest,
  EquipmentUpdateRequest,
  EquipmentVO
} from '../../../generated';
import {
  AdminEquipmentCategoryControllerService,
  AdminEquipmentControllerService,
  AdminRoomControllerService
} from '../../../generated';
import AccessEnum from '@/access/accessEnum';
import {useStore} from 'vuex';

const store = useStore();
const router = useRouter();
const dataList = ref<EquipmentVO[]>([]);
const loading = ref(false);
const selectedKeys = ref<number[]>([]);
const roomList = ref<any[]>([]);
const roomLoading = ref(false);
const categoryList = ref<any[]>([]);  // ✅ 新增
const categoryLoading = ref(false);   // ✅ 新增

// 分页
const pagination = ref({
  showTotal: true,
  pageSize: 10,
  current: 1,
  total: 0,
  showJumper: true,
  showPageSize: true,
  pageSizeOptions: [5, 10, 20, 50]
});

// 搜索参数
const searchParams = ref<EquipmentQueryRequest>({
  equipmentName: undefined,
  equipmentCode: undefined,
  categoryId: undefined,  // ✅ 新增
  status: undefined,
  pageSize: 10,
  current: 1
});

// 表格列配置
const columns = [
  {title: '设备ID', dataIndex: 'id', width: 80},
  {title: '设备名称', dataIndex: 'equipmentName', width: 150},
  {title: '设备代码', dataIndex: 'equipmentCode', width: 120},
  {title: '分类', width: 100, slotName: 'category'},  // ✅ 新增
  {title: '图标', dataIndex: 'icon', width: 80, slotName: 'icon'},
  {title: '状态', dataIndex: 'status', width: 100, slotName: 'status'},
  {title: '所在会议室', width: 150, slotName: 'currentRoom'},
  {title: '创建时间', dataIndex: 'createTime', width: 180},
  {title: '操作', width: 250, fixed: 'right', slotName: 'operation'}
];

// 行选择配置
const rowSelection = {
  type: 'checkbox' as const,
  showCheckedAll: true,
  onlyCurrent: false
};

// ✅ 加载设备分类列表
const loadCategoryList = async () => {
  categoryLoading.value = true;
  try {
    const res = await AdminEquipmentCategoryControllerService.listAllCategoriesUsingGet();
    if (res.code === 0) {
      categoryList.value = res.data || [];
    }
  } catch (error) {
    console.error('加载设备分类失败', error);
  } finally {
    categoryLoading.value = false;
  }
};

// 加载设备数据
const loadData = async () => {
  const loginUser = store.state.user.loginUser;
  if (!loginUser || loginUser.role !== AccessEnum.ADMIN) {
    Message.error('请先登录管理员账号');
    await router.push('/user/login');
    return;
  }

  loading.value = true;
  try {
    const res = await AdminEquipmentControllerService.listEquipmentVoByPageUsingPost(searchParams.value);
    if (res.code === 0 && res.data) {
      dataList.value = res.data.records || [];
      pagination.value.total = res.data.total || 0;
    } else {
      Message.error('加载失败: ' + (res.message || '未知错误'));
    }
  } catch (error: any) {
    Message.error('加载失败: ' + error.message);
  } finally {
    loading.value = false;
  }
};

// 会议室搜索参数（不变）
const roomSearchParams = ref({
  roomName: undefined,
  building: undefined,
  status: 0
});

// 会议室列表分页（不变）
const roomPagination = ref({
  showTotal: true,
  pageSize: 5,
  current: 1,
  total: 0,
  showJumper: true
});

// 过滤后的会议室列表（不变）
const filteredRoomList = ref<any[]>([]);

// 选中的会议室（单选）（不变）
const selectedRoomKeys = ref<number[]>([]);

// 会议室表格列（不变）
const roomColumns = [
  {title: '会议室ID', dataIndex: 'id', width: 80},
  {title: '会议室名称', dataIndex: 'roomName', width: 150},
  {title: '位置', dataIndex: 'locationDesc', width: 200},
  {title: '容纳人数', dataIndex: 'capacity', width: 100},
  {title: '状态', width: 100, slotName: 'status'}
];

// 会议室行选择配置（单选）（不变）
const roomRowSelection = {
  type: 'radio' as const,
  showCheckedAll: false,
  onlyCurrent: true
};

// 加载会议室列表（带分页和搜索）（不变）
const loadRoomListForMove = async () => {
  roomLoading.value = true;
  try {
    const res = await AdminRoomControllerService.listRoomVoByPageUsingPost({
      ...roomSearchParams.value,
      current: roomPagination.value.current,
      pageSize: roomPagination.value.pageSize
    });
    console.log("加载会议室列表:", res);
    if (res.code === 0 && res.data) {
      filteredRoomList.value = res.data.records || [];
      roomPagination.value.total = res.data.total || 0;
    } else {
      Message.error('加载会议室列表失败');
    }
  } catch (error: any) {
    Message.error('加载会议室列表失败: ' + error.message);
  } finally {
    roomLoading.value = false;
  }
};

// 会议室搜索（不变）
const onRoomSearch = () => {
  roomPagination.value.current = 1;
  loadRoomListForMove();
};

// 会议室页码变化（不变）
const onRoomPageChange = (page: number) => {
  roomPagination.value.current = page;
  loadRoomListForMove();
};

// 会议室每页条数变化（不变）
const onRoomPageSizeChange = (pageSize: number) => {
  roomPagination.value.pageSize = pageSize;
  roomPagination.value.current = 1;
  loadRoomListForMove();
};

// 加载会议室列表（用于移入选择）（不变）
const loadRoomList = async () => {
  roomLoading.value = true;
  try {
    const res = await AdminRoomControllerService.listAllAvailableRoomsUsingGet();
    if (res.code === 0) {
      roomList.value = res.data || [];
    }
  } catch (error: any) {
    Message.error('加载会议室列表失败: ' + error.message);
  } finally {
    roomLoading.value = false;
  }
};

// 搜索
const onSearch = () => {
  pagination.value.current = 1;
  searchParams.value.current = 1;
  loadData();
};

// 重置搜索
const onReset = () => {
  searchParams.value = {
    equipmentName: undefined,
    equipmentCode: undefined,
    categoryId: undefined,  // ✅ 新增
    status: undefined,
    pageSize: 10,
    current: 1
  };
  pagination.value.current = 1;
  loadData();
};

// 页码变化
const onPageChange = (page: number) => {
  pagination.value.current = page;
  searchParams.value.current = page;
  loadData();
};

// 每页条数变化
const onPageSizeChange = (pageSize: number) => {
  pagination.value.pageSize = pageSize;
  searchParams.value.pageSize = pageSize;
  pagination.value.current = 1;
  searchParams.value.current = 1;
  loadData();
};

// 新增/编辑设备弹窗相关
const modalVisible = ref(false);
const modalTitle = ref('');
const modalType = ref<'add' | 'edit'>('add');
const modalLoading = ref(false);
const formRef = ref();
const formData = reactive<EquipmentAddRequest & { id?: number }>({
  id: undefined,
  equipmentName: '',
  equipmentCode: '',
  categoryId: undefined,  // ✅ 新增
  icon: '',
  status: 0
});

const formRules = {
  equipmentName: [
    {required: true, message: '设备名称不能为空'},
    {maxLength: 50, message: '设备名称不能超过50个字符'}
  ],
  equipmentCode: [
    {required: true, message: '设备代码不能为空'},
    {maxLength: 50, message: '设备代码不能超过50个字符'}
  ],
  categoryId: [  // ✅ 新增
    {required: true, message: '请选择设备分类'}
  ]
};

// 新增设备
const onAdd = () => {
  modalType.value = 'add';
  modalTitle.value = '新增设备';
  Object.assign(formData, {
    id: undefined,
    equipmentName: '',
    equipmentCode: '',
    categoryId: undefined,  // ✅ 新增
    icon: '',
    status: 0
  });
  modalVisible.value = true;
};

// 编辑设备
const onEdit = (record: EquipmentVO) => {
  modalType.value = 'edit';
  modalTitle.value = '编辑设备';
  Object.assign(formData, {
    id: record.id,
    equipmentName: record.equipmentName,
    equipmentCode: record.equipmentCode,
    categoryId: record.categoryId,  // ✅ 新增
    icon: record.icon,
    status: record.status
  });
  modalVisible.value = true;
};

// 弹窗确定
const handleModalOk = async () => {
  const errors = await formRef.value?.validate();
  if (errors) return;

  modalLoading.value = true;
  try {
    let res;
    if (modalType.value === 'add') {
      res = await AdminEquipmentControllerService.addEquipmentUsingPost(formData);
    } else {
      const originalRecord = dataList.value.find(item => item.id === formData.id);

      if (originalRecord && originalRecord.status !== formData.status) {
        res = await AdminEquipmentControllerService.updateEquipmentStatusUsingPost({
          id: formData.id!,
          status: formData.status,
          remark: formData.status === 0 ? '通过编辑恢复可用' : '通过编辑设为不可用'
        });
      } else {
        const updateData: EquipmentUpdateRequest = {
          id: formData.id!,
          equipmentName: formData.equipmentName,
          equipmentCode: formData.equipmentCode,
          categoryId: formData.categoryId,  // ✅ 新增
          icon: formData.icon,
          status: formData.status
        };
        res = await AdminEquipmentControllerService.updateEquipmentUsingPost(updateData);
      }
    }

    if (res.code === 0) {
      Message.success(modalType.value === 'add' ? '新增成功' : '更新成功');
      modalVisible.value = false;
      loadData();
    } else {
      Message.error(res.message || '操作失败');
    }
  } catch (error: any) {
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

// 删除单个设备（不变）
const onDelete = (record: EquipmentVO) => {
  Modal.warning({
    title: '确认删除',
    content: `确定要删除设备 "${record.equipmentName}" 吗？`,
    hideCancel: false,
    okButtonProps: {status: 'danger'},
    onOk: async () => {
      try {
        const res = await AdminEquipmentControllerService.deleteEquipmentUsingPost({id: record.id!});
        if (res.code === 0) {
          Message.success('删除成功');
          loadData();
        } else {
          Message.error(res.message || '删除失败');
        }
      } catch (error: any) {
        Message.error('删除失败: ' + error.message);
      }
    }
  });
};

// 批量删除（不变）
const onBatchDelete = () => {
  if (selectedKeys.value.length === 0) return;

  Modal.warning({
    title: '确认批量删除',
    content: `确定要删除选中的 ${selectedKeys.value.length} 个设备吗？`,
    onOk: async () => {
      try {
        const res = await AdminEquipmentControllerService.batchDeleteEquipmentUsingPost({
          ids: selectedKeys.value
        });
        if (res.code === 0) {
          Message.success(`成功删除 ${selectedKeys.value.length} 个设备`);
          selectedKeys.value = [];
          loadData();
        } else {
          Message.error(res.message || '批量删除失败');
        }
      } catch (error: any) {
        Message.error('批量删除失败: ' + error.message);
      }
    }
  });
};

// 更多操作（不变）
const currentEquipment = ref<EquipmentVO>();
const moveModalVisible = ref(false);
const moveLoading = ref(false);
const moveType = ref<'in' | 'out' | 'scrap'>('in');
const getMoveModalTitle = () => {
  switch (moveType.value) {
    case 'in': return '移入会议室';
    case 'out': return '移出会议室';
    case 'scrap': return '报废设备';
    default: return '操作';
  }
};
const targetRoomId = ref<number>();
const moveRemark = ref('');

const onMoreAction = (key: string, record: EquipmentVO) => {
  currentEquipment.value = record;

  switch (key) {
    case 'move':
      moveType.value = record.currentRoom ? 'out' : 'in';
      if (moveType.value === 'in') {
        selectedRoomKeys.value = [];
        roomSearchParams.value = {roomName: undefined, building: undefined, status: 0};
        roomPagination.value.current = 1;
        loadRoomListForMove();
      }
      moveRemark.value = '';
      moveModalVisible.value = true;
      break;
    case 'maintain':
      handleMaintain(record);
      break;
    case 'recover':
      handleRecover(record);
      break;
    case 'scrap':
      moveType.value = 'scrap';
      moveRemark.value = '';
      moveModalVisible.value = true;
      break;
  }
};

// 恢复可用
const handleRecover = (record: EquipmentVO) => {
  Modal.info({
    title: '确认恢复',
    content: `确定将设备 "${record.equipmentName}" 恢复为可用状态吗？`,
    onOk: async () => {
      try {
        const res = await AdminEquipmentControllerService.updateEquipmentStatusUsingPost({
          id: record.id!,
          status: 0,
          remark: '维修完成，恢复可用'
        });
        if (res.code === 0) {
          Message.success('设备已恢复可用');
          loadData();
        } else {
          Message.error(res.message || '操作失败');
        }
      } catch (error: any) {
        Message.error('操作失败: ' + error.message);
      }
    }
  });
};

// 设为维修
const handleMaintain = (record: EquipmentVO) => {
  Modal.warning({
    title: '确认设为维修',
    content: `确定将设备 "${record.equipmentName}" 设为维修状态吗？`,
    onOk: async () => {
      try {
        const res = await AdminEquipmentControllerService.updateEquipmentStatusUsingPost({
          id: record.id!,
          status: 1,
          remark: '设为维修状态'
        });
        if (res.code === 0) {
          Message.success('已设为维修状态');
          loadData();
        } else {
          Message.error(res.message || '操作失败');
        }
      } catch (error: any) {
        Message.error('操作失败: ' + error.message);
      }
    }
  });
};

// 设备移入/移出/报废确定
const handleMoveOk = async () => {
  if (!currentEquipment.value?.id) return;

  if (moveType.value === 'in' && selectedRoomKeys.value.length === 0) {
    Message.warning('请选择目标会议室');
    return;
  }

  moveLoading.value = true;
  try {
    let res;
    const moveRequest: EquipmentMoveRequest = {
      id: currentEquipment.value.id,
      remark: moveRemark.value || undefined
    };

    if (moveType.value === 'in') {
      moveRequest.targetRoomId = selectedRoomKeys.value[0];
      res = await AdminEquipmentControllerService.moveEquipmentInUsingPost(moveRequest);
    } else if (moveType.value === 'out') {
      res = await AdminEquipmentControllerService.moveEquipmentOutUsingPost(moveRequest);
    } else {
      res = await AdminEquipmentControllerService.scrapEquipmentUsingPost(moveRequest);
    }

    if (res.code === 0) {
      Message.success('操作成功');
      moveModalVisible.value = false;
      loadData();
    } else {
      Message.error(res.message || '操作失败');
    }
  } catch (error: any) {
    Message.error('操作失败: ' + error.message);
  } finally {
    moveLoading.value = false;
  }
};

// 初始化
onMounted(() => {
  loadCategoryList();  // ✅ 先加载分类
  loadData();
  loadRoomList();
});
</script>

<style scoped lang="less">
#equipmentManageView {
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

  .text-muted {
    color: var(--color-text-3);
  }
}
</style>
