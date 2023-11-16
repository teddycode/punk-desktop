<script lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import {defineComponent} from "vue";
import {message, Modal} from 'ant-design-vue'
import {
  AimOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined,
  CheckSquareOutlined,
  ControlOutlined,
  DownloadOutlined,
  ExclamationCircleOutlined,
  ExpandAltOutlined,
  EyeOutlined,
  GoldOutlined,
  HomeOutlined,
  ImportOutlined,
  InsuranceOutlined,
  LayoutOutlined,
  LinkOutlined,
  LockOutlined,
  NodeIndexOutlined,
  SearchOutlined,
  SkinOutlined
} from '@ant-design/icons-vue'
import settings from '../../src/settings/settingsContent'
import settingPage from '../../src/settings/settingPage.js'
import Passwords from "./components/Passwords.vue";
import zhCN from 'ant-design-vue/es/locale/zh_CN';
import {passwordManagers} from '../../src/settings/passwordManager'
import SettingGroup from "./components/SettingGroup.vue";

let {logger} = window.$models

export default defineComponent({
  components: {
    SettingGroup,
    Passwords, ImportOutlined,
    EyeOutlined, LayoutOutlined, SearchOutlined, AimOutlined, ControlOutlined, CheckSquareOutlined, HomeOutlined,
    LockOutlined, NodeIndexOutlined, GoldOutlined, InsuranceOutlined, ExpandAltOutlined, ArrowRightOutlined, DownloadOutlined,
    ExclamationCircleOutlined,
    SkinOutlined, LinkOutlined,
    CheckCircleOutlined
  },
  data() {
    return {
      currentPasswordDb: {},
      currentPasswordManager: {
        alias: '无'
      },
      logCount: 0,//'日志记录数'
      locale: zhCN,
      savePath: '',
      platform: '',//平台
      autoStart: false,//自动启动
      closeExit: 1,//关闭时的默认操作
      askCloseExit: true,//关闭的时候询问
      showCloseExit: false,//
      downloadAuto: false,
      sideBarPopoverDelay: 0,//侧边栏感知延迟
      showSideBarPopover: true,//显示侧边栏悬浮面板
      activeKey: 'Privacy',
      db: {},
      settings: {
        appearance: {
          title: '外观',
          itemGroups: [
            {
              name: 'darkMod',
              title: '深色模式',
              items: [
                {
                  name: 'useTabDarkBackground',
                  title: '标签页深色背景',
                  type: 'switch',
                  tip: '深色模式下，新标签页背景色设置为深色（此设置不会影响到网页内容的背景色）'
                }
              ]
            }
          ]
        },
        debug: {
          title: '调试',
          itemGroups: [
            {
              name: 'log',
              title: '日志',
              items: [
                {
                  name: 'clearLog',
                  title: '清理日志',
                  type: 'button',
                  buttonType: 'primary',
                  buttonSize: 'small',
                  click: () => {
                    logger.getCount((data) => {
                      this.logCount = data[0].count
                      Modal.confirm({
                        content: '当前存在的日志数：' + this.logCount + '，确认清理？此操作不可恢复。',
                        centered: true,
                        onOk: () => {
                          logger.clear((cb) => {
                            message.success('清理成功。')
                            this.getDbSize()
                          })
                        }
                      })
                    })
                  },
                  tip: '清理全部的日志，点击可查看前日志总数',
                },
                {
                  name: 'requestLog',
                  title: '请求日志',
                  type: 'switch',
                  tip: '开启请求日志，将记录下发送至服务器的请求（仅包含浏览器系统请求，不包含网页请求）。可能导致数据库性能下降。默认不开启。'
                },
                {
                  name: 'logLimit',
                  title: '最多记录请求数',
                  type: 'number',
                  value: 1000,
                  defaultValue: 1000,
                  max: 1000000,
                  tip: '数据库允许记录的最多请求数，超过则会自动被清理。最多记录100万条。'
                }
              ]
            },

          ]
        },
        sidePanel:
            {
              title: '左侧栏',
              itemGroups: [
                {
                  name: 'base',
                  title: '基础设置',
                  download: [
                    {
                      // callback:['sidebar'],
                      value: false,
                      defaultValue: false,
                      name: 'downloadAutoSave',
                      title: '每次下载前询问文件保存位置',
                      type: 'switch',
                      tip: '每次下载之前都会弹出保存位置选择框，手动选择下载文件保存的位置'
                    }
                  ],
                  items: [
                    {
                      callback: ['sidebar', 'main'],//改变的时候，通知侧边栏
                      value: 0,
                      defaultValue: 0,
                      name: 'sideBarFocusDelay',
                      title: '左侧栏聚焦延迟',
                      unit: '百毫秒',
                      type: 'number',
                      tip: '设置延迟后，可减少误触概率，但是也将同时降低左侧栏的响应速度，建议设置为300毫秒左右。如频繁使用左侧栏，可调整为0。'
                    },
                    {
                      callback: ['sidebar'],//改变的时候，通知侧边栏
                      value: false,
                      defaultValue: false,
                      name: 'sideBarDbClickCloseTask',
                      title: '双击删除标签组',
                      type: 'switch',
                      tip: '在左侧栏标签组上双击，自动关闭标签组。'
                    },
                    {
                      callback: ['sidebar'],//改变的时候，通知侧边栏
                      value: false,
                      defaultValue: false,
                      name: 'sideBarCloseAutoClean',
                      title: '组内存在锁定标签时删除标签组改为清理标签组',
                      type: 'switch',
                      tip: '当标签组内存在锁定标签时，自动改为清理标签组内非锁定标签。对双击删除、点关闭均生效。不勾选则仅提示。建议勾选。'
                    },
                  ]
                },
                {

                  name: 'popover',
                  img: '/img/tip-sidebar-popover.png',
                  title: '悬浮面板',
                  tip: '当鼠标移到左侧栏标签组上的时候，会自动出现悬浮面板。',
                  items: [
                    {
                      callback: ['sidebar'],//改变的时候通知侧边栏
                      value: true,//此值用于绑定
                      defaultValue: true,//默认值
                      name: 'showSideBarPopover',
                      title: '启用悬浮面板',
                      type: 'switch',
                      tip: '鼠标移动到标签组上的时候显示悬浮面板。关闭后则不显示。'
                    }
                  ]
                },
              ]
            }
      }
    }
  },
  mounted() {
    let url = new URL(window.location)

    var type = url.searchParams.get('tab')
    this.activeKey = type || 'Privacy'
    settings.get('downloadAutoSave', (value) => {
      if (value !== undefined) {
        this.downloadAuto = value
      }
    })


    this.platform = process.platform
    window.settings = settings
    // settings.load()
    settingPage.init()
    settings.get('autoRun', (value) => {
      if (value !== undefined)
        this.autoStart = value
    })
    settings.get('closeExit', (value) => {
      if (value !== undefined)
        this.closeExit = value
    })
    settings.get('askCloseExit', (value) => {
      if (value !== undefined)
        this.askCloseExit = value
    })
    this.initCustomSettings()

    ipc.on('getSavePath', (event, args) => {
      this.savePath = args
    })

    settings.get('downloadSavePath', (value) => {
      if (value !== undefined) {
        this.savePath = value
      }
    })


    this.getDbSize()

    this.preparePasswordsSettings()
  },

  // setup() {
  //   const activeKey = ref('Privacy')
  //
  //   return {
  //     activeKey,
  //   }
  // },


  methods: {
    getDbSize() {
      let fileStat = require('fs').statSync(window.globalArgs['user-data-dir'] + '/db/db.sqlite')
      this.db = {
        size: (fileStat.size / 1024 / 1024).toFixed(2)
      }
    },
    changePwdDb() {
      ipc.send('changePwdDb')
    },
    setPasswordManager(pm) {
      if (typeof pm === 'string') {
        pm = this.passwordManagers[1]
      }

      settings.set('passwordManager', {name: pm.name})
      settings.get('passwordDb', (value) => {
        if (this.currentPasswordManager.name === 'file' && (!value || !value.filePath)) {
          Modal.confirm({
            title: '提示',
            content: '您必须手动设置一个密码库之后方可使用密码填充功能，点击去设置进行设置。',
            okText: '去设置',
            cancelText: '暂不设置',
            onOk: () => {
              this.changePwdDb()
            }
          })
        }
      })
      this.currentPasswordManager = pm
    },
    preparePasswordsSettings() {
      /* Password auto-fill settings  */
      this.passwordManagers = passwordManagers
      settings.get('passwordManager', (value) => {
        if (!value) {
          this.currentPasswordManager = this.passwordManagers[0]
          return
        }
        console.log(value, 'pwd')
        this.currentPasswordManager = this.passwordManagers.find(pm => {
          return pm.name === value.name
        })
        if (value.name === 'file') {
          this.currentPasswordDb.filePath = value.filePath
        }
      })
      settings.listen('passwordManager', (value) => {
        if (!value) {
          this.currentPasswordManager = this.passwordManagers[0]
          return
        }
        this.currentPasswordManager = this.passwordManagers.find(pm => {
          return pm.name === value.name
        })
        if (value.name === 'file') {
          this.currentPasswordDb.filePath = value.filePath
        }
      })


      // settings.listen('passwordManager', function (value) {
      //   if(currentPasswordManager.name==='Built-in password manager'){
      //     passwordManagersDropdown.value='内置密码管理器'
      //   }else{
      //     passwordManagersDropdown.value = currentPasswordManager.name
      //   }
      // })
      //
      // passwordManagersDropdown.addEventListener('change', function (e) {
      //   if (this.value === 'none') {
      //     settings.set('passwordManager', { name: 'none' })
      //   } else {
      //     if(this.value==='内置密码管理器'){
      //       settings.set('passwordManager', { name: 'Built-in password manager' })
      //     }else{
      //       settings.set('passwordManager', { name: this.value })
      //     }
      //   }
      // })
    },
    onChange(e) {
      if (e == true) {
        settings.set('downloadAutoSave', true)
      }
      if (e == false) {
        settings.set('downloadAutoSave', false)
      }
    },
    importPwd() {
      Modal.confirm({
        title: '选择csv文件导入',
        content: 'csv可从其他浏览器的密码导出功能导出获得。导入后请手动刷新设置页面。',
        centered: true,
        onOk: () => {
          ipc.send('importPwd')
        },
        okText: '导入',
        cancelText: '取消'
      })
    },
    /**
     * 读入自定义配置
     */
    choseSavePath(e) {
      ipc.send('setSavePath')
    },
    initCustomSettings() {
      let keys = Object.keys(this.settings)
      keys.forEach((setGroup, key) => {
        this.settings[setGroup].itemGroups.forEach((itemGroup) => {

          itemGroup.items.forEach((item) => {
            //读取配置项
            settings.get(item.name, (value) => {
              if (value === undefined) {
                item.value = item.defaultValue
              } else {
                item.value = value
              }
            })

            //绑定配置项的自动存储事件
            item.onChange = (event) => {
              let value
              switch (item.type) {
                case 'switch':
                case 'number':
                  value = event
                  break
              }
              settings.set(item.name, value)
              if (item.callback) {
                let args = {
                  callback: JSON.parse(JSON.stringify(item.callback)),
                  name: item.name,
                  value: value
                }
                setTimeout(() => {
                  ipc.send('settingChangedCallback', args)
                }, 500)
              }
            }
          })
        })
      })
    },


    changeAutoStart(value) {
      let isAutoRun = value.target.checked
      ipc.send('setAutoRun', {value: isAutoRun})
    },
    changeCloseExit(value) {
      let closeExit = Number(value.target.value)
      settings.set('closeExit', closeExit)
    },
    changeAskCloseExit(value) {
      let checked = value.target.checked
      settings.set('askCloseExit', checked)
    },
    setDefault() {
      settingPage.callSetDefaultBrowser()
    },
    openUrl(url) {
      window.ipc.send('addTab', {url: url})
    }
  }
})
</script>

