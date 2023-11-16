<template>
  <Widget :customIndex="customIndex" :desk="desk" :options="options">
    <div
        class="pointer"
        style="text-align: center; padding: 2em"
        @click="enterMusic"
    >
      <a-avatar
          :class="{ playing: status.music.playing }"
          :size="100"
          :src="status.music.cover || 'https://a.apps.vip/icons/wyy.png'"
          style="border: 3px solid #999"
      ></a-avatar>
    </div>
    <a-row :gutter="10">
      <a-col :span="12"></a-col>
      <a-col :span="12"></a-col>
    </a-row>
  </Widget>
</template>
<script>
import { appStore } from '../../store'
import { mapWritableState } from 'pinia'
import Widget from '../card/Widget.vue'

export default {
  name: 'Music',
  props: {
    customIndex: {
      type: Number,
      default: 0,
    },
    customData: {
      type: Object,
      default: () => {
      },
    },
    desk: {
      type: Object
    }
  },
  data () {
    return {
      options: {
        className: 'card small',
        title: '网易云',
        icon: 'customerservice',
        type: 'music',
      },
    }
  },
  components: {
    Widget,
  },
  computed: {
    ...mapWritableState(appStore, ['status']),
  },
  methods: {
    enterMusic () {
      this.$router.push('/music')
    },
  },
}
</script>

<style scoped></style>
