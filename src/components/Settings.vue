<script lang="ts" setup>
import { exec } from 'child_process';
import { ipcRenderer, shell } from 'electron';
import { ElMessage, ElMessageBox } from 'element-plus';
import { last } from 'lodash';
import { ref } from 'vue';
import config from "../../package.json"
// const package = require("../../package.json");
const iconv = require("iconv-lite");
const active = ref(0)
// const exec = require('child_process');
const { spawn } = require('child_process');
const commandMsg = ref<string[]>([
  `使用说明:`,
  `1. 本程序依赖于scoopt工具，故需要先安装scoop`,
  `2. 请依次点击下一步安装并配置scoop`,
  `3. 也可自已执行相关命令，相关命令如下:`,
  `3.1 查看powershell版本:`,
  `$PSVersionTable.PSVersion`,
  `3.2 更改脚本执行策略`,
  `set-executionpolicy remotesigned -s cu`,
  `3.3 设置环境变量(scoop安装位置，以D:\Scoop为例)`,
  `$env:SCOOP='D:\Scoop'`,
  `[Environment]::SetEnvironmentVariable('SCOOP',$env:SCOOP,'User')`,
  `3.4 安装Scoop:`,
  `iex (new-object net.webclient).downloadstring('https://get.scoop.sh')`,
  `或  iwr-useb get.scoop.sh|iex`,
  `如有网络问题，可用国内镜像:`,
  `iwr -useb https://gitee.com/glsnames/scoop-installer/raw/master/bin/install.ps1 | iex`,
  `scoop config SCOOP_REPO 'https://gitee.com/glsnames/scoop-installer'`
])
const isActive = ref(false)
const next = () => {
  commandMsg.value = []
  if (active.value == 0) {
    isActive.value = true;
    // Set-ExecutionPolicy RemoteSigned -scope CurrentUser;
    const ls = spawn('echo "A" | powershell set-executionpolicy remotesigned -s cu', {
      encoding: 'utf8',
      cwd: process.cwd(), // 执行命令路径
      shell: true, // 使用shell命令
    })
    commandMsg.value.push("----------------------------------------------------------------------------------")
    commandMsg.value.push("执行前请确认Powershell版本大于3,可通过'$PSVersionTable.PSVersion'查看")
    commandMsg.value.push("----------------------------------------------------------------------------------")
    commandMsg.value.push("正在执行:set-executionpolicy remotesigned -s cu;")
    commandMsg.value.push("----------------------------------------------------------------------------------")
    // 监听标准输出
    ls.stdout.on('data', (data: any) => {
      // let s = data
      let s = data.toString()
      console.log(s.indexOf("\r\n"))
      let ls = s.split("\r\n");
      ls.forEach((element: string) => {
        commandMsg.value.push(element);
      });
    });
    // 监听标准错误
    ls.stderr.on('data', (data: any) => {
      let arr: any[] = []
      arr.push(data)
      let s = iconv.decode(Buffer.concat(arr), "GBK")
      let ls = s.split("\r\n");
      ls.forEach((element: string) => {
        commandMsg.value.push(element);
      });
    });
    // 子进程关闭事件
    ls.on('close', (code) => {
      console.log(`子进程退出，退出码 ${code}`);
      commandMsg.value.push("----------------------------------------------------------------------------------")
      commandMsg.value.push("执行完成")
      isActive.value = false;
      active.value++;
    });
  } else if (active.value == 1) {
    isActive.value = true;
    let selectDir = ""
    ipcRenderer.send("open-directory-dialog")
    ipcRenderer.on("selectDirectory", (e, res) => {
      if (!res.canceled) {
        if (commandMsg.value.length != 0) return;
        selectDir = res.filePaths[0]
        console.log(selectDir)
        const cmd = `powershell "$env:SCOOP = '${selectDir}'; [Environment]:: SetEnvironmentVariable('SCOOP', $env:SCOOP, 'User')"`
        commandMsg.value.push("----------------------------------------------------------------------------------")
        commandMsg.value.push(`正在执行:${cmd} `)
        commandMsg.value.push("----------------------------------------------------------------------------------")
        // const cmd = `powershell cd D: /; ls`
        const ls = spawn(cmd, {
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
            commandMsg.value.push(element);
          });
        });
        // 监听标准错误
        ls.stderr.on('data', (data: any) => {
          let arr: any[] = []
          arr.push(data)
          let s = iconv.decode(Buffer.concat(arr), "GBK")
          let ls = s.split("\r\n");
          ls.forEach((element: string) => {
            commandMsg.value.push(element);
          });
        });
        // 子进程关闭事件
        ls.on('close', (code) => {
          console.log(`子进程退出，退出码 ${code}`);
          commandMsg.value.push("----------------------------------------------------------------------------------")
          commandMsg.value.push("执行完成")
          isActive.value = false;
          active.value++;
        });
      }
    })
  } else if (active.value == 2) {
    isActive.value = true;
    // const condidateCmd = `powershell "iex (new-object net.webclient).downloadstring('https://get.scoop.sh')"`
    const condidateCmd = `powershell .\\install.ps1`
    // https://github.com/lukesampson/scoop

    // const condidateCmd = `powershell "&iwr -useb https://gitee.com/RubyKids/scoop-cn/raw/master/install.ps1 | iex;"`
    commandMsg.value.push("----------------------------------------------------------------------------------")
    commandMsg.value.push(`正在执行:${condidateCmd}`)
    commandMsg.value.push("----------------------------------------------------------------------------------")
    const ls = spawn(condidateCmd, {
      encoding: 'GBK',
      cwd: process.cwd(), // 执行命令路径
      shell: true, // 使用shell命令
    })
    // 监听标准输出
    ls.stdout.on('data', (data: any) => {
      // let s = data
      let s = data.toString()
      let ls = s.split("\r\n");
      ls.forEach((element: string) => {
        commandMsg.value.push(element);
      });
    });
    // 监听标准错误
    ls.stderr.on('data', (data: any) => {
      let arr: any[] = []
      arr.push(data)
      let s = iconv.decode(Buffer.concat(arr), "GBK")
      let ls = s.split("\r\n");
      ls.forEach((element: string) => {
        commandMsg.value.push(element);
      });
    });
    // 子进程关闭事件
    ls.on('close', (code) => {
      console.log(`子进程退出，退出码 ${code}`);
      console.log(code == 1)
      if (code != 0) {
        const newCmd = "powershell .\\install.ps1 -RunAsAdmin"
        let l = spawn(newCmd, {
          encoding: 'GBK',
          cwd: process.cwd(), // 执行命令路径
          shell: true, // 使用shell命令
        })
        // 监听标准输出
        l.stdout.on('data', (data: any) => {
          // let s = data
          let s = data.toString()
          let ls = s.split("\r\n");
          ls.forEach((element: string) => {
            commandMsg.value.push(element);
          });
        });
        // 监听标准错误
        l.stderr.on('data', (data: any) => {
          let arr: any[] = []
          arr.push(data)
          let s = iconv.decode(Buffer.concat(arr), "GBK")
          let ls = s.split("\r\n");
          ls.forEach((element: string) => {
            commandMsg.value.push(element);
          });
        });
      }
      commandMsg.value.push("执行完成")
      isActive.value = false;
      active.value++;
    });

  } else {
    isActive.value = true;
    const cmd = "scoop --version";
    const ls = spawn(cmd, {
      encoding: 'utf8',
      cwd: process.cwd(), // 执行命令路径
      shell: true, // 使用shell命令
    })
    let success = false;
    // 监听标准输出
    ls.stdout.on('data', (data: any) => {
      // let s = data
      let s = data.toString()
      let ls = s.split("\r\n");
      ls.forEach((element: string) => {
        if (element.indexOf("Released") != -1) success = true;
        commandMsg.value.push(element);
      });
    });
    // 监听标准错误
    ls.stderr.on('data', (data: any) => {
      let arr: any[] = []
      arr.push(data)
      let s = iconv.decode(Buffer.concat(arr), "GBK")
      let ls = s.split("\r\n");
      ls.forEach((element: string) => {
        commandMsg.value.push(element);
      });
    });
    // 子进程关闭事件
    ls.on('close', (code: any) => {
      console.log(`子进程退出，退出码 ${code}`);
      commandMsg.value.push("----------------------------------------------------------------------------------")
      commandMsg.value.push("执行完成")
      if (success) commandMsg.value.push("安装成功")
      else commandMsg.value.push("安装失败，请重试或根据命令自行安装")
      isActive.value = false;
      active.value++;
    });
  }
}
const back = () => {
  commandMsg.value = []
  active.value--;
  if (active.value == 0) {
    commandMsg.value = [
      `使用说明:`,
      `1. 本程序依赖于scoopt工具，故需要先安装scoop`,
      `2. 请依次点击下一步安装并配置scoop`,
      `3. 也可自已执行相关命令，相关命令如下:`,
      `3.1 查看powershell版本:`,
      `$PSVersionTable.PSVersion`,
      `3.2 更改脚本执行策略`,
      `set-executionpolicy remotesigned -s cu`,
      `3.3 设置环境变量(scoop安装位置，以D:\Scoop为例)`,
      `$env:SCOOP='D:\Scoop'`,
      `[Environment]::SetEnvironmentVariable('SCOOP',$env:SCOOP,'User')`,
      `3.4 安装Scoop:`,
      `iex (new-object net.webclient).downloadstring('https://get.scoop.sh')`,
      `或  iwr-useb get.scoop.sh|iex`,
      `如有网络问题，可用国内镜像:`,
      `iwr -useb https://gitee.com/glsnames/scoop-installer/raw/master/bin/install.ps1 | iex`,
      `scoop config SCOOP_REPO 'https://gitee.com/glsnames/scoop-installer'`
    ]
  }
}
const scoopDir = ref("");
const resultMsg = ref<string[]>([])
const choose = () => {
  ipcRenderer.send("open-directory-dialog")
  ipcRenderer.on("selectDirectory", (e, res) => {
    if (!res.canceled) {
      scoopDir.value = res.filePaths[0]
    }
  })
}
const setDir = () => {
  let pattern = /[a-zA-Z]:(\\[\w\u4e00-\u9fa5\(\)\[\]\{\}`~!@#$%^&]+[`~!@#$%^&\(\)\[\]\{\}\s\w\u4e00-\u9fa5]+)+(\\[`~!@#$%^&\w\u4e00-\u9fa5.\(\)\[\]\{\}]([.]*[`~!@#$%^&\w\s\(\)\[\]\{\}\u4e00-\u9fa5])+)+/
  if (!pattern.test(scoopDir.value)) {
    ElMessage({
      type: "error",
      message: "请输入正确的路径"
    })
    return;
  }
  resultMsg.value = []
  const cmd = `powershell $env:SCOOP='${scoopDir.value}';[Environment]::SetEnvironmentVariable('SCOOP',$env:SCOOP,'User')`
  const ls = spawn(cmd, {
    encoding: 'utf8',
    cwd: process.cwd(), // 执行命令路径
    shell: true, // 使用shell命令
  })
  resultMsg.value.push("----------------------------------------------------------------------------------")
  resultMsg.value.push(`正在执行:${cmd}`)
  resultMsg.value.push("----------------------------------------------------------------------------------")
  // 监听标准输出
  ls.stdout.on('data', (data: any) => {
    // let s = data
    let s = data.toString()
    let ls = s.split("\r\n");
    ls.forEach((element: string) => {
      resultMsg.value.push(element);
    });
  });
  // 监听标准错误
  ls.stderr.on('data', (data: any) => {
    let arr: any[] = []
    arr.push(data)
    let s = iconv.decode(Buffer.concat(arr), "GBK")
    let ls = s.split("\r\n");
    ls.forEach((element: string) => {
      resultMsg.value.push(element);
    });
  });
  // 子进程关闭事件
  ls.on('close', (code) => {
    console.log(`子进程退出，退出码 ${code}`);
    resultMsg.value.push("----------------------------------------------------------------------------------")
    resultMsg.value.push("执行完成")
  });
}
const openLink = (s: string) => {
  if (s == "github") shell.openExternal("https://github.com/Zephon-H");
  else if (s == "blog") shell.openExternal("http://www.zephon.ml/blog/")
}
const multipleSelectBuckets = ref([])
const multipleSelectSoftwares = ref([])

const bucketData = [
  { name: 'main', link: 'https://github.com/ScoopInstaller/Main' },
  { name: 'nirsoft', link: 'https://github.com/kodybrown/scoop-nirsoft' },
  { name: 'versions', link: 'https://github.com/ScoopInstaller/Versions' },
  { name: 'jetbrains', link: 'https://github.com/Ash258/Scoop-JetBrains' },
  { name: 'extras', link: 'https://github.com/ScoopInstaller/Extras' },
  { name: 'dorado', link: 'https://github.com/h404bi/dorado' },
  { name: 'java', link: 'https://github.com/ScoopInstaller/Java' },
]

const softwareData = [
  { name: 'aria2', description: 'scoop下载程序时支持使用 aria2 来加速下载,安装后还需要配置' },
  { name: 'sudo', description: 'scoop 进行全局安装时需要使用到 sudo 命令,相当于以管理员权限运行命令' },
  { name: '7zip', description: 'scoop下载很多程序都需要用7zip自动解压,就算不安装,后面也会被自动安装的' },
  { name: 'utools', description: '生产力工具,主要可以快速搜索定位电脑中的文件,并且支持各种插件' },
  { name: 'tabby', description: '生产力工具,一个好用的命令行工具,但会损失一点点性能' },
  { name: 'snipaste', description: '一个好用的截图工具' },
  { name: 'git', description: '对,就是github的git,必须安装,否则其它很多功能无法使用' },
]

const handleSelectionChange = (val: any) => {
  multipleSelectBuckets.value = val
}
const handleSelectionSoftwareChange = (val: any) => {
  multipleSelectSoftwares.value = val
}
const isLoading = ref(false)
const cmd = ref("")
const configBuckets = () => {
  isLoading.value = true
  multipleSelectBuckets.value.forEach((item: any) => {
    isLoading.value = true
    cmd.value = `scoop bucket add ${item.name} ${item.link}`
    console.log(cmd)
    exec(cmd.value, (error: any, stdout: any, stderr: any) => {
      if (!error) {
        ElMessage({
          message: stdout,
          type: 'success'
        })
      } else {
        ElMessage({
          message: stderr,
          type: 'error'
        })
      }
      isLoading.value = false
    })
  });
  window.localStorage.setItem("updateBucket", "true");
}
const configSoftwares = () => {
  isLoading.value = true
  multipleSelectSoftwares.value.forEach((item: any) => {
    isLoading.value = true
    cmd.value = `scoop install ${item.name}`
    console.log(cmd)
    exec(cmd.value, (error: any, stdout: any, stderr: any) => {
      if (!error) {
        ElMessage({
          message: stdout,
          type: 'success'
        })
      } else {
        ElMessage({
          message: stderr,
          type: 'error'
        })
      }
      isLoading.value = false
    })
  });
  window.localStorage.setItem("updateSoftware", "true");
}
const openTerminal = () => {
  dialogVisible.value = true
}

const dialogVisible = ref(false)

const handleClose = (done: () => void) => {
  ElMessageBox.confirm('Are you sure to close this dialog?')
    .then(() => {
      done()
    })
    .catch(() => {
      // catch error
    })
}
const handleCloseInner = (c: boolean) => {
  dialogVisible.value = false
  exec("start powershell");
  if (c) {
    ipcRenderer.send('window-close')
  }
}
</script>
<template>
  <div>
    <el-dialog v-model="dialogVisible" title="Tips" width="30%" :before-close="handleClose">
      <span>是否需要关闭本程序?</span>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleCloseInner(false)">不关闭</el-button>
          <el-button type="primary" @click="handleCloseInner(true)">确认关闭</el-button>
        </span>
      </template>
    </el-dialog>

    <el-tabs tab-position="left" style="height: 410px" class="demo-tabs">
      <el-tab-pane label="安装Scoop">
        <el-card style="Height:300px">
          <el-scrollbar height="250px">
            <div v-for="item in commandMsg">{{ item }}</div>
          </el-scrollbar>
        </el-card>
        <el-steps :space="220" align-center :active="active" finish-status="success">
          <el-step title="第一步" description="打开远程权限" />
          <el-step title="第二步" description="自定义安装目录" />
          <el-step title="第三步" description="Scoop下载安装" />
          <el-step title="第四步" description="检查安装" />
        </el-steps>
        <div class="buttons">
          <el-button @click="back" :disabled="active == 0">上一步
          </el-button>
          <el-button @click="next" :disabled="isActive || active > 3">下一步</el-button>
        </div>
      </el-tab-pane>
      <el-tab-pane label="重新设置Scoop路径">
        <el-card style="Height:470px">
          <el-input v-model="scoopDir" placeholder="请输入路径或点击选择路径(为避免出现未知问题，最好使用非中文路径)" clearable />
          <el-scrollbar height="300px">
            <div v-for="item in resultMsg">{{ item }}</div>
          </el-scrollbar>
          <div>
            <el-button style="margin-left: 150px;" @click="choose">选择路径</el-button>
            <el-button type="primary" @click="setDir">设置路径</el-button>
          </div>
        </el-card>
      </el-tab-pane>
      <el-tab-pane label="推荐仓库一键配置" style="text-align:center">
        <el-scrollbar height="370px">
          <el-table ref="multipleTableRef" :data="bucketData" style="width: 100%"
            @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" />
            <el-table-column property="name" label="名称" width="130">
            </el-table-column>
            <el-table-column property="link" label="链接" />
          </el-table>
        </el-scrollbar>
        <el-tag v-if="isLoading" class="cmd">
          正在执行:{{ cmd }}</el-tag>
        <el-button style="margin-left:500px" type="primary" @click="configBuckets" :loading="isLoading">一键配置
        </el-button>
      </el-tab-pane>
      <el-tab-pane label="推荐软件一键安装" style="text-align:center">
        <el-scrollbar height="370px">
          <el-table :data="softwareData" style="width: 100%" @selection-change="handleSelectionSoftwareChange">
            <el-table-column type="selection" width="55" />
            <el-table-column property="name" label="名称" width="100" />
            <el-table-column property="description" label="说明" />
          </el-table>
        </el-scrollbar>
        <div>
          <el-tag v-if="isLoading" class="cmd">正在执行:{{ cmd }}</el-tag>
          <el-button style="margin-left:500px" type="primary" @click="configSoftwares" :loading="isLoading">一键安装
          </el-button>
        </div>
      </el-tab-pane>
      <el-tab-pane label="命令行" style="text-align:center">
        <el-button @click="openTerminal" type="primary" style="margin-top:150px">走开，我自己用命令行来</el-button>
      </el-tab-pane>
      <el-tab-pane label="关于" style="text-align:center">
        <h2>{{ config.name }}</h2>
        <p>Version:{{ config.version }}</p>
        <p>Author:{{ config.author }}</p>
        <p style="margin-top:50px">
          <el-button style="width: 120px; height: 30px;" @click="openLink('github')">Github</el-button>
        </p>
        <p>
          <el-button style="width: 120px; height: 30px;" @click="openLink('blog')">Blog</el-button>
        </p>

      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style scoped>
.buttons {
  display: flex;
  margin-top: 10px;
  padding-left: 70%;
}

.demo-tabs>.el-tabs__content {
  padding: 32px;
  color: #6b778c;
  font-size: 32px;
  font-weight: 600;
}

.cmd {
  position: fixed;
  bottom: 25px;
  right: 200px;
  width: 400px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* .el-tabs--right .el-tabs__content,
.el-tabs--left .el-tabs__content {
  height: 100%;
} */
</style>
