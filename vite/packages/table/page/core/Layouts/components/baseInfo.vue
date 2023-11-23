<template>
  <div class="drawer" ref="drawer">
    <img src="/img/rays.png" alt="" class="baseImg" @click="visible=true">
    <a-drawer :visible="visible" :closable="false"
              :getContainer="() => $refs.drawer"
              :placement="direction?'right':'left'" @close="visible=false"
              :with-header="false" size="340px">
      <div class="baseUserInfo background">
        <div class="userbox">
          <div class="infoBox">
            <img src="/img/user.png" alt="" class="userIcon">
            <div class="display:flex">
              <div class="username">测试用户</div>
              <div class="userTitle">testUser</div>
            </div>
          </div>
        </div>
        <div class="userContent">
          <a-form :model="form" laba-width="100px" size="small">
            <div class="form-item">
              <div class="form-key">主题风格 {{ themes }}</div>
              <div class="form-vakue">
                <a-radio-group v-model:value="themes" class="ml-4">
                  <a-radio :value="false" size="large">白天</a-radio>
                  <a-radio :value="true" size="large">黑夜</a-radio>
                </a-radio-group>
              </div>
            </div>
            <div class="form-item">
              <div class="form-key">动态主题</div>
              <div class="form-vakue themesColorBox flex">
                <colorPicker v-model="themesColor.primaryColor" result="#1890ff" title="asda"></colorPicker>
                <colorPicker v-model="themesColor.errorColor" result="#ff4d4f"></colorPicker>
                <colorPicker v-model="themesColor.warningColor" result="#faad14"></colorPicker>
                <colorPicker v-model="themesColor.successColor" result="#52c41a"></colorPicker>
                <colorPicker v-model="themesColor.infoColor" result="#909399"></colorPicker>
              </div>
            </div>
            <div class="form-item">
              <div class="form-key">国际化</div>
              <div class="form-vakue">
                <a-radio-group v-model:value="locales" class="ml-4">
                  <a-radio value="zh-cn" size="large">中文</a-radio>
                  <a-radio value="en" size="large">English</a-radio>
                </a-radio-group>
              </div>
            </div>
            <div class="form-item">
              <div class="form-key">固定header</div>
              <div class="form-vakue">
                <a-radio-group v-model:value="fixedTop" class="ml-4">
                  <a-radio :value="true" size="large">是</a-radio>
                  <a-radio :value="false" size="large">否</a-radio>
                </a-radio-group>
              </div>
            </div>
            <div class="form-item">
              <div class="form-key">菜单类型</div>
              <div class="form-vakue">
                <!-- 如果页面固定菜单 直接锁死 -->
                <a-radio-group v-model:value="isMenu" class="ml-4"
                               :disabled="router.currentRoute.value.meta.menu">
                  <a-radio :value="true" size="large">菜单Y</a-radio>
                  <a-radio :value="false" size="large">菜单X</a-radio>
                </a-radio-group>
              </div>
            </div>
            <div class="form-item">
              <div class="form-key">面包屑</div>
              <div class="form-vakue">
                <a-switch v-model:checked="isBreadcrumb" checked-children="开" un-checked-children="关"/>
              </div>
            </div>
            <div class="form-item">
              <div class="form-key">菜单导航</div>
              <div class="form-vakue">
                <a-switch v-model:checked="isPathbar" checked-children="开" un-checked-children="关"/>
              </div>
            </div>
            <div class="form-item">
              <div class="form-key">组件大小</div>
              <div class="form-vakue">
                <a-radio-group v-model:value="modulesSize" class="ml-4">
                  <a-radio value="large" size="large">大</a-radio>
                  <a-radio value="default" size="large">中</a-radio>
                  <a-radio value="small" size="large">小</a-radio>
                </a-radio-group>
              </div>
            </div>
            <div class="form-item">
              <div class="form-key">配置信息位置</div>
              <div class="form-vakue">
                <a-switch v-model:checked="direction" checked-children="开" un-checked-children="关"/>
              </div>
            </div>
            <div class="form-item">
              <div class="form-key">切换系统</div>

            </div>
            <div class="form-item">
              <div class="form-vakue  ">
                <a-scrollbar>
                </a-scrollbar>
              </div>
            </div>
          </a-form>
        </div>
      </div>
    </a-drawer>
  </div>
