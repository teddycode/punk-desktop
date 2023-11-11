<template>
  <div class="flex flex-row" style="height: 100%">
    <div class="item-content" style="height: 100%">
      <div v-for="item in navLists" :key="item" :style="avatarBgColor(item.frame.rarity)"
           class="mb-3 mx-2 rounded-lg flex flex-col" style="width:337px;">
        <div class="avatar-top flex " style="position: relative">
          <div style="width: 100px;height: 100px;">

            <RayMedal v-if="item.frame.rarity>=4" :size="120" :src="item.cover"
                      medalStyle="transform:scale(250%) !important" style="transform: translateX(-10%) translateY(-5%) ">

            </RayMedal>
            <img v-else :src="item.cover" alt="" class="w-full h-full object-fill">
          </div>
          <div class="flex flex-col justify-center ml-4">
            <div class="mt-2">
                  <span :style="titleTagColor(item.frame.rarity)" class="avatar-font">
              {{ item.alias }}
            </span>
              <span :style="avatarTagColor(item.frame.rarity)" class="w-11 h-6 rank-font rounded my-2.5">
              {{ textTag(item.frame.rarity) }}
            </span>
            </div>
            <div class="xt-text-2 mt-1">
              {{ item.summary }}
            </div>

            <span class="get-way-font mt-1">
              获得途径：{{ avatarGainMethodText(item.frame.gainMethod) }}
            </span>
            <div v-if="item.prices.length" class="mt-2">
              <a-avatar-group v-if="item.ownersCount">
                <span class="mr-4 xt-text-2"> 已售 {{ item?.ownersCount[1] }} 件</span>
                <a-avatar v-for="owner in item.ownersCount[0]" :src="owner.userInfo.avatar"
                          class="pointer" @click="showUserCard(owner.uid,owner.userInfo)"></a-avatar>
              </a-avatar-group>
            </div>
          </div>
          <div class=" xt-bg px-3 py-1 rounded-full pointer" style="position: absolute;right: 10px;top: 10px" title="试穿"
               @click="tryFrame(item.cover)">
            <icon icon="yifu" style="font-size: 18px"></icon>
            试穿
          </div>
        </div>
        <div v-if="item.prices.length !== 0" class="avatar-bottom flex  ">
          <a-button v-if="!item.owned" :style="getFrameScore(item)&&false ? {width:'104px'}:{width:'100%'}"
                    class="mr-3 rounded-xl avatar-font flex items-center justify-center m-3"
                    style="color: var(--active-text);height: 44px;" type="primary"
                    @click="buyNow(item)"
          >
            赞助 ￥ {{ getFramePrice(item).price }}
            <template v-if="getFramePrice(item).originPrice"><span
                class="line-through ml-2">￥{{ getFramePrice(item).originPrice }}</span>
              <a-badge :count="getDiscount(getFramePrice(item))" :number-style="{ backgroundColor: '#52c41a',borderColor:'transparent' }"
                       class="ml-2"></a-badge>
            </template>
          </a-button>
          <div v-else class="mr-3 avatar-font flex items-center justify-center  m-3" disabled
               style="height:44px;width: 100%;border: 1px solid var(--divider);color: var(--primary-text);">
            已有
          </div>
          <!-- <a-button v-else type="default" class="mr-3 rounded-xl avatar-font flex items-center justify-center  m-3" style="width: 100%">
            已有 <span class=" ml-2">￥ {{ getFramePrice(item).price }}</span> <template  v-if="getFramePrice(item).originPrice"><span class="line-through ml-2">￥{{getFramePrice(item).originPrice}}</span>
            </template>
          </a-button> -->
          <a-button v-if="getFrameScore(item)" class="mr-3  rounded-xl avatar-font flex items-center justify-center" hidden=""
                    style="color: var(--active-text);height: 44px;" type="primary" @click="scorePay(item)"

          >
            {{ getFrameScore(item) }}积分
          </a-button>
          <a-button :style="getFrameScore(item)&&false ? {width:'104px'}:{width:'50%'}" class="rounded-xl" hidden="" style="height: 44px;color: var(--active-text);"
                    type="primary"
                    @click="teamGift(item)"
          >
            赠送
          </a-button>
        </div>
      </div>
      <div class="mb-3 mx-2" style="width:337px;opacity: 0;height: 1px;"></div>
      <div class="mb-3 mx-2" style="width:337px;opacity: 0;height: 1px;"></div>
    </div>
  </div>

  <!-- 收款码付费弹窗组件 -->
  <a-modal v-model:visible="payVisible" :bodyStyle="{borderRadius:'12px',padding:'12px',}" :closable="false" :footer="null" :header="null" :width="480"
           centered @cancel="closeCheckTimer"
  >
    <div v-if="isPay === false" class="w-full flex items-center mb-6">
      <div class="avatar-font h-12 flex items-center justify-center" style="width: 90%;color: var(--primary-text);">
        收银台
      </div>
      <div class="w-12 flex items-center justify-center h-12 rounded-lg active-button pointer"
           style="color: var(--secondary-text);background: var(--secondary-bg);"
           @click="payVisible = false;closeCheckTimer()">
        <Icon icon="guanbi" style="font-size: 0.5715em;"></Icon>
      </div>
    </div>
    <PaymentMoney ref="paymentPanel" :gettingOrder="gettingOrder" :needPayAvatar="needPayAvatar"
                  :order="order"
                  @payOk="getFrameGoods();payVisible=false"></PaymentMoney>
    <!-- 未购买情况下走扫码支付的流程 -->
  </a-modal>

  <!-- 积分付费弹窗组件 -->
  <a-modal v-model:visible="pointVisible" :bodyStyle="{borderRadius:'12px',padding:'12px',}" :closable="false" :footer="null" :header="null"
           :width="480" centered
  >
    <div class="flex mb-6">
      <div class="avatar-font h-12 flex items-center justify-center" style="width: 90%;color: var(--primary-text);">
        收银台
      </div>
      <div class="w-12 h-12 flex items-center pointer justify-center rounded-lg active-button"
           style="color: var(--secondary-text);background: var(--secondary-bg);"
           @click="pointVisible = false"
      >
        <Icon icon="guanbi" style="font-size: 0.5715em;"></Icon>
      </div>
    </div>
    <PointPayment :needPayAvatar="needPayAvatar"></PointPayment>
  </a-modal>

  <GiftModal ref="giftRef" :memberDevoteDisplay="memberDevoteDisplay" :needPayAvatar="needPayAvatar"></GiftModal>
