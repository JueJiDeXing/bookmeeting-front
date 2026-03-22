<template>
  <div id="equipmentCategoryManageView">
    <!-- 操作按钮区域 -->
    <div class="operation-bar">
      <a-space>
        <a-button type="primary" @click="onAdd">
          <template #icon><icon-plus /></template>
          新增分类
        </a-button>
        <a-button type="primary" status="danger" @click="onBatchDelete" :disabled="selectedKeys.length === 0">
          <template #icon><icon-delete /></template>
          批量删除
        </a-button>
      </a-space>
    </div>

    <!-- 搜索区域 -->
    <a-form :model="searchParams" layout="inline" class="search-form">
      <a-form-item field="categoryName" label="分类名称">
        <a-input
            v-model="searchParams.categoryName"
            placeholder="请输入分类名称"
            allow-clear
            @press-enter="onSearch"
        />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" @click="onSearch">
          <template #icon><icon-search /></template>
          搜索
        </a-button>
        <a-button @click="onReset">
          <template #icon><icon-refresh /></template>
          重置
        </a-button>
      </a-form-item>
    </a-form>

    <!-- 分类列表 -->
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
        :bordered="false"
    >
      <template #columns>
        <a-table-column title="ID" data-index="id" :width="80" />
        <a-table-column title="分类名称" data-index="categoryName" :width="120">
          <template #cell="{ record }">
            <a-tag color="arcoblue" size="medium">{{ record.categoryName }}</a-tag>
          </template>
        </a-table-column>
        <a-table-column title="排序" data-index="sortOrder" :width="100" sortable>
          <template #cell="{ record }">
            <span class="sort-number">{{ record.sortOrder }}</span>
          </template>
        </a-table-column>
        <a-table-column title="设备数量" data-index="equipmentCount" :width="100">
          <template #cell="{ record }">
              <span class="count-badge">{{ record.equipmentCount || 0 }}个</span>
          </template>
        </a-table-column>
        <a-table-column title="创建时间" data-index="createTime" :width="180" />
        <a-table-column title="操作" :width="200" fixed="right">
          <template #cell="{ record }">
            <a-space>
              <a-button type="text" size="small" @click="onEdit(record)">
                <template #icon><icon-edit /></template>
                编辑
              </a-button>
              <a-button
                  type="text"
                  size="small"
                  status="danger"
                  @click="onDelete(record)"
                  :disabled="record.equipmentCount > 0"
              >
                <template #icon><icon-delete /></template>
                删除
              </a-button>
              <a-dropdown @select="(key) => onMoreAction(key, record)">
                <a-button type="text" size="small">
                  <template #icon><icon-more /></template>
                  更多
                </a-button>
                <template #content>
                  <a-doption value="moveUp">
                    <icon-arrow-up />
                    上移
                  </a-doption>
                  <a-doption value="moveDown">
                    <icon-arrow-down />
                    下移
                  </a-doption>
                </template>
              </a-dropdown>
            </a-space>
          </template>
        </a-table-column>
      </template>

      <!-- 空状态 -->
      <template #empty>
        <a-empty description="暂无设备分类">
          <template #image>
            <icon-tag style="font-size: 48px; color: var(--color-text-4)" />
          </template>
          <a-button type="primary" @click="onAdd">新增分类</a-button>
        </a-empty>
      </template>
    </a-table>

    <!-- 新增/编辑分类弹窗 -->
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
        <a-form-item field="categoryName" label="分类名称" required>
          <a-input
              v-model="formData.categoryName"
              placeholder="请输入分类名称，如：白板、投影仪"
              :max-length="50"
              show-word-limit
          />
        </a-form-item>
        <a-form-item field="sortOrder" label="排序权重">
          <a-input-number
              v-model="formData.sortOrder"
              placeholder="数字越小越靠前"
              :min="0"
              :max="999"
              style="width: 100%"
          >
            <template #append>越小越靠前</template>
          </a-input-number>
          <template #extra>
            <span class="text-muted">排序数字越小，在筛选列表中显示越靠前</span>
          </template>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 批量删除确认弹窗 -->
    <a-modal
        :visible="batchDeleteModalVisible"
        title="确认批量删除"
        @ok="handleBatchDeleteOk"
        @cancel="batchDeleteModalVisible = false"
        :ok-loading="batchDeleteLoading"
        :ok-button-props="{ status: 'danger' }"
    >
      <a-alert type="warning" show-icon>
        确定要删除选中的 {{ selectedKeys.length }} 个分类吗？
        <template v-if="hasEquipmentInSelected">
          <br />
          <span style="color: red">注意：部分分类下存在设备，无法删除！</span>
        </template>
      </a-alert>
      <div style="margin-top: 16px">
        <a-table
            :data="selectedCategoriesWithEquipment"
            :pagination="false"
            :bordered="false"
            size="small"
        >
          <a-table-column title="分类名称" data-index="categoryName" />
          <a-table-column title="设备数量" data-index="equipmentCount" :width="100">
            <template #cell="{ record }">
              <a-tag :color="record.equipmentCount > 0 ? 'red' : 'green'">
                {{ record.equipmentCount }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="状态" :width="100">
            <template #cell="{ record }">
              <span v-if="record.equipmentCount > 0" style="color: red">不可删除</span>
              <span v-else style="color: green">可删除</span>
            </template>
          </a-table-column>
        </a-table>
      </div>
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
  IconTag,
  IconArrowUp,
  IconArrowDown
} from '@arco-design/web-vue/es/icon';
import { useRouter } from 'vue-router';
import { AdminEquipmentCategoryControllerService } from '../../../generated';
import type {
  EquipmentCategoryAddRequest,
  EquipmentCategoryUpdateRequest,
  EquipmentCategoryQueryRequest,
  EquipmentCategoryVO
} from '../../../generated';

