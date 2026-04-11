<template>
    <a-layout style="background-color: #f5f5f5">
      <a-card>
        中继链区块 #{{ block_info.number }}
      </a-card>
      <!-- Tab 切换选项卡 -->
      <a-tabs v-model:activeKey="activeTable" type="card" @change="handleTabChange">
        <a-tab-pane key="overview" tab="概览" />
        <a-tab-pane key="transactions" tab="交易列表" />
      </a-tabs>

      <a-card class="info-card" v-if="activeTable === 'overview'">
        <!-- 区块高度 -->
        <a-row class="info-row" gutter="16">
            <a-col span="8">区块高度:</a-col>
            <a-col span="16">
            <a-space>
                <!-- 左箭头（父区块） -->
                <a-button
                v-if="ifHaveParent"
                shape="circle"
                :disabled="!ifHaveParent"
                @click="goToBlock(
                    router,
                    block_info.parentHash,
                    data_from_route.multi_addr,
                    data_from_route.rpc
                    )"
                >
                <template #icon><left-outlined /></template>
                </a-button>

                <span>{{ block_info.number }}</span>

                <!-- 右箭头（子区块） -->
                <a-button
                v-if="ifHaveChild"
                shape="circle"
                :disabled="!ifHaveChild"
                @click="goToBlock(
                    router,
                    block_info.childHash,
                    data_from_route.multi_addr,
                    data_from_route.rpc
                    )"
                >
                <template #icon><right-outlined /></template>
                </a-button>
            </a-space>
            </a-col>
        </a-row>
        <!-- 区块哈希 -->
        <a-row class="info-row" gutter="16">
          <a-col span="8">区块哈希:</a-col>
          <a-col span="16">
            <a-col span="16">{{ block_info.blockHash }}</a-col>
          </a-col>
        </a-row>



        <!-- 区块时间戳 -->
        <a-row class="info-row" gutter="16">
          <a-col span="8">时间戳:</a-col>
          <a-col span="16">{{ formatTimestamp(block_info.timestamp) }}</a-col>
        </a-row>

        <!-- 出块矿工 -->
        <a-row class="info-row" gutter="16">
          <a-col span="8">矿工地址:</a-col>
          <a-col span="16"> {{ block_info.miner }} </a-col>
        </a-row>

        <!-- Gas 信息 -->
        <a-row class="info-row" gutter="16">
          <a-col span="8">Gas 限制:</a-col>
          <a-col span="16">{{ block_info.gasLimit }}</a-col>
        </a-row>
        <a-row class="info-row" gutter="16">
          <a-col span="8">Gas 使用:</a-col>
          <a-col span="16">{{ block_info.gasUsed }}</a-col>
        </a-row>

      </a-card>

      <!-- 交易列表 -->
      <a-table
        v-if="activeTable === 'transactions'"
        :columns="tx_columns"
        :data-source="txList"
        :loading="loading"
        class="custom-table"
      ></a-table>
    </a-layout>
  </template>

  <script lang="ts" setup>
  import { ref, onMounted, computed } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { ethers, NonceManager } from 'ethers';
  import { goToBlock } from './utils/useNavigation';
  import { shortenHash } from './utils/shortenData';
  import { LeftOutlined, RightOutlined } from '@ant-design/icons-vue';
  import axios from 'axios'
  import { message } from 'ant-design-vue'
  import type { TxOverview } from './utils/type'

  const route = useRoute();
  const router = useRouter();
  const loading = ref(false);
  const activeTable = ref('overview'); // 默认显示概览
  let provider: ethers.JsonRpcProvider;


  // 路由数据
  const data_from_route = ref({
    block_hash: String(route.params.block_hash), // 从路由获取区块哈希
    rpc: route.query.rpc || history.state.rpc, // RPC地址
    multi_addr: route.query.multi_addr || history.state.multi_addr,
  });

  const ifHaveParent = ref(false)
  const ifHaveChild = ref(false)

  // 区块信息
  const block_info = ref({
    number: 0,
    blockHash: '0x',
    parentHash: '0x',
    childHash: '0x',
    timestamp: 0,
    miner: '0x',
    gasLimit: BigInt(0),
    gasUsed: BigInt(0),
    stateRoot: '0x',
    txRoot: '0x',
    receiptRoot: '0x'
  });

  // 区块内交易列表
  const txList = ref<TxOverview[]>();
  const tx_columns = [
    {
      title: '序号',
      dataIndex: 'tx_index',
    },
    {
      title: '交易哈希',
      dataIndex: 'tx_hash',
    }
  ];

  // 选项卡切换
  const handleTabChange = (activeKey: string) => {
    if (activeKey === 'transactions') {
      fetchTransactions(); // 请求交易记录
    }
  };

  // 格式化时间戳
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp * 1000); // 时间戳为秒，需要乘 1000 转为毫秒
    return date.toLocaleString();
  };

  // 数据查询：获取区块和区块内交易列表
  const fetchBlockData = async () => {
    const rpcUrl = data_from_route.value.rpc;
    provider = new ethers.JsonRpcProvider(rpcUrl);


    const block = await provider.getBlock(data_from_route.value.block_hash);
    if (!block){
        return null;
        }
    const number = block.number;
    if(number > 0){
        ifHaveParent.value = true
    }
    const child = await provider.getBlock(number + 1);
    let childHash;
    if (child){
        ifHaveChild.value = true
        childHash = child.hash;
    }
    block_info.value = {
        number: block.number,
        blockHash: block.hash ?? '0x',
        parentHash: block.parentHash ?? '0x',
        childHash: childHash ?? '0x',
        timestamp: block.timestamp,
        miner: block.miner,
        gasLimit: block.gasLimit,
        gasUsed: block.gasUsed,
        stateRoot: block.stateRoot ?? '0x',
        txRoot: '0x',
        receiptRoot: block.receiptsRoot ?? '0x',
    };
  };

  const fetchTxInfo = async (block_hash: string) => {
    try {
        const response = await axios.get('http://localhost:3020/api/bridgeTxsInBlock/' + block_hash)
        txList.value = response.data
        console.log(txList.value)
    } catch (err) {
        console.error('获取合约信息失败:', err)
        message.error('获取合约信息失败')
    }
    }
  // 获取区块内交易
  const fetchTransactions = async () => {
    await fetchTxInfo(data_from_route.value.block_hash)
    console.log('交易列表已加载');
  };

  // 页面挂载时加载数据
  onMounted(fetchBlockData);
  </script>

  <style lang="scss" scoped>
  a {
    color: #c1e3ff;
  }

  .hash-text {
    font-family: monospace;
    color: #1890ff;
    cursor: pointer;
  }

  :deep(.ant-tooltip-inner) {
    max-width: 500px; /* 控制 Tooltip 的宽度 */
  }
  </style>
