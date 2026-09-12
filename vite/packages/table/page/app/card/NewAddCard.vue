<template>
  <teleport to="body">
    <div class="popContainer"></div>
    <div class="controller drag" style="color: var(--primary-text)">
      <div class="header">
        <div class="left">
          <!-- <div class="btn no-drag xt-bg-2" @click="onBack" style="color:var(--primary-text);  ">
            <Icon icon="xiangzuo" style="height: 24px; width: 24px"></Icon>
          </div> -->
          <div
            @click="onBack"
            class="pointer flex items-center rounded-lg justify-center no-drag"
            style="
              background: var(--secondary-bg);
              width: 48px;
              height: 48px;
              font-size: 16px;
              color: var(--primary-text);
            "
          >
            <Icon icon="xiangzuo" style="font-size: 1.5em"></Icon>
          </div>
          <div class="box-title no-drag">小组件</div>
        </div>
        <div class="flex no-grag">
          <div class="no-drag mr-3">
            <HorizontalPanel :navList="navType" v-model:selectType="selectNav"></HorizontalPanel>
          </div>
          <!-- 头部搜索和下拉列表 -->
          <div class="no-drag">
            <Search
              v-model:keywords="search.keywords"
              v-model:order="search.order"
              placeholder="关键词"
              :sortType="searchOptions"
              :isFiltrate="true"
              @search="doSearch"
            />
          </div>
        </div>
      </div>
      <div class="text-center no-drag mb-2" v-if="isSearching">
        搜索结果：{{ keyword }}
        <icon @click="cancelSearch" class="pointer" style="color: red" icon="close-circle-fill"></icon>
      </div>
      <div class="mian" v-if="selectNav.name === 'small'">
        <div class="left">
          <div
            class="no-drag nav"
            style="color: var(--primary-text)"
            :class="{ 'xt-active-btn': navIndex == index }"
            @click="updateNavIndex(index)"
            v-for="(item, index) in baseNavList"
            :key="item.name"
          >
            {{ item.cname }}
          </div>
        </div>
        <div class="right no-drag">
          <!-- 进行数据筛选 将离线模式屏蔽的隐藏 -->
          <NewCardPreViews
            @addSuccess="onBack"
            v-if="baseNavList[navIndex].children !== null"
            :navList="baseNavList[navIndex].children"
            :search="searchValue"
            :desk="desk"
          >
          </NewCardPreViews>
          <template v-else>
            <div class="warn-boxs">
              <XtState :state="'null'" @onClick="onClick" style="width: 320px; height: 320px" bg=""></XtState>
            </div>
          </template>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script>
import NewCardPreViews from './NewCardPreViews.vue';
import { NavList } from './navList';
import HorizontalPanel from '../../../components/HorizontalPanel.vue';
import _ from 'lodash-es';
import Search from '../../../components/Search.vue';
import { mapActions, mapWritableState } from 'pinia';
import { offlineStore } from '../../../js/common/offline';

