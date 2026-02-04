<template>
  <div
    :data-index="index"
    :style="[iconSize]"
    class="cursor-pointer rounded-xl xt-hover black xt-base-btn flex-col justify-around"
    @click.stop="iconClick($event)"
  >
    <div
      :data-index="index"
      :style="[bgSize, backgroundState]"
      class="xt-text overflow-hidden no-drag flex items-center justify-center rounded-xl w-full"
    >
      <!--      <img-->
      <!--        v-if="src && src.length > 0"-->
      <!--        :data-index="index"-->
      <!--        :src="renderIcon(src)"-->
      <!--        :style="[imgSize, radiusState, imgStateStyle]"-->
      <!--        alt=""-->
      <!--      />-->
      <div class="w-[64px] h-[64px] rounded-xl xt-bg flex items-center justify-center">
        <div style="width: 45px; height: 45px" class="flex items-center justify-center">
          <a-avatar
            :data-index="index"
            v-if="src && src.length > 0"
            :size="44"
            shape="square"
            :src="renderIcon(src)"
          ></a-avatar>
        </div>
      </div>
    </div>
    <div v-if="isTitle" :data-index="index" :style="[textSize]" class="text-center xt-text h-5 truncate mx-auto">
      <p :style="{ color: isBoxed ? 'black' : this.iconTextColor }">{{ titleValue }}</p>
    </div>
  </div>
  <XtGuided v-if="visible" @close="visible = false"></XtGuided>
</template>

<!-- 应用图标 -->
<script>
import { message } from 'ant-design-vue';
import editProps from '../hooks/editProps';
import { sizeValues } from './iconConfig';
import { renderIcon } from '@js/common/common';
import { cardStore } from '@store/card';
import { mapWritableState } from 'pinia';

