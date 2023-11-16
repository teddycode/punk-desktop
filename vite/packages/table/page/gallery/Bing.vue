<template>
  <!-- <div class="rotate-center" style="font-size: 2em;margin-bottom: 1em">
    必应壁纸
  </div> -->
  <vue-custom-scrollbar id="containerWrapper" :settings="settingsScroller" style="margin-top: 1.5em;">
    <!--            <lightgallery id="container"-->
    <!--                          :settings="settings"-->
    <!--                          :onInit="onInit"-->
    <!--                          :onBeforeSlide="onBeforeSlide"-->
    <!--            >-->
    <!--              <a class="gallery-item" v-for="image in images" :data-lg-size='image.lgSize' :data-src="image.src"-->
    <!--                 :data-sub-html='image.subHtml'>-->
    <!--                <img-->
    <!--                  class="img-responsive"-->
    <!--                  :src="image.url"-->
    <!--                />-->
    <!--              </a>-->
    <!--            </lightgallery>-->
    <div id="container" class="spotlight-group" data-autoslide="true" data-control="autofit,page,fullscreen,close,zoom"
         data-fit="cover" data-infinite="true" data-play="true">
      <template v-for="dayImages  in bingImages">
        <div>{{ dayImages.day }}</div>
        <a v-for="img in dayImages.images" :data-lg-size='img.lgSize' :href="img.src" class="spotlight ">
          <img :src="img.src" data-animation="my-rotate"/>
        </a>
      </template>

    </div>
    <template v-for="dayImages  in bingImages">
      <div class="mt-3 mb-3 text-white s-text"
           style="color: var(--primary-text);text-align: left;font-size: 20px;font-weight: bold;"> - 第 {{
          dayImages.day
        }} 天 -
      </div>
      <PaperList :list="dayImages.images"></PaperList>
    </template>

  </vue-custom-scrollbar>
</template>

<script>
import axios from 'axios'
import justifiedGallery from 'justifiedGallery'
import { mapActions } from 'pinia'
import PaperList from '../../components/comp/PaperList.vue'
import { paperStore } from '../../store/paper'

export default {
  name: 'Bing',
  components: { PaperList },
  data () {
    return {
      page: 1,
      isLoading: false,
      bingImages: [],//必应壁纸
      settingsScroller: {
        useBothWheelAxes: true,
        swipeEasing: true,
        suppressScrollY: false,
        suppressScrollX: true,
        wheelPropagation: true
      },
    }

  },
  mounted () {
    $('.image-wrapper').on('touchmove', (e) => {
      e.stopPropagation()
    })
    $('.image-item').on('touchend', (e) => {
    })
    justifiedGallery()
    $('#container').justifiedGallery({
      captions: false,
      lastRow: 'hide',
      rowHeight: 180,
      margins: 5
    })
    $('#containerWrapper').scroll(() => {
      if ($('#containerWrapper').scrollTop() + $('#containerWrapper').height() + 20 >= $('#bingImages').prop('scrollHeight') && this.isLoading === false) {
        this.getBingWallPaper(this.page++)
      }
    })

    this.getBingWallPaper(this.page++, () => {
      this.getBingWallPaper(this.page++).then()
    })

  },
  methods: {
    ...mapActions(paperStore, ['addToMyPaper']),

    getBingWallPaper (page, cb) {
      if (page > 7) {
        return
      }
      this.isLoading = true
      let url = `https://cn.bing.com/HPImageArchive.aspx?format=js&idx=${page}&n=8`
      let imagesResult = axios.get(url).then((imagesResult) => {
        if (imagesResult.status === 200) {
          let dayImages = []
          let images = imagesResult.data.images
          //let animations = ['a-fadeout','a-fadeoutT', 'a-fadeoutR', 'a-fadeoutB', 'a-fadeoutL','a-rotateoutLT', 'a-rotateoutLB', 'a-rotateoutRT', 'a-rotateoutRB', 'a-flipout', 'a-flipoutX', 'a-flipoutY']
          let animations = ['ani-gray', 'bowen', 'ani-rotate']
          if (images) {
            images.forEach(img => {
              let random = Math.random()
              let randomIndex = Math.floor((Math.random() * animations.length))
              let image = {
                title: false,// img.title,
                src: 'https://cn.bing.com' + img.url,
                path: 'https://cn.bing.com' + img.url,
                animation: animations[randomIndex]//['gray','rate'][(Math.random()*2).toFixed()]//''slide','fade','scale',
              }
              dayImages.push(image)
            })
            this.bingImages.push({
              day: page,
              images: dayImages
            })
            this.$nextTick(() => {

              this.isLoading = false
              if (cb) cb()
              // setTimeout(()=>{
              //
              // },500)
            })
          }

        }
      }).catch((err) => {
      })
    },
  }
}
</script>

<style lang="scss" scoped>
@import 'justifiedGallery/dist/css/justifiedGallery.min.css';

.s-text {
  text-shadow: none;
}
</style>
