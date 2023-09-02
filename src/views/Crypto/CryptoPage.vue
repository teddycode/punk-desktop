<template>
  <MainBackground>
    <div class="PageContent">
      <!-- 导航栏 -->
      <NavBar></NavBar>
      <div class="MarkdownContent">
        <div class="PageTitle">密码学库</div>

        <div class="DeveloperEntrance">
          <img
            src="../../assets/developer-entrance-background.jpg"
            alt="developer-entrance-background"
            class="bg-img"
          />
          <div>成为磐古开发者</div>
          <div>想要在磐古系统中加入你的设计？来治理社区提交你的提案吧。</div>
          <el-button color="blue">进入治理社区</el-button>
        </div>

        <div class="demo-collapse">
          <el-collapse v-model="activeNames" @change="handleChange">
            <el-collapse-item title="更新历史" name="1">
              <el-timeline>
                <el-timeline-item
                  v-for="(activity, index) in activities"
                  :key="index"
                  :timestamp="activity.timestamp"
                >
                  {{ activity.content }}
                </el-timeline-item>
              </el-timeline>
            </el-collapse-item>
          </el-collapse>
        </div>

        <div>
          <div class="PageTitle">哈希函数</div>
          <el-table :data="hashData" style="width: 100%">
            <el-table-column prop="name" label="名称" width="180" />
            <el-table-column prop="size" label="位数" width="180" />
            <el-table-column prop="version" label="版本" width="180" />
            <el-table-column prop="lastUpdate" label="更新时间" />
          </el-table>
          <div class="PageTitle">数字签名</div>
          <el-table :data="sigData" style="width: 100%">
            <el-table-column prop="name" label="名称" width="180" />
            <el-table-column prop="type" label="类型" width="180" />
            <el-table-column prop="version" label="版本" width="180" />
            <el-table-column prop="lastUpdate" label="更新时间" />
          </el-table>
          <div class="PageTitle">密钥交换</div>
          <el-table :data="keyExchangeData" style="width: 100%">
            <el-table-column prop="name" label="名称" width="180" />
            <el-table-column prop="version" label="版本" width="180" />
            <el-table-column prop="lastUpdate" label="更新时间" />
          </el-table>
          <div class="PageTitle">秘密承诺</div>
          <el-table :data="commitmentData" style="width: 100%">
            <el-table-column prop="name" label="名称" width="180" />
            <el-table-column prop="version" label="版本" width="180" />
            <el-table-column prop="lastUpdate" label="更新时间" />
          </el-table>
          <div class="PageTitle">秘密分享</div>
          <el-table :data="secretSharingData" style="width: 100%">
            <el-table-column prop="name" label="名称" width="180" />
            <el-table-column prop="version" label="版本" width="180" />
            <el-table-column prop="lastUpdate" label="更新时间" />
          </el-table>
          <div class="PageTitle">可验证随机数</div>
          <el-table :data="vrfData" style="width: 100%">
            <el-table-column prop="name" label="名称" width="180" />
            <el-table-column prop="version" label="版本" width="180" />
            <el-table-column prop="lastUpdate" label="更新时间" />
          </el-table>
          <div class="PageTitle">可验证延迟函数</div>
          <el-table :data="vdfData" style="width: 100%">
            <el-table-column prop="name" label="名称" width="180" />
            <el-table-column prop="version" label="版本" width="180" />
            <el-table-column prop="lastUpdate" label="更新时间" />
          </el-table>
          <div class="PageTitle">零知识证明</div>
          <el-table :data="zkpData" style="width: 100%">
            <el-table-column prop="name" label="名称" width="180" />
            <el-table-column prop="version" label="版本" width="180" />
            <el-table-column prop="lastUpdate" label="更新时间" />
          </el-table>
        </div>
      </div>
    </div>
  </MainBackground>
</template>

<script>
import MainBackground from "@/components/MainBackground.vue";
import NavBar from "@/components/crypto/NavBar.vue";

export default {
  components: { MainBackground, NavBar },
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
  data() {
    return {
      open: false,
      hashData: [
        {
          name: "BLAKE2b",
          size: 256,
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
* {
  color: #ffffff;
  font-family: "Microsoft Yahei";
}

.PageContent {
  margin-left: 10%;
  margin-right: 10%;
  text-align: left;
}

.PageTitle {
  font-size: 28px;
  text-align: left;
  margin-top: 10px;
  margin-bottom: 20px;
  font-weight: bold;
}

.DeveloperEntrance {
  border-radius: 4px;
}

.el-row {
  margin-bottom: 20px;
}
.el-row:last-child {
  margin-bottom: 0;
}
.el-col {
  border-radius: 4px;
}

.grid-content {
  border: 1px #170397;
  border-radius: 4px;
  height: 150px;
  text-align: center;
}

.router-link-active {
  text-decoration: none;
  color: #fff;
  font-size: 20px;
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

/* 按钮 */
</style>
