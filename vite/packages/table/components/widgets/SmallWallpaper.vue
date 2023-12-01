<template>
  <Widget
    ref="cardSlot"
    :customIndex="customIndex"
    :desk="desk"
    :menuList="menuList"
    :options="options"
    @pickFilterChange="pickFilterChange"
  >
    <div class="small-wallpaper">
      <div class="absolute inset-0" style="border-radius: 8px; z-index: -1">
        <div v-if="imgList.length <= 0" class="w-full" style="margin-top: 15%; text-align: center">
          <a-empty :image="simpleImage" />
          <div class="item-content">
            <xt-button :h="40" :w="100" size="mini" type="theme" @click="goGallery">去挑选壁纸</xt-button>
          </div>
        </div>
        <div v-else class="h-full w-full">
          <video
            v-if="currentImg.srcProtocol"
            ref="wallpaperVideo"
            autoplay=""
            class="fullscreen-video"
            loop=""
            muted=""
            playsinline=""
            style="border-radius: 8px; object-fit: cover"
          >
            <source id="bgVid" :src="currentImg.srcProtocol" type="video/mp4" />
          </video>
          <img
            v-else-if="currentImg.middleSrc"
            :src="currentImg.middleSrc"
            alt=""
            class="h-full w-full"
            style="border-radius: 8px; object-fit: cover"
            @error="imgError"
          />
          <img
            v-else
            :src="currentImg.src"
            alt=""
            class="h-full w-full"
            style="border-radius: 8px; object-fit: cover"
            @error="imgError"
          />
        </div>
      </div>
      <div
        v-if="imgList.length > 0"
        class="home-blur absolute inset-0 small-blur"
        style="border-radius: 8px; z-index: -1"
      >
        <div class="item-icon flex justify-center items-center pointer mx-auto mt-2" @click="randomImg">
          <Icon :class="randomFlag ? 'replace-it' : ''" class="icon" icon="reload"></Icon>
        </div>
        <div class="flex flex-row mt-2 justify-between px-3">
          <div class="item-icon flex justify-center items-center pointer" @click="lastImg">
            <Icon class="icon" icon="caret-left"></Icon>
          </div>
          <div
            v-if="addressType.name !== 'my'"
            class="item-icon flex justify-center items-center pointer"
            @click="collect"
          >
            <Icon v-if="!isInMyPapers" icon="star"></Icon>
            <Icon v-else icon="star-fill" style="fill: yellow"></Icon>
          </div>
          <div class="item-icon flex justify-center items-center pointer" @click="nextImg">
            <Icon class="icon" icon="caret-right"></Icon>
          </div>
        </div>

        <div class="item-icon flex justify-center items-center pointer mt-2 mx-auto" @click="settingImg">
          <Icon class="icon" icon="desktop"></Icon>
        </div>
      </div>
    </div>
  </Widget>
  <a-drawer v-model:visible="settingVisible" :width="500" placement="right">
    <template #title>
      <div class="text-center">「壁纸」设置</div>
    </template>
    <div class="text-base">壁纸源</div>
    <a-select
      v-model:value="pickFilterValue"
      :bordered="false"
      :options="wallpaperOptions"
      class="w-full h-10 rounded-lg mt-4 text-xs"
      size="large"
      style="background: rgba(42, 42, 42, 1); border: 1px solid rgba(255, 255, 255, 0.1)"
      @change="pickFilterChange($event)"
    >
    </a-select>
  </a-drawer>
</template>

<script>
import Widget from '../card/Widget.vue';
import axios from 'axios';
import { mapActions, mapWritableState } from 'pinia';
import { paperStore } from '../../store/paper';
import { appStore } from '../../store';
import { cardStore } from '../../store/card';
import XtButton from '../../ui/libs/Button/index.vue';

