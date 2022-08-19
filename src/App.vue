<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import Tabs from './components/Tabs.vue'
import { Minus, Close } from "@element-plus/icons-vue";
import { reactive, ref } from 'vue';
// import { ipcRenderer } from 'electron'
const ipcRenderer = window.require("electron").ipcRenderer;
const windowClose = () => {
  ipcRenderer.send('window-close')
}
const windowMin = () => {
  ipcRenderer.send("window-min")
}

const isKeyDown = ref(false)
const dinatesX = ref(0)
const dinatesY = ref(0)
const state: any = reactive({
  isKeyDown: false,
  dinatesX: 0,
  dinatesY: 0
});

const mousedown = (e: any) => {
  let isDown = true
  let baseX = e.x
  let baseY = e.y

  document.addEventListener('mousemove', function (e) {
    if (isDown) {
      const x = e.screenX - baseX
      const y = e.screenY - baseY

      ipcRenderer.send('move-application', {
        posX: x,
        posY: y
      })
    }
  })
  document.onmouseup = (ev) => {
    isDown = false
  };
}

</script>

<template>
  <div id="app">
    <el-scrollbar height="500px">
      <div class="top" @mousedown="mousedown">
        <!-- <div class="left">Scoop 管理器</div> -->
        <div class="left">
          <el-icon :size="10" class="window-close" @click="windowClose">
            <Close class="show" />
          </el-icon>
          <el-icon :size="10" class="window-min" @click="windowMin">
            <Minus class="show" />
          </el-icon>
        </div>
        <div class="right">Scoop管理器</div>
      </div>
      <Tabs />
    </el-scrollbar>
  </div>
</template>

<style>
#app {
  background-color: rgba(0, 0, 0, 0);
  font-size: 14px;
  border-radius: 10px 10px 0 0;
  overflow: hidden;
}

.top {
  /* position: relative; */
  position: fixed;
  top: 0;
  width: 100%;
  height: 20px;
  color: #000;
  background-color: #fff;
  border-radius: 10px 10px 0 0;
  z-index: 99;
}

.left {
  float: left;
  line-height: 20px;
  padding-left: 3px;
}

.right {
  margin-right: 370px;
  float: right;
  text-align: center;
}

.window-min,
.window-close {
  text-align: center;
  -webkit-app-region: no-drag;
  border-radius: 50%;
  padding: 2px;
}

.window-close {
  background-color: rgb(255, 95, 88);
}

.window-min {
  margin-left: 5px;
  background-color: rgb(255, 189, 46);
}


.show {
  color: rgba(0, 0, 0, 0);
}

.show:hover {
  color: rgba(0, 0, 0, 0.8);
}
</style>
