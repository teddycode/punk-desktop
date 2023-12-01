<template>
  <a-drawer
    v-model:visible="detailDisplay"
    :bodyStyle="{ textAlign: 'left', overflow: 'hidden' }"
    :title="drawerTitle"
    placement="right"
    width="500"
    @close="onClose"
  >
    <vue-custom-scrollbar
      :settings="settingsScroller"
      style="height: 86vh"
      @touchstart.stop
      @touchmove.stop
      @touchend.stop
    >
      <div
        v-for="(item, index) in rightSelect"
        :class="defaultGameIndex === index ? 'drawer-active' : ''"
        class="w-full h-12 flex items-center justify-center pointer my-4 rounded-lg s-list"
        @click="selectedAreaSuit(item, index)"
      >
        {{ item.name }}
      </div>
    </vue-custom-scrollbar>
  </a-drawer>
</template>

<script>
export default {
  props: {
    drawerTitle: String,
    rightSelect: {
      type: Array,
      default: () => [],
    },
    selectRegion: String,
  },
  data() {
    return {
      detailDisplay: false,
      settingsScroller: {
        useBothWheelAxes: true,
        swipeEasing: true,
        suppressScrollY: false,
        suppressScrollX: true,
        wheelPropagation: true,
      },
      defaultGameIndex: 0,
    };
  },
  mounted() {
    this.posRegion();
  },
  watch: {
    selectRegion: {
      handler() {
        this.posRegion();
      },
    },
  },
  methods: {
    openDrawer() {
      this.detailDisplay = true;
    },
    selectedAreaSuit(item, index) {
      this.$emit('getArea', item);
      this.defaultGameIndex = index;
      this.detailDisplay = false;
    },
    posRegion() {
      if (this.selectRegion) {
        if (this.selectRegion && this.rightSelect.length > 0) {
          this.defaultGameIndex = this.rightSelect.findIndex((el) => {
            return el.id === this.selectRegion;
          });
          this.defaultGameIndex = this.rightSelect.findIndex((el) => {
            return el.appid === this.selectRegion;
          });
        }
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.drawer-active {
  background: var(--active-bg);
  color: var(--active-text);
}

:deep(.ps__thumb-y) {
  display: none !important;
}
</style>
<style>
.s-list {
  background: var(--secondary-bg);
}
</style>
