<template>
    <dv-border-box10 class="desktop-box">
        <div class="desktop-header">
            <router-link to="/FileEdit" class="desktop-title-link">
                <div class="desktop-title">桌面管理</div>
            </router-link>
            <el-switch v-model="isOn" active-color="#13ce66" inactive-color="#ff4949"></el-switch>
        </div>
        <div v-if="isOn" class="desktop-content">
            <div class="desktop-item" v-for="item in items" :key="item.id">
                <img :src="require(`@/assets/${item.name}.png`)" alt="" class="icon">
                <div class="desktop-item-name">{{ item.name }}</div>
            </div>
        </div>
        <div v-else class="desktop-content">
            <div class="main-left-center-tip">
                <font-awesome-icon icon="exclamation-circle" class="tip-icon"/>
                您没有打开桌面管理器！
            </div>
        </div>
    </dv-border-box10>
</template>

<script>
import { ref } from 'vue'

export default {
    name: "DesktopManagement",
    setup() {
        const isOn = ref(true)
        const items = ref([
            { id: 1, name: 'word' },
            { id: 2, name: 'wps' },
            { id: 3, name: 'steam' },
            { id: 4, name: 'Typora' },
            { id: 5, name: 'wechat' },
            { id: 6, name: 'QQ' },
        ])

        return { isOn, items }
    }
}
</script>

<style scoped>
.desktop-box {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 120%;
    height: 100%;
}

.desktop-header {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
}

.desktop-title{
    color: #5ab1ef;
    font-size: x-large;
    text-align: center;
}
.desktop-title-link {
    text-decoration: none;
}
.desktop-header .el-switch {
    position: absolute;
    right: 10px;
}

.desktop-content {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    height: 80%;
}

.desktop-item {
    width: 33.33%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.icon {
    width: 50px;
    height: 50px;
}

.main-left-center-tip{
    height: 30%;
    font-size: x-large;
    margin-bottom: 20px;
    color: white;
    text-align: center;
}

.tip-icon {
    color: deepskyblue;
}
.desktop-item-name{
    color: white;
}
</style>
