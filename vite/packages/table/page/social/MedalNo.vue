<script lang="ts">
import {defineComponent} from 'vue'

export default defineComponent({
  name: "MedalNo",
  props: ['no']
})
</script>

<template>
 <span v-if="no === 1">
              <a-avatar :size="32" src="/img/rankingList/one.png"></a-avatar>
            </span>
  <span v-else-if="no === 2">
              <a-avatar :size="32" src="/img/rankingList/two.png"></a-avatar>
            </span>
  <span v-else-if="no === 3">
              <a-avatar :size="32" src="/img/rankingList/three.png"></a-avatar>
            </span>

  <div v-else :style="no < 11 ? 'width:32px' : ''" class="ranking-back flex justify-center items-center">{{ no }}</div>
</template>

<style lang="scss" scoped>
.ranking-back {
  height: 32px;
  padding: 0 10px;
  line-height: 32px;
  border-radius: 8px;
  text-align: center;
  background: var(--mask-bg);
  font-size: 18px;
  color: var(--primary-text);
  font-weight: 500;
}
</style>