<template>
  <a-config-provider :locale="locale">
    <div id="restart-required-banner" class="banner yellow-background" hidden role="alert">
      <div class="container">
        <i class="i carbon:information"></i>
        <span data-string="settingsRestartRequired"></span>
      </div>
    </div>
    <div style="margin:auto;width: 1200px;box-shadow:0 0 16px rgba(0,0,0,0.32)">
      <div style="background:white">
        <a-tabs v-model:activeKey="activeKey" :destroyInactiveTabPane="false" style="height: 100vh; " tabPosition="left"
                type="card">
          <template #leftExtra>
            <div style="padding-top: 20px;padding-bottom: 20px;font-size: 20px">
              <a-avatar src="/icons/logo128.png" style="margin-right: 5px"></a-avatar>
              设置
            </div>
          </template>
          <a-tab-pane key="Privacy" :forceRender="true">
            <template #tab>
              <span>
                <eye-outlined/>
                隐私设置
              </span>
            </template>
            <div id="privacy-settings-container" class="settings-container">
              <h3 class="set-item" data-string="settingsPrivacyHeading"></h3>

              <div id="content-blocking-statistics" class="settings-info-subheading">
                <insurance-outlined style="font-size: 24px;vertical-align: middle"/>
                <span id="content-blocking-blocked-requests" data-allowHTML data-string="settingsBlockedRequestCount">
                </span>
              </div>

              <div id="tracking-level-container" class="setting-section">
                <div class="setting-option">
                  <input id="blocking-allow-all" name="blockingLevel" type="radio"/>
                  <label data-string="settingsContentBlockingLevel0" for="blocking-allow-all"></label>
                </div>
                <div class="setting-option">
                  <input id="blocking-third-party" name="blockingLevel" type="radio"/>
                  <label data-string="settingsContentBlockingLevel1" for="blocking-third-party"></label>
                </div>
                <div class="setting-option">
                  <input id="blocking-block-all" name="blockingLevel" type="radio"/>
                  <label data-string="settingsContentBlockingLevel2" for="blocking-block-all"></label>
                </div>

                <div id="content-blocking-information" hidden>
                  <div>
                    <label data-string="settingsContentBlockingExceptions" for="content-blocking-exceptions"></label>
                    <textarea id="content-blocking-exceptions" rows="1" spellcheck="false"
                              style="width: 100%; max-width: 500px"></textarea>
                  </div>
                  <a id="customize-filters-link" data-string="settingsCustomizeFiltersLink"
                     href="https://www.yuque.com/tswork/ngd5zk/vch5wr"
                     target="_blank"></a>
                </div>
              </div>

              <div id="content-type-blocking"></div>
            </div>
          </a-tab-pane>
          <a-tab-pane key="Appearance" :forceRender="true">
            <template #tab>
              <span>
                <skin-outlined/>
                外观
              </span>

            </template>
            <div id="appearance-settings-container" class="settings-container">
              <h3 data-string="settingsAppearanceHeading"></h3>

              <label data-string="settingsEnableDarkMode" for="dark-mode-container"></label>
              <div id="dark-mode-container" class="setting-section">
                <div class="setting-option">
                  <input id="dark-mode-never" name="darkMode" type="radio"/>
                  <label data-string="settingsDarkModeNever" for="dark-mode-never"></label>
                </div>
                <div class="setting-option">
                  <input id="dark-mode-night" name="darkMode" type="radio"/>
                  <label data-string="settingsDarkModeNight" for="dark-mode-night"></label>
                </div>
                <div class="setting-option">
                  <input id="dark-mode-always" name="darkMode" type="radio"/>
                  <label data-string="settingsDarkModeAlways" for="dark-mode-always"></label>
                </div>
                <div class="setting-option">
                  <input id="dark-mode-system" name="darkMode" type="radio"/>
                  <label data-string="settingsDarkModeSystem" for="dark-mode-system"></label>
                </div>
              </div>

              <div class="setting-section">
                <input id="checkbox-site-theme" type="checkbox"/>
                <label data-string="settingsSiteThemeToggle" for="checkbox-site-theme"></label>
              </div>

              <div class="setting-section">
                <input id="checkbox-show-divider" type="checkbox"/>
                <label data-string="settingsShowDividerToggle" for="checkbox-show-divider"></label>
              </div>

              <SettingGroup :item-groups="settings.appearance.itemGroups"></SettingGroup>

            </div>

          </a-tab-pane>
          <a-tab-pane key="SidePanel" :forceRender="true">
            <template #tab>
              <span>
                <layout-outlined/>
                左侧栏
              </span>
            </template>
            <SettingGroup :item-groups="settings.sidePanel.itemGroups"></SettingGroup>
          </a-tab-pane>
          <a-tab-pane key="DownloadSetting" :forceRender="true">
            <template #tab>
              <span>
                <download-outlined/>
                下载设置
              </span>
            </template>
            <div class="settings-container">
              <h3>下载设置</h3>
              <div class="setting-section" style="display: flex;align-items: center">
                <span>设置默认下载保存路径:</span>
                <a-input v-model:value="savePath" :disabled="true" placeholder="请选择文件保存路径"
                         style="width: 40%;margin-left: 15px"/>
                <span style="margin-left: 15px;cursor: pointer" @click="choseSavePath()">更改</span>
              </div>
              <div v-for="itemGroup in settings.sidePanel.itemGroups" class="settings-container">
                <div v-for="item in itemGroup.download">
                  <span class="item-title">- {{ item.title }}：</span> &nbsp;&nbsp;
                  <span v-if="item.type === 'switch'">
                    <a-switch v-model:checked="downloadAuto" size="small" style="margin-bottom: 4px"
                              @change="onChange($event)"/>
                  </span>
                  <p class="tip">
                    <exclamation-circle-outlined/>
                    {{ item.tip }}
                  </p>
                </div>
              </div>

            </div>
          </a-tab-pane>
          <a-tab-pane key="Feature" :forceRender="true">
            <template #tab>
              <span>
                <ControlOutlined/>
                其他功能
              </span>
            </template>
            <div id="additional-settings-container" class="settings-container">
              <h3>开机自启动</h3>

              <div class="setting-section">
                <a-checkbox v-model:checked="autoStart" @change="changeAutoStart">开机自启动（浏览器启动加速）
                </a-checkbox>
                <p class="tip">
                  开机后，自动后台启动到托盘菜单，并开始累计在线时长。此功能同时可加快浏览器的启动速度。
                </p>
                <br>


                <!--  仅window上显示此配置项 -->
                <h3>关闭主界面后操作（仅限Windows操作系统）</h3>

                <div style="margin-top: 5px">
                  <a-checkbox v-model:checked="askCloseExit" :disabled="this.platform !== 'win32'"
                              @change="changeAskCloseExit">每次关闭主窗体的时候都询问
                  </a-checkbox>
                </div>
                <a-radio-group
                    v-if="askCloseExit === false && this.platform === 'win32'"
                    v-model:value="closeExit"
                    style="margin-top: 10px;margin-bottom: 10px;background: #f1f1f1;padding: 10px;border-radius: 3px"
                    @change="changeCloseExit">
                  <a-radio :value="0">完全退出</a-radio>
                  <a-radio :value="1">节能后台运行（推荐）</a-radio>
                </a-radio-group>
                <div class="tip" style="margin-top: 5px">
                  <exclamation-circle-outlined/>
                  节能后台运行将<strong>大幅度降低</strong>软件内存消耗。
                  <br>
                  选择完全退出则不能：
                  <ol style="padding-left: 20px">
                    <li>
                      累计在线使用时长，提升在线等级。
                    </li>
                    <li>
                      接收轻聊、应用消息。
                    </li>
                    <li>
                      快速打开浏览器。
                    </li>
                  </ol>
                </div>

                <h3>其他</h3>
                <input id="checkbox-userscripts" type="checkbox"/>
                <label data-string="settingsUserscriptsToggle" for="checkbox-userscripts"></label>
                <div class="settings-info-subheading setting-secondary-label"
                     data-allowHTML
                     data-string="settingsUserscriptsExplanation"></div>
              </div>

              <div id="section-separate-titlebar" class="setting-section" hidden>
                <input id="checkbox-separate-titlebar" type="checkbox"/>
                <label data-string="settingsSeparateTitlebarToggle" for="checkbox-separate-titlebar"></label>
              </div>

              <div id="section-open-tabs-in-foreground" class="setting-section">
                <input id="checkbox-open-tabs-in-foreground" type="checkbox"/>
                <label data-string="settingsOpenTabsInForegroundToggle" for="checkbox-open-tabs-in-foreground"></label>
              </div>

              <div id="section-user-agent" class="setting-section">
                <input id="checkbox-user-agent" type="checkbox"/>
                <label data-string="settingsUserAgentToggle" for="checkbox-user-agent"></label>
                <input id="input-user-agent" style="
            vertical-align: middle;
            margin-left: 1em;
            width: 375px;
            max-width: 80vw;
            visibility: hidden;
          " type="text"/>
              </div>

              <div class="setting-section">
                <input id="checkbox-enable-autoplay" type="checkbox">
                <label data-string="settingsAutoplayToggle" for="checkbox-enable-autoplay"></label>
              </div>

              <!-- 暂不支持自动检测更新关闭     <div class="setting-section">-->
              <!--        <input type="checkbox" id="checkbox-update-notifications" />-->
              <!--        <label-->
              <!--          for="checkbox-update-notifications"-->
              <!--          data-string="settingsUpdateNotificationsToggle"-->
              <!--        ></label>-->
              <!--      </div>-->
              <div class="setting-section">
                <input id="checkbox-usage-statistics" type="checkbox"/>
                <label data-allowHTML data-string="settingsUsageStatisticsToggle"
                       for="checkbox-usage-statistics"></label>
              </div>
            </div>

          </a-tab-pane>
          <a-tab-pane key="SearchEngine" :forceRender="true">
            <template #tab>
              <span>
                <SearchOutlined/>
                搜索引擎
              </span>
            </template>
            <div id="search-engine-settings-container" class="settings-container">
              <h3 data-string="settingsSearchEngineHeading"></h3>

              <div class="setting-section">
                <label data-string="settingsDefaultSearchEngine" for="defaultSearchEngine"></label>
                <select id="default-search-engine" name="defaultSearchEngine"></select>
                <input id="custom-search-engine" hidden style="margin-left: 0.5em; min-width: 325px"/>

                <div class="settings-info-subheading" data-string="settingsDDGExplanation" style="padding-top: 0.4em">
                </div>
              </div>
            </div>

          </a-tab-pane>
          <a-tab-pane key="Operation" :forceRender="true">
            <template #tab>
              <span>
                <AimOutlined/>
                操作
              </span>
            </template>
            <div id="browser-settings-container" class="settings-container">
              <h3>便捷操作</h3>
              <div class="setting-section">
                <label><input id="dropOpenLink" type="checkbox"> 拖拽链接以新标签页打开</label>
                <div class="settings-info-subheading">当拖拽网页中的链接时，以新标签页打开。</div>
              </div>
              <div class="setting-section">
                <label><input id="dbClickClose" type="checkbox"> 双击关闭标签</label>
                <div class="settings-info-subheading">当双击标签栏的标签时，直接将其关闭（非锁定标签）</div>
              </div>
            </div>
            <div id="browser-gesture" class="settings-container">
              <h3>触摸板手势</h3>
              <div class="setting-section">
                <label><input id="gestureBack" type="checkbox"> 双指向右滑返回</label>
                <p>
                  <svg aria-hidden="true" class="gesture-icon">
                    <use xlink:href="#icon-swipe-right"></use>
                  </svg>
                  <span class="gesture-tip">捏合双指，自左向右滑动</span>
                </p>
              </div>
              <div class="setting-section">
                <label><input id="gestureZoom" type="checkbox"> 双指缩放</label>
                <div class="settings-info-subheading">取消勾选后，按住Ctrl（Command）+鼠标滚轮也将同时失效。</div>
                <p>
                  <a-button size="small">ctrl</a-button>
                  +
                  <svg aria-hidden="true" class="gesture-icon">
                    <use xlink:href="#icon-pinch"></use>
                  </svg>
                  <svg aria-hidden="true" class="gesture-icon">
                    <use xlink:href="#icon-stretch"></use>
                  </svg>
                  <span class="gesture-tip">按住Ctrl（Mac是Command），同时双指捏合或者双指拉大，可调节网页缩放比例</span>
                </p>

              </div>
            </div>
          </a-tab-pane>
          <a-tab-pane key="Default" :forceRender="true">
            <template #tab>
              <span>
                <check-square-outlined/>
                默认浏览器
              </span>
            </template>
            <div id="browser-settings-container" class="settings-container">
              <h3 data-string="settingsBrowserHeading"></h3>
              <p>当前：<span id="os_name"></span> <span id="os_type"></span></p>
              <div class="setting-section">
                <input id="custom-browser" hidden style="margin-left: 0.5em; min-width: 325px"/>
                <button id="button-default-browser" style="border-radius: 4px;border: solid 1px #ccc;padding: 5px "
                        @click="setDefault"></button>
              </div>
            </div>
          </a-tab-pane>
          <a-tab-pane key="NewTab" :forceRender="true">
            <template #tab>
              <span>
                <home-outlined/>
                起始页
              </span>
            </template>

            <div id="browser-tab-container" class="settings-container">
              <h3>起始页</h3>
              <div id="tab-choose" class="setting-section">
                <div class="setting-option" style="display: flex;align-items: center">
                  <input id="tstab-input" name="tabChoosed" type="radio"/>
                  <label for="tstab-input">磐古桌面（官方尝鲜版）</label>
                  <div class="url-icon" @click="openUrl('ts://newtab')">
                    <link-outlined/>
                  </div>

                </div>
                <div class="setting-option" style="display:flex;align-items: center">
                  <input id="qingning-input" name="tabChoosed" type="radio"/>
                  <label for="qingning-input">青柠起始页（极致简约）</label>
                  <div class="url-icon" @click="openUrl('https://limestart.cn/')">
                    <link-outlined/>
                  </div>
                </div>
                <div class="setting-option" style="display: flex;align-items: center">
                  <input id="infinity-input" name="tabChoosed" type="radio"/>
                  <label for="infinity-input">infinity（功能强大）</label>
                  <div class="url-icon" @click="openUrl('https://inftab.com/')">
                    <link-outlined/>
                  </div>
                </div>
                <div class="setting-option" style="display: flex;align-items: center">
                  <input id="itab-input" name="tabChoosed" type="radio"/>
                  <label for="itab-input">iTab（热门新秀）</label>
                  <div class="url-icon" @click="openUrl('https://go.itab.link/?t=2')">
                    <link-outlined/>
                  </div>
                </div>
                <div class="setting-option">
                  <input id="tab-custom-input" name="tabChoosed" type="radio"/>
                  <label for="tab-custom-input">自定义</label>
                  <input id="tab-text-input" hidden placeholder="请输入" style="width: 100%; max-width: 300px"
                         type="text"/>
                </div>
              </div>
            </div>

          </a-tab-pane>
          <a-tab-pane key="Password" :forceRender="true">
            <template #tab>
              <span>
                <lock-outlined/>
                密码管理
              </span>
            </template>
            <div id="password-autofill-container" class="settings-container">
              <h3 data-string="settingsPasswordAutoFillHeadline"></h3>

              <div class="setting-section">

                当前密码管理器：
                <a-avatar v-if="currentPasswordManager.icon" :src="currentPasswordManager.icon" shape="square"/>
                <a-avatar v-else style="background-color: #1890ff">内</a-avatar>
                {{ currentPasswordManager.alias }}

                <div v-if="currentPasswordManager.name !== 'file'" hidden
                     style="border: 1px solid rgba(65,105,225,0.64);padding: 10px;width: 600px;border-radius: 4px;;margin-top: 10px;">
                  <div>
                    <a-avatar :size="30" src="/kee/kee.svg"></a-avatar>
                    <strong
                        style="font-size: 16px;margin-left: 10px">磐古轻密码</strong></div>
                  <div style="padding-left: 42px;">推荐使用<strong>磐古轻密码</strong>管理您的密码，可一键迁移当前浏览器密码至轻应用。
                    <a-button size="small" style="margin-top: 10px" type="primary"
                              @click="setPasswordManager('file')">点击更改
                    </a-button>
                  </div>

                </div>

                <div v-if="currentPasswordManager.name === 'file'"
                     style="margin-top: 10px;margin-bottom: 10px;padding-left: 20px">
                  <a-input-group compact style="float: right">

                    <a-input :value="currentPasswordDb.filePath" disabled placeholder="请选择密码库"
                             style="width:400px">
                      <template #addonBefore>
                        密码库位置
                      </template>
                    </a-input>
                    <a-button type="primary" @click="changePwdDb">更改密码库</a-button>
                  </a-input-group>
                </div>

                <a-collapse ghost size="small">
                  <a-collapse-panel header='更换密码管理器'>
                    <a-list :data-source="passwordManagers" :grid="{ gutter: 20, column: 2 }">
                      <template #renderItem="{ item }">
                        <a-list-item>
                          <a-card
                              :style="{ 'border-color': currentPasswordManager.name === item.name ? '#3a8ee6' : '#f1f1f1', background: currentPasswordManager.name === item.name ? 'rgba(58,142,230,0.03)' : 'white' }"
                              hoverable size="small">
                            <template #actions>
                              <a v-if="item.disable">敬请期待</a>
                              <a v-else-if="currentPasswordManager.name === item.name" style="color:#1890ff"
                                 @click="setPasswordManager(item)">
                                <check-circle-outlined/>
                                当前使用中</a>
                              <a v-else="currentPasswordManager.name===item.name"
                                 @click="setPasswordManager(item)">
                                <check-circle-outlined/>
                                设置</a>
                              <a :href="item.url" target="_blank"> 查看官网</a>
                            </template>
                            <a-card-meta :title="item.alias">
                              <template #description>
                                <div v-html="item.summary"></div>
                              </template>
                              <template #avatar>
                                <a-avatar v-if="item.icon" :src="item.icon" shape="square"/>
                                <a-avatar v-else style="background-color: #1890ff">内</a-avatar>
                              </template>
                            </a-card-meta>
                          </a-card>
                        </a-list-item>
                      </template>
                    </a-list>
                  </a-collapse-panel>
                </a-collapse>
                <!--              <select-->
                <!--                -->
                <!--              ></select>-->

              </div>

              <h3>内置密码库内的密码（任何使用此浏览器的用户均可切换到内置密码库，重要密码建议使用独立密码库）
                <a-button size="small" style="float: right"
                          type="primary" @click="importPwd">
                  <import-outlined/>
                  导入密码
                </a-button>
              </h3>
              <Passwords/>
            </div>

          </a-tab-pane>
          <a-tab-pane key="Proxy" :forceRender="true">
            <template #tab>
              <span>
                <NodeIndexOutlined/>
                代理
              </span>
            </template>
            <div id="proxy-settings-container" class="settings-container">
              <h3 data-string="settingsProxyHeading"></h3>

              <div id="proxy-type-container" class="setting-section">
                <select id="selected-proxy-type">
                  <option data-string="settingsNoProxy"></option>
                  <option data-string="settingsManualProxy"></option>
                  <option data-string="settingsAutomaticProxy"></option>
                  <option data-string="settingsSystemProxy"></option>
                </select>
              </div>

              <div id="manual-proxy-section" class="setting-section">
                <div class="setting-option">
                  <label data-string="settingsProxyRules" for="proxy-rules-input"></label>
                  <input id="proxy-rules-input" name="proxyRules" placeholder="proxy.example.com:8080" type="text"/>
                </div>

                <div class="setting-option">
                  <label data-string="settingsProxyBypassRules" for="proxy-bypass-rules-input"></label>
                  <input id="proxy-bypass-rules-input" name="proxyBypassRules"
                         placeholder="localhost, 127.0.0.1/8, ::1"/>
                </div>
              </div>

              <div id="pac-option" class="setting-option">
                <label data-string="settingsProxyConfigurationURL" for="pac-url-input"></label>
                <input id="pac-url-input" placeholder="https://example.com/proxy.pac" type="text"/>
              </div>
            </div>

          </a-tab-pane>
          <a-tab-pane key="ShortCuts" :forceRender="true">
            <template #tab>
              <span>
                <AimOutlined/>
                快捷键
              </span>
            </template>
            <div id="keymap-settings-container" class="settings-container">
              <h3 data-string="settingsKeyboardShortcutsHeading"></h3>
              <div class="settings-info-subheading" data-string="settingsKeyboardShortcutsHelp"></div>

              <div class="setting-section">
                <ul id="key-map-list"></ul>
              </div>
            </div>
          </a-tab-pane>
          <a-tab-pane key="Bangs" :forceRender="true">
            <template #tab>
              <span>
                <gold-outlined/>
                快捷指令
              </span>
            </template>

            <div id="custom-bangs-container" class="settings-container">
              <h3 data-string="settingsCustomBangs"></h3>
              <div class="setting-section">
                <ul id="custom-bangs"></ul>
                <button id="add-custom-bang" data-string="settingsCustomBangsAdd"></button>
              </div>
            </div>
          </a-tab-pane>
          <a-tab-pane key="Debug" :forceRender="true">
            <template #tab>
              <span>
                <layout-outlined/>
                调试模式
              </span>
            </template>
            <SettingGroup :item-groups="settings.debug.itemGroups"></SettingGroup>
            <p>当前数据库大小：{{ db.size }} MB
              <a-button size="small" @click="getDbSize">刷新</a-button>
            </p>
          </a-tab-pane>
        </a-tabs>
      </div>

    </div>
  </a-config-provider>
</template>
<style>
body {
  background: #f1f1f1
}

.gesture-tip {
  margin-left: 10px;
}

.set-title {
  margin-bottom: 5px;
}

h3 {
  font-size: 14px;
  padding-bottom: 5px;
  margin-left: -20px;
  padding-left: 5px;
  position: relative;
  margin-top: 10px;
}
</style>
<style lang="scss">
h3 {
  &:before {
    content: "";
    display: inline-block;
    background: #0051ff;
    width: 5px;
    border-radius: 3px;
    height: 16px;
    position: absolute;
    bottom: 8px;
    left: -8px;

  }
}

.item-group-tip {
  font-size: 13px;
  margin-left: -15px;
  color: #999;
  margin-bottom: 10px;
}

.item-title {
}

.tip {
  color: grey;
  font-size: 12px;
  margin-top: 5px;
}

.url-icon {
  cursor: pointer;
}
</style>
