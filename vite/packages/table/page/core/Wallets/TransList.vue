<template>
  <a-card :bordered="true" style="margin-top: 10px">
    <a-row>
      <a-col :sm="8" :xs="24">
        <info title="代币种类" value="2种" :bordered="true" />
      </a-col>
      <a-col :sm="8" :xs="24">
        <info title="账户总数" value="3个" :bordered="true" />
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
        <a-button type="dashed" @click="add">
          <template #icon> </template>
          <PlusOutlined />添加</a-button
        >
      </template>
      <a-table :columns="columns" :data-source="tableData">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'name'">
            <a>
              {{ record.name }}
            </a>
          </template>
          <template v-else-if="column.key === 'tags'">
            <span>
              <a-tag
                v-for="tag in record.tags"
                :key="tag"
                :color="tag === 'loser' ? 'volcano' : tag.length > 5 ? 'geekblue' : 'green'"
              >
                {{ tag.toUpperCase() }}
              </a-tag>
            </span>
          </template>
          <template v-else-if="column.key === 'action'">
            <span>
              <a>Invite 一 {{ record.name }}</a>
              <a-divider type="vertical" />
              <a>Delete</a>
              <a-divider type="vertical" />
              <a class="ant-dropdown-link">
                More actions
                <down-outlined />
              </a>
            </span>
          </template>
        </template>
      </a-table>
      <!--      <a-list-->
      <!--        size="default"-->
      <!--        :pagination="{ showSizeChanger: true, showQuickJumper: true, pageSize: 10, total: 50 }"-->
      <!--        :data-source="data"-->
      <!--      >-->
      <!--        <template #renderItem="{ item }">-->
      <!--          <a-list-item>-->
      <!--            <template #actions>-->
      <!--              <div><EditOutlined /> <a key="list-edit">编辑</a></div>-->
      <!--              <div><BarsOutlined /> <a key="list-transaction">交易记录</a></div>-->
      <!--              <a-popconfirm-->
      <!--                title="删除后，将无法通过该账户登录！"-->
      <!--                ok-text="确认"-->
      <!--                cancel-text="取消"-->
      <!--                @confirm="onDeleteAccount"-->
      <!--                @cancel=""-->
      <!--              >-->
      <!--                <DeleteOutlined /> <a href="#">删除</a>-->
      <!--              </a-popconfirm>-->
      <!--            </template>-->
      <!--            <a-skeleton avatar :title="false" :loading="!!item.loading" active>-->
      <!--              <a-list-item-meta-->
      <!--                description="Ant Design, a design language for background applications, is refined by Ant UED Team"-->
      <!--              >-->
      <!--                <template #title>-->
      <!--                  <a href="https://www.antdv.com/">{{ item.name.last }}</a>-->
      <!--                </template>-->
      <!--                <template #avatar>-->
      <!--                  <a-avatar :src="item.picture.large" />-->
      <!--                </template>-->
      <!--              </a-list-item-meta>-->
      <!--              <div>ETH</div>-->
      <!--            </a-skeleton>-->
      <!--          </a-list-item>-->
      <!--        </template>-->
      <!--      </a-list>-->
    </a-card>
  </div>
</template>

<!--
元素： 钱包地址、余额、交易记录
功能： 1.当前活跃钱包切换，2.总资产，钱包信息增删改查
账户与网络是多对多的关系
-->