const router = useRouter();
const dataList = ref<EquipmentCategoryVO[]>([]);
const loading = ref(false);
const selectedKeys = ref<number[]>([]);
const batchDeleteModalVisible = ref(false);
const batchDeleteLoading = ref(false);

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
const searchParams = ref<EquipmentCategoryQueryRequest>({
  categoryName: undefined,
  pageSize: 10,
  current: 1
});

// 表格列配置
const columns = [
  { title: 'ID', dataIndex: 'id', width: 80 },
  { title: '分类名称', dataIndex: 'categoryName', width: 120, slotName: 'categoryName' },
  { title: '排序', dataIndex: 'sortOrder', width: 100, slotName: 'sortOrder' },
  { title: '设备数量', dataIndex: 'equipmentCount', width: 100, slotName: 'equipmentCount' },
  { title: '创建时间', dataIndex: 'createTime', width: 180 },
  { title: '操作', width: 200, fixed: 'right', slotName: 'operation' }
];

// 行选择配置
const rowSelection = {
  type: 'checkbox' as const,
  showCheckedAll: true,
  onlyCurrent: false
};

// 计算选中的分类中是否有包含设备的
const selectedCategoriesWithEquipment = computed(() => {
  return dataList.value.filter(item => selectedKeys.value.includes(item.id!));
});

const hasEquipmentInSelected = computed(() => {
  return selectedCategoriesWithEquipment.value.some(item => (item.equipmentCount || 0) > 0);
});

