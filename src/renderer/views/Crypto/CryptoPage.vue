<template>
  <MainBackground>
    <!-- 导航栏 -->
    <el-menu :default-active="activeIndex" active-text-color="#ffd04b" background-color="#111B2D" class="el-menu-demo"
             mode="horizontal" text-color="#fff">
      <el-sub-menu index="1">
        <template #title>密码学库</template>
        <el-menu-item index="hash" @click="goAnchor('#hash')">哈希函数</el-menu-item>
        <el-menu-item index="sig" @click="goAnchor('#sig')">数字签名</el-menu-item>
        <el-menu-item index="ke" @click="goAnchor('#ke')">密钥交换</el-menu-item>
        <el-menu-item index="commit" @click="goAnchor('#commit')">秘密承诺</el-menu-item>
        <el-menu-item index="share" @click="goAnchor('#share')">秘密分享</el-menu-item>
        <el-menu-item index="vrf" @click="goAnchor('#vrf')">可验证随机数</el-menu-item>
        <el-menu-item index="vdf" @click="goAnchor('#vdf')">可验证延迟函数</el-menu-item>
        <el-menu-item index="zkp" @click="goAnchor('#zkp')">零知识证明</el-menu-item>
      </el-sub-menu>
      <el-menu-item index="2" @click="goAnchor('#developer')"> 进入社区</el-menu-item>
      <el-menu-item index="3" @click="goAnchor('#more')"> 了解更多</el-menu-item>
    </el-menu>
    <div class="PageContent">
      <div id="developer" class="DeveloperEntrance">
        <div class="developer-title">成为磐古开发者</div>
        <div class="developer-description">想要在磐古系统中加入你的设计？来治理社区提交你的提案吧。</div>
        <div class="buttons-container">
          <addnode-button1 class="developer-button-left" color="blue" @click="gotoGovernance">进入治理社区
          </addnode-button1>
          <addnode-button1 class="developer-button-right" color="blue" @click="gotoNewProposal">创建新提案
          </addnode-button1>
        </div>
      </div>
      <div>
        <div id="hash" class="PageTitle">哈希函数</div>
        <table class="table-style">
          <thead>
          <tr>
            <th>名称</th>
            <th>位数</th>
            <th>版本</th>
            <th>更新时间</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="item in hashData" :key="item.name">
            <td>{{ item.name }}</td>
            <td>{{ item.size }}</td>
            <td>{{ item.version }}</td>
            <td>{{ item.lastUpdate }}</td>
          </tr>
          </tbody>
        </table>
        <div id="sig" class="PageTitle">数字签名</div>
        <table class="table-style">
          <thead>
          <tr>
            <th>名称</th>
            <th>类型</th>
            <th>版本</th>
            <th>更新时间</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="item in sigData" :key="item.name">
            <td>{{ item.name }}</td>
            <td>{{ item.type }}</td>
            <td>{{ item.version }}</td>
            <td>{{ item.lastUpdate }}</td>
          </tr>
          </tbody>
        </table>
        <div id="ke" class="PageTitle">密钥交换</div>
        <table class="table-style">
          <thead>
          <tr>
            <th>名称</th>
            <th>版本</th>
            <th>更新时间</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="item in keyExchangeData" :key="item.name">
            <td>{{ item.name }}</td>
            <td>{{ item.version }}</td>
            <td>{{ item.lastUpdate }}</td>
          </tr>
          </tbody>
        </table>
        <div id="commit" class="PageTitle">秘密承诺</div>
        <table class="table-style">
          <thead>
          <tr>
            <th>名称</th>
            <th>版本</th>
            <th>更新时间</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="item in commitmentData" :key="item.name">
            <td>{{ item.name }}</td>
            <td>{{ item.version }}</td>
            <td>{{ item.lastUpdate }}</td>
          </tr>
          </tbody>
        </table>
        <div id="share" class="PageTitle">秘密分享</div>
        <table class="table-style">
          <thead>
          <tr>
            <th>名称</th>
            <th>版本</th>
            <th>更新时间</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="item in secretSharingData" :key="item.name">
            <td>{{ item.name }}</td>
            <td>{{ item.version }}</td>
            <td>{{ item.lastUpdate }}</td>
          </tr>
          </tbody>
        </table>
        <div id="vrf" class="PageTitle">可验证随机数</div>
        <table class="table-style">
          <thead>
          <tr>
            <th>名称</th>
            <th>版本</th>
            <th>更新时间</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="item in vrfData" :key="item.name">
            <td>{{ item.name }}</td>
            <td>{{ item.version }}</td>
            <td>{{ item.lastUpdate }}</td>
          </tr>
          </tbody>
        </table>
        <div id="vdf" class="PageTitle">可验证延迟函数</div>
        <table class="table-style">
          <thead>
          <tr>
            <th>名称</th>
            <th>版本</th>
            <th>更新时间</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="item in vdfData" :key="item.name">
            <td>{{ item.name }}</td>
            <td>{{ item.version }}</td>
            <td>{{ item.lastUpdate }}</td>
          </tr>
          </tbody>
        </table>
        <div id="zkp" class="PageTitle">零知识证明</div>
        <table class="table-style">
          <thead>
          <tr>
            <th>名称</th>
            <th>版本</th>
            <th>更新时间</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="item in zkpData" :key="item.name">
            <td>{{ item.name }}</td>
            <td>{{ item.version }}</td>
            <td>{{ item.lastUpdate }}</td>
          </tr>
          </tbody>
        </table>
      </div>
      <div id="more" class="PageTitle">
        了解更多
      </div>
      <el-row gutter="40">
        <el-col :span="12">
          <div class="document-button">
            <font-awesome-icon class="icon" icon="file-alt"/>
            <span class="doc-text">阅读文档</span>
            <font-awesome-icon class="right-icon" icon="angle-right"/>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="document-button">
            <font-awesome-icon class="icon" icon="fire"/>
            <span class="doc-text">进入论坛</span>
            <font-awesome-icon class="right-icon" icon="angle-right"/>
          </div>
        </el-col>
      </el-row>

    </div>
  </MainBackground>