<script lang="ts">
import { defineComponent } from 'vue';
import info from './components/Info.vue';
import TaskForm from './components/TaskForm.vue';
import LayoutFooter from '@page/core/Layouts/components/layout-footer.vue';
import { BarsOutlined, EditOutlined, EyeOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons-vue';

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
  },
  setup() {
    // 列表元素： 账户别名。网络名称、钱包地址、币种符号、资产数额、钱包状态、操作【删除、编辑、交易记录、】
    const columns = [
      {
        name: '主键',
        dataIndex: 'id',
        key: 'id',
      },
      {
        name: '账户别名',
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
        title: '账户状态',
        key: 'status',
        dataIndex: 'status',
      },
      {
        title: '操作',
        key: 'action',
      },
    ];

    const tableData = [
      {
        key: '1',
        name: 'John Brown',
        age: 32,
        address: 'New York No. 1 Lake Park',
        tags: ['nice', 'developer'],
      },
      {
        key: '2',
        name: 'Jim Green',
        age: 42,
        address: 'London No. 1 Lake Park',
        tags: ['loser'],
      },
      {
        key: '3',
        name: 'Joe Black',
        age: 32,
        address: 'Sidney No. 1 Lake Park',
        tags: ['cool', 'teacher'],
      },
    ];
    // const data = [
    //   {
    //     gender: 'male',
    //     name: { title: 'Mr', first: 'اميرعلي', last: 'کریمی' },
    //     email: 'myraaly.khrymy@example.com',
    //     picture: {
    //       large: 'https://randomuser.me/api/portraits/men/78.jpg',
    //       medium: 'https://randomuser.me/api/portraits/med/men/78.jpg',
    //       thumbnail: 'https://randomuser.me/api/portraits/thumb/men/78.jpg',
    //     },
    //     nat: 'IR',
    //   },
    //   {
    //     gender: 'male',
    //     name: { title: 'Mr', first: 'Antonio', last: 'Romero' },
    //     email: 'antonio.romero@example.com',
    //     picture: {
    //       large: 'https://randomuser.me/api/portraits/men/35.jpg',
    //       medium: 'https://randomuser.me/api/portraits/med/men/35.jpg',
    //       thumbnail: 'https://randomuser.me/api/portraits/thumb/men/35.jpg',
    //     },
    //     nat: 'ES',
    //   },
    //   {
    //     gender: 'female',
    //     name: { title: 'Mrs', first: 'Kristen', last: 'Bailey' },
    //     email: 'kristen.bailey@example.com',
    //     picture: {
    //       large: 'https://randomuser.me/api/portraits/women/56.jpg',
    //       medium: 'https://randomuser.me/api/portraits/med/women/56.jpg',
    //       thumbnail: 'https://randomuser.me/api/portraits/thumb/women/56.jpg',
    //     },
    //     nat: 'AU',
    //   },
    //   {
    //     gender: 'male',
    //     name: { title: 'Mr', first: 'Ioque', last: 'Souza' },
    //     email: 'ioque.souza@example.com',
    //     picture: {
    //       large: 'https://randomuser.me/api/portraits/men/6.jpg',
    //       medium: 'https://randomuser.me/api/portraits/med/men/6.jpg',
    //       thumbnail: 'https://randomuser.me/api/portraits/thumb/men/6.jpg',
    //     },
    //     nat: 'BR',
    //   },
    //   {
    //     gender: 'male',
    //     name: { title: 'Mr', first: 'Sverre', last: 'Kittilsen' },
    //     email: 'sverre.kittilsen@example.com',
    //     picture: {
    //       large: 'https://randomuser.me/api/portraits/men/82.jpg',
    //       medium: 'https://randomuser.me/api/portraits/med/men/82.jpg',
    //       thumbnail: 'https://randomuser.me/api/portraits/thumb/men/82.jpg',
    //     },
    //     nat: 'NO',
    //   },
    //   {
    //     gender: 'male',
    //     name: { title: 'Mr', first: 'Hugo', last: 'White' },
    //     email: 'hugo.white@example.com',
    //     picture: {
    //       large: 'https://randomuser.me/api/portraits/men/93.jpg',
    //       medium: 'https://randomuser.me/api/portraits/med/men/93.jpg',
    //       thumbnail: 'https://randomuser.me/api/portraits/thumb/men/93.jpg',
    //     },
    //     nat: 'NZ',
    //   },
    //   {
    //     gender: 'female',
    //     name: { title: 'Ms', first: 'Jocenira', last: 'Monteiro' },
    //     email: 'jocenira.monteiro@example.com',
    //     picture: {
    //       large: 'https://randomuser.me/api/portraits/women/43.jpg',
    //       medium: 'https://randomuser.me/api/portraits/med/women/43.jpg',
    //       thumbnail: 'https://randomuser.me/api/portraits/thumb/women/43.jpg',
    //     },
    //     nat: 'BR',
    //   },
    //   {
    //     gender: 'female',
    //     name: { title: 'Miss', first: 'Ilona', last: 'Lehto' },
    //     email: 'ilona.lehto@example.com',
    //     picture: {
    //       large: 'https://randomuser.me/api/portraits/women/47.jpg',
    //       medium: 'https://randomuser.me/api/portraits/med/women/47.jpg',
    //       thumbnail: 'https://randomuser.me/api/portraits/thumb/women/47.jpg',
    //     },
    //     nat: 'FI',
    //   },
    //   {
    //     gender: 'male',
    //     name: { title: 'Mr', first: 'Dobrolik', last: 'Kadenyuk' },
    //     email: 'dobrolik.kadenyuk@example.com',
    //     picture: {
    //       large: 'https://randomuser.me/api/portraits/men/3.jpg',
    //       medium: 'https://randomuser.me/api/portraits/med/men/3.jpg',
    //       thumbnail: 'https://randomuser.me/api/portraits/thumb/men/3.jpg',
    //     },
    //     nat: 'UA',
    //   },
    //   {
    //     gender: 'male',
    //     name: { title: 'Mr', first: 'Alan', last: 'Zacher' },
    //     email: 'alan.zacher@example.com',
    //     picture: {
    //       large: 'https://randomuser.me/api/portraits/men/21.jpg',
    //       medium: 'https://randomuser.me/api/portraits/med/men/21.jpg',
    //       thumbnail: 'https://randomuser.me/api/portraits/thumb/men/21.jpg',
    //     },
    //     nat: 'DE',
    //   },
    // ];
    function add() {
      this.$dialog(
        TaskForm,
        // component props
        {
          record: {},
          on: {
            ok() {
              console.log('ok 回调');
            },
            cancel() {
              console.log('cancel 回调');
            },
            close() {
              console.log('modal close 回调');
            },
          },
        },
        // modal props
        {
          title: '新增',
          width: 700,
          centered: true,
          maskClosable: false,
        },
      );
    }
    function edit(record) {
      console.log('record', record);
      this.$dialog(
        TaskForm,
        // component props
        {
          record,
          on: {
            ok() {
              console.log('ok 回调');
            },
            cancel() {
              console.log('cancel 回调');
            },
            close() {
              console.log('modal close 回调');
            },
          },
        },
        // modal props
        {
          title: '操作',
          width: 700,
          centered: true,
          maskClosable: false,
        },
      );
    }
    function onDeleteAccount() {
      console.log('即将删除账户');
    }
    return {
      columns,
      tableData,
      // data,
      add,
      edit,
      onDeleteAccount,
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
