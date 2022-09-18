<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Loading } from "@element-plus/icons-vue";
const { spawn } = require('child_process');
const iconv = require("iconv-lite");
interface SoftwareItem {
  value: string
  name: string
  version: string
  source: string
  updated: string
};
const loading = ref(false)
const state: any = reactive({
  softwareList: [],
  currSoftwareList: [],
  updateList: "",
  updateLoading: [],
  removeLoading: [],
  cleanLoading: [],
  cacheLoading: [],
});
const query = ref("");
const exec = require('child_process').exec;
const sudo = ref("sudo")
const runExec = () => {
  loading.value = true
  state.softwareList = []
  state.updateList = []
  state.currSoftwareList = []
  let tmpList: any[] = []

  const ls = spawn('powershell scoop list', {
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
      if (list[0] != "" && list[0] != "----" && list[0] != "Name" && list[0] != "Installed") {
        let dic = {
          "value": list[0],
          "name": list[0],
          "version": list[1],
          "source": list[2],
          "updated": list[3] + " " + list[4],
          "status": false,
          "index": state.softwareList.length - 1
        };
        state.softwareList.push(dic)
        state.currSoftwareList.push(dic)
        state.updateLoading.push(false);
        state.removeLoading.push(false);
        state.cleanLoading.push(false);
        state.cacheLoading.push(false);
      }
    });
    loading.value = false
  });
}

const handleInput = () => {
  state.currSoftwareList = query
    ? state.softwareList.filter(createFilter(query.value))
    : state.softwareList
}
const createFilter = (queryString: string) => {
  return (software: SoftwareItem) => {
    return (
      software.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0
    )
  }
}
const handleUninstall = (index: number, name: any) => {
  state.removeLoading[index] = true
  const cmd = sudo.value + " scoop uninstall " + name
  const ls = spawn(cmd, {
    encoding: 'utf8',
    cwd: process.cwd(), // 执行命令路径
    shell: true, // 使用shell命令
  })
  let info: any[] = []
  ls.stdout.on('data', (data: any) => {
    let arr: any[] = []
    arr.push(data)
    let s = iconv.decode(Buffer.concat(arr), "GBK")
    let ls = s.split("\r\n");
    ls.forEach((element: string) => {
      info.push(element);
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
      info.push(element);
    });
  });
  // 子进程关闭事件
  ls.on('close', (code: any) => {
    state.removeLoading[index] = false
    let s = info.join("");
    if (s.indexOf("ERROR") != -1) {
      ElMessage({
        message: s,
        type: 'error'
      })
    } else {
      ElMessage({
        message: s,
        type: 'success'
      })
    }
    refresh()
  });
}
const refresh = () => {
  runExec();
}
const cleanCache = (index: number, s: string = "*") => {
  state.cacheLoading[index] = true
  showUpdateInfo.value = []
  if (s == "*") drawer.value = true
  const cmd = "scoop cache rm " + s
  const ls = spawn(cmd, {
    encoding: 'utf8',
    cwd: process.cwd(), // 执行命令路径
    shell: true, // 使用shell命令
  })
  title.value = "清理缓存中"
  console.log(cmd)
  ls.stdout.on('data', (data: any) => {
    // let s = data
    let s = data.toString()
    let ls = s.split("\r\n");
    ls.forEach((element: string) => {
      console.log(element)
      showUpdateInfo.value.push(element);
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
      showUpdateInfo.value.push(element);
    });
  });
  // 子进程关闭事件
  ls.on('close', (code: any) => {
    title.value = "清理完成"
    state.cacheLoading[index] = false
    ElMessage({
      message: title.value,
      type: 'success'
    })
  });
}
const cleanOld = (index: number, s: string = "*") => {
  state.cleanLoading[index] = true
  showUpdateInfo.value = []
  if (s == "*") drawer.value = true
  const cmd = "scoop cache rm " + s
  const ls = spawn(cmd, {
    encoding: 'utf8',
    cwd: process.cwd(), // 执行命令路径
    shell: true, // 使用shell命令
  })
  title.value = "清理旧版本中"
  console.log(cmd)
  ls.stdout.on('data', (data: any) => {
    // let s = data
    let s = data.toString()
    let ls = s.split("\r\n");
    ls.forEach((element: string) => {
      console.log(element)
      showUpdateInfo.value.push(element);
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
      showUpdateInfo.value.push(element);
    });
  });
  // 子进程关闭事件
  ls.on('close', (code: any) => {
    title.value = "清理完成"
    state.cleanLoading[index] = false
    ElMessage({
      message: title.value,
      type: 'success'
    })
  });
}
const showUpdateInfo = ref<string[]>([])
const update = (index: number, s: string = "*") => {
  title.value = "正在更新"
  state.updateLoading[index] = true
  showUpdateInfo.value = []
  if (s == "*") drawer.value = true
  const cmd = "scoop update " + s
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
      showUpdateInfo.value.push(element);
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
      showUpdateInfo.value.push(element);
    });
  });
  // 子进程关闭事件
  ls.on('close', (code) => {
    title.value = "更新完成"
    ElMessage({
      message: title.value,
      type: 'success'
    })
    state.updateLoading[index] = false
  });
}
const check = () => {
  showUpdateInfo.value = []
  drawer.value = true
  const cmd = "scoop status "
  const ls = spawn(cmd, {
    encoding: 'utf8',
    cwd: process.cwd(), // 执行命令路径
    shell: true, // 使用shell命令
  })
  title.value = "检查更新中"
  console.log(cmd)
  ls.stdout.on('data', (data: any) => {
    // let s = data
    let s = data.toString()
    let ls = s.split("\r\n");
    ls.forEach((element: string) => {
      console.log(element)
      showUpdateInfo.value.push(element);
      let sp = element.split(/\s+/);
      // console.log("sp:", sp);
      if (sp[0] != "WARN" && sp[0] != "Name" && sp[0] != "----" && sp[0] != "" && element.indexOf("Manifest removed") == -1) {
        state.softwareList.forEach((item: any) => {
          if (sp[0] == item["name"]) {
            item.status = true
          }
        });
      }
    });
  });
  // 监听标准错误
  ls.stderr.on('data', (data: any) => {
    let arr: any[] = []
    arr.push(data)
    let s = iconv.decode(Buffer.concat(arr), "GBK")
    let ls = s.split("\r\n");
    ls.forEach((element: string) => {
      showUpdateInfo.value.push(element);
    });
  });
  // 子进程关闭事件
  ls.on('close', (code: any) => {
    title.value = "检查完成"
    ElMessage({
      message: title.value,
      type: 'success'
    })
  });
}
const loadRef = ref<HTMLElement | null>(null)
const checkUpdate = () => {
  check();
}
onMounted(() => {
  runExec();
})

