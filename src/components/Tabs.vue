<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import LocalManage from './LocalManage.vue';
import SoftInstall from './SoftInstall.vue';
import BucketManage from './BucketManage.vue';
import Settings from './Settings.vue';
import type { TabsPaneContext } from 'element-plus';
import { ref } from 'vue';

const activeName = ref('first')
const first = ref(true)
const third = ref(true)
const handleClick = (tab: TabsPaneContext, event: Event) => {
  console.log(tab)
  if (tab.props.name == "third") {
    if (window.localStorage.getItem("updateBucket") == "true") {
      third.value = false
      setTimeout(() => {
        third.value = true;
      }, 100);
      window.localStorage.setItem("updateBucket", "false");
    }
  } else if (tab.props.name == "first") {
    if (window.localStorage.getItem("updateSoftware") == "true") {
      first.value = false
      setTimeout(() => {
        first.value = true;
      }, 100);
      window.localStorage.setItem("updateSoftware", "false");
    }
  }
}
const handleBucket = () => {
}
</script>
<template>
  <el-tabs v-model="activeName" class="tabs" @tab-click="handleClick" style="margin-top:20px" mode="out-in">
    <el-tab-pane label="本地管理" name="first">
      <LocalManage />
    </el-tab-pane>
    <el-tab-pane label="软件安装" name="second">
      <SoftInstall />
    </el-tab-pane>
    <el-tab-pane label="仓库管理" name="third">
      <BucketManage v-if="third" />
    </el-tab-pane>
    <el-tab-pane label="其它" name="other">
      <Settings />
    </el-tab-pane>
  </el-tabs>
</template>
<style>
.tabs {
  background: #fff;
  padding: 0 0 10px 10px;
  min-height: 470px;
}
</style>