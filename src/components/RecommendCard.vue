<!-- components/RecommendCard.vue -->
<template>
  <div class="recommend-card">
    <a-card :bordered="false" class="recommend-container">
      <template #title>
        <a-space>
          <icon-bulb />
          <span>智能推荐</span>
          <a-tag color="arcoblue" size="small">Beta</a-tag>
        </a-space>
      </template>
      <template #extra>
        <a-radio-group v-model="recommendType" type="button" size="small" @change="loadRecommend">
          <a-radio value="personal">个性化</a-radio>
          <a-radio value="hot">热门推荐</a-radio>
        </a-radio-group>
      </template>

      <!-- 筛选条件（仅个性化推荐时显示） -->
      <div class="filter-section" v-if="recommendType === 'personal'">
        <a-row :gutter="16" align="center">
          <a-col :span="6">
            <a-input-number
                v-model="filterParams.attendeeCount"
                placeholder="参会人数"
                :min="1"
                style="width: 100%"
                @change="onFilterChange"
            />
          </a-col>
          <a-col :span="10">
            <a-select
                v-model="filterParams.equipmentIds"
                placeholder="设备要求"
                multiple
                allow-clear
                :loading="equipmentLoading"
                style="width: 100%"
                @change="onFilterChange"
            >
              <a-option v-for="eq in equipmentList" :key="eq.id" :value="eq.id">
                <icon-tool /> {{ eq.equipmentName }}
              </a-option>
            </a-select>
          </a-col>
          <a-col :span="6">
            <a-select
                v-model="filterParams.building"
                placeholder="楼栋"
                allow-clear
                style="width: 100%"
                @change="onFilterChange"
            >
              <a-option v-for="b in buildingList" :key="b" :value="b">{{ b }}</a-option>
            </a-select>
          </a-col>
          <a-col :span="2">
            <a-button type="primary" @click="loadRecommend" :loading="loading">
              <icon-search />
            </a-button>
          </a-col>
        </a-row>
      </div>

      <!-- 推荐列表 - 改为水平滚动布局 -->
      <div class="recommend-list-wrapper" v-if="recommendList.length > 0">
        <div class="recommend-list-scroll">
          <div
              v-for="room in recommendList"
              :key="room.id"
              class="recommend-item"
              @click="handleSelectRoom(room.id)"
          >
            <a-card hoverable class="room-card">
              <!-- 去掉图片，改为渐变背景 -->
              <div class="room-icon">
                <icon-home />
              </div>
              <div class="room-info">
                <div class="room-name">
                  <a-link>{{ room.roomName }}</a-link>
                </div>
                <div class="room-detail">
                  <div class="detail-row">
                    <icon-location class="detail-icon" />
                    <span class="detail-text">{{ room.locationDesc }}</span>
                  </div>
                  <div class="detail-row">
                    <icon-user class="detail-icon" />
                    <span class="detail-text">{{ room.capacity }}人</span>
                  </div>
                  <div class="match-reason" v-if="room.matchReason">
                    <icon-thumb-up class="detail-icon" />
                    <span>{{ room.matchReason }}</span>
                  </div>
                  <div class="equipment-tags">
                    <a-tag v-for="eq in room.equipmentList?.slice(0, 3)" :key="eq.id" size="small">
                      {{ eq.equipmentName }}
                    </a-tag>
                    <a-tag v-if="room.equipmentList?.length > 3" size="small" color="gray">
                      +{{ room.equipmentList.length - 3 }}
                    </a-tag>
                  </div>
                </div>
                <div class="score-footer">
                  <a-rate :model-value="room.score / 20" :count="5" readonly size="small" />
                  <span class="score-text">{{ Math.round(room.score) }}分</span>
                </div>
              </div>
            </a-card>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="!loading && recommendList.length === 0" class="empty-state">
        <a-empty description="暂无推荐" />
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <a-spin />
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Message } from '@arco-design/web-vue';
import {
  IconBulb,
  IconSearch,
  IconLocation,
  IconUser,
  IconThumbUp,
  IconTool,
  IconHome
} from '@arco-design/web-vue/es/icon';
import { useRouter } from 'vue-router';
import {
  UserRecommendControllerService,
  UserEquipmentControllerService,
  UserRoomControllerService
} from '/generated';

const emit = defineEmits(['select-room']);

const router = useRouter();
const loading = ref(false);
const recommendType = ref('personal');
const recommendList = ref([]);
const equipmentList = ref([]);
const equipmentLoading = ref(false);
const buildingList = ref([]);

