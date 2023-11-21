<template>
  <!-- 导航栏 -->
  <a-menu :default-selected-keys="activeIndex" theme="dark" mode="horizontal">
    <a-sub-menu key="1" title="密码学库">
      <a-menu-item key="hash" @click="goAnchor('#hash')">哈希函数</a-menu-item>
      <a-menu-item key="sig" @click="goAnchor('#sig')">数字签名</a-menu-item>
      <a-menu-item key="ke" @click="goAnchor('#ke')">密钥交换</a-menu-item>
      <a-menu-item key="commit" @click="goAnchor('#commit')">秘密承诺</a-menu-item>
      <a-menu-item key="share" @click="goAnchor('#share')">秘密分享</a-menu-item>
      <a-menu-item key="vrf" @click="goAnchor('#vrf')">可验证随机数</a-menu-item>
      <a-menu-item key="vdf" @click="goAnchor('#vdf')">可验证延迟函数</a-menu-item>
      <a-menu-item key="zkp" @click="goAnchor('#zkp')">零知识证明</a-menu-item>
    </a-sub-menu>
    <a-menu-item key="2" @click="goAnchor('#developer')">进入社区</a-menu-item>
    <a-menu-item key="3" @click="goAnchor('#more')">了解更多</a-menu-item>
  </a-menu>
  <div class="PageContent">
    <div id="developer" class="DeveloperEntrance">
      <div class="developer-title">成为磐古开发者</div>
      <div class="developer-description">想要在磐古系统中加入你的设计？来治理社区提交你的提案吧。</div>
      <div class="buttons-container">
        <shape-button class="developer-button-left" color="blue" @click="gotoGovernance">进入治理社区
        </shape-button>
        <shape-button class="developer-button-right" color="blue" @click="gotoNewProposal">创建新提案
        </shape-button>
      </div>
    </div>
    <div>
      <div id="hash"  class="PageTitle">哈希函数</div>
      <a-table :columns="hashColumns" :dataSource="hashData" rowKey="name"/>
      <div id="sig" class="PageTitle">数字签名</div>
      <a-table :columns="sigColumns" :dataSource="sigData" rowKey="name"/>
      <div id="ke" class="PageTitle">密钥交换</div>
      <a-table :columns="keyExchangeColumns" :dataSource="keyExchangeData" rowKey="name"/>
      <div id="commit" class="PageTitle">秘密承诺</div>
      <a-table :columns="commitmentColumns" :dataSource="commitmentData" rowKey="name"/>
      <div id="share" class="PageTitle">秘密分享</div>
      <a-table :columns="secretSharingColumns" :dataSource="secretSharingData" rowKey="name"/>
      <div id="vrf" class="PageTitle">可验证随机数</div>
      <a-table :columns="vrfColumns" :dataSource="vrfData" rowKey="name"/>
      <div id="vdf" class="PageTitle">可验证延迟函数</div>
      <a-table :columns="vdfColumns" :dataSource="vdfData" rowKey="name"/>
      <div id="zkp" class="PageTitle">零知识证明</div>
      <a-table :columns="zkpColumns" :dataSource="zkpData" rowKey="name"/>
    </div>
    <div id="more" class="PageTitle">
      了解更多
    </div>
    <a-row gutter="40">
      <a-col :span="12">
        <div class="document-button">
          <read-outlined/>
          <span class="doc-text">阅读文档</span>
          <right-circle-outlined/>
        </div>
      </a-col>
      <a-col :span="12">
        <div class="document-button">
          <login-outlined/>
          <span class="doc-text">进入论坛</span>
          <right-circle-outlined/>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { Button, Col, Menu, MenuItem, Row, SubMenu, Table } from 'ant-design-vue'
import ShapeButton from '@page/core/components/ShapeButton.vue'
import { LoginOutlined, ReadOutlined, RightCircleOutlined, } from '@ant-design/icons-vue'

