<template>
  <a-layout class="Explorer">
    <a-layout-header class="header-box">
      <!-- 导航栏部分，保持不变 -->
      <a-row class="navigation">
        <a-col :span="4">logo</a-col>
        <a-col :span="2">
          <a-button type="text" style="font-size: large" @click="goToHome">主页</a-button>
        </a-col>
        <a-col :span="2">
          <!-- 区块链下拉列表 -->
          <a-dropdown>
            <a class="ant-dropdown-link">
              区块链
              <DownOutlined />
            </a>
            <template #overlay>
              <a-menu arrow="true">
                <a-menu-item key="0">
                  <router-link to="../TransactionList">交易列表</router-link>
                </a-menu-item>
                <a-menu-item key="1">
                  <router-link to="../BlockList">区块列表</router-link>
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </a-col>
        <a-col :span="2">
          <a-button type="text" style="font-size: large">代币</a-button>
        </a-col>
        <a-col :span="2">
          <a-button type="text" style="font-size: large">更多</a-button>
        </a-col>
        <a-col :span="8">
          <a-input-group>
            <a-input-search
              v-model:value="value"
              style="width: 90%; padding: 16px"
              placeholder="Search by Address / Txn Hash / Block / Token / Domain Name"
              @search="onSearch"
            />
          </a-input-group>
        </a-col>
        <a-col :span="4" class="language-dropdown">
          <!-- 语言选择下拉列表 -->
          <a-radio-group v-model:value="LanguageChoice">
            <a-radio-button value="Chinese">中文</a-radio-button>
            <a-radio-button value="English">English</a-radio-button>
          </a-radio-group>
        </a-col>
      </a-row>
      <a-divider />
    </a-layout-header>
    <a-layout-content class="content-box middle-box">
      <a-row>
        <h1 v-if="transactionInfo">
          <span class="block-title">交易详情</span>
        </h1>
        <h1 v-else>交易信息加载中...</h1>
      </a-row>
      <a-list v-if="transactionInfo">
        <a-row>
          <a-list-item>
            <Tooltip title="交易的唯一标识符">
              <QuestionCircleOutlined style="margin-right: 8px" />
            </Tooltip>
            <strong>交易哈希:</strong> {{ transactionInfo.txnHash }}
          </a-list-item>
        </a-row>
        <a-row>
          <a-list-item>
            <ThunderboltOutlined style="margin-right: 8px"></ThunderboltOutlined><strong>交易行为:</strong> 从
            {{ transactionInfo.from }} 转账 {{ transactionInfo.value }} 到 {{ transactionInfo.to }}
          </a-list-item>
        </a-row>
        <a-row>
          <a-list-item>
            <Tooltip title="包含此交易的区块">
              <QuestionCircleOutlined style="margin-right: 8px" />
            </Tooltip>
            <strong>区块:</strong> {{ transactionInfo.block }}
          </a-list-item>
        </a-row>
        <a-row>
          <a-list-item>
            <Tooltip title="交易创建时间">
              <QuestionCircleOutlined style="margin-right: 8px" />
            </Tooltip>
            <strong>时间:</strong> {{ transactionInfo.age }}
          </a-list-item>
        </a-row>
        <a-row>
          <a-list-item>
            <Tooltip title="交易发送方地址">
              <QuestionCircleOutlined style="margin-right: 8px" />
            </Tooltip>
            <strong>从:</strong> {{ transactionInfo.from }}
            <CopyOutlined @click="copyToClipboard(transactionInfo.from)" />
          </a-list-item>
        </a-row>
        <a-row>
          <a-list-item>
            <Tooltip title="交易接收方地址">
              <QuestionCircleOutlined style="margin-right: 8px" />
            </Tooltip>
            <strong>至:</strong> {{ transactionInfo.to }}
            <CopyOutlined @click="copyToClipboard(transactionInfo.to)" />
          </a-list-item>
        </a-row>
        <a-row>
          <a-list-item>
            <Tooltip title="交易金额">
              <QuestionCircleOutlined style="margin-right: 8px" />
            </Tooltip>
            <strong>金额:</strong> {{ transactionInfo.value }}
          </a-list-item>
        </a-row>
        <a-row>
          <a-list-item>
            <Tooltip title="交易费用">
              <QuestionCircleOutlined style="margin-right: 8px" />
            </Tooltip>
            <strong>交易费用:</strong> {{ transactionInfo.txnFee }}
          </a-list-item>
        </a-row>
      </a-list>
      <div v-else>
        <p>加载中...</p>
      </div>
    </a-layout-content>
  </a-layout>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { transactionsData } from './data/transactions.js';
import { QuestionCircleOutlined, CopyOutlined, ThunderboltOutlined } from '@ant-design/icons-vue';
import { Tooltip, message } from 'ant-design-vue';

const route = useRoute();
const router = useRouter();
const transactionInfo = ref(null);

const loadTransactionByHash = (hash) => {
  const transaction = transactionsData.find((tx) => tx.txnHash === hash);
  if (transaction) {
    transactionInfo.value = transaction;
  } else {
    console.error('Transaction not found');
    transactionInfo.value = null;
  }
};

onMounted(() => {
  const txnHash = route.params.txnHash;
  loadTransactionByHash(txnHash);
});

const goToHome = () => {
  router.push('../index');
};
const copyToClipboard = (text) => {
  if (navigator.clipboard) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        message.success('地址已复制到剪贴板');
      })
      .catch((err) => {
        console.error('复制失败:', err);
        message.error('复制失败');
      });
  } else {
    console.error('浏览器不支持剪贴板操作');
    message.error('浏览器不支持剪贴板操作');
  }
};
</script>

<style scoped>
.Explorer {
  width: 100%;
  margin: 0 auto;
}
.header-box,
.middle-box,
.footer-box {
  margin-left: 5%;
  margin-right: 5%;
  /*border: 1px solid black;*/
  border-radius: 10px;
  text-align: center;
  padding: 10px;
  box-sizing: border-box;
  background-color: transparent;
}
.header-box {
  height: auto; /* 根据内容调整高度 */
}

.middle-box {
  height: auto;
}

.footer-box {
  height: auto;
}
.block-title {
  color: black;
  font-weight: bold;
  font-size: x-large;
}

.block-number {
  color: #131313;
  font-size: medium;
}
.ant-dropdown-link {
  color: black;
}
.navigation {
  font-size: large;
}
</style>
