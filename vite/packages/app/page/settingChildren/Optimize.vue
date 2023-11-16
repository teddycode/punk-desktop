<template>
  <h3>体验优化</h3>

  <a-form :label-col="{span:5}" :model="userSetting" :wrapper-col="{span:19}" style="padding: 20px">
    <a-form-item id="optimize" :rules="{ initialValue: ['A', 'B'] }" label="体验优化" style="margin-bottom: 0">

      <a-row class="setting-check-boxes">
        <a-col :span="8">
          <a-checkbox v-model:checked="userSetting.optimize.autoRun" name="autoRun">
            默认启动
          </a-checkbox>
        </a-col>
        <a-col :span="8">
          <a-checkbox v-model:checked="userSetting.optimize.keepRunning" name="keepRunning">
            保持运行
          </a-checkbox>
        </a-col>
        <!--                        <a-col :span="8">-->
        <!--                          <a-checkbox value="theme">-->
        <!--                            沉浸式主题色-->
        <!--                          </a-checkbox>-->
        <!--                        </a-col>-->
        <!--                        <a-col :span="8">-->
        <!--                          <a-checkbox value="desktop">-->
        <!--                            桌面快捷方式-->
        <!--                          </a-checkbox>-->
        <!--                        </a-col>-->
        <a-col :span="8">
          <a-checkbox v-model:checked="userSetting.optimize.showInSideBar" name="showInSideBar">
            保持在左侧栏
          </a-checkbox>
        </a-col>
      </a-row>
    </a-form-item>
    <a-form-item :wrapper-col="{ offset: 5, span: 19 }">
      <a-button html-type="button" @click="restore">还原初始设置</a-button>
    </a-form-item>
  </a-form>
</template>

<script>
import { mapActions, mapWritableState } from 'pinia'
import { appStore } from '../../store'
import DebugTip from '../../components/DebugTip.vue'

const { appModel } = window.$models
export default {
  name: 'Optimize',
  components: { DebugTip },
  data () {
    return {}
  },
  computed: {
    ...mapWritableState(appStore, ['app', 'debugMod', 'userSetting'])
  },
  mounted () {
  },
  methods: {
    async restore () {

      let defaultSetting = await appModel.getDefaultUserSetting(this.app.nanoid)

      this.userSetting.optimize = defaultSetting.optimize
    },
    ...mapActions(appStore, ['toggleDbugMod'])
  }
}
</script>

<style scoped>

</style>