export default {
  name: 'AddCard',
  components: { NewCardPreViews, HorizontalPanel, Search },
  emits: ['onClose'],
  props: {
    desk: {
      type: Object,
      default: () => {},
    },
    deskList: {
      type: Array,
    },
  },
  data() {
    return {
      navIndex: 0,
      searchValue: '默认排序',
      baseNavList: NavList,
      allNavList: [],
      searchOptions: [
        { value: 'default', name: '默认排序' },
        { value: 'download', name: '下载量' },
        { value: 'updateTime', name: '更新时间' },
        { value: 'createTime', name: '发布时间' },
      ],
      navType: [
        { title: '小组件', name: 'small' },
      ],
      selectNav: { title: '小组件', name: 'small' },
      navDeskIndex: 0,
      //搜索表单值
      search: {
        keywords: '',
        order: 'default',
      },
      keyword: '', //真正搜索词
      searching: false,
    };
  },

  async mounted() {
    // 这里是预留给api请求到时间和下载数据添加数据使用
    let navList = _.cloneDeep(this.baseNavList);

    let items = [];
    navList.map((li) => {
      return items.push(...li.children);
    });
    //取得全部不重复的数组元素
    items = _.uniqBy(items, (li) => {
      return li.name;
    });
    navList.splice(1, 0, {
      cname: '全部',
      children: items,
    });
    navList.forEach((li) => {
      // 离线模式时 隐藏卡片添加
      if (this.getIsOffline()) {
        li.children = li.children.filter((ele) => {
          if (this.offlineList.indexOf(ele.name) < 0) {
            return ele;
          }
        });
      }

      li.cname = li.cname + `（${li.children.length}）`;
    });

    const displayNavList = navList.map((item) => {
      if (item.children != null) {
        let children = [];
        item.children.forEach((i) => {
          i.time = new Date(i.time).getTime();
          children.push({
            ...i,
            download: Math.floor(Math.random() * 10000) + 1,
            // time: this.getTimes()
          });
        });
        return {
          cname: item.cname,
          children,
        };
      } else return item;
    });
    this.allNavList = displayNavList;
    this.baseNavList = displayNavList;
    this.selectNav = this.navType[0];
  },
  computed: {
    ...mapWritableState(offlineStore, ['isOffline', 'offlineList']),
    isSearching() {
      return this.searching;
    },
  },
  methods: {
    ...mapActions(offlineStore, ['getIsOffline']),
    doSearch() {
      if (this.search.keywords === '') {
        this.cancelSearch();
        return;
      }
      this.searching = true;
      this.keyword = this.search.keywords;
      const keyWord = this.keyword.trim();
      const children = this.sortWidgets(this.allNavList
        .flatMap((item) => item.children || [])
        .filter((item) => item.cname.includes(keyWord) || item.detail.includes(keyWord)));
      this.baseNavList = [
        {
          cname: `搜索结果（${children.length}）`,
          children,
        },
      ];
      this.navIndex = 0;
    },
    cancelSearch() {
      this.searching = false;
      this.search.keywords = '';
      this.keyword = '';
      this.baseNavList = this.allNavList;
      this.navIndex = 0;
    },
    onClick() {},
    getTimes() {
      const currentTime = Date.now();
      const startDate = new Date('2023-01-01T00:00:00Z').getTime();
      const randomTimestamp = Math.floor(Math.random() * (currentTime - startDate)) + startDate;
      return randomTimestamp;
    },
    onBack() {
      this.$emit('close');
      this.$emit('onClose');
    },
    afterAdded() {
      this.onBack();
    },
    updateNavIndex(index) {
      this.navIndex = index;
    },
    sortWidgets(items) {
      const sortKeyMap = {
        download: 'download',
        updateTime: 'time',
        createTime: 'time',
      };
      const sortKey = sortKeyMap[this.search.order];
      if (!sortKey) return items;
      return [...items].sort((a, b) => Number(b[sortKey] || 0) - Number(a[sortKey] || 0));
    },
  },
};
</script>

<style lang="scss" scoped>
.popContainer {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  // 背景的模糊大小通过下面的属性值大小来调制
  // background-color: rgba(19, 19, 19, 0.35);
  // background: red;
  background: var(--mask-bg);
  backdrop-filter: blur(10px);
  // background: red;
  -webkit-backdrop-filter: blur(50px);
  backdrop-filter: blur(28px);
  // transform: scale(1.2);
}

.controller {
  z-index: 9999;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: 24px;

  :deep(.ant-select-selector) {
    border: none !important;
    box-shadow: none !important;
  }

  .header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;

    .left {
      display: flex;

      .select {
        display: flex;
        justify-content: center;
        align-items: center;
        text-align: center;
        font-size: 16px;
        background: rgba(0, 0, 0, 0.3);
        background: var(--secondary-bg) !important;
        border-radius: 12px;
        margin-left: 10px;
      }

      .btn {
        background: rgba(0, 0, 0, 0.3);
        border-radius: 12px;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 48px;
        height: 48px;
        margin-right: 20px;
      }

      .search {
        background: var(--secondary-bg);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        width: 400px;
        height: 48px;
        padding-left: 20px;
        font-size: 18px;

        color: var(--primary-text);

        input {
          color: var(--primary-text);
        }
      }

      .select {
        width: 134px;
        height: 48px;
      }
    }
  }

  .mian {
    margin-top: 20px;
    box-sizing: border-box;
    height: 95%;
    display: flex;

    .left {
      height: 100%;
      width: 140px;
      overflow: auto;
      padding-bottom: 40px;

      .nav {
        width: 112px;
        height: 56px;
        border-radius: 12px;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
      }

      .active {
        background: var(--secondary-bg);
      }
    }

    .left::-webkit-scrollbar,
    .right::-webkit-scrollbar {
      display: none;
    }

    .right {
      width: 100%;
      height: 100%;
      overflow: auto;
      display: flex;
      // flex-wrap: wrap;
      flex-direction: column !important;

      .warn {
        border-radius: 12px;
        font-size: 16px;
        padding: 10px;
        box-sizing: border-box;
        padding-left: 20px;
        height: 48px;
        display: flex;
        align-items: center;
        margin-bottom: 20px;

        .icon {
          width: 21px;
          height: 21px;
          background: #508bfe;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          margin-right: 10px;
        }
      }

      .warn-boxs {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }
  }
}

.box-title {
  display: flex;
  align-items: center;
  margin-left: 16px;
  font-size: 18px;
  color: var(--primary-text);
}
</style>
