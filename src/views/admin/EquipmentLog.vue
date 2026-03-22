<template>
  <div id="equipmentLogView">
    <!-- 操作按钮区域 -->
    <div class="operation-bar">
      <a-space>
        <a-button @click="router.push('/admin/equipment')">
          <template #icon><icon-arrow-left /></template>
          返回设备列表
        </a-button>
        <a-button type="primary" @click="onExport">
          <template #icon><icon-download /></template>
          导出日志
        </a-button>
      </a-space>
    </div>

    <!-- 搜索区域 -->
    <a-form :model="searchParams" layout="inline" class="search-form">
      <a-form-item field="equipmentName" label="设备名称">
        <a-input v-model="searchParams.equipmentName" placeholder="请输入设备名称" allow-clear />
      </a-form-item>
      <a-form-item field="equipmentId" label="设备ID">
        <a-input-number v-model="searchParams.equipmentId" placeholder="请输入设备ID" allow-clear style="width: 150px" />
      </a-form-item>
      <a-form-item field="operatorId" label="操作人ID">
        <a-input-number v-model="searchParams.operatorId" placeholder="请输入操作人ID" allow-clear style="width: 150px" />
      </a-form-item>
      <a-form-item field="operationType" label="操作类型">
        <a-select v-model="searchParams.operationType" placeholder="请选择" allow-clear style="width: 120px">
          <a-option :value="1">新增</a-option>
          <a-option :value="2">移入</a-option>
          <a-option :value="3">移出</a-option>
          <a-option :value="4">维修</a-option>
          <a-option :value="5">报废</a-option>
        </a-select>
      </a-form-item>
      <a-form-item field="dateRange" label="操作时间">
        <a-range-picker v-model="dateRange" style="width: 240px" @change="onDateRangeChange" />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" @click="onSearch">
          <template #icon><icon-search /></template>搜索
        </a-button>
        <a-button @click="onReset">
          <template #icon><icon-refresh /></template>重置
        </a-button>
      </a-form-item>
    </a-form>

    <!-- 日志列表 -->
    <a-table
        :columns="columns"
        :data="dataList"
        :pagination="pagination"
        @page-change="onPageChange"
        @page-size-change="onPageSizeChange"
        :loading="loading"
        row-key="id"
        :bordered="false"
        :stripe="true"
    >
      <template #columns>
        <a-table-column title="日志ID" data-index="id" :width="80" />
        <a-table-column title="设备信息" :width="200">
          <template #cell="{ record }">
            <a-space direction="vertical" size="mini">
              <span>{{ record.equipmentName }} ({{ record.equipmentCode }})</span>
              <span class="text-muted">ID: {{ record.equipmentId }}</span>
            </a-space>
          </template>
        </a-table-column>
        <a-table-column title="操作类型" data-index="operationType" :width="100">
          <template #cell="{ record }">
            <a-tag :color="getOperationTypeColor(record.operationType)">
              {{ getOperationTypeText(record.operationType) }}
            </a-tag>
          </template>
        </a-table-column>
        <a-table-column title="操作人" :width="100">
          <template #cell="{ record }">
            <a-space direction="vertical" size="mini">
              <span>{{ record.operatorName || '未知' }}</span>
              <span class="text-muted">ID: {{ record.operatorId }}</span>
            </a-space>
          </template>
        </a-table-column>
        <a-table-column title="位置变更" :width="250">
          <template #cell="{ record }">
            <a-space>
              <span>{{ record.fromRoomName || '未分配' }}</span>
              <icon-arrow-right style="color: var(--color-text-3)" />
              <span>{{ record.toRoomName || '未分配' }}</span>
            </a-space>
          </template>
        </a-table-column>
        <a-table-column title="状态变更" :width="160">
          <template #cell="{ record }">
            <a-space>
              <a-tag v-if="record.oldStatus !== undefined && record.oldStatus !== null" size="small">
                {{ getStatusText(record.oldStatus) }}
              </a-tag>
              <icon-arrow-right v-if="record.oldStatus !== undefined && record.oldStatus !== null" style="color: var(--color-text-3)" />
              <a-tag v-if="record.newStatus !== undefined && record.newStatus !== null" :color="getStatusColor(record.newStatus)" size="small">
                {{ getStatusText(record.newStatus) }}
              </a-tag>
            </a-space>
          </template>
        </a-table-column>
        <a-table-column title="备注" data-index="remark" :width="200">
          <template #cell="{ record }">
            <span class="text-muted">{{ record.remark || '-' }}</span>
          </template>
        </a-table-column>
        <a-table-column title="操作时间" data-index="createTime" :width="180" sortable />
      </template>
    </a-table>

    <!-- 日志详情弹窗 -->
    <a-modal
        :visible="detailModalVisible"
        title="日志详情"
        @cancel="detailModalVisible = false"
        :footer="false"
        :width="600"
    >
      <a-descriptions v-if="currentLog" :column="1" bordered>
        <a-descriptions-item label="日志ID">{{ currentLog.id }}</a-descriptions-item>
        <a-descriptions-item label="设备名称">{{ currentLog.equipmentName }}</a-descriptions-item>
        <a-descriptions-item label="设备代码">{{ currentLog.equipmentCode }}</a-descriptions-item>
        <a-descriptions-item label="操作类型">{{ getOperationTypeText(currentLog.operationType) }}</a-descriptions-item>
        <a-descriptions-item label="操作人">{{ currentLog.operatorName || '未知' }} (ID: {{ currentLog.operatorId }})</a-descriptions-item>
        <a-descriptions-item label="原位置">{{ currentLog.fromRoomName || '未分配' }}</a-descriptions-item>
        <a-descriptions-item label="新位置">{{ currentLog.toRoomName || '未分配' }}</a-descriptions-item>
        <a-descriptions-item label="原状态">{{ currentLog.oldStatus !== undefined && currentLog.oldStatus !== null ? getStatusText(currentLog.oldStatus) : '-' }}</a-descriptions-item>
        <a-descriptions-item label="新状态">{{ currentLog.newStatus !== undefined && currentLog.newStatus !== null ? getStatusText(currentLog.newStatus) : '-' }}</a-descriptions-item>
        <a-descriptions-item label="备注">{{ currentLog.remark || '-' }}</a-descriptions-item>
        <a-descriptions-item label="操作时间">{{ currentLog.createTime }}</a-descriptions-item>
      </a-descriptions>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { Message } from '@arco-design/web-vue';
