<template>
  <DeskGroup v-model:current-desk-id="currentDeskId" :desk-list="deskList" :settings="settings"
             @changeDesk="changeDesk"></DeskGroup>
</template>
<script lang="ts">
import DeskGroup from "../../components/desk/DeskGroup.vue";
import {mapWritableState} from "pinia";
import {workStore} from "../../store/work";

export default ({
  name: "Desk",
  components: {DeskGroup},
  computed: {
    ...mapWritableState(workStore, ['deskList', 'currentDeskId', 'settings'])
  },
  mounted() {
    if (this.deskList.length === 0) {
      this.deskList.push({
        name: '默认桌面',
        id: '00001',
        cards: [],
        settings: {}
      })
    }
  },
  methods: {
    changeDesk(p) {
      this.currentDeskId = p.id
    },
  }
})
</script>


<style lang="scss" scoped>

</style>
