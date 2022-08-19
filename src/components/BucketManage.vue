<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue';
import { ElMessage, ElLoading } from 'element-plus';
const { spawn } = require('child_process');
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
  removeLoading: [],
});
const query = ref("");
const exec = require('child_process').exec;
const runExec = (cmdStr: string) => {
  loading.value = true
  state.softwareList = []
  state.currSoftwareList = []
  state.removeLoading = []
  let tmpList: any[] = []
  const ls = spawn('powershell scoop bucket list', {
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
      if (list[0] != "" && list[0] != "----" && list[0] != "Name") {
        let dic = {
          "value": list[0],
          "name": list[0],
          "source": list[1],
          "updated": list[2] + " " + list[3],
          "manifests": list[4]
        };
        state.softwareList.push(dic)
        state.currSoftwareList.push(dic)
        state.removeLoading.push(false);
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
  exec("scoop bucket rm " + name, (error: any, stdout: any, stderr: any) => {
    if (!error) {
      ElMessage({
        message: stdout.toString().trim() == "" ? "移除成功" : stdout,
        type: 'success'
      })
      refresh()
    }
    state.removeLoading[index] = false
  })
}
const refresh = () => {
  runExec('scoop bucket list');
}

const dialogFormVisible = ref(false)
const form = reactive({
  name: '',
  address: '',
})
const add = () => {
  const loading = ElLoading.service({
    lock: true,
    text: 'Loading',
    background: 'rgba(0, 0, 0, 0.7)',
  })
  exec("scoop bucket add " + form.name + " " + form.address, (error: any, stdout: any, stderr: any) => {
    if (!error) {
      ElMessage({
        message: stdout,
        type: 'success'
      })
    }
    loading.close();
    dialogFormVisible.value = false
    refresh();
  })
}
const recommendBuckets = ref<any[]>([])
onMounted(() => {
  runExec('scoop bucket list');
  recommendBuckets.value = loadRecommendBuckets();
})
const loadRecommendBuckets = () => {
  return [
    { value: 'main', address: 'https://github.com/ScoopInstaller/Main' },
    { value: 'nirsoft', address: 'https://github.com/kodybrown/scoop-nirsoft' },
    { value: 'versions', address: 'https://github.com/ScoopInstaller/Versions' },
    { value: 'jetbrains', address: 'https://github.com/Ash258/Scoop-JetBrains' },
    { varue: 'extras', address: 'https://github.com/ScoopInstaller/Extras' },
    { varue: 'dorado', address: 'https://github.com/h404bi/dorado' },
    { value: 'ZephonBucket', address: ' https://github.com/Zephon-H/ZephonBucket' },
  ]
}
const createBucketsFilter = (queryString: string) => {
  return (recommendBucket: any) => {
    return (
      recommendBucket.value && recommendBucket.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0
    )
  }
}
const querySearch = (queryString: string, cb: any) => {
  const results = queryString
    ? recommendBuckets.value.filter(createBucketsFilter(queryString))
    : recommendBuckets.value
  // call callback function to return suggestions
  cb(results)
}

const handleSelect = (item: any) => {
  form.address = item.address
}
const handleChange = (value: string) => {
  if (value === "") {
    form.address = ""
  }
}
</script>

<template>
  <el-dialog v-model="dialogFormVisible" title="添加仓库">
    <el-form :model="form">
      <el-form-item label="仓库名" label-width="80px">
        <!-- <el-input v-model="form.name" autocomplete="off" /> -->

        <el-autocomplete v-model="form.name" :fetch-suggestions="querySearch" clearable @select="handleSelect"
          @change="handleChange" />

      </el-form-item>
      <el-form-item label="仓库地址" label-width="80px">
        <el-input v-model="form.address" autocomplete="off" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="add">确认</el-button>
      </span>
    </template>
  </el-dialog>
  <div class="buttons">
    <el-button type="primary" @click="refresh">刷新</el-button>
    <el-button type="primary" @click="dialogFormVisible = true">添加</el-button>
  </div>
  <el-input class="search w-80" v-model="query" @input="handleInput" placeholder="搜索" clearable>
  </el-input>
  <el-table v-loading="loading" :data="state.currSoftwareList" style="width: 100%">
    <el-table-column prop="name" label="Name" align="center" />
    <el-table-column prop="source" label="Source" align="center" />
    <el-table-column prop="updated" label="Updated" align="center" />
    <el-table-column prop="manifests" label="Manifests" align="center" />
    <el-table-column label="Operation" align="center">
      <template #default="scope">
        <el-button size="small" type="danger"
          @click.prevent="handleUninstall(scope.$index, state.softwareList[scope.$index]['name'])">删除
        </el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<style scoped>
.buttons {
  margin-top: 3px;
  margin-bottom: 5px;
}

.search {
  width: 100%;
  padding-right: 20%;
}
</style>
