<template>
  <div class="network-page">
    <a-layout class="page-layout">
        <a-layout-sider class="left-menu">
          <div class="logo-label">DVPN</div>
          <div class="menu">
            <a-menu :open-keys="openKeys" :selected-keys="selectedKeys" mode="inline" theme="dark"
              @openChange="onOpenChange" @update:selectedKeys="onSelectChange">
              <a-sub-menu key="sub1">
                <template #icon>
                  <UserOutlined />
                </template>
                <template #title>VPN USER</template>
                <a-menu-item key="vpn">
                  <router-link to="/core/network/vpn">VPN</router-link>
                </a-menu-item>
                <a-menu-item key="account">
                  <router-link to="/core/network/account">Account</router-link>
                </a-menu-item>
              </a-sub-menu>
              <a-sub-menu key="sub2">
                <template #icon>
                  <CloudServerOutlined />
                </template>
                <template #title>NODE PROVIDER</template>
                <a-menu-item key="management">
                  <router-link to="/core/network/management">Management</router-link>
                </a-menu-item>
              </a-sub-menu>
              <a-sub-menu key="sub3">
                <template #icon>
                  <MoneyCollectOutlined />
                </template>
                <template #title>INVESTOR</template>
                <a-menu-item key="node">
                  <router-link to="/core/network/node">Node</router-link>
                </a-menu-item>
                <a-menu-item key="stake">
                  <router-link to="/core/network/stake">Stake</router-link>
                </a-menu-item>
              </a-sub-menu>
            </a-menu>
          </div>
        </a-layout-sider>
      <div class="main-wrapper">
        <a-layout class="main-layout">
          <a-layout-header class="header-layout">
              <div>Welcome to DVPN</div>
              <a-button type="primary" @click="connectWallet">Connect Wallet</a-button>
          </a-layout-header>
          <a-layout-content>
            <div class="main-view">
              <router-view />
            </div>
          </a-layout-content>
        </a-layout>
      </div>
    </a-layout>
  </div>
</template>


<script setup>
import { ref } from 'vue'
import { UserOutlined, CloudServerOutlined, MoneyCollectOutlined } from '@ant-design/icons-vue'

const rootSubmenuKeys = ['sub1', 'sub2', 'sub3']
const openKeys = ref(['sub1'])
const selectedKeys = ref(['vpn'])

const onOpenChange = (keys) => {
  const latestOpenKey = keys.find(key => openKeys.value.indexOf(key) === -1);
  if (rootSubmenuKeys.indexOf(latestOpenKey) === -1) {
    openKeys.value = keys;
  } else {
    openKeys.value = latestOpenKey ? [latestOpenKey] : [];
  }
}

const onSelectChange = (keys) => {
  selectedKeys.value = keys
}
</script>

<style scoped>
.network-page {
  width: 100%;
  height: 90%;
  border: 0.5px solid #FFF;
  border-radius: 15px;
  display: flex;
  padding: 15px;
}

.page-layout {
  background-color: #001529;
}

.left-menu {
  width: 256px;
  height: 100%;
  border: 0.5px solid #FFF;
  border-radius: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #001529;
}

.logo-label {
  color: #fff;
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  margin: 20px 0;
}

.menu {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.main-wrapper {
  width: 100%;
  height: 100%;
  background-color: #001529;
  margin-left: 20px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .1);
  border-radius: 15px;
  border: 0.5px solid #FFF;
}

.main-layout {
  background-color: #001529;
  border-radius: 15px;
}

.header-layout {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background-color: #001529;
  color: #fff;
  border-radius: 15px;
  border: 0.5px solid #FFF;
}

.main-view {
  width: 100%;
  height: 100%;
  margin-top: 20px;
  background-color: #001529;
  border-radius: 15px;
  border: 0.5px solid #FFF;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .1);
}
</style>
