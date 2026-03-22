<template>
  <div id="roomManageView">
    <!-- 操作按钮区域 -->
    <div class="operation-bar">
      <a-space>
        <a-button type="primary" @click="onAdd">
          <template #icon>
            <icon-plus />
          </template>
          新增会议室
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
      <a-form-item field="roomName" label="会议室名称">
        <a-input v-model="searchParams.roomName" placeholder="请输入会议室名称" allow-clear />
      </a-form-item>
      <a-form-item field="building" label="楼栋">
        <a-input v-model="searchParams.building" placeholder="请输入楼栋" allow-clear />
      </a-form-item>
      <a-form-item field="floor" label="楼层">
        <a-input-number v-model="searchParams.floor" placeholder="请输入楼层" allow-clear />
      </a-form-item>
      <a-form-item field="status" label="状态">
        <a-select v-model="searchParams.status" placeholder="请选择状态" allow-clear style="width: 120px">
          <a-option :value="0">可用</a-option>
          <a-option :value="1">维护中</a-option>
          <a-option :value="2">被占用</a-option>
        </a-select>
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

    <!-- 会议室列表 -->
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
        <a-table-column title="会议室ID" data-index="id" :width="100" />
        <a-table-column title="会议室名称" data-index="roomName" :width="150" />
        <a-table-column title="位置" data-index="locationDesc" :width="160" />
        <a-table-column title="容纳人数" data-index="capacity" :width="100" />
        <a-table-column title="状态" data-index="status" :width="80">
          <template #cell="{ record }">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>
        </a-table-column>
        <a-table-column title="设备" data-index="equipment" :width="200">
          <template #cell="{ record }">
            <a-space wrap>
              <a-tag v-for="eq in record.equipmentList" :key="eq.id" size="small" color="arcoblue">
                {{ eq.equipmentName }}
              </a-tag>
              <span v-if="!record.equipmentList?.length" class="no-equipment">-</span>
            </a-space>
          </template>
        </a-table-column>
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
                  <a-doption value="equipment">
                    <icon-tool />
                    设备管理
                  </a-doption>
                  <a-doption value="schedule">
                    <icon-calendar />
                    查看日程
                  </a-doption>
                  <a-doption v-if="record.status === 0" value="maintain">
                    <icon-pause />
                    设为维护
                  </a-doption>
                  <a-doption v-else-if="record.status === 1" value="enable">
                    <icon-play-arrow />
                    设为可用
                  </a-doption>
                </template>
              </a-dropdown>
            </a-space>
          </template>
        </a-table-column>
      </template>
    </a-table>

    <!-- 新增/编辑会议室弹窗 -->
    <a-modal
        :visible="modalVisible"
        :title="modalTitle"
        @ok="handleModalOk"
        @cancel="handleModalCancel"
        :mask-closable="false"
        :ok-loading="modalLoading"
        :width="800"
    >
      <a-form :model="formData" :rules="formRules" ref="formRef" auto-label-width>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="roomName" label="会议室名称" required>
              <a-input v-model="formData.roomName" placeholder="请输入会议室名称" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="capacity" label="容纳人数" required>
              <a-input-number v-model="formData.capacity" placeholder="请输入容纳人数" :min="1" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item field="building" label="楼栋" required>
              <a-input v-model="formData.building" placeholder="请输入楼栋" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item field="floor" label="楼层" required>
              <a-input-number v-model="formData.floor" placeholder="请输入楼层" :min="1" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item field="roomNumber" label="房间号" required>
              <a-input v-model="formData.roomNumber" placeholder="请输入房间号" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item field="description" label="会议室描述">
          <a-textarea v-model="formData.description" placeholder="请输入会议室描述" :max-length="500" show-word-limit :auto-size="{ minRows: 3, maxRows: 5 }" />
        </a-form-item>
        <a-form-item field="imageUrl" label="会议室图片">
          <a-input v-model="formData.imageUrl" placeholder="请输入图片URL" />
        </a-form-item>

        <!-- 设备选择区域 - 增加筛选功能 -->
        <a-form-item label="设备筛选">
          <a-row :gutter="16">
            <a-col :span="8">
              <a-input
                  v-model="equipmentSearchKeyword"
                  placeholder="按设备名称搜索"
                  allow-clear
                  @change="onEquipmentSearch"
              >
                <template #prefix><icon-search /></template>
              </a-input>
            </a-col>
            <a-col :span="8">
              <a-select
                  v-model="equipmentCategoryFilter"
                  placeholder="按分类筛选"
                  allow-clear
                  @change="onEquipmentCategoryFilterChange"
              >
                <a-option v-for="cat in categoryList" :key="cat.id" :value="cat.id">
                  {{ cat.categoryName }}
                </a-option>
              </a-select>
            </a-col>
            <a-col :span="8">
              <a-select
                  v-model="equipmentStatusFilter"
                  placeholder="按状态筛选"
                  allow-clear
                  @change="onEquipmentStatusFilterChange"
              >
                <a-option :value="0">正常</a-option>
                <a-option :value="1">不可用</a-option>
              </a-select>
            </a-col>
          </a-row>
        </a-form-item>

        <a-form-item field="equipmentIds" label="设备配置">
          <a-select
              v-model="formData.equipmentIds"
              placeholder="请选择设备"
              multiple
              :loading="equipmentLoading"
              allow-clear
              allow-search
              :filter-option="filterEquipmentOption"
          >
            <template #empty>
              <a-empty description="暂无可用设备" />
            </template>
            <a-option v-for="item in filteredEquipmentList" :key="item.id" :value="item.id">
              <a-space>
                <icon-tool />
                {{ item.equipmentName }}
                <span class="text-muted">({{ item.equipmentCode }})</span>
                <a-tag v-if="item.status === 1" size="small" color="red">不可用</a-tag>
                <a-tag v-if="item.categoryName" size="small" color="arcoblue">{{ item.categoryName }}</a-tag>
              </a-space>
            </a-option>
          </a-select>
          <template #extra>
            <span class="text-muted">支持搜索设备名称，可按分类和状态筛选</span>
          </template>
        </a-form-item>

        <a-form-item field="status" label="状态">
          <a-radio-group v-model="formData.status" type="button">
            <a-radio :value="0">可用</a-radio>
            <a-radio :value="1">维护中</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 设备管理弹窗 -->
    <a-modal
        :visible="equipmentModalVisible"
        title="会议室设备管理"
        @ok="handleEquipmentModalOk"
        @cancel="handleEquipmentModalCancel"
        :ok-loading="equipmentModalLoading"
        :width="900"
        :mask-closable="false"
    >
      <a-alert type="info" show-icon style="margin-bottom: 16px">
        为 "{{ currentRoom?.roomName }}" 配置设备（勾选表示设备放入此会议室）
      </a-alert>

      <!-- 设备搜索区域 -->
      <a-row :gutter="16" style="margin-bottom: 16px">
        <a-col :span="6">
          <a-input
              v-model="equipmentSearchParams.equipmentName"
              placeholder="设备名称"
              allow-clear
              @change="onEquipmentSearchForModal"
          >
            <template #prefix><icon-search /></template>
          </a-input>
        </a-col>
        <a-col :span="6">
          <a-input
              v-model="equipmentSearchParams.equipmentCode"
              placeholder="设备代码"
              allow-clear
              @change="onEquipmentSearchForModal"
          >
            <template #prefix><icon-search /></template>
          </a-input>
        </a-col>
        <a-col :span="6">
          <a-select
              v-model="equipmentSearchParams.categoryId"
              placeholder="设备分类"
              allow-clear
              style="width: 100%"
              @change="onEquipmentSearchForModal"
          >
            <a-option v-for="cat in categoryList" :key="cat.id" :value="cat.id">
              {{ cat.categoryName }}
            </a-option>
          </a-select>
        </a-col>
        <a-col :span="6">
          <a-select
              v-model="equipmentSearchParams.status"
              placeholder="设备状态"
              allow-clear
              style="width: 100%"
              @change="onEquipmentSearchForModal"
          >
            <a-option :value="0">正常</a-option>
            <a-option :value="1">不可用</a-option>
          </a-select>
        </a-col>
      </a-row>

      <!-- 设备列表表格（可勾选） -->
      <a-table
          :columns="equipmentColumns"
          :data="filteredEquipmentListForModal"
          :pagination="equipmentPagination"
          @page-change="onEquipmentPageChange"
          @page-size-change="onEquipmentPageSizeChange"
          :loading="equipmentLoading"
          row-key="id"
          :row-selection="equipmentRowSelection"
          v-model:selectedKeys="selectedEquipment"
          :scroll="{ y: 350 }"
      >
        <template #columns>
          <a-table-column title="设备ID" data-index="id" :width="70" />
          <a-table-column title="设备名称" data-index="equipmentName" :width="150" />
          <a-table-column title="设备代码" data-index="equipmentCode" :width="120" />
          <a-table-column title="分类" data-index="categoryName" :width="100">
            <template #cell="{ record }">
              <a-tag size="small" color="arcoblue">{{ record.categoryName || '未分类' }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="状态" data-index="status" :width="80">
            <template #cell="{ record }">
              <a-tag :color="record.status === 0 ? 'green' : 'red'" size="small">
                {{ record.status === 0 ? '正常' : '不可用' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="当前所在" :width="150">
            <template #cell="{ record }">
              <span v-if="record.currentRoom">{{ record.currentRoom.roomName }}</span>
              <span v-else class="text-muted">未分配</span>
            </template>
          </a-table-column>
        </template>
      </a-table>

      <template #footer>
        <a-space>
          <a-button @click="equipmentModalVisible = false">取消</a-button>
          <a-button type="primary" @click="handleEquipmentModalOk" :loading="equipmentModalLoading">
            确认配置
          </a-button>
        </a-space>
      </template>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { Message, Modal } from '@arco-design/web-vue';
import {
  IconPlus,
  IconDelete,
  IconSearch,
  IconRefresh,
  IconEdit,
  IconMore,
  IconTool,
  IconCalendar,
  IconPause,
  IconPlayArrow
} from '@arco-design/web-vue/es/icon';
import { useRouter } from "vue-router";
import isLogin from "@/access/isLogin";
import { AdminEquipmentControllerService, AdminRoomControllerService, AdminEquipmentCategoryControllerService } from '../../../generated';
import type {
  RoomAddRequest,
  RoomUpdateRequest,
  RoomQueryRequest,
  RoomVO,
  Equipment,
  EquipmentCategory
} from '../../../generated';

const router = useRouter();
const dataList = ref<RoomVO[]>([]);
const total = ref(0);
const loading = ref(false);
const selectedKeys = ref<number[]>([]);
const equipmentList = ref<Equipment[]>([]);
const equipmentLoading = ref(false);
const currentRoom = ref<RoomVO>();
const selectedEquipment = ref<number[]>([]);
const categoryList = ref<EquipmentCategory[]>([]);
const categoryLoading = ref(false);

// 设备筛选相关
const equipmentSearchKeyword = ref('');
const equipmentCategoryFilter = ref<number>();
const equipmentStatusFilter = ref<number>();

// 分页参数
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
const searchParams = reactive<RoomQueryRequest>({
  roomName: undefined,
  building: undefined,
  floor: undefined,
  status: undefined,
  pageSize: 10,
  current: 1
});

// 表格列配置
const columns = [
  { title: '会议室ID', dataIndex: 'id', width: 100 },
  { title: '会议室名称', dataIndex: 'roomName', width: 150 },
  { title: '位置', dataIndex: 'locationDesc', width: 160 },
  { title: '容纳人数', dataIndex: 'capacity', width: 100 },
  { title: '状态', dataIndex: 'status', width: 80, slotName: 'status' },
  { title: '设备', dataIndex: 'equipment', width: 200, slotName: 'equipment' },
  { title: '创建时间', dataIndex: 'createTime', width: 180 },
  { title: '操作', width: 200, fixed: 'right', slotName: 'operation' }
];

// 行选择配置
const rowSelection = {
  type: 'checkbox' as const,
  showCheckedAll: true,
  onlyCurrent: false
};

// 更多操作
const equipmentModalVisible = ref(false);
const equipmentModalLoading = ref(false);

// 获取状态颜色
const getStatusColor = (status: number): string => {
  switch (status) {
    case 0: return 'green';
    case 1: return 'orange';
    case 2: return 'red';
    default: return 'blue';
  }
};

// 获取状态文本
const getStatusText = (status: number): string => {
  switch (status) {
    case 0: return '可用';
    case 1: return '维护中';
    case 2: return '被占用';
    default: return '未知';
  }
};

// 设备搜索参数
const equipmentSearchParams = ref({
  equipmentName: undefined,
  equipmentCode: undefined,
  categoryId: undefined,
  status: undefined
});

// 设备列表分页
const equipmentPagination = ref({
  showTotal: true,
  pageSize: 10,
  current: 1,
  total: 0,
  showJumper: true
});

// 过滤后的设备列表（用于弹窗中的设备管理）
const filteredEquipmentListForModal = ref<any[]>([]);

// 设备表格列
const equipmentColumns = [
  { title: '设备ID', dataIndex: 'id', width: 70 },
  { title: '设备名称', dataIndex: 'equipmentName', width: 150 },
  { title: '设备代码', dataIndex: 'equipmentCode', width: 120 },
  { title: '分类', width: 100, slotName: 'category' },
  { title: '状态', width: 80, slotName: 'status' },
  { title: '当前所在', width: 150, slotName: 'currentRoom' }
];

// 设备行选择配置
const equipmentRowSelection = {
  type: 'checkbox' as const,
  showCheckedAll: true,
  onlyCurrent: false
};

// 筛选后的设备列表（用于编辑弹窗中的设备选择）
const filteredEquipmentList = computed(() => {
  let filtered = [...equipmentList.value];

  // 按关键词筛选
  if (equipmentSearchKeyword.value) {
    const keyword = equipmentSearchKeyword.value.toLowerCase();
    filtered = filtered.filter(eq =>
        eq.equipmentName?.toLowerCase().includes(keyword) ||
        eq.equipmentCode?.toLowerCase().includes(keyword)
    );
  }

  // 按分类筛选
  if (equipmentCategoryFilter.value) {
    filtered = filtered.filter(eq => eq.categoryId === equipmentCategoryFilter.value);
  }

  // 按状态筛选
  if (equipmentStatusFilter.value !== undefined) {
    filtered = filtered.filter(eq => eq.status === equipmentStatusFilter.value);
  }

  return filtered;
});

// 设备搜索（编辑弹窗）
const onEquipmentSearch = () => {
  // computed 自动处理，无需额外操作
};

const onEquipmentCategoryFilterChange = () => {
  // computed 自动处理
};

const onEquipmentStatusFilterChange = () => {
  // computed 自动处理
};

// 设备搜索（设备管理弹窗）
const onEquipmentSearchForModal = () => {
  equipmentPagination.value.current = 1;
  loadEquipmentListForModal();
};

// 设备筛选选项
const filterEquipmentOption = (inputValue: string, option: any) => {
  return option.label?.toLowerCase().indexOf(inputValue.toLowerCase()) > -1;
};

// 加载设备分类列表
const loadCategoryList = async () => {
  try {
    const res = await AdminEquipmentCategoryControllerService.listAllCategoriesUsingGet();
    if (res.code === 0) {
      categoryList.value = res.data || [];
    }
  } catch (error) {
    console.error('加载设备分类失败', error);
  }
};

// 加载所有设备列表（用于编辑弹窗，加载所有可用设备）
const loadEquipmentList = async () => {
  equipmentLoading.value = true;
  try {
    // 先尝试获取所有可用设备
    const res = await AdminEquipmentControllerService.listAllAvailableEquipmentUsingGet();
    if (res.code === 0 && res.data) {
      equipmentList.value = res.data;
    } else {
      // 如果上面的接口不行，改用分页接口获取全部
      const pageRes = await AdminEquipmentControllerService.listEquipmentVoByPageUsingPost({
        pageSize: 999,
        current: 1
      });
      if (pageRes.code === 0 && pageRes.data) {
        equipmentList.value = pageRes.data.records || [];
      } else {
        Message.error('加载设备列表失败');
        equipmentList.value = [];
      }
    }
  } catch (error: any) {
    console.error('加载设备列表失败:', error);
    equipmentList.value = [];
  } finally {
    equipmentLoading.value = false;
  }
};

// 加载设备列表（用于设备管理弹窗，带分页和搜索）
const loadEquipmentListForModal = async () => {
  equipmentLoading.value = true;
  try {
    const res = await AdminEquipmentControllerService.listEquipmentVoByPageUsingPost({
      ...equipmentSearchParams.value,
      current: equipmentPagination.value.current,
      pageSize: equipmentPagination.value.pageSize
    });
    if (res.code === 0 && res.data) {
      filteredEquipmentListForModal.value = res.data.records || [];
      equipmentPagination.value.total = res.data.total || 0;
    } else {
      Message.error('加载设备列表失败');
    }
  } catch (error: any) {
    Message.error('加载设备列表失败: ' + error.message);
  } finally {
    equipmentLoading.value = false;
  }
};

// 设备页码变化
const onEquipmentPageChange = (page: number) => {
  equipmentPagination.value.current = page;
  loadEquipmentListForModal();
};

// 设备每页条数变化
const onEquipmentPageSizeChange = (pageSize: number) => {
  equipmentPagination.value.pageSize = pageSize;
  equipmentPagination.value.current = 1;
  loadEquipmentListForModal();
};

// 弹窗取消
const handleEquipmentModalCancel = () => {
  equipmentModalVisible.value = false;
  selectedEquipment.value = [];
};

// 加载会议室数据
const loadData = async () => {
  if (!isLogin()) {
    await router.push({ path: "/user/login" });
    return;
  }

  loading.value = true;
  try {
    const result = await AdminRoomControllerService.listRoomVoByPageUsingPost(searchParams);
    console.log('会议室列表加载结果:', result);

    if (result.code === 0 && result.data) {
      dataList.value = result.data.records || [];
      total.value = Number(result.data.total) || 0;
      pagination.value.total = total.value;
    } else {
      Message.error("加载失败: " + (result.message || '未知错误'));
    }
  } catch (error: any) {
    Message.error("加载失败: " + error.message);
    console.error('加载会议室列表失败:', error);
  } finally {
    loading.value = false;
  }
};

// 搜索
const onSearch = () => {
  searchParams.current = 1;
  pagination.value.current = 1;
  loadData();
};

// 重置搜索
const onReset = () => {
  Object.assign(searchParams, {
    roomName: undefined,
    building: undefined,
    floor: undefined,
    status: undefined,
    pageSize: 10,
    current: 1
  });
  pagination.value.current = 1;
  loadData();
};

// 页码变化
const onPageChange = (page: number) => {
  searchParams.current = page;
  pagination.value.current = page;
  loadData();
};

// 每页条数变化
const onPageSizeChange = (pageSize: number) => {
  searchParams.pageSize = pageSize;
  searchParams.current = 1;
  pagination.value.current = 1;
  pagination.value.pageSize = pageSize;
  loadData();
};

// 新增/编辑弹窗相关
const modalVisible = ref(false);
const modalTitle = ref('');
const modalType = ref<'add' | 'edit'>('add');
const modalLoading = ref(false);
const formRef = ref();
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

// 新增会议室
const onAdd = () => {
  modalType.value = 'add';
  modalTitle.value = '新增会议室';
  Object.assign(formData, {
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
  // 重置筛选条件
  equipmentSearchKeyword.value = '';
  equipmentCategoryFilter.value = undefined;
  equipmentStatusFilter.value = undefined;
  modalVisible.value = true;
};

// 编辑会议室
const onEdit = (record: RoomVO) => {
  modalType.value = 'edit';
  modalTitle.value = '编辑会议室';
  Object.assign(formData, {
    id: record.id,
    roomName: record.roomName,
    building: record.building,
    floor: record.floor,
    roomNumber: record.roomNumber,
    capacity: record.capacity,
    description: record.description,
    imageUrl: record.imageUrl,
    status: record.status,
    equipmentIds: record.equipmentList?.map((e: Equipment) => e.id!) || []
  });
  // 重置筛选条件
  equipmentSearchKeyword.value = '';
  equipmentCategoryFilter.value = undefined;
  equipmentStatusFilter.value = undefined;
  modalVisible.value = true;
};

// 弹窗确定
const handleModalOk = async () => {
  const errors = await formRef.value?.validate();
  if (errors) {
    Message.error('请完善表单信息');
    return;
  }

  modalLoading.value = true;
  try {
    let result;
    if (modalType.value === 'add') {
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
      result = await AdminRoomControllerService.addRoomUsingPost(addRequest);
    } else {
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
      result = await AdminRoomControllerService.updateRoomUsingPost(updateRequest);
    }

    if (result.code === 0) {
      Message.success(modalType.value === 'add' ? '新增成功' : '更新成功');
      modalVisible.value = false;
      loadData();
    } else {
      Message.error(result.message || '操作失败');
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

// 删除单个会议室
const onDelete = (record: RoomVO) => {
  Modal.warning({
    title: '确认删除',
    content: `确定要删除会议室 "${record.roomName}" 吗？删除后不可恢复！`,
    hideCancel: false,
    okButtonProps: { status: 'danger' },
    onOk: async () => {
      try {
        const result = await AdminRoomControllerService.deleteRoomUsingPost({ id: record.id! });
        if (result.code === 0) {
          Message.success('删除成功');
          loadData();
        } else {
          Message.error(result.message || '删除失败');
        }
      } catch (error: any) {
        Message.error('删除失败: ' + error.message);
      }
    }
  });
};

// 批量删除
const onBatchDelete = () => {
  if (selectedKeys.value.length === 0) {
    Message.warning('请选择要删除的会议室');
    return;
  }

  Modal.warning({
    title: '确认批量删除',
    content: `确定要删除选中的 ${selectedKeys.value.length} 个会议室吗？删除后不可恢复！`,
    hideCancel: false,
    okButtonProps: { status: 'danger' },
    onOk: async () => {
      try {
        const result = await AdminRoomControllerService.batchDeleteRoomUsingPost({ ids: selectedKeys.value });
        if (result.code === 0) {
          Message.success(`成功删除 ${selectedKeys.value.length} 个会议室`);
          selectedKeys.value = [];
          loadData();
        } else {
          Message.error(result.message || '批量删除失败');
        }
      } catch (error: any) {
        Message.error('批量删除失败: ' + error.message);
      }
    }
  });
};

// 设备管理弹窗确定
const handleEquipmentModalOk = async () => {
  if (!currentRoom.value?.id) return;

  equipmentModalLoading.value = true;
  try {
    // 获取原来的设备ID列表
    const oldEquipmentIds = currentRoom.value.equipmentList?.map((e: Equipment) => e.id!) || [];
    const newEquipmentIds = selectedEquipment.value;

    // 找出新增的设备（在new中但不在old中）
    const addedIds = newEquipmentIds.filter(id => !oldEquipmentIds.includes(id));

    // 找出移除的设备（在old中但不在new中）
    const removedIds = oldEquipmentIds.filter(id => !newEquipmentIds.includes(id));

    // 如果没有变化，直接返回
    if (addedIds.length === 0 && removedIds.length === 0) {
      equipmentModalVisible.value = false;
      Message.info('设备配置未发生变化');
      return;
    }

    // 批量处理新增的设备（移入会议室）
    for (const equipmentId of addedIds) {
      try {
        await AdminEquipmentControllerService.moveEquipmentInUsingPost({
          id: equipmentId,
          targetRoomId: currentRoom.value.id,
          remark: `通过会议室【${currentRoom.value.roomName}】的设备管理功能移入`
        });
      } catch (error: any) {
        console.error(`设备 ${equipmentId} 移入失败:`, error);
        Message.error(`部分设备移入失败: ${error.message}`);
      }
    }

    // 批量处理移除的设备（移出会议室）
    for (const equipmentId of removedIds) {
      try {
        await AdminEquipmentControllerService.moveEquipmentOutUsingPost({
          id: equipmentId,
          remark: `通过会议室【${currentRoom.value.roomName}】的设备管理功能移出`
        });
      } catch (error: any) {
        console.error(`设备 ${equipmentId} 移出失败:`, error);
        Message.error(`部分设备移出失败: ${error.message}`);
      }
    }

    // 最后再调用一次更新关联关系（确保一致）
    const result = await AdminRoomControllerService.updateRoomEquipmentUsingPost({
      roomId: currentRoom.value.id,
      equipmentIds: newEquipmentIds
    });

    if (result.code === 0) {
      Message.success(`设备配置更新成功，新增${addedIds.length}个，移除${removedIds.length}个`);
      equipmentModalVisible.value = false;
      loadData(); // 刷新列表
    } else {
      Message.error(result.message || '更新失败');
    }
  } catch (error: any) {
    Message.error('操作失败: ' + error.message);
  } finally {
    equipmentModalLoading.value = false;
  }
};

// 设为维护
const handleMaintainRoom = (record: RoomVO) => {
  Modal.warning({
    title: '确认设为维护',
    content: `确定将会议室 "${record.roomName}" 设为维护状态吗？`,
    onOk: async () => {
      try {
        const result = await AdminRoomControllerService.updateRoomStatusUsingPost({
          id: record.id!,
          status: 1
        });
        if (result.code === 0) {
          Message.success('已设为维护状态');
          loadData();
        } else {
          Message.error(result.message || '操作失败');
        }
      } catch (error: any) {
        Message.error('操作失败: ' + error.message);
      }
    }
  });
};

// 设为可用
const handleEnableRoom = (record: RoomVO) => {
  Modal.info({
    title: '确认设为可用',
    content: `确定将会议室 "${record.roomName}" 设为可用状态吗？`,
    onOk: async () => {
      try {
        const result = await AdminRoomControllerService.updateRoomStatusUsingPost({
          id: record.id!,
          status: 0
        });
        if (result.code === 0) {
          Message.success('已设为可用状态');
          loadData();
        } else {
          Message.error(result.message || '操作失败');
        }
      } catch (error: any) {
        Message.error('操作失败: ' + error.message);
      }
    }
  });
};

const onMoreAction = (key: string, record: RoomVO) => {
  currentRoom.value = record;

  switch (key) {
    case 'equipment':
      selectedEquipment.value = record.equipmentList?.map((e: Equipment) => e.id!) || [];
      // 重置搜索条件
      equipmentSearchParams.value = {
        equipmentName: undefined,
        equipmentCode: undefined,
        categoryId: undefined,
        status: undefined
      };
      equipmentPagination.value.current = 1;
      loadEquipmentListForModal();
      equipmentModalVisible.value = true;
      break;
    case 'schedule':
      router.push(`/admin/booking?roomId=${record.id}`);
      break;
    case 'maintain':
      handleMaintainRoom(record);
      break;
    case 'enable':
      handleEnableRoom(record);
      break;
  }
};

// 初始化加载
onMounted(() => {
  loadData();
  loadEquipmentList();
  loadCategoryList();
});
</script>

<style scoped lang="less">
#roomManageView {
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

  .no-equipment {
    color: var(--color-text-3);
    font-size: 12px;
  }

  .text-muted {
    color: var(--color-text-3);
    font-size: 12px;
  }
}
</style>