</template>

<script>
import {mapActions, mapState, mapWritableState} from 'pinia'
import PaymentMoney from '../payModal/PaymentMoney.vue'
import PointPayment from '../payModal/PointPayment.vue'
import GiftModal from '../payModal/GiftModal.vue'
import {appStore} from '../../store'
import {frameStore} from '../../store/avatarFrame'
import {teamStore} from '../../store/team'
import _ from 'lodash-es'
import {message} from 'ant-design-vue'
import {avatarBgColor, avatarGainMethodText, avatarTagColor, textTag, titleTagColor} from '../../js/common/avatar'
import RayMedal from '../small/RayMedal.vue'
import FrameAvatar from '../avatar/FrameAvatar.vue'
import Modal from '../Modal.vue'

export default {
  components: {
    FrameAvatar,
    RayMedal,
    PaymentMoney,
    PointPayment,
    GiftModal,
    Modal
  },
  props: {
    //排序列表
    navList: {
      type: Object,
      default: {},
    },
    //下拉框选中的类型
    selected: {
      type: String
    }
  },
  data() {
    return {
      pointVisible: false, // 默认关闭头像框积分兑换窗口
      payVisible: false, // 默认关闭头像框购买弹窗
      giftVisible: false, // 默认关闭赠送弹窗
      giftShow: false, // 点击赠送头像框默认方式
      needPayAvatar: {},  // 接收需要付费的头像框数据
      isPay: false, // 判断是否扫码支付完成条件
      teamSearch: '', // 小队头像框搜索
      simpleImage: '/img/state/null.png', // 数据空状态
      teamIndex: '', // 队友选中下标
      payShow: false, // 选中需要赠送的人界面

      order: {},//订单
      gettingOrder: true,
      tryFrameVisible: false,
      tringFrame: ''
    }
  },
  computed: {
    ...mapState(appStore, ['userInfo']),
    ...mapState(teamStore, ['membersDevote']),
    ...mapWritableState(frameStore, ['frameData']),
    frameList() {
      const data = this.frameData.list
      // const list = _.filter(data, function (o) { return o.frame.gainMethod !== 'rank' })
      // console.log(list)
      return data
    },
  },
  watch: {
    'listItem': {
      handler() {
        this.listItem = this.listItem
      },
      immediate: true,
    },
    navList: {
      immediate: true,
      handler() {
        this.navLists = JSON.parse(JSON.stringify(this.navList))
      }
    },
    selected: {
      immediate: true,
      deep: true,
      handler(newV, oldV) {
        this.navLists.forEach((item) => {
          var date = new Date(item.createTime);
          item.sortTime = date.getTime()
        })
        if (newV == '购买次数') this.navLists = this.mySort(this.navLists, 'ownersCount')
        else if (newV == '创建时间') this.navLists = this.mySort(this.navLists, 'sortTime')
        else this.navLists = this.navList
      }
    }
  },
  mounted() {
    this.getFrameGoods()
  },
  methods: {
    ...mapActions(frameStore, ['getFrameGoods', 'ensureOrder']),
    ...mapActions(appStore, ['showUserCard']),
    tryFrame(frameImage) {
      this.$emit('getFrameImage', frameImage)
    },
    mySort(data, property, asc) {
      let datas = [...data]
      if (property === 'ownersCount') {
        return datas.sort(function (a, b) {
          a = a[property][1]
          b = b[property][1]
          if (asc) return a - b
          else return b - a
        })
      } else if (property === 'sortTime') {
        return datas.sort(function (a, b) {
          a = a[property]
          b = b[property]
          if (asc) return a - b
          else return b - a
        })
      }
    },
    avatarTagColor, textTag, titleTagColor, avatarBgColor, avatarGainMethodText,
    getFramePrice(item) {  // 根据价格类型获取数据
      const money = _.find(item.prices, function (o) {
        return o.type === 'money'
      })
      if (money !== undefined) {
        return money
      }
    },
    getDiscount(price) {
      return '-' + ((1 - price.price / price.originPrice) * 100).toFixed(1) + '%'
    },
    getFrameScore(item) {  // 根据积分类型获取数据
      const score = _.find(item.prices, function (o) {
        return o.type === 'score'
      })
      if (score !== undefined) {
        return score.price
      }
    },

    scorePay(item) {   // 点击积分兑换回调事件
      this.pointVisible = true
      this.needPayAvatar.url = item.cover
      this.needPayAvatar.name = item.summary
    },

    teamGift(item) {  // 赠送回调事件
      this.$refs.giftRef.openGiftModal()
      this.needPayAvatar.price = this.getFramePrice(item)
    },
    // 赠送使用价格支付方式回调事件
    pricePay() {
      this.giftShow = true
    },

    // 头像框人物搜索回调事件
    avatarSearch(e) {
      // console.log('测试', e)
    },
    // 选中队友后回调事件
    giftTeamMember(item) {
      this.teamIndex = item.uid
      this.payShow = true
    },
    closeCheckTimer() {
      this.$refs.paymentPanel.closeTimer()
    },
    // 点击价格购买逻辑
    buyNow(item) {
      this.needPayAvatar.name = item.summary
      this.needPayAvatar.url = item.cover
      this.needPayAvatar.price = this.getFramePrice(item)
      this.gettingOrder = true
      this.ensureOrder(item.dataNanoid, this.getFramePrice(item).nanoid).then((rs) => {
        this.gettingOrder = false
        if (rs.status) {
          if (rs.data.code === 200) {
            //证明已经支付了
            message.info('已经支付了订单，无需重复支付。')
            this.getFrameGoods()
            return
          } else if (rs.data.code === 400) {
            this.payVisible = true // 打开支付弹窗
            this.order = rs.data.order
            this.$refs.paymentPanel.startTimer()
            return
          }
        }

        message.error('生成订单失败，请稍后再试。')
      })
    },
  }
}
</script>

<style lang="scss" scoped>
.item-content {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  overflow: auto;
  justify-content: center;
}

.item-content::-webkit-scrollbar {
  display: none;
}

.avatar-font {
  font-family: Oswald;
  font-size: 16px;
  font-weight: 500;
}

.rank-font {

  font-size: 14px;
  color: var(--active-text);
  font-weight: 500;
  text-align: center;
  margin-left: 10px;
  padding-left: 5px;
  padding-right: 5px;
}

.get-way-font {

  font-size: 14px;
  color: var(--secondary-text);
  font-weight: 400;
}

:deep(.ps__thumb-y) {
  display: none !important;
}

:deep(.ant-btn span) {
  display: flex !important;
  display: inline-block !important;
  align-items: center !important;
  justify-content: center !important;
}

.active-button {
  &:active {
    filter: brightness(0.8);
    opacity: 0.8;
  }

  &:hover {
    opacity: 0.8;
  }
}
</style>
