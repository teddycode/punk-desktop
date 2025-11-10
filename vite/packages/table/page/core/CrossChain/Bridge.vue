<template>  
  
  <a-layout style="background-color: #f5f5f5">
    <a-card>
      跨链桥 {{ data_from_route.symbol }}
    </a-card>
    <!-- Tab 切换选项卡 -->  
     <a-tabs v-model:activeKey="activeTable" type="card" @change="handleTabChange">  
      <a-tab-pane key="overview" tab="概览" />  
      <a-tab-pane key="transactions" tab="业务交易" />  
      <a-tab-pane key="internal-tx" tab="影子区块" />  
      <a-tab-pane key="token-tx" tab="传输任务" />  
      <a-tab-pane key="nft-tx" tab="搬运工" />  
      <a-tab-pane key="unstake" tab="控制交易" />  
    </a-tabs>
    <!-- 概览信息 -->  
    <a-card class="info-card" v-if="activeTable === 'overview'">  
      <a-row class="info-row" gutter="16">  
        <a-col span="8">编号:</a-col>  
        <a-col span="16">{{ data_from_route.chain_id }}</a-col>  
      </a-row>
      <a-row class="info-row" gutter="16">  
        <a-col span="8">名称:</a-col>  
        <a-col span="16">{{ data_from_route.name}}</a-col>  
      </a-row>
      <a-row class="info-row" gutter="16">  
        <a-col span="8">符号:</a-col>  
        <a-col span="16">{{ data_from_route.symbol}}</a-col>  
      </a-row>
      <a-row class="info-row" gutter="16">  
        <a-col span="8">跨链桥状态:</a-col>  
        <a-col span="16">{{ data_from_rpc.state }}</a-col>  
      </a-row>   
      <a-row class="info-row" gutter="16">  
        <a-col span="8">中继合约地址:</a-col>  
        <a-col span="16">{{ data_from_rpc.relay_addr}}</a-col>  
      </a-row>  
      <a-row class="info-row" gutter="16">  
        <a-col span="8">传输合约地址:</a-col>  
        <a-col span="16">{{ data_from_rpc.transport_addr}}</a-col>  
      </a-row>
      <a-row class="info-row" gutter="16">  
        <a-col span="8">注册高度:</a-col>  
        <a-col span="16">{{ }}</a-col>  
      </a-row>
      <a-row class="info-row" gutter="16">  
        <a-col span="8">注册交易:</a-col>  
        <a-col span="16">{{ }}</a-col>  
      </a-row>      
    </a-card>
    
    <!-- 详情模态框 -->  
     
    <a-table  
      v-if="activeTable === 'transactions'"  
      :columns="tx_columns"  
      :data-source="txList"
      :loading="loading"  
      class="custom-table"  
    >  
    </a-table>  
    <!-- 系统合约表格 -->  
     
  </a-layout>
     
</template>  
  
<script lang="ts" setup>  
import { ref, onMounted, computed} from 'vue'  
import { useRoute, useRouter } from 'vue-router'  
import { message } from 'ant-design-vue'  
import { formatEther } from 'ethers'  
import axios from "axios";
import AddressText from '../commponents/AddressText.vue'
import { ethers } from "ethers";
import { h } from 'vue'
import { Tooltip } from 'ant-design-vue';
import type { TxOverview } from '../utils/type'
   