</template>

<script>
import MainBackground from "@/components/MainBackground.vue";
import addnodeButton1 from "@/components/buttons/addnodeButton1.vue";

export default {
  components: {MainBackground, addnodeButton1},
  provide() {
    return {
      // 导航窗格内容
      navItem: {
        FirstLink: "/Crypto",
        FirstItem: "密码学库",
        ItemList: [],
      },
    };
  },
  methods: {
    goAnchor(selector) {
      document.querySelector(selector).scrollIntoView({
        behavior: "smooth",
      });
    },
    gotoGovernance() {
      this.$router.push({name: "GovernancePage"})
    },
    gotoNewProposal() {
      this.$router.push({name: "ProposalHomePage"})
    }
  },
  data() {
    return {
      activeIndex: "1",
      hashData: [
        {
          name: "BLAKE2b",
          size: 512,
          version: "0.1.0",
          lastUpdate: "2023-08-03",
        },
        {
          name: "BLAKE2s",
          size: 256,
          version: "0.1.0",
          lastUpdate: "2023-08-03",
        },
        {
          name: "Keccak-256",
          size: 256,
          version: "0.1.0",
          lastUpdate: "2023-08-03",
        },
        {
          name: "Keccak-512",
          size: 512,
          version: "0.1.0",
          lastUpdate: "2023-08-03",
        },
        {
          name: "Poseidon-256",
          size: 256,
          version: "0.1.0",
          lastUpdate: "2023-08-03",
        },
        {
          name: "RIPEMD-160",
          size: 160,
          version: "0.1.0",
          lastUpdate: "2023-08-03",
        },
        {
          name: "Scrypt-256",
          size: 256,
          version: "0.1.0",
          lastUpdate: "2023-08-03",
        },
        {
          name: "SHA-256",
          size: 256,
          version: "0.1.0",
          lastUpdate: "2023-08-03",
        },
        {
          name: "SHA-512",
          size: 256,
          version: "0.1.0",
          lastUpdate: "2023-08-03",
        },
        {
          name: "SHA3-256",
          size: 256,
          version: "0.1.0",
          lastUpdate: "2023-08-03",
        },
        {
          name: "SHA3-512",
          size: 512,
          version: "0.1.0",
          lastUpdate: "2023-08-03",
        },
      ],
      sigData: [
        {
          name: "BLS",
          type: "常规签名",
          version: "0.1.0",
          lastUpdate: "2023-08-03",
        },
        {
          name: "ECDSA",
          type: "常规签名",
          version: "0.1.0",
          lastUpdate: "2023-08-03",
        },
        {
          name: "ECSchnorr",
          type: "常规签名",
          version: "0.1.0",
          lastUpdate: "2023-08-03",
        },
        {
          name: "EdDSA",
          type: "常规签名",
          version: "0.1.0",
          lastUpdate: "2023-08-03",
        },
        {
          name: "SM2",
          type: "常规签名",
          version: "0.1.0",
          lastUpdate: "2023-08-03",
        },
        {
          name: "BLS多重签名",
          type: "多重签名",
          version: "0.1.0",
          lastUpdate: "2023-08-03",
        },
        {
          name: "BLS门限签名",
          type: "门限签名",
          version: "0.1.0",
          lastUpdate: "2023-08-03",
        },
      ],
      keyExchangeData: [
        {
          name: "DH",
          version: "0.1.0",
          lastUpdate: "2023-08-03",
        },
        {
          name: "ECDH",
          version: "0.1.0",
          lastUpdate: "2023-08-03",
        },
        {
          name: "Stealth Address",
          version: "0.1.0",
          lastUpdate: "2023-08-03",
        },
      ],
      commitmentData: [
        {
          name: "Hash 承诺",
          version: "0.1.0",
          lastUpdate: "2023-08-03",
        },
        {
          name: "Pedersen 承诺",
          version: "0.1.0",
          lastUpdate: "2023-08-03",
        },
        {
          name: "KZG 多项式承诺",
          version: "0.1.0",
          lastUpdate: "2023-08-03",
        },
        {
          name: "向量承诺",
          version: "0.1.0",
          lastUpdate: "2023-08-03",
        },
      ],
      secretSharingData: [
        {
          name: "Shamir 秘密分享",
          version: "0.1.0",
          lastUpdate: "2023-08-03",
        },
        {
          name: "可验证秘密分享",
          version: "0.1.0",
          lastUpdate: "2023-08-03",
        },
        {
          name: "可公开验证秘密分享",
          version: "0.1.0",
          lastUpdate: "2023-08-03",
        },
      ],
      vrfData: [
        {
          name: "ECVRF",
          version: "0.1.0",
          lastUpdate: "2023-08-03",
        },
      ],
      vdfData: [
        {
          name: "Pietrzak VDF",
          version: "0.1.0",
          lastUpdate: "2023-08-03",
        },
        {
          name: "Wesolowski VDF",
          version: "0.1.0",
          lastUpdate: "2023-08-03",
        },
      ],
      zkpData: [
        {
          name: "DLEQ",
          type: "专用零知识证明",
          version: "0.1.0",
          lastUpdate: "2023-08-03",
        },
        {
          name: "Pedersen 承诺零知识证明",
          type: "专用零知识证明",
          version: "0.1.0",
          lastUpdate: "2023-08-03",
        },
        {
          name: "Caulk+",
          type: "专用零知识证明",
          version: "0.1.0",
          lastUpdate: "2023-08-03",
        },
        {
          name: "zk-SNARKs",
          type: "通用零知识证明框架",
          version: "0.1.0",
          lastUpdate: "2023-08-03",
        },
      ],
    };
  },
};
</script>

