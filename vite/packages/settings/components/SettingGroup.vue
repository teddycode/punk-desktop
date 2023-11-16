<template>
  <div v-for="itemGroup in itemGroups" class="settings-container">
    <h3>{{ itemGroup.title }}</h3>
    <div v-if="itemGroup.tip" class="item-group-tip">{{ itemGroup.tip }}</div>
    <img v-if="itemGroup.img" :src="itemGroup.img" style="width: 220px;margin-bottom: 10px"/>
    <div v-for="item in itemGroup.items">
      <span class="item-title">- {{ item.title }}：</span> &nbsp;&nbsp;
      <span v-if="item.type==='switch'">
                <a-switch v-model:checked="item.value" size="small" style="margin-bottom: 4px"
                          @change="item.onChange($event)"/>
              </span>
      <span v-if="item.type==='number'">
                <a-input-number id="inputNumber" v-model:value="item.value" :max="item.max"
                                :min="0" size="small" style="width: 50px;text-align: center" @change="item.onChange"/> {{
          item.unit
        }}
              </span>
      <span v-if="item.type==='button'">
               <a-button :size="item.buttonSize" :type="item.buttonType" @click="item.click">{{ item.title }}</a-button>
              </span>
      <p class="tip">
        <exclamation-circle-outlined/>
        {{ item.tip }}
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SettingGroup',
  props: ['itemGroups'],
  mounted () {

  }
}
</script>

<style scoped>

</style>
