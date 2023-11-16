<script lang="ts">
import {mapWritableState} from "pinia";
import {steamUserStore} from "../../store/steamUser";
import {getCover} from "../../js/common/game";
import VueCustomScrollbar from "../../../../src/components/vue-scrollbar.vue";

export default {
  components: {VueCustomScrollbar},
  methods: {
    getCover,
    select(game) {
      this.$emit('valueChanged', game)
      this.$emit('update:visible', false)
      this.drawerVisible = false
    },
    visibleChanged() {
      this.$emit('update:visible', false)
    }
  },
  props: ['visible', 'items', 'activeId'],
  emits: ['valueChanged', 'visibleChanged'],
  data() {
    return {
      drawerVisible: false,
      outerSettings: {
        useBothWheelAxes: true,
        swipeEasing: true,
        suppressScrollY: true,
        suppressScrollX: false,
        wheelPropagation: true
      },
    }
  },
  computed: {
    ...mapWritableState(steamUserStore, ['desks', 'runningGame']),
  },
  watch: {
    'visible': {
      handler(newVal) {
        this.drawerVisible = newVal
      }
    }
  },
  mounted() {
    this.drawerVisible = this.visible
  }
}
</script>

<template>

  <a-drawer v-model:visible="drawerVisible" :height="270" placement="bottom" @close="visibleChanged">
    <vue-custom-scrollbar :settings="outerSettings" style="width: 100%;height: 100%;white-space: nowrap;">
      <div v-for="game in items" :class="{'active-game':game.appid===activeId}"
           class="mr-6 text-center pointer mb-1 game"
           style="display: inline-block"
           @click="select(game)">
        <a-image :preview="false" :src="getCover(game.appid)" class="mb-2"
                 style="width:250px;border-radius: 4px"></a-image>
        <div class="truncate" style="font-size: 18px">
          {{ game.chineseName }}
        </div>
      </div>

    </vue-custom-scrollbar>
  </a-drawer>

</template>

<style lang="scss" scoped>
.game {
  opacity: 0.5;

  &:hover, &.active, &.active-game {
    opacity: 1;
  }
}
</style>