const loading = ref(false);
const activeTable = ref('overview'); // 默认显示源链信息表
let provider: ethers.JsonRpcProvider;
const route = useRoute()
const router = useRouter() 
const routerState = history.state     
// 路由数据  
const data_from_route = ref({  
  chain_id: Number(route.params.chain_id),  
  rpc: route.query.rpc || routerState.rpc,  
  symbol: route.query.symbol || routerState.symbol,  
  name: route.query.name || routerState.name,  
  multi_addr: route.query.multi_addr || routerState.multi_addr,  
  addr: route.query.addr || routerState.addr,  
}) 
const data_from_rpc = ref({
  state: 0,
  relay_addr: '0x',
  transport_addr: '0x'
})
const txList = ref<TxOverview[]>()
const tx_columns = [
  {
    title: '编号',
    dataIndex: 'no',
  },
  {
    title: '交易哈希',
    dataIndex: 'tx_hash',
    key: 'tx_hash',
    customRender: ({ text }: { text: string }) => {    
      return shortenHashWithTooltipAndClick(text,'tx')
    },  
  },
  {
    title: '区块哈希',
    dataIndex: 'block_hash',
    customRender: ({ text }: { text: string }) => {  
      return shortenHashWithTooltipAndClick(text,'block') 
    },
  },
  {
    title: '区块内索引',
    dataIndex: 'tx_index',
  },
];
const contract_columns = [
  {
    title: '序号',
    dataIndex: 'contract_id',
    key: 'contractID',
  },
  {
    title: '合约地址',
    dataIndex: 'contract_addr',
  },
  {
    title: '管理者地址',
    dataIndex: 'manager_addr',
  },
  {
    title: '合约状态',
    dataIndex: 'contract_state',
  },
  {  
    title: '所属链',  // 修改列标题  
    dataIndex: 'chainInfo',  // 使用新的dataIndex   
  }, 
  {  
    title: '合约类型',  // 修改列标题  
    dataIndex: 'contractType',  // 使用新的dataIndex    
  }
];

const handleTabChange = (activeKey: string) => {  
  if (activeKey === 'transactions') {  
    fetchBridgeTxInfo(); // 请求交易记录 
  }  
}; 



const formatHash = (hash: string) => {
  return hash && hash.length > 15 ? `${hash.substring(0, 12)}...` : hash;
};

const shortenHashWithTooltipAndClick = (hash: string, dataIndex: string) => {  
  const shortened = `${hash.slice(0, 6)}...${hash.slice(-4)}`; // 取前6个字符和后4个字符  
  return h(  
    Tooltip,  
    {  
      title: hash,  
      placement: 'top'  // 添加提示框位置  
    },  
    () => h(
      'span',
      { 
        class: 'hash-text',
        onClick:() => {
          if (dataIndex == 'tx'){
            let path = `/multi/tx/${hash}`
            console.log(path)
            handleTxClick(hash)
          }
          else if (dataIndex == 'block'){
            handleBlockClick(hash)
          }
        }
      }, 
      shortened 
    ),  
  );  
};   

const handleTxClick = (tx_hash: string) => {  
  router.push({  
    path: `/multi/tx/${tx_hash}`,  
    state: {  
      multi_addr: data_from_route.value.multi_addr,  
      rpc: data_from_route.value.rpc,    
    }  
  })  
}
const handleBlockClick = (block_hash: string) => {  
  router.push({  
    path: `/multi/block/${block_hash}`,  
    state: {  
      multi_addr: data_from_route.value.multi_addr,  
      rpc: data_from_route.value.rpc,    
    }  
  })  
}   
const fetchBridgeTxInfo = async() => {
  try {  
    loading.value = true;
    const response = await axios.get('http://localhost:3020/api/bridgeTxs')  
    txList.value = response.data
    //console.log(txList)  
  } catch (err) {  
    console.error('获取跨链区信息失败:', err)  
    message.error('获取跨链区信息失败')  
  } finally {  
    loading.value = false;  
  }  
};
const fetchDataFromDB = async() => {
  await fetchBridgeTxInfo()
};
const fetchDataFromRPC = async() => {
  //await fetchDataFromDB();
  provider = new ethers.JsonRpcProvider(data_from_route.value['rpc']);
  let multiABI =[
    "function getSourceChainNum() view returns (uint256)",
    "function getSystemContractNum() view returns (uint256)",
    "function getSystemContractAddressByLevelID(uint256, uint256)view returns (address)",
    "function getSystemContractAddressByLevelID(uint256, uint256)view returns (address)",
    "function getSourceChainInfo(uint256) view returns (string, string, uint256, uint256, address[])"
  ];
  const multiContract = new ethers.Contract(data_from_route.value['multi_addr'], multiABI, provider);
  let res = await multiContract.getSourceChainInfo(data_from_route.value.chain_id);
  console.log(res)
  data_from_rpc.value = {
    'state': res[2],
    'relay_addr': res[4][0],
    'transport_addr': res[4][0],
  }
}
const fetchData = () => {
  console.log("This is page for bridge!")
  fetchDataFromRPC()
  //fetchDataFromDB()
}  
onMounted(fetchData)

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