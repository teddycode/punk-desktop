<template>
  <div
      :class="[data.message.flow === 'out' && 'reserve']"
      :style="`width: ${data?.second * 10 + 40}px`"
      class="message-audio"
      @click.stop="play"
  >
    <i :class="[data.message.flow === 'out' && 'icon-reserve']" class="icon icon-voice"></i>
    <label>{{ data.second }}s</label>
    <audio ref="audio" :src="data.url"></audio>
  </div>
</template>

<script lang="ts">
import {defineComponent, reactive, ref, toRefs, watch} from 'vue';

export default defineComponent({
  props: {
    data: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props: any, ctx: any) {
    const data = reactive({
      data: {},
      show: false,
    });

    const audio = ref(null);

    watch(
        () => props.data,
        () => {
          data.data = props.data;
        },
        {deep: true, immediate: true}
    );

    const play = () => {
      const audios = document.getElementsByTagName('audio');
      for (const audio of audios) {
        if (!audio.paused) {
          audio.pause();
          audio.load();
        }
      }
      const audioPlayer: any = audio.value;
      if (audioPlayer.paused) {
        audioPlayer.play();
        data.show = true;
      } else {
        audioPlayer.pause();
        audioPlayer.load();
        data.show = false;
      }
    };

    return {
      ...toRefs(data),
      audio,
      play,
    };
  },
});
</script>
<style lang="scss" scoped>
@import url('../../../styles/common.scss');
@import url('../../../styles/icon.scss');

.message-audio {
  display: flex;
  align-items: center;
  position: relative;
  cursor: pointer;
  max-width: 100%;
  overflow: hidden;

  .icon {
    margin: 0 4px;
  }

  audio {
    width: 0;
    height: 0;
  }
}

.reserve {
  flex-direction: row-reverse;
}
</style>