export default defineComponent({
  name: 'Crypto',
  components: {
    'a-menu': Menu,
    'a-sub-menu': SubMenu,
    'a-menu-item': MenuItem,
    'a-button': Button,
    'a-table': Table,
    'a-row': Row,
    'a-col': Col,
    'shape-button': ShapeButton,
    'read-outlined': ReadOutlined,
    'right-circle-outlined': RightCircleOutlined,
    'login-outlined': LoginOutlined,
  },
  methods: {
    goAnchor (selector) {
      document.querySelector(selector).scrollIntoView({
        behavior: 'smooth',
      })
    },
    gotoGovernance () {
      this.$router.push({ name: 'GovernancePage' })
    },
    gotoNewProposal () {
      this.$router.push({ name: 'ProposalHomePage' })
    },
  },
  data () {
    return {
      activeIndex: '1',
      hashColumns: [
        {
          title: '名称',
          dataIndex: 'name',
          key: 'name',
        },
        {
          title: '位数',
          dataIndex: 'size',
          key: 'size',
        },
        {
          title: '版本',
          dataIndex: 'version',
          key: 'version',
        },
        {
          title: '更新时间',
          dataIndex: 'lastUpdate',
          key: 'lastUpdate',
        },
      ],
      hashData: [
        {
          name: 'BLAKE2b',
          size: 512,
          version: '0.1.0',
          lastUpdate: '2023-08-03',
        },
        {
          name: 'BLAKE2s',
          size: 256,
          version: '0.1.0',
          lastUpdate: '2023-08-03',
        },
        {
          name: 'Keccak-256',
          size: 256,
          version: '0.1.0',
          lastUpdate: '2023-08-03',
        },
        {
          name: 'Keccak-512',
          size: 512,
          version: '0.1.0',
          lastUpdate: '2023-08-03',
        },
        {
          name: 'Poseidon-256',
          size: 256,
          version: '0.1.0',
          lastUpdate: '2023-08-03',
        },
        {
          name: 'RIPEMD-160',
          size: 160,
          version: '0.1.0',
          lastUpdate: '2023-08-03',
        },
        {
          name: 'Scrypt-256',
          size: 256,
          version: '0.1.0',
          lastUpdate: '2023-08-03',
        },
        {
          name: 'SHA-256',
          size: 256,
          version: '0.1.0',
          lastUpdate: '2023-08-03',
        },
        {
          name: 'SHA-512',
          size: 256,
          version: '0.1.0',
          lastUpdate: '2023-08-03',
        },
        {
          name: 'SHA3-256',
          size: 256,
          version: '0.1.0',
          lastUpdate: '2023-08-03',
        },
        {
          name: 'SHA3-512',
          size: 512,
          version: '0.1.0',
          lastUpdate: '2023-08-03',
        },
      ],
      sigColumns: [
        {
          title: '名称',
          dataIndex: 'name',
          key: 'name',
        },
        {
          title: '类型',
          dataIndex: 'type',
          key: 'type',
        },
        {
          title: '版本',
          dataIndex: 'version',
          key: 'version',
        },
        {
          title: '更新时间',
          dataIndex: 'lastUpdate',
          key: 'lastUpdate',
        },
      ],
      sigData: [
        {
          name: 'BLS',
          type: '常规签名',
          version: '0.1.0',
          lastUpdate: '2023-08-03',
        },
        {
          name: 'ECDSA',
          type: '常规签名',
          version: '0.1.0',
          lastUpdate: '2023-08-03',
        },
        {
          name: 'ECSchnorr',
          type: '常规签名',
          version: '0.1.0',
          lastUpdate: '2023-08-03',
        },
        {
          name: 'EdDSA',
          type: '常规签名',
          version: '0.1.0',
          lastUpdate: '2023-08-03',
        },
        {
          name: 'SM2',
          type: '常规签名',
          version: '0.1.0',
          lastUpdate: '2023-08-03',
        },
        {
          name: 'BLS多重签名',
          type: '多重签名',
          version: '0.1.0',
          lastUpdate: '2023-08-03',
        },
        {
          name: 'BLS门限签名',
          type: '门限签名',
          version: '0.1.0',
          lastUpdate: '2023-08-03',
        },
      ],
      keyExchangeColumns: [
        {
          title: '名称',
          dataIndex: 'name',
          key: 'name',
        },
        {
          title: '版本',
          dataIndex: 'version',
          key: 'version',
        },
        {
          title: '更新时间',
          dataIndex: 'lastUpdate',
          key: 'lastUpdate',
        },
      ],
      keyExchangeData: [
        {
          name: 'DH',
          version: '0.1.0',
          lastUpdate: '2023-08-03',
        },
        {
          name: 'ECDH',
          version: '0.1.0',
          lastUpdate: '2023-08-03',
        },
        {
          name: 'Stealth Address',
          version: '0.1.0',
          lastUpdate: '2023-08-03',
        },
      ],
      commitmentColumns: [
        {
          title: '名称',
          dataIndex: 'name',
          key: 'name',
        },
        {
          title: '版本',
          dataIndex: 'version',
          key: 'version',
        },
        {
          title: '更新时间',
          dataIndex: 'lastUpdate',
          key: 'lastUpdate',
        },
      ],
      commitmentData: [
        {
          name: 'Hash 承诺',
          version: '0.1.0',
          lastUpdate: '2023-08-03',
        },
        {
          name: 'Pedersen 承诺',
          version: '0.1.0',
          lastUpdate: '2023-08-03',
        },
        {
          name: 'KZG 多项式承诺',
          version: '0.1.0',
          lastUpdate: '2023-08-03',
        },
        {
          name: '向量承诺',
          version: '0.1.0',
          lastUpdate: '2023-08-03',
        },
      ],
      secretSharingColumns: [
        {
          title: '名称',
          dataIndex: 'name',
          key: 'name',
        },
        {
          title: '版本',
          dataIndex: 'version',
          key: 'version',
        },
        {
          title: '更新时间',
          dataIndex: 'lastUpdate',
          key: 'lastUpdate',
        },
      ],
      secretSharingData: [
        {
          name: 'Shamir 秘密分享',
          version: '0.1.0',
          lastUpdate: '2023-08-03',
        },
        {
          name: '可验证秘密分享',
          version: '0.1.0',
          lastUpdate: '2023-08-03',
        },
        {
          name: '可公开验证秘密分享',
          version: '0.1.0',
          lastUpdate: '2023-08-03',
        },
      ],
      vrfColumns: [
        {
          title: '名称',
          dataIndex: 'name',
          key: 'name',
        },
        {
          title: '版本',
          dataIndex: 'version',
          key: 'version',
        },
        {
          title: '更新时间',
          dataIndex: 'lastUpdate',
          key: 'lastUpdate',
        },
      ],
      vrfData: [
        {
          name: 'ECVRF',
          version: '0.1.0',
          lastUpdate: '2023-08-03',
        },
      ],
      vdfColumns: [
        {
          title: '名称',
          dataIndex: 'name',
          key: 'name',
        },
        {
          title: '版本',
          dataIndex: 'version',
          key: 'version',
        },
        {
          title: '更新时间',
          dataIndex: 'lastUpdate',
          key: 'lastUpdate',
        },
      ],
      vdfData: [
        {
          name: 'Pietrzak VDF',
          version: '0.1.0',
          lastUpdate: '2023-08-03',
        },
        {
          name: 'Wesolowski VDF',
          version: '0.1.0',
          lastUpdate: '2023-08-03',
        },
      ],
      zkpColumns: [
        {
          title: '名称',
          dataIndex: 'name',
          key: 'name',
        },
        {
          title: '版本',
          dataIndex: 'version',
          key: 'version',
        },
        {
          title: '更新时间',
          dataIndex: 'lastUpdate',
          key: 'lastUpdate',
        },
      ],
      zkpData: [
        {
          name: 'DLEQ',
          type: '专用零知识证明',
          version: '0.1.0',
          lastUpdate: '2023-08-03',
        },
        {
          name: 'Pedersen 承诺零知识证明',
          type: '专用零知识证明',
          version: '0.1.0',
          lastUpdate: '2023-08-03',
        },
        {
          name: 'Caulk+',
          type: '专用零知识证明',
          version: '0.1.0',
          lastUpdate: '2023-08-03',
        },
        {
          name: 'zk-SNARKs',
          type: '通用零知识证明框架',
          version: '0.1.0',
          lastUpdate: '2023-08-03',
        },
      ],
    }
  },
})
</script>

