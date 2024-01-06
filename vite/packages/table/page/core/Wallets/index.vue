<template>
  <a-card :bordered="true" style="margin-top: 10px">
    <a-row>
      <a-col :sm="8" :xs="24">
        <info title="代币种类" value="2种" :bordered="true" />
      </a-col>
      <a-col :sm="8" :xs="24">
        <info title="钱包总数" value="3个" :bordered="true" />
      </a-col>
      <a-col :sm="8" :xs="24">
        <info title="价值估计" value="2000.0000元" :bordered="true" />
      </a-col>
    </a-row>
  </a-card>
  <div style="margin-top: 10px; margin-bottom: 20px">
    <a-card style="margin-top: 24px" :bordered="true" title="钱包列表">
      <template #extra>
        <a-radio-group v-model="status">
          <a-radio-button value="all">展开所有</a-radio-button>
          <a-radio-button value="processing">隐藏小额</a-radio-button>
          <a-radio-button value="waiting">自动分类</a-radio-button>
        </a-radio-group>
        <a-input-search style="margin-left: 16px; width: 272px" />
        <a-button type="dashed" @click="add">
          <template #icon> <PlusOutlined /> </template>
          添加</a-button
        >
      </template>
      <a-list size="default" :pagination="{ showSizeChanger: true, showQuickJumper: true, pageSize: 5, total: 50 }">
        <a-list-item :key="index" v-for="(item, index) in data">
          <a-list-item-meta :description="item?.description">
            <a-avatar slot="avatar" size="large" shape="square" :src="item.avatar" />
            <a slot="title">{{ item.title }}</a>
          </a-list-item-meta>
          <div slot="actions">
            <a @click="edit(item)">编辑</a>
          </div>
          <div slot="actions">
            <a-dropdown>
              <a-menu slot="overlay">
                <a-menu-item><a>编辑</a></a-menu-item>
                <a-menu-item><a>删除</a></a-menu-item>
              </a-menu>
              <a>更多<a-icon type="down" /></a>
            </a-dropdown>
          </div>
          <div class="list-content">
            <div class="list-content-item">
              <span>Owner</span>
              <p>{{ item.owner }}</p>
            </div>
            <div class="list-content-item">
              <span>开始时间</span>
              <p>{{ item.startAt }}</p>
            </div>
            <div class="list-content-item">
              <a-progress
                :percent="item.progress.value"
                :status="!item.progress.status ? null : item.progress.status"
                style="width: 180px"
              />
            </div>
          </div>
        </a-list-item>
      </a-list>
    </a-card>
  </div>
</template>

<!--
元素： 钱包地址、余额、交易记录
功能： 1.当前活跃钱包切换，2.总资产，钱包信息增删改查
-->

<script lang="ts">
import { defineComponent } from 'vue';
import info from './components/Info.vue';
import TaskForm from './components/TaskForm.vue';
import LayoutFooter from '@page/core/Layouts/components/layout-footer.vue';
import { PlusOutlined } from '@ant-design/icons-vue';

export default defineComponent({
  name: 'WalletsPage',
  components: {
    LayoutFooter,
    info,
    TaskForm,
  },
  setup() {
    const data = [
      {
        title: 'Alipay',
        avatar: 'https://gw.alipayobjects.com/zos/rmsportal/WdGqmHpayyMjiEhcKoVE.png',
        description: '那是一种内在的东西， 他们到达不了，也无法触及的',
        owner: '付晓晓',
        startAt: '2018-07-26 22:44',
        progress: {
          value: 90,
        },
      },
      {
        title: 'Angular',
        avatar: 'https://gw.alipayobjects.com/zos/rmsportal/zOsKZmFRdUtvpqCImOVY.png',
        description: '希望是一个好东西，也许是最好的，好东西是不会消亡的',
        owner: '曲丽丽',
        startAt: '2018-07-26 22:44',
        progress: {
          value: 54,
        },
      },
    ];
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
    return {
      data,
      add,
      edit,
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
