<script lang="ts">
import {getDefaultMic, getDefaultVolume, setDefaultVolume, setMicVolume} from "../../js/ext/audio/audio";
import {mapWritableState} from "pinia";
import {captureStore} from "../../store/capture";
import Template from "../../../user/pages/Template.vue";

export default {
  name: "CaptureSettings",
  components: {Template},
  data() {
    return {
      systemSound: {
        volume: 0,
        muted: false
      }, // 系统声音
      systemMicrophone: 20, // 麦克风,
    }
  },
  computed: {
    ...mapWritableState(captureStore, ['sources', 'settings', 'images', 'videos', 'currentSource']),
  },
  mounted() {
    getDefaultVolume().then((defaultVolume) => {
      this.systemSound = {
        volume: defaultVolume.volume.toFixed(0),
        muted: defaultVolume.muted
      }
    })

    getDefaultMic().then(defaultVolume => {
      this.systemMicrophone = {
        volume: defaultVolume.volume.toFixed(0),
        muted: defaultVolume.muted
      }
    })

  },
  methods: {

    clickMute() {
      this.systemSound.muted = !this.systemSound.muted
      setDefaultVolume({
        muted: this.systemSound.muted
      })
    },
    clickMicMute() {
      this.systemMicrophone.muted = !this.systemMicrophone.muted
      setMicVolume({
        muted: this.systemMicrophone.muted
      })
    },
    changeVolume() {
      setDefaultVolume({
        volume: this.systemSound.volume
      })
    },
    changeMicVolume() {
      setMicVolume({
        volume: this.systemMicrophone.volume
      })
    },
    async setImageSavePath() {
      let savePath = await tsbApi.dialog.showOpenDialog({
        title: '选择目录', message: '请选择截屏保存位置', properties: [
          'openDirectory', 'createDirectory',
        ]
      })
      if (savePath) {
        this.settings.imageSavePath = savePath[0]
      } else {
      }
    },
    async setVideoSavePath() {
      let savePath = await tsbApi.dialog.showOpenDialog({
        title: '选择目录', message: '请选择视频保存位置', properties: [
          'openDirectory', 'createDirectory',
        ]
      })
      if (savePath) {
        this.settings.videoSavePath = savePath[0]
      } else {
      }
    },
  }
}
</script>

<template>
  <div class="flex flex-col scroll-container">
    <div class="flex flex-col rounded-md p-4 mb-3" style="background: var(--secondary-bg);">
      <div class="flex items-center mb-3">
        <div class="pointer" @click="clickMute">
          <Icon v-if="!systemSound.muted" icon="yinliang"
                style="font-size: 1.5em;color:var(--primary-text);"></Icon>
          <Icon v-else icon="jingyin" style="font-size: 1.5em;color:var(--primary-text);"></Icon>
        </div>
        <span class="mx-3" style="color:var(--primary-text);">系统声音</span>
        <div style="width:310px;">
          <a-slider v-model:value="systemSound.volume" @afterChange="changeVolume"></a-slider>
        </div>
      </div>
      <div class="flex items-center">
        <div class="pointer" @click="clickMicMute">
          <Icon v-if="!systemMicrophone.muted" icon="mic-on"
                style="font-size: 1.5em;color:var(--primary-text);"></Icon>
          <Icon v-else icon="mic-off" style="font-size: 1.5em;color:var(--primary-text);"></Icon>
        </div>
        <span style="margin: 0 19px;color:var(--primary-text);">麦克风</span>
        <div style="width:310px;">
          <a-slider v-model:value="systemMicrophone.volume" @afterChange="changeMicVolume"></a-slider>
        </div>
      </div>
    </div>
    <span class="mb-3 fps-t">我的截屏保存地址</span>
    <span class="text-center mb-3 py-3 s-item rounded-lg" style="background: var(--secondary-bg);"
          @click="setImageSavePath">
      <template v-if="settings.imageSavePath">
        {{
          settings.imageSavePath
        }}
      </template>
      <template v-else>
        设置
      </template>
    </span>
    <span class="mb-3 fps-t">我的录制保存地址</span>
    <span class="text-center mb-3 py-3 rounded-lg" style="background: var(--secondary-bg);" @click="setVideoSavePath">
     <template v-if="settings.videoSavePath">
        {{
         settings.videoSavePath
       }}
      </template>
      <template v-else>
        设置
      </template>

    </span>
    <span class="mb-3 fps-t ">视频码率</span>
    <a-select v-model:value="settings.videoBitsPerSecond">
      <a-select-option :value="1.5e6">
        1.5Mbps
      </a-select-option>
      <a-select-option :value="2.5e6">
        2.5Mbps
      </a-select-option>
      <a-select-option :value="5.0e6">
        5.0Mbps
      </a-select-option>
      <a-select-option :value="8.0e6">
        8.0Mbps
      </a-select-option>
      <a-select-option :value="10.0e6">
        10.0Mbps
      </a-select-option>
    </a-select>
  </div>
  <div class="mt-3">
    暂不支持快捷键使用
  </div>
</template>

<style lang="scss" scoped>

</style>
