<template>
  <a-card :bordered="true" style="margin-top: 10px">
    <a-row>
      <a-col :sm="8" :xs="24">
        <info title="代币种类" :value="countStatus.types + ' 种'" :bordered="true" />
      </a-col>
      <a-col :sm="8" :xs="24">
        <info title="账户总数" :value="countStatus.accounts + ' 个'" :bordered="true" />
      </a-col>
      <a-col :sm="8" :xs="24">
        <info title="价值估计" :value="countStatus.values + ' USDT'" :bordered="true" />
      </a-col>
    </a-row>
  </a-card>
  <div style="margin-top: 10px; margin-bottom: 20px">
    <a-card style="margin-top: 24px" :bordered="true" title="账户列表">
      <template #extra>
        <a-radio-group v-model="status">
          <a-radio-button value="all">展开所有</a-radio-button>
          <a-radio-button value="processing">隐藏小额</a-radio-button>
          <a-radio-button value="waiting">自动分类</a-radio-button>
        </a-radio-group>
        <a-input-search style="margin-left: 16px; width: 272px" />
        <a-button type="dashed" @click="onAdd">
          <template #icon> </template>
          <PlusOutlined />添加</a-button
        >
      </template>
      <a-table bordered :columns="columns" :data-source="tableData" :pagination="pageConfig" row-key="id">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'address'">
            <a-tooltip>
              <template #title>点击查看交易记录</template>
              <WalletTwoTone style="padding-right: 5px" />
              <router-link :to="{ name: 'myTransList', query: { address: record?.address } }">
                {{ record.address }}
              </router-link>
            </a-tooltip>
          </template>
          <template v-else-if="column.key === 'symbol'">
            <a-tooltip>
              <template #title>{{ record.symbol.toUpperCase() }}</template>
              <a-avatar :src="getCoinIcon(record.symbol)" alt="未知" style="padding-right: 5px" />
              {{ record.symbol.toUpperCase() }}
            </a-tooltip>
          </template>
          <template v-else-if="column.key === 'type'">
            <div v-if="record.type === 'address'">
              <a-tag color="yellow"> 外部账户 </a-tag>
            </div>
            <div v-else-if="record.type === 'contract'">
              <a-tag color="green"> 合约账户 </a-tag>
            </div>
            <div v-else>
              <a-tag color="red"> 其他账户 </a-tag>
            </div>
          </template>
          <template v-else-if="column.key === 'status'">
            <div v-if="renderStatus(record)">
              <a-badge color="red" text="活跃"></a-badge>
            </div>
            <div v-else>
              <a-badge color="gray" text="非活跃"></a-badge>
            </div>
          </template>
          <template v-else-if="column.key === 'action'">
            <EditOutlined /> <a key="list-edit" @click="onEdit(record)">编辑</a>
            <a-divider type="vertical" />
            <a-popconfirm
              title="停用后，将无法通过该账户登录！"
              ok-text="确认"
              cancel-text="取消"
              @confirm="onDisable"
              @cancel=""
            >
              <DeleteOutlined /> <a href="#">停用</a>
            </a-popconfirm>
          </template>
        </template>
      </a-table>
    </a-card>
    <Modal v-show="modalVisible" v-model:visible="modalVisible" :blurFlag="true" style="z-index: 5000">
      <div class="flex flex-col items-center myinfo-container justify-between w-full p-6">
        <vue-custom-scrollbar class="w-full" style="width: 300px">
          <div class="flex justify-between items-center w-full h-12 mb-3">
            <div class="flex items-center update-title justify-center" style="width: 100%">
              {{ isEdit ? '编辑账户' : '新建账户' }}
            </div>
            <div
              class="w-12 h-12 flex items-center com-button pointer justify-center rounded-lg"
              style="background: var(--secondary-bg)"
              @click="closeModal"
            >
              <Icon icon="guanbi" style="font-size: 1.45em"></Icon>
            </div>
          </div>
          <div class="flex flex-col">
            <span class="update-title mb-3">账户名</span>
            <div
              class="flex items-center rounded-xl justify-center h-10 px-3 mb-3"
              style="border: 1px solid var(--divider); background: var(--secondary-bg)"
            >
              <a-input
                v-model:value="account.name"
                :bordered="false"
                placeholder="账户别名"
                style="padding: 0; width: 100%"
              ></a-input>
            </div>
          </div>
          <div class="flex flex-col">
            <span class="update-title mb-3">代币类型</span>
            <div
              class="flex items-center rounded-xl justify-center h-10 px-3 mb-3"
              style="border: 1px solid var(--divider); background: var(--secondary-bg)"
            >
              <a-select style="width: 100%" v-model:value="account.symbol" placeholder="选择代币类型">
                <a-select-option v-for="item in getCoinTypeList()" :value="item.id" :key="item.id">
                  <a-avatar size="8" :src="getCoinIcon(item?.name)" style="margin-right: 5px" /> {{ item.name }}
                </a-select-option>
              </a-select>
            </div>
          </div>
          <div class="flex flex-col">
            <span class="update-title mb-3">账户类型</span>
            <div
              class="flex items-center rounded-xl justify-center h-10 px-3 mb-3"
              style="border: 1px solid var(--divider); background: var(--secondary-bg)"
            >
              <a-select style="width: 100%" v-model:value="account.type" placeholder="选择账户类型">
                <a-select-option value="address"> 地址账户</a-select-option>
                <a-select-option value="contract"> 合约账户</a-select-option>
              </a-select>
            </div>
          </div>
          <!-- 新增状态下徐亚验证钱包 -->
          <template v-if="!isEdit">
            <span class="update-title mb-3">签名随机数</span>
            <p>
              <a-input ref="walletSecret" disabled v-model:value="walletAdd.secret"></a-input>
            </p>
            <span class="update-title mb-3">签名信息</span>
            <p>
              <a-textarea ref="walletSignature" disabled v-model:value="walletAdd.sign"></a-textarea>
            </p>
            <div class="flex w-full items-center justify-center mt-6">
              <a-button @click="bindWallet"> 点击获取绑定的钱包信息 </a-button>
            </div>
          </template>
          <div class="flex w-full items-center justify-center mt-6">
            <a-button
              class="h-48 rounded-xl mr-3"
              style="width: 120px; color: var(--primary-text); border: none; background: var(--secondary-bg)"
              type="primary"
              @click="closeModal"
            >
              取消
            </a-button>
            <a-button
              class="h-48 rounded-xl"
              style="width: 120px; color: var(--active-text)"
              type="primary"
              @click="doModalConfirm"
            >
              确定
            </a-button>
          </div>
        </vue-custom-scrollbar>
      </div>
    </Modal>
  </div>
