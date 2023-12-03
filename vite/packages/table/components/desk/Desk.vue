<template>
  <!--桌面卡片-->
  <div v-if="currentDesk.cards" style="height: 100%; width: calc(100% - 20px)">
    <div
      v-if="currentDesk.cards.length === 0"
      :class="notTrigger ? 'trigger' : ''"
      class="m-auto"
      style="width: 100%; height: 100%"
    >
      <div style="width: 100%; height: 100%">
        <a-result
          class="m-auto rounded-lg s-bg"
          status="success"
          style="margin: auto"
          sub-title="您可以长按空白处、右键添加小组件。"
          title="使用卡片桌面"
        >
          <template #extra>
            <a-button
              key="console"
              class="mr-10 xt-active-bg"
              style="color: var(--active-text)"
              type="primary"
              @click="newAddCard"
              >添加第一张卡片
            </a-button>
            <a-button key="buy" @click="learn">学习</a-button>
          </template>

          <div class="desc">
            <p style="font-size: 16px">
              <strong>您可以通过桌面设置调节卡片到合适的大小</strong>
            </p>
            <p>
              从社区获得分享代码（此功能暂未上线，请耐心等待）
              <a>从社区导入 &gt;</a>
            </p>
          </div>
        </a-result>
      </div>
    </div>
    <!--桌面右键 -->
    <RightMenu :menus="dropdownMenu" class="w-full h-full" @contextmenu="showMenu">
      <!-- <xt-button @click='addFreeDeskState(currentDesk.id)'>自由布局</xt-button>
      <xt-button @click='delFreeDeskState(currentDesk.id)'>默认布局</xt-button> -->
      <FreeDesk v-if="getFreeDeskState(currentDesk.id)" :currentDesk="currentDesk">
        <template #item="{ data }">
          <component
            :is="data.data.name"
            :customData="data.data.customData"
            :customIndex="data.data.id"
            :desk="currentDesk"
            :editing="editing"
          />
        </template>
      </FreeDesk>
      <vue-custom-scrollbar
        v-show="!getFreeDeskState(currentDesk.id)"
        id="scrollerBar"
        key="scrollbar"
        :settings="{
          ...scrollbarSettings,
          suppressScrollY: settings.vDirection ? false : true,
          suppressScrollX: settings.vDirection ? true : false,
        }"
        class="no-drag"
        style="
          position: relative;
          width: 100%;
          height: 100%;
          padding-left: 10px;
          padding-right: 10px;
          display: flex;
          flex-direction: row;
        "
      >
        <div
          id="cardContent"
          ref="deskContainer"
          :class="notTrigger ? 'trigger' : ''"
          :style="{
            // 'flex-direction': settings.vDirection?'row':'column',
            'padding-top': this.usingSettings.marginTop + 'px',
            width: settings.vDirection ? '100%' : 'auto',
            height: settings.vDirection ? 'auto' : '100%',
          }"
          style="/*display: flex;*/ /*align-items: center;*/ /*align-content: center;*/"
        >
          <vuuri
            v-if="currentDesk.cards && !hide"
            :key="key"
            ref="grid"
            v-model="currentDesk.cards"
            :drag-enabled="editing"
            :get-item-margin="
              () => {
                return usingSettings.cardMargin * this.adjustZoom + 'px';
              }
            "
            :options="muuriOptions"
            :style="{
              width: settings.vDirection ? '100%' : 'auto',
              height: settings.vDirection ? 'auto' : '100%',
            }"
            class="grid home-widgets"
            group-id="grid.id"
          >
            <template #item="{ item }">
              <div
                :class="{ editing: editing }"
                :editing="editing"
                :style="{ zoom: ((usingSettings.cardZoom * this.adjustZoom) / 100).toFixed(2) }"
              >
                <component
                  :is="item.name"
                  :customData="item.customData"
                  :customIndex="item.id"
                  :desk="currentDesk"
                  :editing="editing"
                ></component>
              </div>
            </template>
          </vuuri>
        </div>
      </vue-custom-scrollbar>
      <!-- </div> -->
    </RightMenu>
  </div>
  <!---->
  <transition name="fade">
    <div
      v-if="addCardVisible"
      class="home-blur"
      style="position: fixed; top: 0; right: 0; left: 0; bottom: 0; z-index: 999"
    >
      <NewAddCard
        :desk="currentDesk"
        @addSuccess="hideAddCard"
        @close="hideAddCard"
        @onBack="
          () => {
            this.addCardVisible = false;
          }
        "
      ></NewAddCard>
    </div>
  </transition>
  <!--添加小组件-->
  <!--  <a-drawer-->
  <!--    :contentWrapperStyle="{ backgroundColor: '#1F1F1F' }"-->
  <!--    :height="350"-->
  <!--    :visible="menuVisible"-->
  <!--    :width="120"-->
  <!--    class="drawer"-->
  <!--    placement="bottom"-->
  <!--    style="z-index: 99999999999"-->
  <!--    @close="onClose"-->
  <!--  >-->
  <!--    <a-row :gutter="[20, 20]" style="margin-top: 1em">-->
  <!--      <div class="hidden mb-3" style="height: 200px"></div>-->
  <!--      <xt-task id="M0101" no="2" to="" @cb="newAddCard()">-->
  <!--        <a-col>-->
  <!--          <div class="btn" @click="newAddCard">-->
  <!--            <xt-new-icon icon="fluent:collections-add-24-regular" size="42" />-->
  <!--            <div><span>添加小组件</span></div>-->
  <!--          </div>-->
  <!--        </a-col>-->
  <!--      </xt-task>-->
  <!--      <xt-task id="M0201" no="2" to="" @cb="newAddIcon()">-->
  <!--        <a-col>-->
  <!--          <div class="btn flex flex-col items-center" @click="newAddIcon">-->
  <!--            <xt-new-icon icon="fluent:add-16-filled" size="42" />-->
  <!--            <div><span>添加图标</span></div>-->
  <!--          </div>-->
  <!--        </a-col>-->
  <!--      </xt-task>-->
  <!--      <a-col>-->
  <!--        <div class="btn" @click="toggleEditing">-->
  <!--          <xt-new-icon v-if="!this.editing" icon="fluent:window-new-16-regular" size="42" />-->
  <!--          <xt-new-icon v-else icon="fluent:record-stop-16-regular" size="42" />-->
  <!--          <div><span v-if="!this.editing">调整布局</span><span v-else style="color: red">停止调整</span></div>-->
  <!--        </div>-->
  <!--      </a-col>-->
  <!--      <xt-task id="M0103" no="2" to="" @cb="showSetting">-->
  <!--        <a-col>-->
  <!--          <div class="btn" @click="showSetting">-->
  <!--            <xt-new-icon icon="fluent:settings-16-regular" size="42" />-->
  <!--            <div><span>桌面设置</span></div>-->
  <!--          </div>-->
  <!--        </a-col>-->
  <!--      </xt-task>-->
  <!--      <a-col>-->
  <!--        <div class="btn" @click="clear">-->
  <!--          <xt-new-icon icon="fluent:circle-off-16-regular" size="42" />-->

  <!--          <div><span>清空桌面</span></div>-->
  <!--        </div>-->
  <!--      </a-col>-->

  <!--      <a-col>-->
  <!--        <div v-if="!hide" class="btn" @click="hideDesk">-->
  <!--          <xt-new-icon icon="fluent:eye-off-16-regular" size="42" />-->

  <!--          <div><span>隐藏小组件</span></div>-->
  <!--        </div>-->
  <!--        <div v-else class="btn" @click="showDesk">-->
  <!--          <xt-new-icon icon="fluent:eye-16-regular" size="42" />-->
  <!--          <div><span>显示小组件</span></div>-->
  <!--        </div>-->
  <!--      </a-col>-->
  <!--      &lt;!&ndash;      <a-col>&ndash;&gt;-->
  <!--      &lt;!&ndash;        <div @click="showAddDeskForm" class="btn">&ndash;&gt;-->
  <!--      &lt;!&ndash;          <Icon style="font-size: 3em" icon="desktop"></Icon>&ndash;&gt;-->
  <!--      &lt;!&ndash;          <div><span>添加桌面</span></div>&ndash;&gt;-->
  <!--      &lt;!&ndash;        </div>&ndash;&gt;-->
  <!--      &lt;!&ndash;      </a-col>&ndash;&gt;-->
  <!--      &lt;!&ndash;      <a-col>&ndash;&gt;-->
  <!--      &lt;!&ndash;        <div @click="delDesk" class="btn">&ndash;&gt;-->
  <!--      &lt;!&ndash;          <Icon style="font-size: 3em" icon="shanchu"></Icon>&ndash;&gt;-->
  <!--      &lt;!&ndash;          <div><span>删除桌面</span></div>&ndash;&gt;-->
  <!--      &lt;!&ndash;        </div>&ndash;&gt;-->
  <!--      &lt;!&ndash;      </a-col>&ndash;&gt;-->

  <!--      &lt;!&ndash;   菜单插槽    &ndash;&gt;-->
  <!--      <slot name="currentDeskMenu"></slot>-->
  <!--    </a-row>-->
  <!--    <slot name="outMenu"></slot>-->
  <!--  </a-drawer>-->
  <a-drawer v-model:visible="settingVisible" placement="right">
    <XtTab
      v-if="settingVisible"
      v-model="currentSettingTab"
      :list="settingsTab"
      boxClass="p-1 xt-bg-2"
      class="mb-2"
      style="height: 48px"
    ></XtTab>
    <template v-if="currentSettingTab === 'current' && currentDesk.settings">
      <div class="line-title">基础设置</div>
      <div class="mt-2 line">桌面名称：</div>
      <div>
        <a-input v-model:value="currentDesk.name"></a-input>
      </div>
      <div class="my-3" style="font-size: 1.2em; font-weight: bold">
        独立缩放：
        <div class="line xt-text-2" style="font-size: 14px; font-weight: normal">
          开启独立缩放后，将不再使用通用桌面设置中的缩放设置。
        </div>
        <a-switch v-model:checked="settings.enableZoom" @change="update"></a-switch>
      </div>
      <template v-if="settings.enableZoom">
        <div class="line-title">卡片设置：</div>

        <div class="line">
          卡片缩放：
          <a-slider v-model:value="settings.cardZoom" :max="500" :min="20" @afterChange="update"></a-slider>
        </div>
        <div class="line">
          卡片空隙：(调大空隙可能变成瀑布流布局)
          <a-slider v-model:value="settings.cardMargin" :max="30" :min="5"></a-slider>
        </div>
        <div class="line">
          距离顶部：
          <a-slider v-model:value="settings.marginTop" :max="200" :min="0"></a-slider>
        </div>
      </template>

      <div>
        桌面垂直布局：
        <a-switch v-model:checked="currentDesk.settings.vDirection"></a-switch>
      </div>
    </template>
    <template v-else>
      <div class="line-title">卡片设置：</div>
      <!-- <xt-text class=" xt-bg-2 rounded-xl p-3 mb-1">
        <div class=" flex flex-col">
          <div >自由布局（开发中）：<a-switch v-model:checked="freeDeskState" /></div>
          <xt-text type="2">该功能尚未完成 可能会产生严重bug，开启需谨慎！！！</xt-text>
        </div>
      </xt-text> -->
      <template v-if="settings.enableZoom">
        <div class="mb-2" style="color: orangered">
          <icon icon="tishi-xianxing"></icon>
          当前桌面正在使用独立设置，此处设置对当前桌面不起作用。
        </div>
      </template>
      <div class="line">
        卡片缩放：
        <a-slider v-model:value="globalSettings.cardZoom" :max="500" :min="20" @afterChange="update"></a-slider>
      </div>
      <div class="line">
        卡片空隙：(调大空隙可能变成瀑布流布局)
        <a-slider v-model:value="globalSettings.cardMargin" :max="30" :min="5"></a-slider>
      </div>
      <div class="line">
        距离顶部：
        <a-slider v-model:value="globalSettings.marginTop" :max="200" :min="0"></a-slider>
      </div>
      <slot name="settingsAllAfter"> </slot>
    </template>
  </a-drawer>

  <transition name="fade">
    <div v-if="iconVisible" class="" style="position: fixed; top: 0; right: 0; left: 0; bottom: 0; z-index: 999">
      <AddIcon :desk="currentDesk" @close="iconHide" @setCustoms="setCustoms"></AddIcon>
    </div>
  </transition>
