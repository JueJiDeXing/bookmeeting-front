<template>
  <div id="app">
    <template v-if="route.meta?.layout === 'BasicLayout' ">
      <BasicLayout>
        <router-view/>
      </BasicLayout>
    </template>
    <template v-else-if="route.meta?.layout === 'AdminLayout' ">
      <AdminLayout>
        <router-view/>
      </AdminLayout>
    </template>
    <template v-else>
      <router-view/>
    </template>
  </div>
</template>

<script setup lang="ts">
import BasicLayout from "@/layouts/BasicLayout.vue";
import {onMounted} from "vue";
import {useRoute} from "vue-router";
import AdminLayout from "@/layouts/AdminLayout.vue";

const route = useRoute();


/**
 * 全局初始化函数
 */
const doInit = () => {
  console.log("Hello, 我是绝迹的星");
}
onMounted(() => {
  doInit();
})

</script>
<style>
html, body {
  height: 100%;
  overflow: hidden;
  margin: 0;
  padding: 0;
}
</style>
