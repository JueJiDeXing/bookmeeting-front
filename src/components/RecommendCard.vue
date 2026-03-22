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

      <!-- 推荐列表 -->
      <div class="recommend-list">
        <a-spin :loading="loading">
          <a-row :gutter="16">
            <a-col :span="8" v-for="room in recommendList" :key="room.id">
              <a-card hoverable class="room-card" @click="handleSelectRoom(room.id)">
                <template #cover>
                  <div class="room-cover">
                    <img :src="room.imageUrl || defaultImage" alt="room" />
                    <div class="score-badge">
                      <a-rate :model-value="room.score / 20" :count="5" readonly size="small" />
                      <span class="score-text">{{ Math.round(room.score) }}分</span>
                    </div>
                  </div>
                </template>
                <a-card-meta>
                  <template #title>
                    <a-link>{{ room.roomName }}</a-link>
                  </template>
                  <template #description>
                    <div class="room-info">
                      <div><icon-location /> {{ room.locationDesc }}</div>
                      <div><icon-user /> {{ room.capacity }}人</div>
                      <div class="match-reason" v-if="room.matchReason">
                        <icon-thumb-up /> {{ room.matchReason }}
                      </div>
                      <div class="equipment-tags">
                        <a-tag v-for="eq in room.equipmentList?.slice(0, 2)" :key="eq.id" size="small">
                          {{ eq.equipmentName }}
                        </a-tag>
                        <a-tag v-if="room.equipmentList?.length > 2" size="small">
                          +{{ room.equipmentList.length - 2 }}
                        </a-tag>
                      </div>
                    </div>
                  </template>
                </a-card-meta>
              </a-card>
            </a-col>
          </a-row>

          <div v-if="!loading && recommendList.length === 0" class="empty-state">
            <a-empty description="暂无推荐" />
          </div>
        </a-spin>
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
  IconTool
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

const defaultImage = 'https://via.placeholder.com/300x160?text=Meeting+Room';

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
    margin-bottom: 16px;
    padding: 12px;
    background-color: var(--color-fill-1);
    border-radius: 8px;
  }

  .recommend-list {
    min-height: 280px;
  }

  .room-card {
    margin-bottom: 16px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .room-cover {
      position: relative;
      height: 100px;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .score-badge {
        position: absolute;
        bottom: 4px;
        right: 4px;
        background: rgba(0, 0, 0, 0.6);
        padding: 2px 6px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        gap: 4px;

        .score-text {
          color: #ffc107;
          font-size: 10px;
          font-weight: bold;
        }
      }
    }

    .room-info {
      font-size: 12px;
      color: var(--color-text-3);
      line-height: 1.5;

      .match-reason {
        color: rgb(var(--green-6));
        margin-top: 4px;
        font-size: 11px;
      }

      .equipment-tags {
        margin-top: 6px;
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
      }
    }
  }

  .empty-state {
    padding: 40px;
    text-align: center;
  }
}
</style>