export default {
  mixins: [editProps],
  props: {
    isReSize: { type: Boolean, default: false },
    state: { type: Boolean, default: false },
    index: { type: Number },
    isBoxed: { type: Boolean, default: false },
  },
  data() {
    return {
      visible: false,
    };
  },
  mounted() {
    // console.log('图标尺寸：', this.imgSize);
  },
  computed: {
    // 动态切换圆角状态
    ...mapWritableState(cardStore, ['iconTextColor']),
    radiusState() {
      if (this.state) return;
      if (this.isRadius)
        return {
          borderRadius: this.radius + '%',
        };
      else return { borderRadius: '0px' };
    },
    // 动态切换背景状态
    backgroundState() {
      if (this.state) return;
      if (this.isBackground) return { background: this.backgroundColor };
      else return { background: 'none' };
    },
    iconSize() {
      return this.getSizeValues(this.size).iconSize;
    },
    textSize() {
      let textSize = this.getSizeValues(this.size).textSize;
      if (this.size === 'icons1' || this.size === 'icons2') {
        textSize['font-size'] = '12px';
        textSize['margin-top'] = '4px';
      } else {
        textSize['font-size'] = '14px';
      }
      return textSize;
    },
    imgSize() {
      return this.getSizeValues(this.size).imgSize;
    },
    bgSize() {
      return this.getSizeValues(this.size).bgSize;
    },
    imgStateStyle() {
      return {
        'object-fit': this.imgState,
      };
    },
  },
  watch: {
    imgShape(newV) {},
  },
  methods: {
    renderIcon,
    getSizeValues(size) {
      if (this.isReSize) {
        size = 'mini';
      }

      let { w, h } = sizeValues[size];

      let imgW = sizeValues[size][this.imgShape].w;
      let imgH = sizeValues[size][this.imgShape].h;

      if (this.imgShape !== 'square') {
        imgH = this.isTitle ? imgH : imgH + 20;
      }
      let bgH = this.size === 'icons1' || this.size === 'icons2' ? imgH : this.isTitle ? h - 20 : h;
      return {
        bgSize: {
          width: `${w}px`,
          height: `${bgH}px`,
        },
        iconSize: {
          width: `${w}px`,
          height: `${h}px`,
        },
        textSize: {
          width: `${w - 20}px`,
          'font-size': '1px',
        },
        imgSize: {
          width: `${imgW}px`,
          height: `${imgH}px`,
        },
      };
    },
    closeModal() {
      window.open('https://www.apps.vip/download/');
      this.visible = false;
    },
    // 单图标点击执行app
    iconClick(event) {
      try {
        console.log('点击信息: ', JSON.stringify(this?.open));
        if (event.ctrlKey && event.button === 0) {
          this.$emit('custom-event');
          return;
        }
        if (this.open !== undefined && this.open.value !== '') {
          // 链接
          this.newOpenApp();
        } else if (this.link !== '') {
          // 其他应用
          this.openApp(this.linkValue);
        } else message.error('你还未设置链接/快捷方式');
      } catch (e) {
        console.log(e);
        message.error('应用打开失败！');
      }
    },
    // 新版app打开方式
    newOpenApp() {
      switch (this.open.type) {
        // 默认浏览器
        case 'default':
          browser.openInSystem(this.open.value);
          break;
        // 嵌入浏览器
        case 'internal':
          browser.openInTable(this.open.value, { wallet: this?.open?.wallet });
          break;
        // 磐古跨链客户端
        case 'thinksky':
          browser.openInInner(this.open.value);
          break;
        // 轻应用
        case 'lightApp':
          ipc.send('executeAppByPackage', {
            package: this.open.value,
          });
          break;
        // 酷应用
        case 'coolApp':
          this.$router.push({ name: 'app', query: this.open.value });
          break;
        // 本地应用
        case 'tableApp':
          require('electron').shell.openPath(require('path').normalize(this.open.value));
          break;
        // 桌面内嵌页面，由route跳转并携带参数
        case 'pageApp':
          let route = { name: this.open?.route, query: { data: this.open?.params } };
          console.log('跳转路由：', route);
          this.$router.push(route);
          break;
        // dapp小程序
        case 'Dapp':
          console.log("跳转Dapp详情页，ID：",this.open);
          this.$router.push({ name: 'DappDetails', params: { id: this.open.dappId } });
          break;
        // 应用市场弹窗
        case 'sysPage':
          // 触发事件通知父组件打开 NewDAppCard
          this.$emit('open-dapp-market');
          break;
        // 系统应用
        // case "systemApp":
        //   if (this.open.value.event === "fullscreen") {
        //     tsbApi.window.setFullScreen(this.full);
        //   } else if (this.open.value.event === "/status") {
        //     this.$router.push({ path: "/status" });
        //   } else if (this.linkValue.data) {
        //     this.$router.push({ name: "app", params: this.linkValue.data });
        //   } else this.$router.push({ name: this.linkValue.event });
        //   break;
        default:
          this.openApp();
      }
    },
    // 复制来到 旧版打开app
    openApp() {
      if (typeof this.linkValue === 'object' && this.linkValue.type) {
        switch (this.linkValue.type) {
          case 'systemApp':
            if (this.linkValue.event === 'fullscreen') {
              // 这里不知道啥意思linkValue
              this.full = !this.full;
              tsbApi.window.setFullScreen(!this.full);
            } else if (this.linkValue.event === '/status') {
              if (this.$route.path === '/status') this.$router.go(-1);
              else this.$router.push({ path: '/status' });
            } else if (this.linkValue.data) {
              this.$router.push({ name: 'app', query: this.linkValue.data });
            } else this.$router.push({ name: this.linkValue.event });
            break;
          case 'coolApp':
            this.$router.push({ name: 'app', query: this.linkValue.data });
            break;
          case 'localApp':
            require('electron').shell.openPath(this.linkValue.path);
            break;
          case 'lightApp':
            ipc.send('executeAppByPackage', {
              package: this.linkValue.package,
            });
            break;
          default:
            require('electron').shell.openPath(this.linkValue.path);
        }
      } else if (this.linkValue) {
        this.linkValue.path
          ? require('electron').shell.openPath(this.linkValue.path)
          : require('electron').shell.openPath(require('path').normalize(this.linkValue));
      }
    },
  },
};
</script>

<style lang="scss" scoped></style>
