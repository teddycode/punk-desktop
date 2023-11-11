<script lang="ts">
import {defineComponent} from 'vue'
import * as OV from 'online-3d-viewer'
import {FullscreenExitOutlined, FullscreenOutlined} from '@ant-design/icons-vue'

var myViewer = null
export default defineComponent({
  name: "modelFile",
  components: {FullscreenOutlined, FullscreenExitOutlined},
  props: ['data'],
  data() {
    return {
      fullScreen: false,
    }
  },
  mounted() {
    OV.SetExternalLibLocation('../libs');

    // get the parent element of the viewer
    let parentDiv = document.getElementById('viewer' + '_' + this.data.message.ID);

    // initialize the viewer with the parent element and some parameters
    let viewer = new OV.EmbeddedViewer(parentDiv, {
      backgroundColor: new OV.RGBAColor(0, 0, 0, 5)
    });


    viewer.LoadModelFromUrlList([
      this.data.url
    ]);
    myViewer = viewer
  },
  methods: {
    setFullScreen() {
      this.fullScreen = !this.fullScreen
      this.$nextTick(() => {
        myViewer.Resize()
      })

    }
  }
})
</script>

<template>

  <div :class="{'full-screen':fullScreen}" class="model-preview">
    <xt-button :h="30" :w="30" class="pointer xt-bg-2 " size="mini" style="position:absolute;right: 10px;top: 10px;border-radius: 4px"
               @click="setFullScreen">
      <FullscreenOutlined v-if="!fullScreen"/>
      <template v-else>
        <FullscreenExitOutlined/>
      </template>
    </xt-button>
    <div :id="'viewer'+'_'+data.message.ID" :style="{width:fullScreen?'100%':'300px',height:fullScreen?'100%':'300px'}"
         class="online_3d_viewer " model="/model/model.stl"
         style=" border-radius: 4px"
         @contextmenu.stop>
    </div>

  </div>

</template>

<style lang="scss" scoped>
.model-preview {
  width: 300px;
  height: 300px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 10px;
  position: relative;
}

.full-screen {
  background: var(--primary-bg-solid);
  width: 100vw;
  height: 100vh;
  left: 0;
  right: 0;
  position: fixed;
  z-index: 999;
  top: 0;
}

.normal {
  width: auto;
  height: auto;
}
</style>
