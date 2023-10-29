<template>
  <main-background>
    <div class="exg-container">
      <div class="left-panel"></div>
      <div class="middle-panel">
        <div class="middle-top">
          <div id="kline_container" ref="klineContainer"></div>
        </div>
        <div class="middle-bottom">
          <div class="exg-transaction-view">
            <div class="header-transaction">
              <router-link :class="{active: $route.name === 'MyExchange'}" class="btn-transaction"
                           to="/exchange/myExchange">市价
              </router-link>
              <router-link :class="{active: $route.name === 'LimitOrder'}" class="btn-transaction"
                           to="/exchange/limitOrder">限价
              </router-link>
              <router-link :class="{active: $route.name === 'DepositToken'}" class="btn-transaction"
                           to="/exchange/depositToken">充提
              </router-link>
              <!-- <router-link to="/Exhcange/myToken" class="btn-transaction" :class="{active: $route.path === '/myTransaction/myToken'}">代币</router-link> -->
              <router-link :class="{active: $route.name === 'MyTrade'}" class="btn-transaction"
                           to="/exchange/myTrade">流动性
              </router-link>
              <router-link :class="{active: $route.name === 'MyOrder'}" class="btn-transaction"
                           to="/exchange/myOrder">我的订单
              </router-link>
            </div>
            <div class="exg-content-transaction">
              <router-view></router-view>
            </div>
          </div>
        </div>
      </div>
      <div class="right-panel">
        <div class="right-top">
          <TokenPage class="full-size"></TokenPage>
        </div>
        <!--        <div class="right-bottom">-->
        <!--&lt;!&ndash;          <OrderPage class="full-size"></OrderPage>&ndash;&gt;-->
        <!--        </div>-->
      </div>
    </div>
  </main-background>
</template>
<script lang="ts">
import {ref, onMounted, onBeforeUnmount} from 'vue';
import MainBackground from "@components/common/MainBackground.vue";
import OrderPage from "@pages/Exchange/components/OrderPage/index.vue";
import TokenPage from "@pages/Exchange/components/TokenPage/index.vue";
import Kline from 'kline';

export default {
  name: 'Exchange',
  components: {
    OrderPage,
    TokenPage,
    MainBackground,
  },
  setup() {
    const kline = ref(null);
    const container = ref(null);
    const width = ref(null);
    const height = ref(null);


    const setupKline = () => {
      kline.value = new Kline({
        element: "#kline_container",
        symbol: "BTC",
        symbolName: "比特币",
        type: "poll",
        url: "http://127.0.0.1:8081/mock.json"
      });
      kline.value.draw();
      container.value = this.$refs.klineContainer;
      width.value = container.value.clientWidth;
      height.value = container.value.clientHeight;
      console.log(width.value);
      console.log(height.value);
      kline.value.resize(width.value, height.value);
      kline.value.setShowTrade(false);
    };

    const handleWindowResize = () => {
      const middleTop = this.$refs.klineContainer.parentElement;
      if (middleTop && kline.value && typeof kline.value.resize === "function") {
        console.log("resize");
        const width = middleTop.clientWidth;
        const height = middleTop.clientHeight;
        kline.value.resize(width, height);
      }
    };

    onMounted(() => {
      setupKline();
      window.addEventListener('resize', handleWindowResize);
      handleWindowResize();
    });

    onBeforeUnmount(() => {
      window.removeEventListener('resize', handleWindowResize);
    });

    return {
      kline,
      container,
      width,
      height,
      setupKline,
      handleWindowResize
    };
  }
};
</script>


<style scoped>
.exg-container {
  display: flex;
  height: 100%;
  width: 100%;
}

.left-panel {
  width: 20%; /* 20% */
  /* background-color: #f5f5f5; */
  background-image: url('/images/exchange/leftpic.png');
  /* background-size: contain; */
  background-size: cover;
  display: flex;
  background-repeat: no-repeat;
}

.middle-panel {
  width: 60%; /* 60% */
  display: flex;
  flex-direction: column;
}

.right-panel {
  width: 20%; /* 20% */
  display: flex;
  flex-direction: column;
  background-image: url('/images/exchange/right.jpg');
  /* background-size: contain; */
  /* //填充整个div */
  background-size: cover;
  background-repeat: no-repeat;
}

.middle-top {
  height: 57%;
  position: relative;
}

#kline_container {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

.middle-bottom {
  /* flex: 1;  50% */
  height: 43%;
  /* background-color: #f5f5f5; */
}

.exg-transaction-view {
  display: flex;
  flex-direction: column;
  /*min-height: 100vh;*/
}

.full-size {
  width: 100%;
  height: 100%;
}

.header-transaction {
  margin: 0px;
  display: flex;
  justify-content: flex-start;
  margin-bottom: 0px;
  background-color: #2D3748;
}

.btn-transaction {
  color: white;
  padding: 3px 6px;
  border: none;
  cursor: pointer;
  background-color: transparent;
  border-radius: 5px;
  margin-right: 15px;
  text-decoration: none; /* add this to remove the underline */
}

.btn-transaction.active {
  background-color: #4FD1C5; /* Use a brighter color for the active button */
  color: #F7FAFC; /* Use a darker color for the text to make it stand out */
}

.exg-content-transaction {
  flex: 1;
}
</style>