<style>
.PageContent {
  color: #ffffff;
  text-align: left;
  margin-left: 5%;
  margin-right: 5%;
  overflow-y: auto;
  max-height: calc(100% - 60px);
  position: relative;
}

.PageTitle {
  font-size: 28px;
  text-align: left;
  margin-top: 10px;
  padding-top: 10px;
  margin-bottom: 10px;
  font-weight: bold;
}

.DeveloperEntrance {
  margin-top: 2%;
  border-radius: 20px;
  position: relative; /* 设置为相对定位 */
  background-image: url('@/assets/images/developer-background.jpg'); /* 使用您上传的图片作为背景 */
  background-size: cover; /* 使背景图像填充整个容器 */
  height: 400px; /* 为容器设置一个高度，您可以根据需要调整 */
}

.developer-title {
  position: absolute;
  left: 50%;
  top: 5%;
  transform: translateX(-50%);
  font-size: 2.5rem;
  font-weight: bold;
  color: #ffffff;
}

.developer-description {
  width: 36%;
  position: absolute;
  left: 75%;
  top: 40%;
  transform: translateX(-50%);
  font-size: 1.5rem;
  color: #ffffff;
}

.developer-button {
  position: absolute;
  left: 50%;
  top: 80%;
  transform: translateX(-50%);
  font-size: 20px;
  color: #ffffff;
  background-color: transparent !important;
}

.buttons-container {
  position: absolute;
  display: flex;
  justify-content: space-between;
  width: 100%;
  bottom: 10%;
}

.developer-button-left {
  font-size: 20px;
  color: #ffffff;
  /*background-color: transparent !important;*/
  margin-left: 15%; /* 这只是一个例子，您可以根据需要调整 */
}

.developer-button-right {
  font-size: 20px;
  color: #ffffff;
  /*background-color: transparent !important;*/
  margin-right: 15%; /* 这只是一个例子，您可以根据需要调整 */
}

a {
  text-decoration: none;
  color: #fff;
  font-size: 20px;
}

.bg-img {
  max-width: 100%;
  height: auto;
}

.el-menu-demo {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
}

::-webkit-scrollbar {
  display: none;
}

.document-button {
  display: flex;
  align-items: center;
  justify-content: space-between; /* 添加这一行 */
  border: 2px solid white;
  padding: 10px 20px;
  cursor: pointer;
  border-radius: 5px;
  transition: background-color 0.3s;
}

.document-button:hover {
  background-color: rgba(255, 255, 255, 0.1); /* 轻微的背景色变化，增加交互感 */
}

.doc-icon {
  font-size: 24px;
  background: linear-gradient(to right, red, yellow);
  -webkit-background-clip: text;
  color: transparent;
  margin-right: 10px;
}

.doc-text {
  margin-left: 10px;
  color: white;
  font-weight: bold;
}

.right-icon {
  margin-left: auto;
}
</style>
