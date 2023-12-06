<template>
  <div class="container">
    <div class="left-panel"></div>
    <div class="middle-panel">
      <div class="middle-top">
        <div id="kline_container" ref="klineContainer"></div>
      </div>
      <div class="middle-bottom">
        <div class="transaction-view">
          <div class="header-transaction">
            <router-link
              :to="{ name: 'MyExchange' }"
              class="btn-transaction"
              :class="{ active: this.$route.name === 'MyExchange' }"
              >市价
            </router-link>
            <router-link
              :to="{ name: 'LimitOrder' }"
              class="btn-transaction"
              :class="{ active: this.$route.name === 'LimitOrder' }"
              >限价
            </router-link>
            <router-link
              :to="{ name: 'DepositToken' }"
              class="btn-transaction"
              :class="{ active: this.$route.name === 'DepositToken' }"
              >充提
            </router-link>
            <!-- <router-link to="/myTransaction/myToken" class="btn-transaction" :class="{active: $route.path === '/myTransaction/myToken'}">代币</router-link> -->
            <router-link
              :to="{ name: 'MyTrade' }"
              class="btn-transaction"
              :class="{ active: this.$route.name === 'MyTrade' }"
              >流动性
            </router-link>
            <router-link
              :to="{ name: 'MyOrder' }"
              class="btn-transaction"
              :class="{ active: this.$route.name === 'MyOrder' }"
              >我的订单
            </router-link>
          </div>
          <div class="content-transaction">
            <router-view></router-view>
          </div>
        </div>
      </div>
    </div>
    <div class="right-panel">
      <!-- <div class="right-top">
          <TokenPage class="full-size"></TokenPage>
      </div>
      <div class="right-bottom">
          <myOrder class="full-size"></myOrder>
      </div> -->
    </div>
  </div>
</template>
<script>
import OrderPage from './components/OrderPage.vue';
import TokenPage from './components/TokenPage.vue';
import Kline from 'kline';

export default {
  name: 'myTransaction',
  components: {
    OrderPage,
    TokenPage,
  },
  data() {
    return {
      kline: null,
      container: null,
      width: null,
      height: null,
    };
  },

  methods: {
    setupKline() {
      try {
        // if (this.kline != null || this.container != null) {
        //   return;
        // }
        this.kline = new Kline({
          element: '#kline_container',
          symbol: 'BTC',
          symbolName: '比特币',
          type: 'poll',
          url: '/mock/kline.json',
        });
        this.kline.draw();
        this.container = this.$refs.klineContainer;
        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;
        console.log(this.width);
        console.log(this.height);
        this.kline.resize(this.width, this.height);
        //this.kline.resize(760, 400);
        this.kline.setShowTrade(false); // true/false
      } catch (e) {
        console.error('exchange page error1:', e.toString());
      }
    },
    handleWindowResize() {
      try {
        const middleTop = this.$refs.klineContainer.parentElement; // 获取middle-top元素
        if (middleTop && this.kline && typeof this.kline.resize === 'function') {
          console.log('resize');
          const width = middleTop.clientWidth;
          const height = middleTop.clientHeight;
          this.kline.resize(width, height);
        }
      } catch (e) {
        console.error('exchange page error2:', e.toString());
      }
    },
  },
  mounted() {
    // 此处应该仅设置一次
    this.setupKline();
    window.addEventListener('resize', this.handleWindowResize);
    this.handleWindowResize(); // Call once on mounted to set initial size
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleWindowResize);
  },
};
</script>

<style scoped>
.container {
  display: flex;
  height: 100vh;
  width: 100vw;
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

.transaction-view {
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
  background-color: #2d3748;
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
  background-color: #4fd1c5; /* Use a brighter color for the active button */
  color: #f7fafc; /* Use a darker color for the text to make it stand out */
}

.content-transaction {
  flex: 1;
}
</style>