</template>

<script>
import Muuri from 'muuri';
import { message, Modal } from 'ant-design-vue';
import { mapActions, mapWritableState } from 'pinia';
import { appStore } from '@store';

import { useWidgetStore } from '../card/store.ts';
import { useFreeDeskStore } from './free/store';
import componentsMinis from './components.ts';

export default {
  name: 'Desk',
  emits: ['changeEditing'],
  mixins: [componentsMinis],
  props: {
    deskGroupMenu: {
      default: () => {
        return [];
      },
    },
    globalSettings: {
      type: Object,
      default: {},
    },
    editing: {
      type: Boolean,
      required: true,
      default: false,
    },
    currentDesk: {
      type: Object,
      required: true,
      default: () => {
        return { cards: [] };
      },
    },
    muuriOptions: {
      type: Object,
      required: false,
      default: () => {
        return {
          // dragStartPredicate: {
          //   distance: 10,
          //   delay: 1000,
          // },
          dragAutoScroll: {},
          layout: {
            // fillGaps: true,
            // horizontal: false,
            alignRight: false,
            alignBottom: false,
            // rounding: true
          },
          targets: [
            {
              element: '#scrollerBar>div',
            },
          ],
          handle: null,
          threshold: 50,
          safeZone: 0.2,
          speed: Muuri.AutoScroller.smoothSpeed(1000, 2000, 2500),
          sortDuringScroll: true,
          smoothStop: false,
          onStart: null,
          onStop: null,
          dragSortPredicate: {
            threshold: 30,
          },
          dragSortHeuristics: {
            sortInterval: 10,
            minDragDistance: 5,
            minBounceBackAngle: Math.PI / 2,
          },
        };
      },
    },
    settings: {
      type: Object,
      required: false,
      default: {
        cardZoom: 100,
        marginTop: 0,
        cardMargin: 5, //卡片间隙
        vDirection: false,
      },
    },
    notTrigger: {
      type: Boolean,
      default: () => false,
    },
  },
  watch: {
    freeDeskState(newV) {
      this.renewFreeDeskState(this.currentDesk.id);
    },
    currentDesk(newVal) {
      newVal.layoutSize = this.getLayoutSize();
      // if (!newVal.settings) {
      //   newVal.settings=
      //     .settings = {
      //     cardZoom: 100,
      //     marginTop: 0,
      //     cardMargin: 5,//卡片间隙
      //     vDirection: false,
      //   }
      // }
      this.muuriOptions.layout.horizontal = !newVal.settings?.vDirection;
    },

    'currentDesk.settings': {
      handler(newVal) {
        console.log('更改了方向');
        if (!newVal) {
          newVal = {
            cardZoom: 100,
            marginTop: 0,
            cardMargin: 5, //卡片间隙
            vDirection: false,
          };
        }
        this.muuriOptions.layout.horizontal = !newVal.vDirection;
        this.currentDesk.settings = newVal;
        this.update();
      },
      deep: true,
      immediate: true,
    },
    'currentDesk.settings.vDirection': {
      handler(newVal) {
        console.log('更新了方向，重载');
        this.key = Date.now();
        console.log(this.muuriOptions.layout, 'murri参数');
      },
      deep: true,
    },
  },
  computed: {
    ...mapWritableState(appStore, ['fullScreen']),
    ...mapWritableState(useWidgetStore, ['rightModel']),
    deskGroupMenus() {
      if (this.deskGroupMenu && this.deskGroupMenu.length > 1) {
        let arr = [...this.deskGroupMenu[1].children];
        let exists = arr.some((item) => item.id === 4);
        if (!exists) {
          arr.push({
            id: 4,
            newIcon: 'fluent:circle-off-16-regular',
            name: '清空桌面',
            fn: this.clear,
          });
        }
        arr.sort((a, b) => a.id - b.id);
        let deskGroupMenu = [...this.deskGroupMenu];
        deskGroupMenu[1].children = [...arr];
        return deskGroupMenu;
      }
      return [];
    },

    deskMenus() {
      return [
        {
          id: 1,
          newIcon: 'fluent:add-16-filled',
          name: '添加图标',
          fn: this.newAddIcon,
        },
        {
          id: 2,
          newIcon: 'fluent:collections-add-24-regular',
          name: '添加小组件',
          fn: this.newAddCard,
        },
        {
          id: 4,
          divider: true,
        },
        {
          id: 5,
          newIcon: this.editing ? 'fluent:record-stop-16-regular' : 'fluent:window-new-16-regular',
          name: this.editing ? '停止调整' : '调整桌面布局',
          fn: this.toggleEditing,
        },
        {
          id: 6,
          newIcon: this.hide ? 'fluent:eye-16-regular' : 'fluent:eye-off-16-regular',
          name: this.hide ? '显示小组件' : '隐藏小组件',
          fn: this.hide ? this.showDesk : this.hideDesk,
        },
        {
          id: 7,
          divider: true,
        },
        {
          id: 8,
          newIcon: 'fluent:settings-16-regular',
          name: '桌面设置',
          fn: this.showSetting,
        },
      ];
    },
    dropdownMenu() {
      let arr = [...this.deskGroupMenus, ...this.deskMenus];
      arr.sort((a, b) => a.id - b.id);
      return arr;
    },
    usingSettings() {
      if (this.settings.enableZoom) {
        return this.settings;
      } else {
        return this.globalSettings;
      }
    },
  },
  data() {
    return {
      freeDeskState: false,
      stashBound: { width: 0, height: 0, zoom: 0 },
      adjustZoom: 1,
      iconVisible: false,
      settingVisible: false,
      hide: false,
      key: Date.now(),
      menuVisible: false,
      addCardVisible: false,
      scrollbarSettings: {
        useBothWheelAxes: true,
        swipeEasing: true,
        suppressScrollY: true,
        suppressScrollX: false,
        wheelPropagation: true,
        currentItemId: -1,
      },
      settingsTab: [
        { name: '通用桌面设置', value: 'all' },
        { name: '当前桌面设置', value: 'current' },
      ],
      currentSettingTab: 'all',
      resizeHandler: null,
    };
  },
  mounted() {
    this.resizeHandler = () => {
      this.currentDesk.layoutSize = this.getLayoutSize();
    };
    this.getLayoutSize();
    window.addEventListener('resize', this.resizeHandler);
  },
  unmounted() {
    window.removeEventListener('resize', this.resizeHandler);
  },
  methods: {
    ...mapActions(useFreeDeskStore, ['addFreeDeskState', 'getFreeDeskState', 'delFreeDeskState', 'renewFreeDeskState']),
    learn() {
      browser.openInTable('https://www.bilibili.com/video/BV1Th4y1o7SZ/?vd_source=2b7e342ffb60104849f5db6262bb1e0b');
    },
    update() {
      if (this.$refs.grid) {
        this.$refs.grid.update();
      }
    },
    hideMenu() {
      this.menuVisible = false;
    },
    toggleEditing() {
      if (this.editing) {
        message.info('已关闭拖拽调整');
      } else {
        message.info('您可以直接拖拽图标调整位置');
      }
      this.muuriOptions.layout.horizontal = !this.settings.vDirection;
      this.$emit('changeEditing', this.editing);
      this.menuVisible = false;
      this.key = Date.now();
      console.log(this.muuriOptions, 'ediingt输出');
    },
    showSetting() {
      this.settingVisible = true;
      this.menuVisible = false;
    },
    hideDesk() {
      this.hide = !this.hide;
      this.menuVisible = false;
    },
    iconHide() {
      this.iconVisible = false;
    },

    showDesk() {
      this.hide = !this.hide;
      this.menuVisible = false;
    },
    clear() {
      this.menuVisible = false;
      let desk = this.currentDesk;
      if (desk) {
        Modal.confirm({
          centered: true,
          content: '清空当前桌面的全部卡片？此操作不可还原。',
          onOk: () => {
            desk.cards = [];
            this.menuVisible = false;
          },
          okText: '清空卡片',
        });
      }
    },
    newAddCard() {
      this.addCardVisible = true;
      // addCardVisible
      this.menuVisible = false;
    },
    hideAddCard() {
      this.addCardVisible = false;
    },
    onClose() {
      this.menuVisible = false;
    },
    showMenu() {
      if (!this.notTrigger && this.rightModel !== 'follow') this.menuVisible = true;
    },
    // 添加图标
    newAddIcon() {
      this.iconVisible = true;
      this.menuVisible = false;
    },
    /**
     * 暂存布局，与restore结对使用。
     */
    stashLayout() {
      this.stashBound = {
        width: this.$refs.deskContainer.clientWidth,
        height: this.$refs.deskContainer.clientHeight,
      };
    },
    /**
     * 恢复布局
     */
    restoreLayout(rate = 0) {
      if (rate) {
        this.adjustZoom = 1;
        this.update();
        return;
      }
      let bound = {
        width: this.$refs.deskContainer.clientWidth,
        height: this.$refs.deskContainer.clientHeight,
      };
      this.adjustZoom = bound.height / this.stashBound.height;
      this.update();
    },
    /**
     * 获取当前布局的宽高
     * @returns {{width: number, height: number}}
     */
    getLayoutSize() {
      this.currentDesk.layoutSize = {
        width: this.$refs.deskContainer.clientWidth,
        height: this.$refs.deskContainer.clientHeight,
      };
      if (this.currentDesk?.settings?.preparing) {
        message.loading({ content: '此桌面为首次使用，正在为您适配您的桌面…', key: 'preparing' });
        this.setFullScreen(true, () => {
          setTimeout(() => {
            this.$nextTick(() => {
              const fullLayoutSize = {
                width: this.$refs.deskContainer.clientWidth,
                height: this.$refs.deskContainer.clientHeight,
              };
              const settings = this.currentDesk.settings;
              const oldLayoutSize = this.settings.layoutSize;
              settings.cardZoom = (
                (settings.cardZoom * fullLayoutSize.height) /
                oldLayoutSize.height /
                this.adjustZoom
              ).toFixed();
              settings.cardMargin = (
                (settings.cardMargin * fullLayoutSize.height) /
                oldLayoutSize.height /
                this.adjustZoom
              ).toFixed();
              //todo竖屏界面不一样
              message.success({ content: '此桌面为首次使用，已为您适配您的当前窗口。', key: 'preparing' });
              settings.preparing = false;
              this.setFullScreen(false);
              delete settings.layoutSize;
            });
          }, 1000);
        });
      }
      return this.currentDesk.layoutSize;
    },
    setFullScreen(flag, cb) {
      this.stashLayout();
      this.fullScreen = flag;
      this.$nextTick(() => {
        if (flag === false) {
          this.restoreLayout(1);
        } else {
          this.restoreLayout();
        }
        if (cb) cb();
      });
    },
    getAdjustZoom() {
      return this.adjustZoom;
    },
  },
};
</script>

