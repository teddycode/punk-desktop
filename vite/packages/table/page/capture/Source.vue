<template>
  <div class="ml-3" style="white-space: pre-wrap;width: 100%;height: 100%;overflow: hidden">
    <vue-custom-scrollbar :settings="scrollbarSettings" style="height: 100%">
      <div style="display: flex;flex-direction: row;max-width: 100%;flex-wrap: wrap">
        <a-row :gutter="20">
          <a-col :span="12">
            <div v-for="source in sources" class="mr-3 pointer" style="width: 300px">
              <div class="mb-3 truncate" @click="this.currentSource=source">
                <a-avatar v-if="source.type==='window'" :src="'file://'+source.icon" shape="square"
                          style="width: 20px;height: 20px">
                </a-avatar>
                <a-avatar v-else shape="square" style="width: 20px;height: 20px"
                ></a-avatar>
                {{ source.name }}
              </div>

            </div>
          </a-col>
          <a-col :span="12">
            <div>
              预览：
              <div class="mb-4">
                <a-image :src="'file://'+currentSource.src" style="width: 300px;object-fit: contain">
                </a-image>
              </div>
            </div>
          </a-col>
        </a-row>


      </div>
    </vue-custom-scrollbar>

  </div>


</template>

<script>
import {captureStore} from '../../store/capture'
import {mapActions, mapState} from 'pinia'
import VueCustomScrollbar from '../../../../src/components/vue-scrollbar.vue'

export default {
  name: 'Source',
  components: {VueCustomScrollbar},
  data() {
    return {
      scrollbarSettings: {
        useBothWheelAxes: false,
        minScrollbarLength: 30,
        swipeEasing: true,
        suppressScrollY: true,
        suppressScrollX: false,
        wheelPropagation: true
      },
      currentSource: {}
    }
  },

  mounted() {
    this.getSource()


  },
  computed: {
    ...mapState(captureStore, ['sources'])
  },
  methods: {
    ...mapActions(captureStore, ['getSource'])
  }
}
</script>

<style scoped>

</style>
