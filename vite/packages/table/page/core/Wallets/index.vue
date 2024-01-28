<template>
  <a-card :bordered="true" style="margin-top: 10px">
    <a-row>
      <a-col :sm="8" :xs="24">
        <info title="代币种类" value="1种" :bordered="true" />
      </a-col>
      <a-col :sm="8" :xs="24">
        <info title="账户总数" value="4个" :bordered="true" />
      </a-col>
      <a-col :sm="8" :xs="24">
        <info title="价值估计" value="2000.0000元" :bordered="true" />
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
      <a-table bordered :columns="columns" :data-source="data" row-key="id">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'address'">
            <a-tooltip>
              <template #title>点击查看交易记录</template>
              <WalletTwoTone style="padding-right: 5px" />
              <router-link :to="{ name: 'myTransList' }">
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
              <a-tag color="yellow"> 地址账户 </a-tag>
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
              @confirm="onDelete"
              @cancel=""
            >
              <DeleteOutlined /> <a href="#">停用</a>
            </a-popconfirm>
          </template>
        </template>
      </a-table>
    </a-card>
    <a-modal
      centered
      v-model:visible="modalVisible"
      :title="isEdit ? '编辑账户' : '新建账户'"
      ok-text="确定"
      cancel-text="取消"
      width="600px"
      @ok="doModalConfirm"
    >
      <h6>账户名</h6>
      <p>
        <a-input
          ref="accountName"
          @keyup.enter="doModalConfirm"
          v-model:value="account.name"
          placeholder="账户别名"
        ></a-input>
      </p>

      <h6>代币类型</h6>
      <p>
        <a-select style="width: 50%" v-model:value="account.symbol" placeholder="选择代币类型">
          <a-select-option v-for="item in getCoinTypeList()" :value="item.id" :key="item.id">
            <a-avatar size="8" :src="getCoinIcon(item?.name)" style="margin-right: 5px" /> {{ item.name }}
          </a-select-option>
        </a-select>
      </p>
      <h6>账户类型</h6>
      <p>
        <a-select style="width: 50%" v-model:value="account.type" placeholder="选择账户类型">
          <a-select-option value="address"> 地址账户</a-select-option>
          <a-select-option value="contract"> 合约账户</a-select-option>
        </a-select>
      </p>
      <p></p>
    </a-modal>
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
import TaskForm from './components/TaskForm.vue';
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

export default defineComponent({
  name: 'WalletsPage',
  components: {
    LayoutFooter,
    info,
    TaskForm,
    PlusOutlined,
    EditOutlined,
    EyeOutlined,
    BarsOutlined,
    DeleteOutlined,
    WalletTwoTone,
  },
  setup() {
    // 列表元素： 账户别名。网络名称、钱包地址、币种符号、资产数额、钱包状态、操作【删除、编辑、交易记录、】
    const columns = [
      {
        title: '序号',
        dataIndex: 'id',
        key: 'id',
      },
      {
        title: '账户别名',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: '账户地址',
        dataIndex: 'address',
        key: 'address',
      },
      {
        title: '币种符号',
        dataIndex: 'symbol',
        key: 'symbol',
      },
      {
        title: '资产数额',
        key: 'amount',
        dataIndex: 'amount',
      },
      {
        title: '账户类型',
        key: 'type',
        dataIndex: 'type',
      },
      {
        title: '账户状态',
        key: 'status',
        dataIndex: 'status',
      },
      {
        title: '操作',
        key: 'action',
      },
    ];
    // 样例数据
    let data = [
      {
        id: 1,
        name: '工资账户',
        address: '0x1423f4ceC7fCBE8400A957121ad616C439a0d4CF',
        symbol: 'ETH',
        type: 'address',
        amount: '0.038',
        status: 'active',
      },
      {
        id: 2,
        name: '日常消费',
        address: '0x437a5079CE5f89A62bc74e66e5f5a772Eb31CaB9',
        symbol: 'ETH',
        type: 'address',
        amount: '0.133',
        status: 'inActive',
      },
      {
        id: 3,
        name: '理财账户',
        address: '0x8942E52BE95b4f7e7566A91D77308F415DCf1d5D',
        symbol: 'ETH',
        type: 'contract',
        amount: '1.336648844',
        status: 'inActive',
      },
      {
        id: 4,
        name: '测试账户',
        address: '0x8942E52BE95b4f7e7566A91D77308F415DCf1d5D',
        symbol: 'ETH',
        type: 'contract',
        amount: '1.336648844',
        status: 'inActive',
      },
    ];

    const currentAccount = useWeb3ModalAccount();

    let account = ref({
      name: '',
      symbol: 'ETH',
      type: 'address',
    });
    let isEdit = ref(false);
    let modalVisible = ref(false);
    function onAdd() {
      isEdit.value = false;
      modalVisible.value = true;
    }
    function onEdit(record) {
      account.value.name = record.name;
      account.value.type = record.type;
      isEdit.value = true;
      modalVisible.value = true;
    }
    function onDelete() {
      console.log('即将删除账户');
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
    // 确认
    function doModalConfirm() {
      console.log('Editding');
      if (isEdit) {
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
    return {
      account,
      columns,
      isEdit,
      modalVisible,
      doModalConfirm,
      getCoinTypeList,
      data,
      onAdd,
      onEdit,
      onDelete,
      renderStatus,
      getCoinIcon,
    };
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
