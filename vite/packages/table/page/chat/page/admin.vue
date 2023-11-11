<script lang="ts">
import VueCustomScrollbar from "../../../../../src/components/vue-scrollbar.vue";
import {mapActions, mapState} from "pinia";
import {chatAdminStore} from "../chatAdminStore";

export default {
  name: "admin",
  components: {VueCustomScrollbar},
  data() {
    return {
      showDetail: false,

    }
  },
  computed: {
    ...mapState(chatAdminStore, ['stats'])
  },
  mounted() {
    this.refreshStats()
  },

  methods: {
    ...mapActions(chatAdminStore, ['refreshStats'])
  }
}
</script>

<template>
  <div>
    <div class="p-2 m-2 h-full">
      <vue-custom-scrollbar ref="scrollerbar" :settings="{}" class="w-full" style="height:calc(100%)">
        <div class="line-title">
          统计面板
        </div>
        <div class="line">
          昨日IM大盘数据 —— {{ stats.AppName }}（AppId:{{ stats.AppId }} {{ stats.Company }}） 报告期数：{{ stats.Date }}
          <div style="float: right">
            <xt-button v-if="!showDetail" type="theme" @click="showDetail=true;$refs.scrollerbar.update()">查看全部
            </xt-button>
            <xt-button v-else type="theme" @click="showDetail=false;$refs.scrollerbar.update()">隐藏</xt-button>
          </div>
        </div>
        <div class="pd-2">
          <div :style="!showDetail?'height: 90px;overflow: hidden':'height: auto;'"
               class="text-center flex stats-container "

               style="flex-wrap: wrap;gap:10px;justify-content: center;">
            <div :span="4" class="xt-bg rounded-lg p-2  ">
              <a-statistic :value="stats.ActiveUserNum" title="活跃用户">

              </a-statistic>
            </div>
            <div :span="4" class="xt-bg rounded-lg p-2 ">
              <a-statistic :value="stats.RegistUserNumOneDay" title="新增注册人数">
              </a-statistic>
            </div>
            <div :span="4" class="xt-bg rounded-lg p-2">
              <a-statistic :value="stats.RegistUserNumTotal" title="累计注册人数">
              </a-statistic>
            </div>
            <div :span="4" class="xt-bg rounded-lg p-2">
              <a-statistic :value="stats.LoginTimes" title="登录次数">
              </a-statistic>
            </div>
            <div :span="4" class="xt-bg rounded-lg p-2">
              <a-statistic :value="stats.LoginUserNum" title="登录人数">
              </a-statistic>
            </div>
            <div :span="4" class="xt-bg rounded-lg p-2 p-2">
              <a-statistic :value="stats.UpMsgNum" title="上行消息数">
              </a-statistic>
            </div>
            <div :span="4" class="xt-bg rounded-lg p-2 p-2">
              <a-statistic :value="stats.SendMsgUserNum" title="发消息人数">
              </a-statistic>
            </div>
            <div :span="4" class="xt-bg rounded-lg p-2 p-2">
              <a-statistic :value="stats.APNSMsgNum" title="APNs 推送数">
              </a-statistic>
            </div>
            <div :span="4" class="xt-bg rounded-lg p-2 p-2">
              <a-statistic :value="stats.C2CUpMsgNum" title="上行消息数（C2C）">
              </a-statistic>
            </div>
            <div :span="4" class="xt-bg rounded-lg p-2 p-2">
              <a-statistic :value="stats.C2CDownMsgNum" title="下行消息数（C2C）">
              </a-statistic>
            </div>
            <div :span="4" class="xt-bg rounded-lg p-2 p-2">
              <a-statistic :value="stats.C2CSendMsgUserNum" title="发消息人数（C2C）">
              </a-statistic>
            </div>
            <div :span="4" class="xt-bg rounded-lg p-2 p-2">
              <a-statistic :value="stats.C2CAPNSMsgNum" title="APNs 推送数（C2C）">
              </a-statistic>
            </div>
            <div :span="4" class="xt-bg rounded-lg p-2 p-2">
              <a-statistic :value="stats.MaxOnlineNum" title="最高在线人数">
              </a-statistic>
            </div>
            <div :span="4" class="xt-bg rounded-lg p-2 p-2">
              <a-statistic :value="stats.DownMsgNum" title="下行消息总数（C2C和群）">
              </a-statistic>
            </div>
            <div :span="4" class="xt-bg rounded-lg p-2 p-2">
              <a-statistic :value="stats.ChainIncrease" title="关系链对数增加量">
              </a-statistic>
            </div>
            <div :span="4" class="xt-bg rounded-lg p-2 p-2">
              <a-statistic :value="stats.ChainDecrease" title="关系链对数删除量">
              </a-statistic>
            </div>
            <div :span="4" class="xt-bg rounded-lg p-2 p-2">
              <a-statistic :value="stats.GroupUpMsgNum" title="上行消息数（群）">
              </a-statistic>
            </div>
            <div :span="4" class="xt-bg rounded-lg p-2 p-2">
              <a-statistic :value="stats.GroupDownMsgNum" title="上下行消息数（群）">
              </a-statistic>
            </div>
            <div :span="4" class="xt-bg rounded-lg p-2 p-2">
              <a-statistic :value="stats.GroupSendMsgUserNum" title="发消息人数（群）">
              </a-statistic>
            </div>
            <div :span="4" class="xt-bg rounded-lg p-2 p-2">
              <a-statistic :value="stats.GroupAPNSMsgNum" title="APNs 推送数（群）">
              </a-statistic>
            </div>
            <div :span="4" class="xt-bg rounded-lg p-2 p-2">
              <a-statistic :value="stats.GroupSendMsgGroupNum" title="发消息群组数">
              </a-statistic>
            </div>
            <div :span="4" class="xt-bg rounded-lg p-2 p-2">
              <a-statistic :value="stats.GroupJoinGroupTimes" title="入群总数">
              </a-statistic>
            </div>
            <div :span="4" class="xt-bg rounded-lg p-2 p-2">
              <a-statistic :value="stats.GroupQuitGroupTimes" title="退群总数">
              </a-statistic>
            </div>
            <div :span="4" class="xt-bg rounded-lg p-2 p-2">
              <a-statistic :value="stats.GroupNewGroupNum" title="新增群组数">
              </a-statistic>
            </div>
            <div :span="4" class="xt-bg rounded-lg p-2 p-2">
              <a-statistic :value="stats.GroupAllGroupNum" title="累计群组数">
              </a-statistic>
            </div>
            <div :span="4" class="xt-bg rounded-lg p-2 p-2">
              <a-statistic :value="stats.GroupDestroyGroupNum" title="解散群个数">
              </a-statistic>
            </div>
            <div :span="4" class="xt-bg rounded-lg p-2 p-2">
              <a-statistic :value="stats.CallBackReq" title="回调请求数">
              </a-statistic>
            </div>
            <div :span="4" class="xt-bg rounded-lg p-2 p-2">
              <a-statistic :value="stats.CallBackRsp" title="回调应答数">
              </a-statistic>
            </div>
          </div>


        </div>
      </vue-custom-scrollbar>

    </div>
  </div>

</template>

<style lang="scss" scoped>
.stats-container {
  & > div {
    width: 150px;
  }
}
</style>
