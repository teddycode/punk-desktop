<template>
  <div class="governance-page">
    <h1 class="governance-title">治理</h1>
    <div class="content-container">
      <div class="side-div left-div">
        <div class="upper-div">
          <process-guide></process-guide>
        </div>
        <div class="lower-div">
          <tool-box></tool-box>
        </div>
      </div>
      <div class="center-div">
        <div class="nav-container">
          <a-button type="primary" class="nav-btn">共识</a-button>
          <a-button type="primary" class="nav-btn">网络</a-button>
          <a-button type="primary" class="nav-btn">公共物品</a-button>
          <a-button type="primary" class="nav-btn">交易</a-button>
          <a-button type="primary" class="nav-btn">国库</a-button>
        </div>
        <div class="main-content">
          <div class="content-box">
            <div class="box-title">
              <div class="box-title-left">最新提出</div>
              <div class="box-title-more" @click="navToPL">更多>></div>
            </div>
            <div class="box-main-content">
              <img alt="" class="main-img" src="/images/governance/pos_gov.jpg" @click="navToInfo" />
            </div>
          </div>
          <div class="content-box">
            <div class="box-title">
              <div class="box-title-left">数据看板</div>
              <div class="box-title-more" @click="navToPL">更多>></div>
            </div>
            <div class="box-main-content">
              <img alt="" class="main-img" src="/images/governance/treasure.jpg" />
            </div>
          </div>
          <div class="content-box">
            <div class="box-title">
              <div class="box-title-left">热门提案</div>
              <div class="box-title-more" @click="navToPL">更多>></div>
            </div>
            <div class="box-main-content">
              <ul class="proposal-list">
                <li @click="navToInfo">Proof-of-Stake 网络的区块奖励调整提案</li>
                <li @click="navToInfo">去中心化金融 (DeFi) 协议的安全增强提案</li>
                <li @click="navToInfo">跨链桥接协议的多链集成提案</li>
                <li @click="navToInfo">稳定币发行和抵押品参数的调整</li>
                <li @click="navToInfo">区块链社区治理流程改进提案</li>
              </ul>
            </div>
          </div>
          <div class="content-box">
            <div class="box-title">
              <div class="box-title-left">正在评议</div>
              <div class="box-title-more" @click="navToPL">更多>></div>
            </div>
            <div class="box-main-content">
              <ul class="proposal-list">
                <li @click="navToInfo">Proof-of-Stake 网络的区块奖励调整提案</li>
                <li @click="navToInfo">去中心化金融 (DeFi) 协议的安全增强提案</li>
                <li @click="navToInfo">跨链桥接协议的多链集成提案</li>
                <li @click="navToInfo">稳定币发行和抵押品参数的调整</li>
                <li @click="navToInfo">区块链社区治理流程改进提案</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div class="side-div right-div">
        <div class="upper-div">
          <!--          <new-proposal></new-proposal>-->
        </div>
        <div class="lower-div">
          <my-proposals></my-proposals>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import processGuide from './components/processGuide.vue';
import toolBox from './components/toolBox.vue';
import newProposal from './components/newProposal.vue';
import myProposals from './components/myProposals.vue';

export default {
  components: {
    processGuide,
    toolBox,
    newProposal,
    myProposals,
  },
  data() {
    return {};
  },
  methods: {
    navToInfo() {
      this.$router.push({ name: 'OneProposals' });
    },
    navToPL() {
      this.$router.push({ name: 'ProposalHomePage' });
    },
  },
};
</script>

<style scoped>
.governance-page {
  padding: 2rem;
  height: 100%;
}

.governance-title {
  font-size: 1.875rem;
  margin-bottom: 2rem;
  text-align: center;
  color: #333333;
}

.content-container {
  display: flex;
  justify-content: space-between;
  height: 90%;
  align-items: stretch;
}

.center-div {
  border: 2px solid #333333;
  border-radius: 15px;
  box-sizing: border-box;
  background-color: transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}

.nav-container {
  display: flex;
  justify-content: space-between;
  width: 95%;
  margin: 20px;
  background-color: #2d3748;
  padding: 10px;
}

.nav-btn {
  color: #333333;
  padding: 10px 20px;
  background-color: transparent;
  border-radius: 5px;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.nav-btn:hover {
  background-color: #4fd1c5;
}

.left-div,
.right-div {
  flex: 2;
  margin-right: 3%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.right-div {
  margin-right: 0;
  margin-left: 3%;
}

.center-div {
  flex: 5;
}

.upper-div,
.lower-div {
  border: 2px solid #333333;
  border-radius: 15px;
  box-sizing: border-box;
  background-color: transparent;
}

.upper-div {
  height: 65%;
}

.lower-div {
  height: 30%;
}

.main-content {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  width: 95%;
  height: 90%;
}

.content-box {
  padding-top: 2%;
  flex-basis: calc(50% - 3%);
  height: 40%;
  color: #333333;
}

.proposal-list {
  padding-left: 10%;
  margin-top: 3%;
  font-size: 1rem;
  list-style-type: none;
}

.proposal-list li::marker {
  color: #333333;
}

.proposal-list li {
  margin-bottom: 3%;
  list-style-type: disc;
}

.box-title {
  font-size: 1.2rem;
  text-align: left;
  padding-left: 4%;
  border-bottom-width: 1px;
  border-bottom-style: solid;
  border-bottom-color: #cadff3;
}

.box-main-content {
  text-align: left;
}

.box-title-left {
  display: inline-block;
  color: #1479d7;
  border-bottom-width: 4px;
  border-bottom-style: solid;
  border-bottom-color: rgb(20, 121, 215);
}

.box-title-more {
  display: block;
  float: right;
}

.main-img {
  max-width: 100%; /* 图片最大宽度为容器宽度 */
  height: auto; /* 保持图片宽高比 */
  display: block; /* 去掉默认行内元素的下方空白间隙 */
}
</style>
