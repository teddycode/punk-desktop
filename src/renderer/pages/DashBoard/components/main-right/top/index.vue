<template>
  <div class="main-right-top-area">
    <dv-border-box11>
      <div class="swiper-title">
        系统功能
      </div>
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
        <SwiperSlide v-for="(func, index) in functions" :key="index">
          <div @click="goToSysFunc(func)">
            <div class="feature-content">
              <font-awesome-icon :icon="func.icon" class="feature-icon" size="3x"/>
              <h2 class="feature-title">{{ func.title }}</h2>
              <p class="feature-description">{{ func.description }}</p>
            </div>
          </div>
        </SwiperSlide>
        <div class="swiper-button-prev" @click.stop="prevEl"/>
        <div class="swiper-button-next" @click.stop="nextEl"/>
      </Swiper>
      <div class="swiper-pagination">
      </div>
    </dv-border-box11>
  </div>
</template>

<script lang="ts">
import {defineComponent, ref, computed} from 'vue';
import {Swiper, SwiperSlide} from "swiper/vue";
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
import {useRouter} from "vue-router";
import {storeToRefs} from "pinia";
import {useBaseStore} from "@store/baseboard";

export default defineComponent({
  name: "MainRightTop",
  components: {Swiper, SwiperSlide, FontAwesomeIcon},
  setup() {
    const store = useBaseStore();
    const router = useRouter();
    const swiperRef = ref(null);
    const onSwiper = (swiper: any) => {
      swiperRef.value = swiper;
      console.log(swiper);
    };
    const onSlideChange = () => {
      // console.log('slide change');
    };
    const prevEl = () => {
      swiperRef?.value.slidePrev();
    };
    const nextEl = () => {
      swiperRef?.value.slideNext();
    };
    const functions = ref([
      {
        id: 1,
        title: '交易',
        router: 'ExchangePage',
        description: '关于交易的描述.',
        icon: faExchangeAlt,
      },
      {
        id: 2,
        title: '转账',
        router: 'TransferPage',
        description: '关于转账的描述.',
        icon: faHandHoldingUsd,
      },
      {
        id: 3,
        title: '藏品',
        router: 'CollectionPage',
        description: '关于藏品的描述.',
        icon: faGem,
      },
      {
        id: 4,
        title: '网络',
        router: 'NetworkPage',
        description: '关于网络的描述.',
        icon: faSitemap,
      },
      {
        id: 5,
        title: '治理',
        router: 'GovernancePage',
        description: '关于治理的描述.',
        icon: faGavel,
      },
      {
        id: 6,
        title: '共识',
        router: 'ConsensusPage',
        description: '关于共识的描述.',
        icon: faHandsHelping,
      },
      {
        id: 7,
        title: '计算',
        router: 'ComputingPage',
        description: '关于计算的描述.',
        icon: faCalculator,
      },
      {
        id: 8,
        title: '存储',
        router: 'StoragePage',
        description: '关于存储的描述.',
        icon: faDatabase,
      },
      {
        id: 9,
        title: '密码',
        router: 'CryptoPage',
        description: '关于密码的描述.',
        icon: faLock,
      },
    ]);

    const {currentPage} = storeToRefs(store);
    const setCurrentPage = (page: string) => store.setCurrentPage(page);
    const goToSysFunc = (func: any) => {
      setCurrentPage(func.title);
      router.push({name: func.router});
    };
    return {
      onSwiper,
      onSlideChange,
      prevEl,
      nextEl,
      functions,
      currentPage,
      goToSysFunc,
      modules: [Navigation, Pagination, Scrollbar, A11y, Autoplay, EffectFlip],
    };
  },
});
</script>


<style lang="scss" scoped>
.main-right-top-area {
  height: 42%;
}

.swiper-title {
  font-size: 1.5rem;
  padding-top: 12px;
  color: #5ab1ef;
}

.features {
  display: flex;
  justify-content: center;
  margin-top: 36px;
}

.feature-content {
  margin-top: 20px;
  padding: 30px;
}

.feature-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
  color: white;
}

.feature-description {
  font-size: 16px;
  color: #888;
}

.swiper {
  position: relative;
  transform: scale(1, 1.1);
}

.swiper-pagination {
  bottom: 6px;
  width: 120%;
  text-align: center;
}

swiper {
  width: 100%;
  swiper-slide {
    height: 120%;
    box-shadow: 0 3px 6px 1px rgba(0, 0, 0, 0.16);
    border-radius: 4px 4px 4px 4px;
    opacity: 1;
    border: 1px solid #E4E5EA;
    width: 100%;
    background: #F9FAFE;
  }
}

.button-prev {
  top: 66px;
  margin-left: 6px;
}

.button-next {
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
  margin-top: 20px;
  margin-bottom: 20px;
  color: #ffffff; /* 更改此值为你想要的颜色 */
  font-size: 28px; /* 更改此值为你想要的大小 */
}

</style>
