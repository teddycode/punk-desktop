<template>
  <Widget :customData="customData" :customIndex="customIndex" :desk="desk" :options="options">
    <a-tooltip placement="top" title="更多管理">
      <div class=" px-2 rounded-full" style="position: absolute;top: 16px;right:40px;cursor: pointer;font-size: 12px"
           @click="goStatus">
        <icon icon="tiaoduguanli"></icon>
      </div>
    </a-tooltip>
    <div v-if="inputShow === false && outputShow === false " class="mt-5 flex flex-col"
         style="color:var(--primary-text) !important">
      <div class="flex">
        <div class="flex-1 flex flex-col mr-4">
          <div class="flex my-1 justify-between">
            <span style=" font-size: 14px;font-weight: 400;">音量</span>
            <span style=" font-size: 14px;font-weight: 400;">{{ defaultOutput.volume }}%</span>
          </div>
          <div class="flex items-center justify-between">
            <div style="width:180px;">
              <a-slider v-model:value="defaultOutput.volume" :tooltip-visible="false" @afterChange="changeVolume()"
                        @click.stop/>
            </div>
          </div>
        </div>
        <div class="flex-1">
          <div class="flex btn-active items-center voice-hover btn-hover rounded-full pointer justify-center px-3 py-3 s-item xt-bg-2"
               @click.stop="clickMute">
            <Icon v-if="muteShow === true" icon="yinliang" style="font-size: 2.286em;"></Icon>
            <Icon v-else icon="jingyin" style="font-size: 2.286em;"></Icon>
          </div>
        </div>
      </div>
      <span class="mt-2" style=" font-size: 14px;font-weight: 400;">输出</span>
      <div class="flex mt-3 btn-active pointer items-center rounded-lg justify-center s-item xt-bg-2"
           style="padding: 8px 10px;"
           @click.stop="selectOutputVoice">
        <div class="item-name">{{ defaultOutput.name }}（{{ defaultOutput.deviceName }}）</div>
        <Icon icon="xiangxia" style="font-size: 1.5em"></Icon>
      </div>
      <span class="mt-2" style="font-size: 14px;font-weight: 400;">输入检测</span>
      <div class="flex">
        <div class="mr-4 flex items-center justify-center" style="width: 180px;">
          <a-progress :percent="audioTest" :showInfo="false"/>
        </div>
        <div class="flex items-center voice-hover btn-active rounded-full pointer justify-center px-3 py-3 s-item xt-bg-2" style=""
             @click="closeMicrophone">
          <Icon v-if="microphoneShow === true" icon="mic-on" style="font-size: 2.286em;"></Icon>
          <Icon v-else icon="mic-off" style="font-size: 2.286em"></Icon>
        </div>
      </div>
      <span style="font-size: 14px;font-weight: 400;">输入</span>
      <div class="flex mt-2 btn-active pointer items-center rounded-lg justify-center s-item xt-bg-2"
           style="padding: 8px 10px;"
           @click.stop="selectInputVoice">
        <span class="item-name">{{ defaultMic.name }}（{{ defaultMic.deviceName }}）</span>
        <Icon icon="xiangxia" style="font-size: 1.5em;"></Icon>
      </div>
    </div>
    <VoiceOutputDetail v-if="outputShow" @updateOutput="receiveOutput"></VoiceOutputDetail>
    <VoiceInputDetail v-if="inputShow" @updateInput="receiveInput"></VoiceInputDetail>
    <audio id="speakerAudio" src='/sound/gua.mp3'>
      您的浏览器暂不支持音频播放
    </audio>
  </Widget>
</template>

<script>
import Widget from '../../card/Widget.vue'
import VoiceInputDetail from './VoiceInputDetail.vue'
import VoiceOutputDetail from './VoiceOutputDetail.vue'
import {mapActions, mapWritableState} from 'pinia'
import {inspectorStore} from '../../../store/inspector'
import {getDefaultMic, getDefaultVolume, setDefaultVolume, setMicVolume} from '../../../js/ext/audio/audio'
import {appStore} from '../../../store'

export default {
  name: 'Voice',
  components: {
    Widget,
    VoiceOutputDetail,
    VoiceInputDetail
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
    }
  },
  data() {
    return {
      defaultMic: {},
      defaultOutput: {},
      options: {
        className: 'card',
        title: '音频',
        icon: 'sound',
        type: 'games',
      },
      audioValue: 50,
      outputShow: false,
      inputShow: false,
      outputContent: '',
      inputContent: '',
      muteShow: true,
      microphoneShow: true,
    }
  },
  computed: {
    ...mapWritableState(inspectorStore, ['audioTest']),
    ...mapWritableState(appStore, ['settings'])
  },
  async mounted() {
    this.defaultOutput = await getDefaultVolume()
    this.defaultMic = await getDefaultMic()
    this.muteShow = !this.defaultOutput.muted
    this.microphoneShow = !this.defaultMic.muted
    this.startListenAudioTest()
    //
    // const device = await navigator.bluetooth.requestDevice({
    //   acceptAllDevices: true
    // })
    // var {hid}=window.$models
    // console.log(hid.devices())
    // hid.devices().forEach(d=>{
    //   console.log(d)
    //   console.log(d.product+":")
    // })
    // console.log(new HID.HID())
  },
  methods: {
    ...mapActions(inspectorStore, ['startListenAudioTest', 'stopListenerAudioTest']),
    selectOutputVoice() {
      this.outputShow = true
    },
    selectInputVoice() {
      this.inputShow = true
    },
    receiveOutput(val) {
      this.outputContent = val.name
      this.outputShow = false
    },
    receiveInput(v) {
      this.inputContent = v.name
      this.inputShow = false
    },
    async gua() {
      if (!this.settings.duck) {
        return
      }
      let audioSpeaker = document.getElementById('speakerAudio')
      audioSpeaker.play()
    },
    clickMute() {
      this.muteShow = !this.muteShow
      setDefaultVolume({
        volume: this.defaultOutput.volume,
        muted: !this.muteShow
      })
      if (this.muteShow) {
        setTimeout(() => {
          this.gua()
        }, 800)
      }
    },
    closeMicrophone() {
      this.microphoneShow = !this.microphoneShow
      setMicVolume({muted: !this.microphoneShow})
    },
    changeVolume() {
      setDefaultVolume({
        volume: this.defaultOutput.volume
      })
      this.gua()
    },
    goStatus() {
      this.$router.push({
        name: 'status'
      })
    }
  },
  unmounted() {
    this.stopListenerAudioTest()
  },


}
</script>

<style lang="scss" scoped>
::v-deep .ant-slider-track {
  // background: linear-gradient(90deg, rgba(98, 193, 255, 1) 0%, rgba(51, 141, 255, 1) 100%) !important;
}

.item-name {
  word-break: normal;
  display: block;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow: hidden;
}

:deep(.ant-slider-handle) {
  background: rgba(255, 255, 255, 0.85) !important;
  border-color: rgba(151, 151, 151, 1) !important;
}

:deep(.ant-slider-rail) {
  // background: rgba(255, 255, 255, 0.4) !important;
}

:deep(.ant-progress-inner) {
  background-color: rgba(255, 255, 255, 0.4) !important;
}

:deep(.ant-progress-bg) {
  height: 9px !important;
}

.voice-hover:hover {
  opacity: 0.8;
}
</style>