</template>

<!--
元素： 钱包地址、余额、交易记录
功能： 1.当前活跃钱包切换，2.总资产，钱包信息增删改查
账户与网络是多对多的关系
-->

<script lang="ts">
import { defineComponent, ref } from 'vue';
import info from './components/Info.vue';
import LayoutFooter from '@page/core/Layouts/components/layout-footer.vue';
import {
  BarsOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  WalletTwoTone,
  DeleteOutlined,
} from '@ant-design/icons-vue';
import { useWeb3ModalAccount } from '@web3modal/ethers5/vue';
import datas from './data';
import { GetForWalletStatus, PostWalletPageList, PutForWalletInfo } from '@js/service/wallets';
import { appStore } from '@store';
import { PageParams } from '@js/service/typing';
import { message } from 'ant-design-vue';
import UploadImage from '@components/UploadImage.vue';
import Modal from '@components/Modal.vue';
import { createWeb3Modal } from '@web3modal/ethers5/vue';
import { walletConfig } from '@store/wallet.ts';

export default defineComponent({
  name: 'WalletsPage',
  components: {
    Modal,
    UploadImage,
    LayoutFooter,
    info,
    PlusOutlined,
    EditOutlined,
    EyeOutlined,
    BarsOutlined,
    DeleteOutlined,
    WalletTwoTone,
  },
  setup() {
    // 列表元素： 账户别名。网络名称、钱包地址、币种符号、资产数额、钱包状态、操作【删除、编辑、交易记录、】
    const columns = datas.walletColumn;
    // 样例数据
    let tableData = ref([]);

    const currentAccount = '';

    let account = ref({
      name: '',
      symbol: 'ETH',
      type: 'address',
    });
    // 统计数据
    let countStatus = ref({
      types: 0,
      accounts: 0,
      values: 0.0,
    });

    let pageConfig = ref({
      current: 1,
      pageSize: 10,
      total: 0,
    });

    let walletAdd = ref({
      secret: '',
      sign: '',
    });

    let currentRow = null;

    const userInfo = appStore().userInfo;

    let isEdit = ref(false);
    let modalVisible = ref(false);

    function onAdd() {
      isEdit.value = false;
      modalVisible.value = true;
    }

    function onEdit(record) {
      currentRow = record;
      account.value.name = record.name;
      account.value.type = record.type;
      isEdit.value = true;
      modalVisible.value = true;
    }

    function onDisable() {
      console.log('即将停用账户');
    }
    // 获取代币图标
    function getCoinIcon(name) {
      return '/icons/coins/svg/' + name.toLowerCase() + '.svg';
    }

    function renderStatus(record) {
      if (currentAccount && currentAccount.isConnected && currentAccount.address) {
        let address = currentAccount.address.value;
        if (address?.toLowerCase() === record?.address?.toLowerCase()) {
          return true;
        }
      }
      return false;
    }
    // 关闭对话框
    function closeModal() {
      modalVisible.value = false;
    }
    // 确认
    function doModalConfirm() {
      console.log('Editding');
      if (isEdit.value) {
        if (currentRow) {
          const params = {
            id: currentRow?.id,
            name: account.value?.name,
            coin: account.value?.symbol,
            type: account.value?.type,
          };
          PutForWalletInfo(params).then((resp) => {
            console.log('钱包信息更新结果：', resp);
            if (resp.data === true) {
              message.info('钱包信息更新成功！');
              fetchTableData();
              modalVisible.value = false;
            } else {
              message.warning('钱包信息更新失败！');
            }
          });
        }
      } else {
      }
    }
    // 获取类型
    function getCoinTypeList() {
      //   TODO 遍历文件夹下的图标文件
      return [
        {
          id: 1,
          name: 'ETH',
        },
        {
          id: 2,
          name: 'BTC',
        },
      ];
    }
    // 获取后端数据
    async function fetchStatusData() {
      const userId = parseInt(userInfo.uid);
      GetForWalletStatus(userId).then((data) => {
        console.log('钱包统计数据：', data);
        countStatus.value.types = data?.data.types;
        countStatus.value.accounts = data?.data.accounts;
        countStatus.value.values = data?.data.values;
      });
    }
    //   获取表格数据
    async function fetchTableData() {
      const param: PageParams = {
        ...pageConfig.value,
        userId: parseInt(userInfo.uid),
      };
      PostWalletPageList(param).then((resp) => {
        console.log('钱包分页数据：', resp);
        tableData.value = resp?.data?.records;
        pageConfig.value.current = resp?.data?.pageNumber;
      });
    }
    // 绑定钱包的信息
    async function bindWallet() {
      tsbApi.user.walletAuth((data) => {
        console.log('绑定钱包返回数据了：', data);
        const parts = data?.data.split('#=#');
        if (parts.length != 2) {
          message.error('返回消息格式不正确：', data);
          return;
        }
        walletAdd.value.secret = parts[0];
        walletAdd.value.sign = parts[1];
      });
    }

    return {
      account,
      currentAccount,
      userInfo,
      columns,
      isEdit,
      modalVisible,
      doModalConfirm,
      closeModal,
      currentRow,
      getCoinTypeList,
      tableData,
      pageConfig,
      countStatus,
      onAdd,
      walletAdd,
      bindWallet,
      onEdit,
      onDisable,
      renderStatus,
      getCoinIcon,
      fetchStatusData,
      fetchTableData,
    };
  },
  mounted() {
    try {
      currentAccount = useWeb3ModalAccount();
    } catch (e) {
      console.warn(e);
    }
    this.fetchStatusData();
    this.fetchTableData();
  },
});
</script>

<style lang="less" scoped>
.collections-page {
  /*min-height: 100%;*/
  width: 90%;
  margin: 0 auto;
}

.title-section h1 {
  text-align: center;
  margin-bottom: 60px;
}

.table-section {
  padding: 0 5%;
}

.collections-table tr:hover {
  background-color: #eaf4ff;
  box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.1);
  cursor: pointer;
}
.ant-avatar-lg {
  width: 48px;
  height: 48px;
  line-height: 48px;
}

.list-content-item {
  color: rgba(0, 0, 0, 0.45);
  display: inline-block;
  vertical-align: middle;
  font-size: 14px;
  margin-left: 40px;
  span {
    line-height: 20px;
  }
  p {
    margin-top: 4px;
    margin-bottom: 0;
    line-height: 22px;
  }
}
</style>
