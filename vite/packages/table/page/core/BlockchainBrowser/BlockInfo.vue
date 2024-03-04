<template>
  <a-layout class="BlockchainBrowser">
    <a-layout-header class="header-box">
      <a-row class="navigation">
        <a-col :span="4">logo</a-col>
        <a-col :span="2">
          <a-button type="text" style="font-size: large" @click="goToHome">主页</a-button>
        </a-col>
        <a-col :span="2">
          <!-- 区块链下拉列表 -->
          <a-dropdown >
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
          <a-input-group >
            <a-input-search
              v-model:value="value"
              style="width: 90%;padding: 16px"
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
      <h1 v-if="blockInfo">
        <span class="block-title">区块</span> <span class="block-number">#{{ blockInfo.number }}</span>
      </h1>

      <h1 v-else>区块信息加载中...</h1>
      </a-row>
        <a-tabs v-model:activeKey="activeKey">
          <a-tab-pane key="1" tab="信息总览">
            <div v-if="blockInfo">
              <!-- 区块信息列表 -->
              <a-list>
                <a-row>
                  <a-list-item>
                    <Tooltip title="当前区块所处区块链的位置" >
                      <QuestionCircleOutlined style="margin-right: 8px"/>
                    </Tooltip>
                  <strong>区块高度:</strong> {{ blockInfo.number }}
                    <a-button size="small" :icon="h(LeftOutlined)" @click="goToNextBlock" />
                    <a-button size="small" :icon="h(RightOutlined)" @click="goToPrevBlock" />
                  </a-list-item>
                </a-row>
                <a-row>
                <a-list-item>
                  <Tooltip title="当前区块的区块头地址">
                    <QuestionCircleOutlined style="margin-right: 8px"/>
                  </Tooltip>
                  <strong>区块地址:</strong> {{blockInfo.hash}}
                </a-list-item>
              </a-row>
                <a-row>
                <a-list-item>
                  <Tooltip title="该区块的当前确认状态">
                    <QuestionCircleOutlined style="margin-right: 8px"/>
                  </Tooltip>
                  <strong>状态:</strong> 已确认
                </a-list-item>
                </a-row>
                <a-row>
                <a-list-item>
                  <Tooltip title="该区块被创建和确认的确切时间">
                    <QuestionCircleOutlined style="margin-right: 8px"/>
                  </Tooltip>
                  <strong>时戳:</strong> 14秒以前 (Jan-31-2024 09:33:47 AM +UTC)
                </a-list-item>
                </a-row>
                <a-divider></a-divider>
                <a-row>
                <a-list-item>
                  <Tooltip title="区块创建者为验证交易和创建新区块而获得的奖励">
                    <QuestionCircleOutlined style="margin-right: 8px"/>
                  </Tooltip>
                  <strong>区块奖励:</strong> 10 ETH
                </a-list-item>
                </a-row>
                <a-row>
                <a-list-item>
                  <Tooltip title="收到区块奖励的账户或地址">
                    <QuestionCircleOutlined style="margin-right: 8px"/>
                  </Tooltip>
                  <strong>奖励接收者:</strong> {{ blockInfo.feeRecipient }}
                  <CopyOutlined @click="copyToClipboard(blockInfo.feeRecipient)"/>
                </a-list-item>
                </a-row>
                <a-row>

                <a-list-item>
                  <Tooltip title="大小指的是区块打包数据的总体积">
                  <QuestionCircleOutlined style="margin-right: 8px"/>
                </Tooltip>
                  <strong>大小:</strong> 256 KB
                </a-list-item>
                </a-row>
                <a-row>
                <a-list-item>
                  <Tooltip title="区块包含的交易总数">
                    <QuestionCircleOutlined style="margin-right: 8px"/>
                  </Tooltip>
                  <strong>交易数量:</strong> {{ blockInfo.transactions }}
                </a-list-item>
                </a-row>
                <a-divider></a-divider>
                <a-row>
                  <a-list-item>
                    <Tooltip title="整个区块包含的Gas费以及所占Gas上限的比例">
                      <QuestionCircleOutlined style="margin-right: 8px"/>
                    </Tooltip>
                    <strong>使用的Gas:</strong> 12,575,256 (41.92%)
                  </a-list-item>
                </a-row>
                <a-row>
                  <a-list-item>
                    <Tooltip title="区块交易Gas费总和上限">
                      <QuestionCircleOutlined style="margin-right: 8px"/>
                    </Tooltip>
                    <strong>Gas上限:</strong> 30,000,000
                  </a-list-item>
                </a-row>
              </a-list>
            </div>
            <div v-else>
              <p>加载中...</p>
            </div>
          </a-tab-pane>
          <a-tab-pane key="2" tab="共识信息">共识相关信息</a-tab-pane>
          <a-tab-pane key="3" tab="更多信息">
            <div v-if="blockInfo">
              <!-- 区块信息列表 -->
              <a-list>
                <a-row>
                  <a-list-item>
                    <Tooltip title="当前区块的前一个区块的区块头哈希值" >
                      <QuestionCircleOutlined style="margin-right: 8px"/>
                    </Tooltip>
                    <strong>父区块地址:</strong> {{ parentBlockHash }}
                  </a-list-item>
                </a-row>
                <a-row>
                  <a-list-item>
                    <Tooltip title="挖矿难度相关值" >
                      <QuestionCircleOutlined style="margin-right: 8px"/>
                    </Tooltip>
                    <strong>Nonce:</strong> 0x0000000000000000
                  </a-list-item>
                </a-row>
                <!-- ... 更多信息 -->
              </a-list>
            </div>
            <div v-else>
              <p>加载中...</p>
            </div>
          </a-tab-pane>
        </a-tabs>
    </a-layout-content>
  </a-layout>
