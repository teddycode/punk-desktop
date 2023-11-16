<!--
 * @Author: teddycode 1055334354@qq.com
 * @Date: 2023-11-06 17:13:46
 * @LastEditors: teddycode 1055334354@qq.com
 * @LastEditTime: 2023-11-07 17:38:47
 * @Description:
 *
 * Copyright (c) 2023 by ${git_name_email}, All Rights Reserved.
-->
<template>
  <div :class="bgColor" :style="{height:itemHeight}" class="flex flex-row rounded-lg p-1"
       style="background: var(--secondary-bg);">
    <div v-for="(item,index) in navList" :class="activeIndex===index ? 'xt-active-btn':''"
         :style="btnStyle"
         class="nav-box h-full panel-icon flex btn-active items-center relative rounded-lg pointer"
         @click.stop="clickNav(item,index)">
      <div :class="activeIndex === index ? 'round-dot' : 'circle'"></div>
      <span class="flex justify-center panel-title" style="flex:1;color:var(--primary-text);">{{ item.title }}</span>
      <div v-if="item.state === true" class="state-dot ml-2"></div>
    </div>
  </div>
</template>dd

<script>
export default {
  name: 'RadioTab',
  props: {
    //单选导航列表
    navList: {
      type: Array,
      default: () => []
    },
    // 当前选中的内容
    selectType: {
      type: Object,
      default: () => {
      }
    },
    //背景颜色
    bgColor: {
      type: String,
      default: 'active-item'
    },
    //导航的高
    height: {
      type: Number,
      default: 48
    },
    //按钮的样式
    btnStyle: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      activeIndex: 0
    }
  },
  computed: {
    itemHeight () {
      return this.height + 'px'
    }
  },
  watch: {
    'selectType': {
      handler () {
        this.posType()
      }

    }
  },
  mounted () {
    this.posType()
  },
  methods: {
    posType () {
      if (this.selectType) {
        if (this.selectType.name && this.navList.length > 0) {
          this.activeIndex = this.navList.findIndex(item => {
            return item.name === this.selectType.name
          })
        }
      }

    },
    clickNav (item, index) {
      this.activeIndex = index
      item.state = false  // 将消息未读状态隐藏
      this.$emit('update:selectType', item)
    }
  },
}
</script>

<style scoped>
.state-dot {
  width: 8px;
  height: 8px;
  background: #FF4D4F;
  border-radius: 4px;
}

.active-item {
  color: var(--active-text);
  background: var(--active-bg)
}

.nav-box {
  width: 50%;
  padding: 0 20px;
}

:deep(.xt-active-btn) {
  justify-content: start;
}

.circle {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: none;
  border: 2px solid var(--active-bg);
}
</style>
