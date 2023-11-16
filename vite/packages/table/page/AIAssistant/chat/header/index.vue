<template>
  <div class="flex justify-between items-center">
    <div class="flex items-center">
      <!-- 搜索 和 创建 -->
      <!-- <a-input
        style="width: 156px; height: 48px"
        class="xt-border rounded-xl xt-bg-2 pl-4"
        v-model:value="searchValue"
        placeholder="搜索"
      >
        <template #suffix>
          <Icon
            icon="sousuo"
            style="font-size: 20px"
            class="cursor-pointer"
            @click="searchTopic()"
          ></Icon>
        </template>
      </a-input> -->

      <div class="text-base">{{ selectTitle }}</div>
    </div>

    <div class="flex">
      <XtButton
          v-if="0"
          class="mx-2"
          icon="tishi-xianxing"
          text="订阅已过期"
          type="warn"
          w="128"
          @click="buyVisible = true"
      ></XtButton>

      <XtIcon icon="shezhi1" @click="openEdit()"></XtIcon>
    </div>
  </div>

  <!-- 充值 -->
  <xt-modal v-model="buyVisible" :isFooter="false" title="购买">
    <Store style="width: 440px"></Store>
  </xt-modal>
  <!-- 编辑 -->
  <XtDrawer v-model="settingVisible" placement="right">
    <template #title>
      <XtTitle type="header"
      >设置
        <template #right>
          <XtButton
              h="40"
              text="保 存"
              type="theme"
              w="80"
              @click="saveEdit()"
          ></XtButton>
        </template>
      </XtTitle>
    </template>
    <Edit ref="editRef" :data="topicList[selectTopicIndex]" @del="del"></Edit>
  </XtDrawer>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import _ from 'lodash-es'
import { mapActions, mapWritableState } from 'pinia'
import { aiStore } from '../../../../store/ai'
import { message } from 'ant-design-vue'

export default {
  computed: {
    ...mapWritableState(aiStore, [
      'serachTopic',
      'selectTopicIndex',
      'topicList',
      'selectTitle',
    ]),
    getSelectTopic () {
      return this.topicList.find((item) => item.id === this.selectTopicIndex)
    },
  },
  components: {
    Edit: defineAsyncComponent(() => import('./edit.vue')),
  },
  data () {
    return {
      createChatVisible: false,
      buyVisible: false,
      searchValue: '',
      settingVisible: false,
    }
  },
  methods: {
    ...mapActions(aiStore, ['delTopic']),
    del () {
      this.settingVisible = false
      this.delTopic()
      message.success('删除成功')
    },
    openEdit () {
      if (this.topicList[this.selectTopicIndex] !== undefined) {
        this.settingVisible = true
      } else {
        message.error('你还未选择对话，请先创建会话')
      }
    },
    searchTopic () {
      this.serachTopic = this.searchValue
    },
    saveEdit () {
      let editRef = this.$refs.editRef
      this.topicList[this.selectTopicIndex] = _.cloneDeep(editRef.value)
      this.settingVisible = false
    },
  },
}
</script>

<style lang="scss" scoped></style>