<style scoped>
.PageContent {
  color: #000;
  text-align: left;
  margin: 0 5%;
  overflow-y: auto;
  max-height: calc(100% - 60px);
  position: relative;
}

.PageTitle {
  font-size: 28px;
  text-align: left;
  margin: 10px 0;
  font-weight: bold;
}

.DeveloperEntrance {
  margin-top: 2%;
  border-radius: 10px;
  position: relative;
  background: url('/images/crypto/developer-bg.jpg');
  background-size: cover;
  height: 400px;
  opacity: 0.9;
}

.developer-title {
  position: absolute;
  left: 50%;
  top: 5%;
  transform: translateX(-50%);
  font: bold 2.5rem/1.5 'Helvetica Neue', sans-serif;
  color: #fff;
}

.developer-description {
  width: 36%;
  position: absolute;
  left: 75%;
  top: 40%;
  transform: translateX(-50%);
  font: 1.5rem/1.5 'Helvetica Neue', sans-serif;
  color: #fff;
}

.developer-button {
  position: absolute;
  left: 50%;
  top: 80%;
  transform: translateX(-50%);
  font-size: 20px;
  color: #000;
  background-color: transparent !important;
}

.buttons-container {
  position: absolute;
  display: flex;
  justify-content: space-between;
  width: 100%;
  bottom: 10%;
}

.developer-button-left,
.developer-button-right {
  font-size: 20px;
  color: #000;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 15%;
}

a {
  text-decoration: none;
  color: #000;
  font-size: 20px;
}

.bg-img {
  max-width: 100%;
  height: auto;
}

::-webkit-scrollbar {
  display: none;
}

.document-button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 2px solid blue;
  padding: 10px 20px;
  cursor: pointer;
  border-radius: 5px;
  transition: background-color 0.3s;
}

.document-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
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
  color: black;
  font-weight: bold;
}

.right-icon {
  margin-left: auto;
}
</style>