export default {
  name: 'smallWallpaper',
  components: {
    XtButton,
    Widget,
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
    desk: {
      type: Object,
    },
  },
  data() {
    return {
      options: {
        className: 'card small',
        title: '壁纸',
        icon: 'image',
        type: 'MiddleWallpaper',
        noTitle: true,
      },
      menuList: [
        {
          icon: 'shezhi1',
          title: '设置',
          fn: () => {
            this.settingVisible = true;
            this.$refs.cardSlot.visible = false;
          },
        },
      ],
      pickFilterValue: '我的收藏',
      wallpaperOptions: [
        { value: '我的收藏', name: 'my', path: '' },
        { value: '必应壁纸', name: 'bing', path: 'https://cn.bing.com/HPImageArchive.aspx?format=js&idx=1&n=8' },
        { value: '拾光壁纸', path: 'https://api.nguaduot.cn/timeline/v2?client=thisky', name: 'PickingPaper' },
        { value: '贪食鬼', path: 'https://api.nguaduot.cn/glutton/v2?client=thisky', name: 'PickingPaper' },
        { value: '贪吃蛇', path: 'https://api.nguaduot.cn/snake/v2?client=thisky', name: 'PickingPaper' },
        { value: 'wallhaven', path: 'https://api.nguaduot.cn/wallhaven/v2?client=thisky', name: 'PickingPaper' },
        // {value:'动态壁纸',name:'lively',path:'https://api.nguaduot.cn/timeline/v2'}
      ],
      settingVisible: false,
      simpleImage: '/public/img/test/load-ail.png',
      addressType: {
        value: '我的收藏',
        path: '',
        name: 'my',
      },
      imgList: [{ src: '' }],
      currentImg: {
        srcProtocol: null,
        path: '',
      },
      imgIndex: 0,
      randomFlag: false,
    };
  },
  methods: {
    ...mapActions(paperStore, ['removeToMyPaper']),
    ...mapActions(appStore, ['setBackgroundImage']),
    ...mapActions(cardStore, ['updateCustomData']),
    goGallery() {
      this.$router.push({ name: 'my' });
    },
    imgError() {
      this.imgSpin = false;
      this.currentImg.src = '/img/defaultImg.jpg';
    },
    pickFilterChange(e) {
      this.addressType = this.wallpaperOptions.find((i) => i.value === e);
      this.updateCustomData(this.customIndex, this.addressType, this.desk);
      if (!this.addressType) {
        this.addressType = '我的收藏';
      }
      if (this.addressType.path !== '') {
        axios
          .get(this.addressType.path, {})
          .then((res) => {
            this.imgList = [];
            if (res.data.data) {
              let pickImage = res.data.data;
              this.count = res.data.count;
              let animations = ['ani-gray', 'bowen', 'ani-rotate'];
              if (pickImage) {
                pickImage.forEach((img) => {
                  if (img.thumburl !== null) {
                    let thumburl = '';
                    let str = '';
                    let randomIndex = Math.floor(Math.random() * animations.length);
                    if (img.thumburl.indexOf('@') !== -1) {
                      str = img.thumburl.substring(img.thumburl.indexOf('@'), img.thumburl.length);
                      thumburl = img.thumburl.replace(str, '@500w.webp');
                    }
                    if (img.thumburl.indexOf('400') !== -1) {
                      thumburl =
                        img.thumburl.substring(0, img.thumburl.indexOf('400')) +
                        '500' +
                        img.thumburl.slice(img.thumburl.indexOf('400') - img.thumburl.length + 3);
                    }

                    const image = {
                      title: false,
                      src: img.thumburl,
                      path: img.imgurl,
                      resolution: img.size,
                      score: img.score,
                      no: img.no,
                      middleSrc: thumburl,
                      animations: animations[randomIndex],
                    };
                    this.imgList.push(image);
                  }
                });
              }
            } else {
              let images = res.data.images;
              let animations = ['ani-gray', 'bowen', 'ani-rotate'];
              if (images) {
                images.forEach((img) => {
                  let random = Math.random();
                  let randomIndex = Math.floor(Math.random() * animations.length);
                  let image = {
                    title: false, // img.title,
                    src: 'https://cn.bing.com' + img.url,
                    path: 'https://cn.bing.com' + img.url,
                    animation: animations[randomIndex], //['gray','rate'][(Math.random()*2).toFixed()]//''slide','fade','scale',
                  };
                  this.imgList.push(image);
                });
              }
            }
            this.initImg();
          })
          .catch((err) => {
            this.imgList = [];
            this.initImg();
          });
      } else {
        this.imgList = this.myPapers;
        this.initImg();
      }
    },
    initImg() {
      this.imgIndex = 0;
      this.setImg();
    },
    setImg() {
      this.currentImg = this.imgList[this.imgIndex] || {
        srcProtocol: null,
        path: '',
      };
      this.$nextTick(() => {
        if (this.currentImg.srcProtocol) {
          this.$refs.wallpaperVideo.load();
          this.$refs.wallpaperVideo.play();
        }
      });
    },
    lastImg() {
      this.imgIndex -= 1;
      if (this.imgIndex < 0) {
        this.imgIndex = this.imgList.length - 1;
      }
    },
    async nextImg() {
      // if(this.imgIndex>=this.imgList.length-1){
      //   if(this.addressType.name ==='picking') {
      //
      //       let res = await  axios.get(this.addressType.path, {
      //         params: {
      //           no: 5
      //         }
      //       })
      //     if(res.data.data){
      //       let pickImage = res.data.data
      //       this.count = res.data.count
      //       let animations = ["ani-gray", "bowen", "ani-rotate"];
      //       if(pickImage){
      //         pickImage.forEach(img=>{
      //           if(img.thumburl !== null){
      //             let randomIndex = Math.floor(Math.random() * animations.length);
      //             const image = {
      //               title:false,
      //               src:img.thumburl,
      //               path:img.imgurl,
      //               resolution:img.size,
      //               score:img.score,
      //               no:img.no,
      //               animations: animations[randomIndex],
      //             }
      //             this.imgList.push(image)
      //           }
      //         })
      //       }
      //
      //     }else{
      //       this.imgIndex = 0
      //     }
      //
      //   }else {
      //     this.imgIndex = 0
      //   }
      //
      // }
      this.imgIndex += 1;
      if (this.imgIndex >= this.imgList.length) {
        this.imgIndex = 0;
      }
    },
    randomImg() {
      if (this.randomFlag === true) return;
      this.randomFlag = true;
      setTimeout(() => {
        this.randomFlag = false;
        let nmb = parseInt(Math.random() * this.imgList.length);
        this.imgIndex === nmb ? this.randomImg() : (this.imgIndex = nmb);
      }, 500);
    },
    collect() {
      if (this.addressType.name === 'PickingPaper') {
        this.removeToMyPaper(this.imgList[this.imgIndex]);
      } else if (this.addressType.name === 'bing') {
        let image = {
          src: this.imgList[this.imgIndex].src,
          path: this.imgList[this.imgIndex].src,
        };
        this.removeToMyPaper(image);
      }
    },
    settingImg() {
      if (this.addressType.name === 'my') {
        if (this.imgList[this.imgIndex].srcProtocol) {
          this.setBackgroundImage({
            path: '',
            runpath: `file://${this.imgList[this.imgIndex].src}`,
          });
        } else {
          if (!this.imgList[this.imgIndex].path) {
            this.imgList[this.imgIndex].path = this.imgList[this.imgIndex].src;
          }

          this.setBackgroundImage(this.imgList[this.imgIndex]);
        }
      } else {
        this.setBackgroundImage(this.imgList[this.imgIndex]);
      }
    },
  },
  computed: {
    ...mapWritableState(paperStore, ['myPapers']),
    isInMyPapers() {
      return (
        this.myPapers.findIndex((img) => {
          return this.imgList[this.imgIndex].src === img.src;
        }) > -1
      );
    },
  },
  mounted() {
    this.$nextTick(() => {
      if (!this.customData) {
        this.pickFilterChange('我的收藏');
      } else {
        this.pickFilterValue = this.customData.value;
        this.pickFilterChange(this.customData.value);
      }
      this.setImg();
    });
  },
  watch: {
    imgIndex: {
      handler() {
        this.setImg();
      },
    },
  },
};
</script>

<style lang="scss" scoped>
.item-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: var(--primary-bg);
  color: var(--primary-text);
  backdrop-filter: blur(20px);

  .icon {
    height: 36px;
    width: 36px;
  }
}

.small-wallpaper {
  .small-blur {
    background: rgba(0, 0, 0, 0);
    backdrop-filter: blur(0) !important;
    display: none;
  }

  &:hover {
    .small-blur {
      display: block;
    }
  }
}

:deep(.ant-empty-image) {
  height: 60px;
}
</style>
