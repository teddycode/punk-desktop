<template>  
  
  <a-layout style="background-color: #f5f5f5">
    <a-card>
      中继链交易 {{ data_from_route.tx_hash }}
    </a-card>
    <!-- Tab 切换选项卡 -->  
     <a-tabs v-model:activeKey="activeTable" type="card" @change="handleTabChange">  
      <a-tab-pane key="overview" tab="概览" />  
      <a-tab-pane key="events" tab="交易事件" />  
    </a-tabs>
    
    <a-card class="info-card" v-if="activeTable === 'overview'">  
      <!-- 交易哈希 -->  
      <a-row class="info-row" gutter="16">  
        <a-col span="8">交易哈希:</a-col>  
        <a-col span="16">{{ data_from_route.tx_hash }}</a-col>  
      </a-row>
      
      <a-row class="info-row" gutter="16">  
        <a-col span="8">交易类型:</a-col>  
        <a-col span="16">  
          {{ receipt_info.contractAddress !== '0x' ? '合约部署交易' : '普通交易' }}  
        </a-col>  
      </a-row>
      
      <!-- 区块高度 -->  
      <a-row class="info-row" gutter="16">  
        <a-col span="8">区块高度:</a-col>  
        <a-col span="16">{{ tx_info.blockNumber }}</a-col>  
      </a-row>
      
      <!-- 区块哈希 -->  
      <a-row class="info-row" gutter="16">  
        <a-col span="8">区块哈希:</a-col>  
        <a-col span="16" @click="goToBlock(router,tx_info.blockHash,data_from_route.multi_addr,data_from_route.multi_addr)">
          {{ tx_info.blockHash }}
        </a-col>  
      </a-row>
      
        
      <a-row class="info-row" gutter="16">  
        <a-col span="8">交易索引:</a-col>  
        <a-col span="16">{{ receipt_info.index }}</a-col>  
      </a-row>

      <!-- 区块哈希 -->  
      <a-row class="info-row" gutter="16">  
        <a-col span="8">交易状态:</a-col>  
        <a-col span="16">{{ receipt_info.status }}</a-col>  
      </a-row>
      
      <!-- 发送方地址 -->  
      <a-row class="info-row" gutter="16">  
        <a-col span="8">发送方地址:</a-col>  
        <a-col span="16">{{ tx_info.from }}</a-col>  
      </a-row>  
      
      <a-row class="info-row" gutter="16" v-if="receipt_info.contractAddress === '0x'">  
        <a-col span="8">接收方地址:</a-col>  
        <a-col span="16">
          {{ tx_info.to }}  
        </a-col>  
      </a-row>  

      <a-row class="info-row" gutter="16" v-else>  
        <a-col span="8">合约部署地址:</a-col>  
        <a-col span="16"> 
          {{ receipt_info.contractAddress }}  
        </a-col>  
      </a-row> 
       
      
      <!-- 交易数额 -->  
      <a-row class="info-row" gutter="16">  
        <a-col span="8">value:</a-col>  
        <a-col span="16">{{ tx_info.value }}</a-col>  
      </a-row>

      <!-- 交易数额 -->  
      <a-row class="info-row" gutter="16">  
        <a-col span="8">data:</a-col>  
        <a-col span="16">
          <a-tooltip :title="tx_info.data">  
              {{ shortenHash(tx_info.data) }}  
          </a-tooltip>
        </a-col>  
      </a-row>
      

      <a-row class="info-row" gutter="16">  
        <a-col span="8">gas消耗:</a-col>  
        <a-col span="16">{{ receipt_info.gasUsed }}</a-col>  
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
import AddressText from './commponents/AddressText.vue'
import { ethers } from "ethers";
import { h } from 'vue'
import { Tooltip } from 'ant-design-vue';   
import { goToBlock } from './utils/useNavigation';  
import { shortenHash } from './utils/shortenData';
import type { TxOverview } from './utils/type'  


const loading = ref(false);
const activeTable = ref('overview'); // 默认显示源链信息表
let provider: ethers.JsonRpcProvider;
const route = useRoute()
const router = useRouter() 
const routerState = history.state     
// 路由数据  
const data_from_route = ref({  
  tx_hash: String(route.params.tx_hash),  
  rpc: route.query.rpc || routerState.rpc,   
  multi_addr: route.query.multi_addr || routerState.multi_addr,  
}) 
const tx_info = ref({ 
  blockNumber: 0,  
  from: "",  
  to: "",  
  value: BigInt(0),
  data: "",
  index: 0,
  blockHash: '0x' 
});
const receipt_info = ref({
  contractAddress: '0x',
  index: 0,
  gasUsed: BigInt(0),
  confirmations: 0,
  status: 0,
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
const fetchTxFromRPC = async() => {
  provider = new ethers.JsonRpcProvider(data_from_route.value['rpc']);
  const transaction = await provider.getTransaction(data_from_route.value.tx_hash)
  const receipt = await provider.getTransactionReceipt(data_from_route.value.tx_hash)
  if (transaction && receipt){
    tx_info.value = {
      blockNumber: transaction.blockNumber!,
      blockHash: transaction.blockHash!,
      index: transaction.index,
      from: transaction.from,
      to: transaction.to ?? '0x',
      value: transaction.value,
      data: transaction.data,
    }
    receipt_info.value = {
      contractAddress: receipt.contractAddress ?? '0x',
      index: receipt.index,
      gasUsed: receipt.gasUsed,
      confirmations: Number(receipt.confirmations),
      status: receipt.status ?? -1,
    }
  }
  
  
  console.log(tx_info.value)
}
const fetchData = () => {
  console.log("This is page for tx!")
  fetchTxFromRPC()
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