<style lang="scss" scoped>
.grid {
  position: relative;
  //display: inline-block;
  white-space: pre-wrap;
  border-radius: 4px;
  vertical-align: top;
  //left: 0;
  //right: 0;
  margin-right: 1em;
  //height:3000px;
  //max-width: 100%;
}

.trigger {
  pointer-events: none;
}
</style>
<style lang="scss">
.home-widgets {
  .muuri-item {
    padding: 0;
  }

  /**
  .muuri-item {
  }
  */

  .card {
    position: relative;
    border: 0;
    height: 420px;

    &.small {
      height: 204px;
    }

    &.double {
      width: 572px;
      height: 420px;
    }
  }
}
</style>
<style lang="scss" scoped>
.grid {
  position: relative;
  //display: inline-block;
  //width: 43em;
  border-radius: 4px;
  vertical-align: top;

  margin-right: 1em;

  .editing {
    pointer-events: none;
    cursor: move;
  }
}

.btn {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

//@media screen and (min-height: 1020px) and (max-height: 1600px) {
//  #scrollerBar {
//    height: 880px;
//
//    .grid {
//      height: 880px;
//    }
//  }
//}
//
//@media screen and (max-height: 1021px) {
//  #scrollerBar {
//    height: 438px;
//
//    .grid {
//      height: 438px;
//    }
//  }
//}
</style>
