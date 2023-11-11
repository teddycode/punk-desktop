<script lang="ts">
import Widget from "./Widget.vue";
import {mapActions} from "pinia";
import {appStore} from "../../store";

export default {
  name: "CoolWidget",
  components: {Widget},
  data() {
    return {
      options: {
        className: 'card small',
        title: '',
        icon: '',
        type: 'fish',
        noTitle: true,
      },
    }
  },
  props: {
    'appName': {
      type: String,
      default: 'demo'
    },
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
  methods: {
    ...mapActions(appStore, ['showUserCard']),
    doShowUserCard() {
      this.showUserCard(4)
    }
  }
}
</script>

<template>
  <Widget :customIndex="customIndex" :desk="desk" :options="options">
    <WujieVue
        :fetch="fetch"
        :name="'dd'+Date.now()"
        :props="{data:{
                a:1,
                b:2
              },
              methods:{
                showUserCard:doShowUserCard
              }}"
        :sync="true"
        height="100%"
        url="http://localhost:5173/#/card1"
        width="100%"
    ></WujieVue>
  </Widget>
</template>

<style lang="scss" scoped>

</style>
