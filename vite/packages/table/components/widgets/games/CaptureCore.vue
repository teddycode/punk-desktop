<script lang="ts">
import Modal from '../../Modal.vue'
import SourceSelector from '../../modal/SourceSelector.vue'
import {mapActions, mapWritableState} from 'pinia'
import {captureStore} from '../../../store/capture'
import CaptureSettings from '../../modal/CaptureSettings.vue'
import {getDefaultMic, setMicVolume} from '../../../js/ext/audio/audio'
import SaveImage from '../../game/SaveImage.vue'
import {useToast} from 'vue-toastification'
import {formatSeconds} from '../../../util'
import {defineComponent} from "vue";

const toast = useToast()
export default defineComponent({
  name: "CaptureCore",
  components: {Modal, CaptureSettings, SourceSelector},
  data() {
    return {

      systemMicrophone: {
        muted: false,
      },
      microphoneShow: false,
      muteShow: false,

    }
  },
  computed: {
    ...mapWritableState(captureStore, ['recordedSeconds', 'sources', 'settings', 'images', 'videos', 'currentSource', 'recording']),
  },
  mounted() {
    this.reloadMic()
  },
  methods: {
    ...mapActions(captureStore, ['screenShoot', 'startRecording', 'stopRecording']),
    formatSeconds: formatSeconds,
    reloadMic() {
      getDefaultMic().then(defaultVolume => {
        this.systemMicrophone = {
          volume: defaultVolume.volume.toFixed(0),
          muted: defaultVolume.muted
        }
      })
    },

    closeMicrophone() {
      this.microphoneShow = !this.microphoneShow
    },
    clickMicMute() {
      this.systemMicrophone.muted = !this.systemMicrophone.muted
      setMicVolume({
        muted: this.systemMicrophone.muted
      })
    },
    showToast(src) {
      toast(
          {
            component: SaveImage,
            props: {
              image: src
            },
          }, {
            icon: false,
            closeOnClick: false,
            closeButton: false,
            pauseOnFocusLoss: false,
            pauseOnHover: false
          }
      )
    },
    captureScreen() {
      this.screenShoot((src) => {
        console.log(src)
        this.showToast(src)
      })
      // 截图 支线任务点

    },
    startRecord() {
      // console.log('object :>> ', object);
      this.startRecording()
      // 录制 支线任务点
    },
    stopRecord() {
      this.stopRecording()
    },
    selectSource() {
      this.$emit('selectSource')
    }
  }
})
</script>

<template>
  <div v-if="!currentSource.id" style="min-height: 100px">
    <div class="flex flex-col items-center justify-center " style="margin-top: 50px" @click="selectSource">
      <span class="mb-3 s-item w-full pointer my-active btn-active voice-hover text-center rounded-lg py-3 "><icon
          icon="wanggeshitu"></icon> 选择捕获源使用</span>
    </div>
  </div>
  <div v-else class="mb-5 flex justify-center items-center mx-5 my-8" style="color:var(--primary-text)">
    <div class="truncate pointer" style="width: 150px;position: absolute;left: 90px;top: 16px" @click="selectSource">
      <a-avatar :size="20" :src="'file://'+currentSource.icon" shape="square" style="vertical-align: top"></a-avatar>
      {{ currentSource.name }}
    </div>
    <div :class="{disable:!this.settings.imageSavePath}"
         class="flex justify-center pointer  items-center mr-6 flex-col ml-6"
         @click="captureScreen">
              <span class="px-4 voice-hover py-4 btn-active rounded-full mb-3" style="background: var(--secondary-bg);">
                <Icon icon="camera" style="font-size: 2em;"></Icon>
              </span>
      <span>截屏</span>
    </div>

    <div v-if="!recording" :class="{disable:!this.settings.videoSavePath}"
         class="flex justify-center pointer items-center mr-6 flex-col"
         @click="startRecord">
            <span class="px-4 voice-hover py-4  btn-active rounded-full mb-3" style="background: var(--secondary-bg);">
              <Icon icon="record-circle-line" style="font-size: 2em;"></Icon>
            </span>
      <span>录制</span>
    </div>
    <div v-else :class="{disable:!this.settings.videoSavePath}"
         class="flex justify-center pointer items-center mr-6 flex-col"
         @click="stopRecord">
            <span class="px-4 voice-hover py-4  btn-active rounded-full mb-3" style="background: var(--secondary-bg);">
              <Icon icon="record-circle-line" style="font-size: 2em;color:red"></Icon>
            </span>
      <span>{{ formatSeconds(this.recordedSeconds) || '0秒' }}</span>
    </div>
    <div class="flex  justify-center pointer items-center mr-6 flex-col" @click="clickMicMute">
            <span class="px-4 voice-hover btn-active py-4 rounded-full mb-3" style="background:  var(--secondary-bg);">
              <Icon v-if="systemMicrophone.muted === false" icon="mic-on" style="font-size: 2em;"></Icon>
              <Icon v-else icon="mic-off" style="font-size: 2em;"></Icon>
            </span>
      <span>麦克风</span>
    </div>


  </div>

</template>

<style lang="scss" scoped>
.my-active {
  background: var(--active-bg) !important;
}

.disable {
  pointer-events: none;
  opacity: 0.5;
}
</style>
