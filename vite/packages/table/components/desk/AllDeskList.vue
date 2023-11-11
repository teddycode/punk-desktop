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
    ...mapWritableState(steamUserStore, ['runningGame']),
  },
  watch: {
    'visible': {
      handler(newVal) {
        this.drawerVisible = newVal
      }
    }
  },
  mounted() {
  }
}
</script>

<template>

  <vue-custom-scrollbar :settings="outerSettings" style="width: 100%;height: 100%;white-space: nowrap;">
    <div v-for="item in items" :class="{'active-game':item.id===activeId}" class="mr-6 text-center pointer mb-1 game"
         style="display: inline-block;width: 100px"
         @click="select(item)">
      <div>
        <a-avatar v-if="item.iconUrl" :preview="false" :size="50" :src="item.iconUrl" class="mb-2"
                  style="border-radius: 4px"></a-avatar>
        <icon v-else :icon="item.icon || 'desktop'" style="font-size: 40px"></icon>
      </div>
      <div class="truncate" style="font-size: 14px">
        {{ item.name }}
      </div>
    </div>

  </vue-custom-scrollbar>

</template>

<style lang="scss" scoped>
.game {
  opacity: 0.5;

  &:hover, &.active, &.active-game {
    opacity: 1;
  }
}
</style>
