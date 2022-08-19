<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
const { spawn } = require('child_process');
const iconv = require("iconv-lite");
const query = ref("")
const loading = ref(false)
const state: any = reactive({
  softwareList: [],
  installLoading: [],
});
const runExec = () => {
  state.softwareList = []
  let tmpList: any[] = []
  const ls = spawn("powershell scoop search " + query.value, {
    encoding: 'utf8',
    cwd: process.cwd(), // 执行命令路径
    shell: true, // 使用shell命令
  })

  // 监听标准输出
  ls.stdout.on('data', (data: any) => {
    // let s = data
    let s = data.toString()
    let ls = s.split("\r\n");
    ls.forEach((element: string) => {
      tmpList.push(element);
    });
  });

  // 子进程关闭事件
  ls.on('close', (code: any) => {
    tmpList.forEach(element => {
      let list = element.split(/\s+/);
      if (list[0] != "" && list[0] != "----" && list[0] != "Name" && list[0] != "Results") {
        let dic = {
          "name": list[0],
          "version": list[1],
          "source": list[2]
        };
        state.softwareList.push(dic)
        state.installLoading.push(false)
      }
    });
    loading.value = false
  });
}
const search = () => {
  loading.value = true
  runExec()
}
const install = (index: number, name: string) => {
  state.installLoading[index] = true
  title.value = "正在安装"
  showInstallInfo.value = []
  drawer.value = true
  const cmd = "scoop install " + name
  const ls = spawn(cmd, {
    encoding: 'utf8',
    cwd: process.cwd(), // 执行命令路径
    shell: true, // 使用shell命令
  })
  console.log(cmd)
  ls.stdout.on('data', (data: any) => {
    // let s = data
    let s = data.toString()
    let ls = s.split("\r\n");
    ls.forEach((element: string) => {
      console.log(element)
      showInstallInfo.value.push(element);
    });
  });
  // 监听标准错误
  ls.stderr.on('data', (data: any) => {
    console.log("error:", data)
    let arr: any[] = []
    arr.push(data)
    let s = iconv.decode(Buffer.concat(arr), "GBK")
    let ls = s.split("\r\n");
    ls.forEach((element: string) => {
      showInstallInfo.value.push(element);
    });
  });
  // 子进程关闭事件
  ls.on('close', (code: any) => {
    title.value = "安装完成"
    ElMessage({
      message: title.value,
      type: 'success'
    })
    window.localStorage.setItem("updateSoftware", "true")
    state.installLoading[index] = false
  });


  // exec("scoop install " + name, (error: any, stdout: any, stderr: any) => {
  //   if (!error) {
  //     ElMessage({
  //       message: stdout,
  //       type: 'success'
  //     })
  //     state.installLoading[index] = false
  //   }
  // })
}

const drawer = ref(false);
const title = ref("");
const showInstallInfo = ref<string[]>([])
</script>

<template>
  <div>
    <el-drawer :title="title" v-model="drawer" direction="btt" size="70%">
      <el-scrollbar height="220px">
        <div v-for="(item, i) in showInstallInfo">{{ item }}</div>
      </el-scrollbar>
    </el-drawer>
    <div class="search">
      <el-input v-model="query" class="w-80 m-2" placeholder="请输入" :prefix-icon="Search" @keyup.enter.native="search" />
      <el-button type="primary" @click="search">
        搜索
      </el-button>
    </div>
    <el-table v-loading="loading" :data="state.softwareList" style="width: 100%">
      <el-table-column prop="name" label="Name" width="160" align="center" />
      <el-table-column prop="version" label="Version" width="160" align="center" />
      <el-table-column prop="source" label="Source" width="160" align="center" />
      <el-table-column label="Operation" align="center">
        <template #default="scope">
          <el-button :loading="state.installLoading[scope.$index]" size="small" type="primary"
            @click.prevent="install(scope.$index, scope.row.name)">安装
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<style scoped>
.search {
  display: flex;
}
</style>