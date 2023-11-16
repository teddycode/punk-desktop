<!--
 * @Author: teddycode 1055334354@qq.com
 * @Date: 2023-11-06 17:13:46
 * @LastEditors: teddycode 1055334354@qq.com
 * @LastEditTime: 2023-11-08 14:34:56
 * @Description:
 *
 * Copyright (c) 2023 by ${git_name_email}, All Rights Reserved.
-->
<template>
  <div style="position: relative;text-align: center;height: 50px">
    <template v-if="showDetail === false">
      <div v-if="tag" :style="{background:tagColor?tagColor:'rgba(0,0,0,0.8)'}" class="rounded-lg w-10 tag">
        {{ tag }}
      </div>
      <FrameAvatar :avatarSize="50" :avatarUrl="avatar" :frame="frame" :frameUrl="frameUrl" framePlacement="left"
                   style=""></FrameAvatar>
      <OnlineTag v-if="online" style="position: absolute;right:5px;bottom:0px;z-index: 9"></OnlineTag>
    </template>
    <template v-else>
      <div v-if="tag" :style="{background:tagColor?tagColor:'rgba(0,0,0,0.8)',}" class="rounded-lg w-10 tag">
        {{ tag }}
      </div>
      <FrameAvatar :avatarSize="50" :avatarUrl="avatar" :frame="frame" :frameUrl="frameUrl"
                   framePlacement="left"></FrameAvatar>
      <OnlineTag v-if="online" style="position: absolute;right:15px;bottom: 0px;z-index: 9"></OnlineTag>
    </template>
  </div>
</template>

<script>
import OnlineTag from './OnlineTag.vue'
import FrameAvatar from '../avatar/FrameAvatar.vue'
import BorderAvatar from '../avatar/BorderAvatar.vue'

export default {
  name: 'UserAvatar',
  components: { OnlineTag, FrameAvatar, BorderAvatar },
  props: ['avatar', 'tag', 'online', 'tagColor', 'showDetail', 'frameUrl', 'frame'],
  computed: {
    // rarityBorder(){ // 通过计算属性将稀有度边框UI进行渲染
    //   const index = rareColor.find(el=>{
    //    return el.id === this.rare
    //   })
    //   return{
    //     border:`4px solid ${index.avatar_color}`
    //   }
    // },
  },
  data () {
    return {}
  }
}
</script>

<style scoped>
.tag {
  position: absolute;
  display: inline-block;
  z-index: 9;
  bottom: -5px;
  right: 10px;
  transform: translateX(-50%);
  left: 50%;
  font-size: 0.8em;
  color: white
}
</style>