const drawer = ref(false);
const title = ref("");
</script>

<template>

  <el-drawer :title="title" v-model="drawer" direction="btt" size="70%">
    <el-scrollbar height="220px">
      <div v-for="(item, i) in showUpdateInfo">{{ item }}</div>
    </el-scrollbar>
  </el-drawer>

  <div class="buttons">
    <el-button type="primary" @click="refresh">刷新</el-button>
    <el-button type="primary" @click="cleanCache">清理所有缓存</el-button>
    <el-button type="primary" @click="cleanOld">清理所有旧版本</el-button>
    <el-button type="primary" @click="checkUpdate">检查更新
      <el-icon id="load" style="margin-left:3px; display: none">
        <Loading />
      </el-icon>
    </el-button>
    <el-button type="primary" @click="update">
      更新所有
    </el-button>
  </div>
  <el-input class="search w-80" v-model="query" @input="handleInput" placeholder="搜索" clearable>
  </el-input>
  <el-table v-loading="loading" :data="state.currSoftwareList" style="width: 100%">
    <el-table-column prop="name" label="Name" width="100" align="center" />
    <el-table-column prop="version" label="Version" width="100" align="center" />
    <el-table-column prop="source" label="Source" width="100" align="center" />
    <el-table-column prop="updated" label="Updated" width="100" align="center" />
    <el-table-column label="Operation" align="center">
      <template #default="scope">
        <el-button :loading="state.removeLoading[scope.row.index]" class="item" size="small" type="danger"
          @click.prevent="handleUninstall(scope.row.index, scope.row.value)">卸载
        </el-button>
        <el-button :loading="state.cleanLoading[scope.row.index]" class="item" size="small"
          @click.prevent="cleanOld(scope.row.index, scope.row.value)">
          清理旧版本</el-button>
        <el-badge :is-dot="scope.row.status" class="item">
          <el-button :loading="state.updateLoading[scope.row.index]" type="success" size="small"
            @click.prevent="update(scope.row.index, scope.row.value)">
            更新
          </el-button>
        </el-badge>
        <el-button :loading="state.cacheLoading[scope.row.index]" class="item" size="small"
          @click.prevent="cleanCache(scope.row.index, scope.row.value)">
          清理缓存</el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<style scoped>
.buttons {
  margin-top: 3px;
  margin-bottom: 10px;
}

.item {
  margin-left: 10px;
  margin-right: 10px;
  margin-top: 4px;
}

.search {
  width: 100%;
  padding-right: 20%;
  margin-bottom: 7px;
}
</style>