const filterParams = ref({
  attendeeCount: undefined,
  equipmentIds: [],
  building: undefined,
  limit: 6
});

// 加载设备列表
const loadEquipmentList = async () => {
  equipmentLoading.value = true;
  try {
    const res = await UserEquipmentControllerService.listAllAvailableEquipmentUsingGet1();
    if (res.code === 0) {
      equipmentList.value = res.data || [];
    }
  } catch (error) {
    console.error('加载设备列表失败', error);
  } finally {
    equipmentLoading.value = false;
  }
};

// 加载楼栋列表
const loadBuildingList = async () => {
  try {
    const res = await UserRoomControllerService.getAllBuildingsUsingGet();
    if (res.code === 0) {
      buildingList.value = res.data || [];
    }
  } catch (error) {
    console.error('加载楼栋列表失败', error);
  }
};

// 加载推荐
const loadRecommend = async () => {
  loading.value = true;
  try {
    if (recommendType.value === 'personal') {
      const res = await UserRecommendControllerService.recommendRoomsUsingPost(filterParams.value);
      if (res.code === 0) {
        recommendList.value = res.data || [];
      }
    } else {
      const res = await UserRecommendControllerService.getHotRoomsUsingGet(6);
      if (res.code === 0) {
        recommendList.value = res.data || [];
      }
    }
  } catch (error: any) {
    Message.error('加载推荐失败: ' + error.message);
  } finally {
    loading.value = false;
  }
};

// 筛选条件变化
const onFilterChange = () => {
  if (recommendType.value === 'personal') {
    loadRecommend();
  }
};

// 选择会议室（触发父组件定位）
const handleSelectRoom = (roomId: number) => {
  emit('select-room', roomId);
  Message.success('已定位到会议室，请在下方选择时间段');
};

onMounted(() => {
  loadEquipmentList();
  loadBuildingList();
  loadRecommend();
});
</script>

<style scoped lang="less">
.recommend-card {
  margin-bottom: 16px;

  .recommend-container {
    background-color: var(--color-bg-2);
    border-radius: 8px;
  }

  .filter-section {
    margin-bottom: 12px;
    padding: 8px;
    background-color: var(--color-fill-1);
    border-radius: 8px;
  }

  // 水平滚动列表样式
  .recommend-list-wrapper {
    overflow-x: auto;
    overflow-y: hidden;
    margin: 0 -4px;
    padding: 8px 0;

    &::-webkit-scrollbar {
      height: 6px;
    }

    &::-webkit-scrollbar-track {
      background: var(--color-fill-2);
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
      background: var(--color-fill-4);
      border-radius: 3px;

      &:hover {
        background: var(--color-fill-5);
      }
    }
  }

  .recommend-list-scroll {
    display: flex;
    gap: 16px;
    padding: 0 4px;
  }

  .recommend-item {
    flex-shrink: 0;
    width: 220px;
    transition: transform 0.2s;

    &:hover {
      transform: translateY(-2px);
    }
  }

  .room-card {
    cursor: pointer;
    transition: all 0.2s;
    height: 100%;
    display: flex;
    flex-direction: column;

    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .room-icon {
      height: 30px;
      background: linear-gradient(135deg, rgb(var(--primary-3)), rgb(var(--primary-6)));
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px 8px 0 0;
      margin: -16px -16px 0 -16px;
      padding: 12px 0 12px;

      .arco-icon {
        font-size: 32px;
        color: white;
      }
    }
  }

  .room-info {
    padding: 10px 0 0;
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .room-name {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 10px;

    .arco-link {
      font-weight: 600;
    }
  }

  .room-detail {
    flex: 1;
    margin-bottom: 2px;
  }

  .detail-row {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: var(--color-text-3);
    margin-bottom: 6px;

    .detail-icon {
      font-size: 12px;
      flex-shrink: 0;
    }

    .detail-text {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .match-reason {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: rgb(var(--green-6));
    margin-top: 4px;
    margin-bottom: 6px;

    .detail-icon {
      font-size: 11px;
    }
  }

  .equipment-tags {
    margin-top: 8px;
    display: flex;
    flex-wrap: wrap;
    gap: 4px;

    .arco-tag {
      font-size: 10px;
      padding: 0 6px;
      line-height: 20px;
    }
  }

  .score-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 2px;
    padding-top: 8px;
    border-top: 1px solid var(--color-border-2);

    .score-text {
      font-size: 12px;
      font-weight: 600;
      color: #ffc107;
    }
  }

  .empty-state {
    padding: 40px;
    text-align: center;
  }

  .loading-state {
    padding: 40px;
    text-align: center;
  }
}
</style>