import {
  IconArrowLeft,
  IconDownload,
  IconSearch,
  IconRefresh,
  IconArrowRight
} from '@arco-design/web-vue/es/icon';
import { useRouter } from 'vue-router';
import { AdminEquipmentControllerService } from '../../../generated';
import type { EquipmentLogQueryRequest, EquipmentLogVO } from '../../../generated';
import dayjs from 'dayjs';

const router = useRouter();
const dataList = ref<EquipmentLogVO[]>([]);
const loading = ref(false);
const detailModalVisible = ref(false);
const currentLog = ref<EquipmentLog>();

// 日期范围
const dateRange = ref<dayjs.Dayjs[]>([]);

// 搜索参数
const searchParams = ref<EquipmentLogQueryRequest>({
  equipmentName: undefined,
  equipmentId: undefined,
  operatorId: undefined,
  operationType: undefined,
  startTime: undefined,
  endTime: undefined,
  pageSize: 10,
  current: 1
});

// 分页
const pagination = ref({
  showTotal: true,
  pageSize: 10,
  current: 1,
  total: 0,
  showJumper: true,
  showPageSize: true,
  pageSizeOptions: [10, 20, 50, 100]
});

// 表格列配置
const columns = [
  { title: '日志ID', dataIndex: 'id', width: 80 },
  { title: '设备信息', width: 200, slotName: 'equipmentInfo' },
  { title: '操作类型', width: 100, slotName: 'operationType' },
  { title: '操作人', width: 100, slotName: 'operator' },
  { title: '位置变更', width: 250, slotName: 'locationChange' },
  { title: '状态变更', width: 160, slotName: 'statusChange' },
  { title: '备注', width: 200, slotName: 'remark' },
  { title: '操作时间', dataIndex: 'createTime', width: 180, sortable: true }
];

// 操作类型颜色
const getOperationTypeColor = (type: number): string => {
  switch (type) {
    case 1: return 'green';
    case 2: return 'blue';
    case 3: return 'orange';
    case 4: return 'purple';
    case 5: return 'red';
    default: return 'gray';
  }
};

// 操作类型文本
const getOperationTypeText = (type: number): string => {
  switch (type) {
    case 1: return '新增';
    case 2: return '移入';
    case 3: return '移出';
    case 4: return '维修';
    case 5: return '报废';
    default: return '未知';
  }
};

// 状态颜色
const getStatusColor = (status: number): string => {
  switch (status) {
    case 0: return 'green';
    case 1: return 'red';
    default: return 'blue';
  }
};

// 状态文本
const getStatusText = (status: number): string => {
  switch (status) {
    case 0: return '正常';
    case 1: return '不可用';
    default: return '未知';
  }
};

// 日期范围变化
const onDateRangeChange = (date: dayjs.Dayjs[]) => {
  if (date && date.length === 2) {
    searchParams.value.startTime = date[0].format('YYYY-MM-DD HH:mm:ss');
    searchParams.value.endTime = date[1].format('YYYY-MM-DD HH:mm:ss');
  } else {
    searchParams.value.startTime = undefined;
    searchParams.value.endTime = undefined;
  }
};

// 加载数据
const loadData = async () => {
  loading.value = true;
  try {
    const res = await AdminEquipmentControllerService.listEquipmentLogByPageUsingPost(searchParams.value);
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

// 搜索
const onSearch = () => {
  pagination.value.current = 1;
  searchParams.value.current = 1;
  loadData();
};

// 重置
const onReset = () => {
  dateRange.value = [];
  searchParams.value = {
    equipmentName: undefined,
    equipmentId: undefined,
    operatorId: undefined,
    operationType: undefined,
    startTime: undefined,
    endTime: undefined,
    pageSize: 10,
    current: 1
  };
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

// 查看详情
const onViewDetail = (record: EquipmentLog) => {
  currentLog.value = record;
  detailModalVisible.value = true;
};

// 导出日志
const onExport = () => {
  Message.info('正在导出日志...');
  // TODO: 调用导出接口
  // 可以调用后端导出接口，或者前端导出CSV
};

onMounted(() => {
  loadData();
});
</script>

<style scoped lang="less">
#equipmentLogView {
  padding: 20px;

  .operation-bar {
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
  }

  .search-form {
    margin-bottom: 20px;
    padding: 20px;
    background-color: var(--color-bg-2);
    border-radius: 4px;
  }

  .text-muted {
    color: var(--color-text-3);
    font-size: 12px;
  }
}
</style>
