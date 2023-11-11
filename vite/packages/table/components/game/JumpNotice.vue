<template>
  <div ref="description">
    <img :src="getCover(game.appid)" class="rounded-md mb-2" style="width: 280px;"/>
    <p style="width: 280px">
      <div>正在启动游戏…</div>
      <div v-if="getDesk()">将自动进入
        <div><img :src="getClientIcon(game.appid,game.clientIcon)" class="rounded-md" style="width: 24px"/>
          <strong>{{ game.name }}</strong> 桌面
        </div>
      </div>
      <div v-else>
        将跳转主桌面
      </div>
    </p>
    <p>
      <div class="mt-3 pointer block text-center  w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto" type="button"
           @click="stop">
        停止跳转
      </div>

    </p>
  </div>

</template>

<script lang="ts">
import {defineComponent} from "vue";
import {getClientIcon, getCover, getIcon} from "../../js/common/game";
import {mapWritableState} from "pinia";
import {steamUserStore} from "../../store/steamUser";

export default defineComponent({
  props: ['game'],
  data() {
    return {
      key: Date.now(),
      timer: null
    }
  },
  computed: {
    ...mapWritableState(steamUserStore, ['desks', 'deskList'])
  },
  mounted() {
    this.timer = setTimeout(() => {
      this.$emit('jump', {game: this.game})
    }, 5000)
  },
  methods: {
    getClientIcon,
    getIcon,
    stop() {
      clearTimeout(this.timer)
      this.$emit('close-toast')
    },
    getCover,
    switchToDesk() {
    },
    getDesk() {
      let found = this.deskList.find(desk => {
        return desk.id === this.game.appid
      })
      return found && found?.cards.length > 0;
    }
    // show(){
    //   notification.open({
    //     message:'正在调用steam启动游戏',
    //     description:
    //       h('div',{class:'description'},[
    //           h('div','是否跳转到对应的游戏桌面？'),
    //         h('div',+this.timeout+'秒后自动关闭本窗口。'),
    //           ]),
    //     btn: () =>
    //       h(
    //         Button,
    //         {
    //           type: 'primary',
    //           size: 'small',
    //           onClick: () => notification.close(this.key),
    //         },
    //         { default: () => 'Confirm' },
    //       ),
    //   })
    //   this.setTimer()
    // },
    // setTimer(){
    //   if(this.timer){
    //     clearInterval(this.timer)
    //   }
    //   this.timer=setInterval(()=>{
    //     if(this.timeout<=1){
    //       this.switchToDesk()
    //       clearInterval(this.timer)
    //       this.timer=null
    //     }
    //     this.timeout--
    //   },1000)
    // }
  }

})


</script>


<style lang="scss" scoped>

</style>
