<template>
    <dv-border-box10 class="dapp-square">
        <div class="apps-container">
            <h2 class="title">应用广场</h2>
            <div class="section">
                <h3 class="subtitle">最近常用</h3>
                <div class="app-grid">
                    <div v-for="app in recentApps" :key="app.name" class="app-card">
                        <img :src="app.icon" alt="" class="app-icon">
                        <p class="app-name">{{ app.name }}</p>
                    </div>
                </div>
            </div>
            <div class="section">
                <h3 class="subtitle">推荐dapp</h3>
                <Swiper
                    :slides-per-view="3"
                    :space-between="10"
                    :autoplay="{delay: 2000,disableOnInteraction: false}"
                    :loop="true"
                    :modules="modules"
                    class="mySwiper">
                    <SwiperSlide v-for="app in commonApps" :key="app.name" class="swiper-slide">
                        <img :src="app.icon" :alt="app.name" class="app-icon">
                        <p class="app-name">{{ app.name }}</p>
                    </SwiperSlide>
                </Swiper>
            </div>
            <add-node-button class="dapp-button">探索更多</add-node-button>
        </div>
    </dv-border-box10>
</template>

<script>
import { ref } from 'vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css';
import 'swiper/swiper-bundle.css';
import  { Autoplay } from 'swiper';
import AddNodeButton from "@/components/buttons/addnodeButton.vue";

export default {
    name: "main-right-dapp",
    components: { AddNodeButton, Swiper, SwiperSlide },
    setup() {
        return {
            recentApps: ref([
                { name: 'Uniswap', icon: '/images/dapps/uniswap.png' },
                { name: 'MakerDAO', icon: '/images/dapps/maker.webp' },
                { name: 'Compound', icon: '/images/dapps/compound.png' },
            ]),
            commonApps: ref([
                { name: 'Uniswap', icon: '/images/dapps/uniswap.png' },
                { name: 'MakerDAO', icon: '/images/dapps/maker.webp' },
                { name: 'Compound', icon: '/images/dapps/compound.png' },
                { name: 'CryptoKitties', icon: '/images/dapps/CryptoKitties.webp' },
            ]),
            modules:[Autoplay],
        };
    },
}
</script>


<style scoped>
.dapp-square{
    height: 45%;
}
.title{
    padding-top: 10px;
    font-size: 1.5rem;
    color: #5ab1ef;
}
.dapp-button{
    width: 40%;
    height: 20%;
}

.section {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.5rem;
}

.subtitle {
    margin-left: 10px;
    font-size: 1rem;
    color: #5ab1ef;
    flex-shrink: 0;
    margin-right: 10px;
}

.app-grid {
    display: flex;
    justify-content: space-between;
    flex-grow: 1;
}

.mySwiper {
    width: 100%;
}

.swiper-slide {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.app-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: calc(33.33% - 10px); /* 考虑到每个卡片间有10px的间距 */
}

.app-icon {
    width: 50px;
    height: 50px;
}

.app-name {
    /*margin-top: 0.5rem;*/
    text-align: center;
    color:white;
}
</style>
