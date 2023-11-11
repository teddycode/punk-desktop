<template>
  <Widget :customData="customData" :customIndex="customIndex" :desk="desk" :menuList="menuList" :options="options">
    <CaptureCore @selectSource="visibleSource=true"></CaptureCore>
  </Widget>
  <teleport to="#app">
    <Modal v-if="visibleSource" v-model:visible="visibleSource" :blurFlag="true">
      <SourceSelector @choosenSource="choosenSource">
      </SourceSelector>
    </Modal>
  </teleport>
  <a-drawer v-model:visible="visibleSettings" :bodyStyle="{ overflow: 'hidden' }" title="设置" width="500"
            @close="reloadMic">
    <CaptureSettings></CaptureSettings>
  </a-drawer>
</template>

<script>
import Widget from '../../card/Widget.vue'
import CaptureCore from './CaptureCore.vue'
import SourceSelector from '../../modal/SourceSelector.vue'
import CaptureSettings from '../../modal/CaptureSettings.vue'
import Modal from '../../Modal.vue'

export default {
  name: 'Capture',
  components: {
    Modal, CaptureSettings, SourceSelector,
    CaptureCore,
    Widget
  },
  props: {
    customIndex: {
      type: Number,
      default: 0
    },
    customData: {
      type: Object,
      default: () => {
      }
    },
    desk: {
      type: Object
    },

  },
  data() {
    return {
      visibleSettings: false,
      visibleSource: false,
      menuList: [{
        icon: 'wanggeshitu',
        title: '更换录制源',
        fn: () => {
          this.visibleSource = true
        }
      },
        {
          icon: 'shezhi',
          title: '设置',
          fn: () => {
            this.visibleSettings = true
          }
        }],
      options: {
        className: 'card small',
        title: '捕获',
        icon: 'video',
        type: 'games',
      },

    }
  },
  methods: {
    choosenSource() {
      this.visibleSource = false
    },
  }


}
</script>

<style lang="scss" scoped>
.voice-hover:hover {
  opacity: 0.5;
}

.disable {
  pointer-events: none;
  opacity: 0.5;
}
</style>