</template>

<script lang="ts" setup>
import {onMounted, ref, watch, h, computed} from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { mockData } from './data/mock.js';
import {DownOutlined, LeftOutlined, RightOutlined,CopyOutlined,QuestionCircleOutlined} from "@ant-design/icons-vue";
import {message,Tooltip} from "ant-design-vue";

const value = ref<string>('');
const selectedOption = ref<string>('All Filters');
const LanguageChoice = ref<string>('中文');
const onSearch = (searchValue: string) => {
  console.log('use value', searchValue);
  console.log('or use this.value', value.value);
};
const route = useRoute();
const router = useRouter();
const blockInfo = ref(null);
const activeKey = ref('1');  // 默认设置为 '1'，即您的第一个 tab

const loadBlockByNumber = (number) => {
  blockInfo.value = mockData.blocks.find(block => block.number === number);
};

onMounted(() => {
  loadBlockByNumber(parseInt(route.params.number));
});

watch(() => route.params.number, (newNumber) => {
  loadBlockByNumber(parseInt(newNumber));
});
const goToHome = () => {
  router.push('../index');
};
const goToBlock = (offset) => {
  if (blockInfo.value) {
    const currentIndex = mockData.blocks.findIndex(block => block.number === blockInfo.value.number);
    const newIndex = currentIndex + offset;
    if (newIndex >= 0 && newIndex < mockData.blocks.length) {
      router.push({ name: 'BlockInfo', params: { number: mockData.blocks[newIndex].number.toString() }});
      activeKey.value = '1';
    }
  }
};

const goToPrevBlock = () => goToBlock(1);
const goToNextBlock = () => goToBlock(-1);
const copyToClipboard = (text) => {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      message.success('地址已复制到剪贴板');
    }).catch(err => {
      console.error('复制失败:', err);
      message.error('复制失败');
    });
  } else {
    console.error('浏览器不支持剪贴板操作');
    message.error('浏览器不支持剪贴板操作');
  }
};
const parentBlockHash = computed(() => {
  if (blockInfo.value) {
    // 假设第一个区块的 number 是 0
    if (blockInfo.value.number === 0) {
      return "创世区块";
    } else {
      const parentIndex = mockData.blocks.findIndex(block => block.number === blockInfo.value.number - 1);
      return parentIndex >= 0 ? mockData.blocks[parentIndex].hash : "未知";
    }
  }
  return null;
});
</script>



<style scoped>

.BlockchainBrowser {
  width: 100%;
  margin: 0 auto;
}
.header-box, .middle-box, .footer-box {
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
.ant-dropdown-link{
  color: black;
}
.navigation{
  font-size: large;
}
</style>
