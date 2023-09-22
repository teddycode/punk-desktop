<template>
  <div class="main-right-swiper">
    <dv-border-box11>
      <div class="main-right-swiper-title">系统主要功能</div>
      <Swiper :autoplay="{delay: 10000,disableOnInteraction: false}"
              :loop="true"
              :modules="modules"
              :pagination="{ clickable: true }"
              :slides-per-view="1"
              :space-between="50"
              effect="flip"
              navigation="navigation"
              @slideChange="onSlideChange"
              @swiper="onSwiper">
        <SwiperSlide v-for="(feature, index) in features" :key="index">
          <div @click="goToFeature(feature)">
            <div class="feature-content">
              <font-awesome-icon :icon="feature.icon" class="feature-icon" size="3x"/>
              <h2 class="feature-title">{{ feature.title }}</h2>
              <p class="feature-description">{{ feature.description }}</p>
            </div>
          </div>
        </SwiperSlide>
        <div class="swiper-button-prev" @click.stop="prevEl(item, index)"/>
        <div class="swiper-button-next" @click.stop="nextEl"/>
      </Swiper>
      <div class="swiper-pagination"></div>
    </dv-border-box11>
  </div>
</template>

<script>
import {Swiper, SwiperSlide} from "swiper/vue";
import {ref} from "vue-demi";
import {A11y, Autoplay, EffectFlip, Navigation, Pagination, Scrollbar} from "swiper";
import {
  faCalculator,
  faDatabase,
  faExchangeAlt,
  faGavel,
  faGem,
  faHandHoldingUsd,
  faHandsHelping,
  faLock,
  faSitemap
} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import 'swiper/swiper-bundle.css';
import {mapMutations} from "vuex";

export default {
  name: "main-right-swiper",
  components: {Swiper, SwiperSlide, FontAwesomeIcon},
  setup() {
    const swiperRef = ref(null)
    const onSwiper = (swiper) => {
      swiperRef.value = swiper
      console.log(swiper);
    };
    const onSlideChange = () => {
      console.log('slide change');
    };
    const prevEl = () => {
      if (swiperRef.value) {
        swiperRef.value.slidePrev()
      }
      console.log('上一张')
    }
    const nextEl = () => {
      if (swiperRef.value) {
        swiperRef.value.slideNext()
      }
      console.log('下一张')
    }
    return {
      onSwiper,
      onSlideChange,
      prevEl,
      nextEl,
      modules: [Navigation, Pagination, Scrollbar, A11y, Autoplay, EffectFlip],
    };
  },
  data() {
    return {
      features: [
        {
          id: 1,
          title: '交易',
          description: '关于交易的描述.',
          icon: faExchangeAlt,
        },
        {
          id: 2,
          title: '转账',
          description: '关于转账的描述.',
          icon: faHandHoldingUsd,
        },
        {
          id: 3,
          title: '藏品',
          description: '关于藏品的描述.',
          icon: faGem,
        },
        {
          id: 4,
          title: '网络',
          description: '关于网络的描述.',
          icon: faSitemap,
        },
        {
          id: 5,
          title: '治理',
          description: '关于治理的描述.',
          icon: faGavel,
        },
        {
          id: 6,
          title: '共识',
          description: '关于共识的描述.',
          icon: faHandsHelping,
        },
        {
          id: 7,
          title: '计算',
          description: '关于计算的描述.',
          icon: faCalculator,
        },
        {
          id: 8,
          title: '存储',
          description: '关于存储的描述.',
          icon: faDatabase,
        },
        {
          id: 9,
          title: '密码',
          description: '关于密码的描述.',
          icon: faLock,
        },
      ],
    }
  },
  computed: {
    currentPage() {
      return this.$store.state.currentPage;
    }
  },
  methods: {
    ...mapMutations(['setCurrentPage']),
    goToFeature(feature) {
      console.log("feature:", feature)
      this.$emit('featureClicked', feature);
      this.setCurrentPage(feature.title)
      if (feature.title === '共识') {
        this.$router.push({name: 'ConsensusPage'});
      } else if (feature.title === '存储') {
        this.$router.push({name: 'StoragePage'});
      } else if (feature.title === '计算') {
        this.$router.push({name: 'ComputingPage'});
      } else if (feature.title === '交易') {
        this.$router.push({name: 'TransactionPage'});
      } else if (feature.title === '转账') {
        this.$router.push({name: 'TransferPage'});
      } else if (feature.title === '治理') {
        this.$router.push({name: 'GovernancePage'});
      } else if (feature.title === '网络') {
        this.$router.push({name: '/NetworkPage'});
      } else if (feature.title === '藏品') {
        this.$router.push({name: 'CollectionPage'});
      } else if (feature.title === '密码') {
        this.$router.push({name: 'CryptoPage'});
      }
    },
  }
}
</script>

<style lang="scss">
.main-right-swiper {
  height: 35%;
}

.features {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}

.feature-content {
  padding: 20px;

}

.feature-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
  color: white;
}

.feature-description {
  font-size: 14px;
  color: #888;
}

.swiper {
  position: relative;
}

.swiper-pagination {
  position: absolute;
  bottom: 10px;
  left: 0;
  width: 100%;
  text-align: center;
}

swiper {
  width: 100%;

  swiper-slide {
    height: 100%;
    box-shadow: 0 3px 6px 1px rgba(0, 0, 0, 0.16);
    border-radius: 4px 4px 4px 4px;
    opacity: 1;
    border: 1px solid #E4E5EA;
    width: 100%;
    background: #F9FAFE;
  }
}

.button-prev {
  position: absolute;
  top: 66px;
  left: -45px;
}

.button-next {
  position: absolute;
  top: 66px;
  right: -45px;
}

.swiper-pagination-bullet {
  opacity: 1;
  background: #ccc; /* 更改此值为你想要的颜色 */
}

.swiper-pagination-bullet-active {
  opacity: 1;
  background: deepskyblue;
}

.feature-icon {
  margin-bottom: 15px;
  color: #ffffff; /* 更改此值为你想要的颜色 */
  font-size: 24px; /* 更改此值为你想要的大小 */
}

.main-right-swiper-title {
  padding-top: 20px;
  color: #5ab1ef;
}
</style>