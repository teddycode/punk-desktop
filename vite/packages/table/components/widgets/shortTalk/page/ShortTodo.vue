<template>
  <Widget
    ref="dataSlot"
    :customData="customData"
    :customIndex="customIndex"
    :desk="desk"
    :menuList="menuList"
    :options="options"
    @click="onHistoryMessage"
  >
    <div class="top-icon">
      <Icon icon="akar-icons:check-box" />
    </div>

    <Unusual
      v-if="!this.access_token || !this.baseUrl"
      :back="back"
      buttonTitle="立即配置"
      title="请完成小组件配置"
    ></Unusual>
    <div v-else class="dash-board">
      <div
        v-for="(item, index) in this.todoList"
        :key="index"
        :class="item.num == 0 || item.num == undefined ? 'green' : item.num < 100 ? 'yellow' : 'red'"
        class="dash-cell pointer"
        @click="jumpUrl(this.admin_url)"
      >
        <div class="cell-title">{{ item.title }}</div>
        <div class="cell-num" style="font-family: 'Oswald-Medium'">{{ item.num == undefined ? '-' : item.num }}</div>
      </div>
    </div>
    <!-- 设置面板 -->
    <a-drawer v-model:open="settingVisible" :width="500" placement="right" title="设置">
      <template #extra>
        <div class="xt-active-btn" style="width: 64px; height: 40px" @click="changeVisible">提交</div>
      </template>
      <vue-custom-scrollbar :settings="settings" style="height: 100%">
        <div>
          <div class="text-content">
            <div>关联短说社区系统</div>
            <div>
              在使用该功能前，需要关联您的短说社区系统，请在短说管理后台获取系统密钥，填入下方输入框，以及您的管理后台地址，成功完成配置后即可使用。
            </div>
            <div>在磐古跨链客户端中打开短说管理后台，可以自动检测获取密钥。</div>
          </div>
          <p class="ml-1 mt-1">密钥</p>
          <a-input
            v-model:value="this.accToken"
            class="search pl-1 input-txt"
            placeholder="请输入"
            style="border-radius: 10px"
          ></a-input>
          <p class="ml-1 mt-2">管理后台地址</p>
          <a-input
            v-model:value="this.accUrl"
            class="search pl-1 input-txt"
            placeholder="请输入"
            style="border-radius: 10px"
          ></a-input>
        </div>
      </vue-custom-scrollbar>
    </a-drawer>
  </Widget>
</template>

<script>
import Widget from '../../../card/Widget.vue';
import { Icon } from '@iconify/vue';
import { mapActions, mapWritableState } from 'pinia';
import { shortTalkStore } from '../store';
import { cardStore } from '../../../../store/card';
import browser from '../../../../js/common/browser';
import Unusual from '../../Unusual.vue';

export default {
  components: {
    Widget,
    Icon,
    Unusual,
  },

  props: {
    customIndex: {
      type: Number,
      default: 0,
    },
    customData: {
      type: Object,
      default: () => {},
    },
    menuList: {
      type: Array,
    },
    desk: {
      type: Object,
    },
    editing: {
      type: Boolean,
    },
  },
  computed: {
    ...mapWritableState(shortTalkStore, ['todoList', 'access_token', 'baseUrl', 'admin_url']),
  },
  data() {
    return {
      settings: {
        swipeEasing: true,
        suppressScrollY: false,
        suppressScrollX: true,
        wheelPropagation: false,
      },
      // 标题样式
      options: {
        className: 'card',
        title: '社区待办',
        icon: 'iconamoon:history-fill',
        rightIcon: 'fluent:open-20-filled',
        // icon: "games-16-filled",
      },
      // 设置
      menuList: [
        {
          icon: 'shezhi1',
          title: '设置',
          fn: () => {
            this.settingVisible = true;
            this.$refs.dataSlot.visible = false;
          },
        },
      ],
      // 密钥和地址
      accToken: '',
      accUrl: '',
      settingVisible: false,
    };
  },
  mounted() {
    // 初始化
    this.accToken = this.access_token;
    this.accUrl = this.baseUrl;
    this.getTodoData();
  },
  methods: {
    ...mapActions(cardStore, ['updateCustomData']),
    ...mapActions(shortTalkStore, ['getTodoData', 'changeAccToken']),
    changeVisible() {
      this.settingVisible = false;
      this.changeAccToken(this.accToken, this.accUrl);
    },
    jumpUrl(url) {
      browser.openInUserSelect(url);
    },
    back() {
      this.settingVisible = true;
    },
  },
  watch: {
    // 监听token 跟 url
    access_token: {
      handler(newVal, oldVal) {
        this.accToken = this.access_token;
        this.getTodoData();
      },
    },
    baseUrl: {
      handler(newVal, oldVal) {
        this.accUrl = this.baseUrl;
        this.getTodoData();
      },
    },
  },
};
</script>

<style lang="scss" scoped>
.top-icon {
  position: absolute;
  top: 17px;
}

.top-icon svg {
  width: 20px;
  height: 20px;
}

.dash-board {
  display: flex;
  text-align: center;
  flex-wrap: wrap;
  position: relative;
  top: -3px;
  justify-content: space-between;
}

.dash-cell {
  width: 120px;
  height: 112px;
  border-radius: 10px;
  margin-top: 12px;
}

.text-content {
  width: 100%;
  min-height: 124px;
  background: #2a2a2a;
  border-radius: 12px;
  padding: 10px 16px;

  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 400;
  margin-bottom: 10px;
}

.text-content div:nth-of-type(1) {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 10px;
}

.text-content div {
  margin-bottom: 10px;
}

.dash-cell .cell-title {
  margin-top: 22px;

  font-size: 16px;
  color: rgba(255, 255, 255, 0.6) !important;
  font-weight: 400;
}

.dash-cell .cell-num {
  margin-top: 11px;
  font-family: Oswald-Medium;
  font-size: 24px;
  font-weight: 500;
}

.green {
  // opacity: 0.2;
  background-color: rgba(#52c41a, 0.2);
  color: #52c41a;
}

.red {
  background-color: rgba(#ff4d4f, 0.2);
  color: #ff4d4f;
}

.yellow {
  background-color: rgba(#faad14, 0.2);
  color: #faad14;
}
</style>