</template>
<script lang="ts">
import {computed, defineComponent, ref, watch} from 'vue'
import {useLayoutStore} from '@store/baseSettings' // 假设你已经创建了一个Pinia store并导出了useStore
import {useI18n} from 'vue-i18n'
import {useRouter} from 'vue-router'
import {ConfigProvider} from 'ant-design-vue'
import colorPicker from '@page/core/components/ColorPicker.vue'

export default defineComponent({
  components: {
    colorPicker
  },
  setup() {
    const store = useLayoutStore()
    const router = useRouter()
    const {locale} = useI18n()

    const visible = ref(false)
    const form = ref(true)

    const themes = computed({
      get: () => store.themes,
      set: (value: string) => {
        store.setThemes(value)
        // TODO 检查是否持久化了
        window.localStorage.setItem('themes', value)
      }
    })

    const themesColor = computed(() => store.themesColor)

    watch(
        themesColor,
        (newval, oldval) => {
          window.localStorage.setItem('themes', 'false')
          window.localStorage.removeItem('themesColor')
          ConfigProvider.config({
            theme: newval,
          })
          window.localStorage.setItem('themesColor', JSON.stringify(newval))
          store.setThemesColor(newval)
        },
        {
          deep: true,
        }
    )

    const locales = computed({
      get: () => store.locales,
      set: (value: string) => {
        locale.value = value
        store.setLocales(value)
        window.localStorage.setItem('locales', value)
      }
    })

    const fixedTop = computed({
      get: () => store.fixedTop,
      set: (value: string) => {
        window.localStorage.setItem('fixedTop', value)
        store.setFixedTop(value)
      }
    })

    const isMenu = computed({
      get: () => store.isMenu,
      set: (value: string) => {
        window.localStorage.setItem('isMenu', value)
        store.setIsMenu(value)
      }
    })

    const isBreadcrumb = computed({
      get: () => store.isBreadcrumb,
      set: (value: string) => {
        window.localStorage.setItem('isBreadcrumb', value)
        store.setIsBreadcrumb(value)
      }
    })

    const modulesSize = computed({
      get: () => store.modulesSize,
      set: (value: string) => {
        window.localStorage.setItem('modulesSize', value)
        store.setModulesSize(value)
      }
    })

    const isPathbar = computed({
      get: () => store.isPathbar,
      set: (value: string) => {
        window.localStorage.setItem('isPathbar', value)
        store.setIsPathBar(value)
      }
    })

    const direction = computed({
      get: () => store.direction,
      set: (value: string) => {
        window.localStorage.setItem('direction', value)
        store.setDirection(value)
      }
    })

    return {
      router,
      visible,
      form,
      isMenu,
      locales,
      fixedTop,
      isBreadcrumb,
      isPathbar,
      direction,
      themes,
      themesColor,
      modulesSize,
    }
  },
})
</script>
<style scoped lang="less">

.baseImg {
  position: fixed;
  right: 10px;
  top: 40%;
  z-index: 10;
  width: 30px;
  height: 30px;
  cursor: pointer;

  img {
    width: 100%;
  }
}

.baseUserInfo {
  box-shadow: var(--a-box-shadow-dark);
  height: 100%;

  .userbox {
    width: 100%;
    height: 150px;
    background: var(--a-color-primary-light-6);
    padding: 40px 20px;
    box-sizing: border-box;

    .infoBox {
      display: flex;
      align-items: center;
      padding-bottom: 4px;
      border-bottom: 1px solid #EEE;

      .username {
        // color: #FFf;
        font-size: 20px;
        font-weight: 600;
        margin-left: 20px;
        margin-top: 30px;
      }

      .userTitle {
        // color: #FFF;
        margin-left: 20px;
      }

      .userIcon {
        width: 100px;
        height: 100px;
        border-radius: 50%;
      }
    }
  }

  .a-radio {
    margin-right: 10px;
  }

  .userContent {
    width: 100%;

    .form-item {
      padding: 10px 20px;
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-sizing: border-box;
      border-bottom: #eee 1px solid;

      .themesColorBox {
        input {
          width: 20px;
          margin-left: 20px;
        }
      }
    }
  }

  .systemBox {
    display: flex;
    width: 100%;

    .systemList {
      width: 100px;
      text-align: center;
      cursor: pointer;
    }

    .systemListAction {
      color: aqua;
    }
  }


}
</style>