// 加载数据
const loadData = async () => {
  loading.value = true;
  try {
    const res = await AdminEquipmentCategoryControllerService.listCategoryByPageUsingPost({
      ...searchParams.value,
      current: pagination.value.current,
      pageSize: pagination.value.pageSize
    });
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
  loadData();
};

// 重置
const onReset = () => {
  searchParams.value = {
    categoryName: undefined,
    pageSize: 10,
    current: 1
  };
  pagination.value.current = 1;
  loadData();
};

// 页码变化
const onPageChange = (page: number) => {
  pagination.value.current = page;
  loadData();
};

// 每页条数变化
const onPageSizeChange = (pageSize: number) => {
  pagination.value.pageSize = pageSize;
  pagination.value.current = 1;
  loadData();
};

// 新增/编辑弹窗
const modalVisible = ref(false);
const modalTitle = ref('');
const modalType = ref<'add' | 'edit'>('add');
const modalLoading = ref(false);
const formRef = ref();
const formData = reactive({
  id: undefined,
  categoryName: '',
  sortOrder: 0
});

const formRules = {
  categoryName: [
    { required: true, message: '分类名称不能为空' },
    { maxLength: 50, message: '分类名称不能超过50个字符' }
  ]
};

// 新增
const onAdd = () => {
  modalType.value = 'add';
  modalTitle.value = '新增分类';
  Object.assign(formData, {
    id: undefined,
    categoryName: '',
    sortOrder: 0
  });
  modalVisible.value = true;
};

// 编辑
const onEdit = (record: EquipmentCategoryVO) => {
  modalType.value = 'edit';
  modalTitle.value = '编辑分类';
  Object.assign(formData, {
    id: record.id,
    categoryName: record.categoryName,
    sortOrder: record.sortOrder || 0
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
      const addRequest: EquipmentCategoryAddRequest = {
        categoryName: formData.categoryName,
        sortOrder: formData.sortOrder
      };
      res = await AdminEquipmentCategoryControllerService.addCategoryUsingPost(addRequest);
    } else {
      const updateRequest: EquipmentCategoryUpdateRequest = {
        id: formData.id,
        categoryName: formData.categoryName,
        sortOrder: formData.sortOrder
      };
      res = await AdminEquipmentCategoryControllerService.updateCategoryUsingPost(updateRequest);
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

// 删除单个
const onDelete = (record: EquipmentCategoryVO) => {
  if ((record.equipmentCount || 0) > 0) {
    Message.warning('该分类下存在设备，无法删除');
    return;
  }

  Modal.warning({
    title: '确认删除',
    content: `确定要删除分类 "${record.categoryName}" 吗？`,
    hideCancel: false,
    okButtonProps: { status: 'danger' },
    onOk: async () => {
      try {
        const res = await AdminEquipmentCategoryControllerService.deleteCategoryUsingPost({ id: record.id! });
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

// 批量删除
const onBatchDelete = () => {
  if (selectedKeys.value.length === 0) return;
  batchDeleteModalVisible.value = true;
};

const handleBatchDeleteOk = async () => {
  // 过滤出可删除的分类（设备数量为0）
  const deletableIds = selectedCategoriesWithEquipment.value
      .filter(item => (item.equipmentCount || 0) === 0)
      .map(item => item.id!);

  if (deletableIds.length === 0) {
    Message.warning('选中的分类都包含设备，无法删除');
    batchDeleteModalVisible.value = false;
    return;
  }

  batchDeleteLoading.value = true;
  try {
    const res = await AdminEquipmentCategoryControllerService.batchDeleteCategoryUsingPost({
      ids: deletableIds
    });

    if (res.code === 0) {
      Message.success(`成功删除 ${deletableIds.length} 个分类`);
      if (deletableIds.length < selectedKeys.value.length) {
        Message.warning(`${selectedKeys.value.length - deletableIds.length} 个分类因包含设备未删除`);
      }
      batchDeleteModalVisible.value = false;
      selectedKeys.value = [];
      loadData();
    } else {
      Message.error(res.message || '批量删除失败');
    }
  } catch (error: any) {
    Message.error('批量删除失败: ' + error.message);
  } finally {
    batchDeleteLoading.value = false;
  }
};

// 更多操作
const onMoreAction = (key: string, record: EquipmentCategoryVO) => {
  switch (key) {
    case 'moveUp':
      handleMoveUp(record);
      break;
    case 'moveDown':
      handleMoveDown(record);
      break;
  }
};

// 上移（减小排序值）
const handleMoveUp = (record: EquipmentCategoryVO) => {
  // 找到比当前排序值小的最大一个
  const prev = dataList.value
      .filter(item => (item.sortOrder || 0) < (record.sortOrder || 0))
      .sort((a, b) => (b.sortOrder || 0) - (a.sortOrder || 0))[0];

  if (!prev) {
    Message.info('已经是第一个了');
    return;
  }

  swapSortOrder(record, prev);
};

// 下移（增大排序值）
const handleMoveDown = (record: EquipmentCategoryVO) => {
  // 找到比当前排序值大的最小一个
  const next = dataList.value
      .filter(item => (item.sortOrder || 0) > (record.sortOrder || 0))
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))[0];

  if (!next) {
    Message.info('已经是最后一个了');
    return;
  }

  swapSortOrder(record, next);
};

// 交换两个分类的排序值
const swapSortOrder = async (a: EquipmentCategoryVO, b: EquipmentCategoryVO) => {
  try {
    // 先更新a的排序为b的值
    await AdminEquipmentCategoryControllerService.updateCategoryUsingPost({
      id: a.id,
      sortOrder: b.sortOrder
    });
    // 再更新b的排序为a的值
    await AdminEquipmentCategoryControllerService.updateCategoryUsingPost({
      id: b.id,
      sortOrder: a.sortOrder
    });

    Message.success('排序已更新');
    loadData();
  } catch (error: any) {
    Message.error('更新排序失败: ' + error.message);
  }
};

onMounted(() => {
  loadData();
});
</script>

<style scoped lang="less">
#equipmentCategoryManageView {
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

  .sort-number {
    font-family: monospace;
    font-weight: 600;
  }

  .count-badge {
    margin-left: 4px;
  }

  .text-muted {
    color: var(--color-text-3);
    font-size: 12px;
  }

  :deep(.arco-table) {
    background-color: var(--color-bg-2);
    border-radius: 4px;
  }
}
</style>
