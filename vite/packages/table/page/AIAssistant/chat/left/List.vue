<template>
  <XtTitle
      class="xt-text"
      style="color: var(--primary-text) !important"
      type="text"
  >对话
    <template #right>
      <xt-base-icon
          class="mr-3 xt-text"
          icon="tianjia2"
          style="font-size: 16px"
          @click="add()"
      ></xt-base-icon>
    </template>
  </XtTitle>
  <template v-if="topList.length">
    <XtTitle type="text">置顶</XtTitle>
    <Topic v-for="data in topList" :data="data"></Topic>
  </template>
  <template v-if="todayList.length">
    <XtTitle type="text">今天</XtTitle>
    <Topic v-for="data in todayList" :data="data"></Topic>
  </template>
  <template v-if="previousList.length">
    <XtTitle type="text">过去</XtTitle>
    <Topic v-for="data in previousList" :data="data"></Topic>
  </template>
</template>

<script>
import Topic from "./topic.vue";
import {mapActions, mapWritableState} from "pinia";
import {aiStore} from "../../../../store/ai";

export default {
  computed: {
    ...mapWritableState(aiStore, ["todayList", "topList", "previousList"]),
  },
  components: {Topic},
  methods: {
    ...mapActions(aiStore, ["addTopic"]),
    add() {
      this.addTopic();
    },
  },
};
</script>

<style lang="scss" scoped></style>
