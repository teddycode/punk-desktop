<template>
    <MainBackground>
        <div class="proposal-detail">
            <div class="header">
                <div class="proposal-title">提案标题</div>
                <div class="details">
                    <span>创建者: <span>xxh</span></span>
                    <span>编号: <span>1234</span></span>
                    <span>类型: <span>hello</span></span>
                    <span>状态: <span>{{ status }}</span></span>
                </div>
            </div>
            <div class="content">
                <div class="left-section"></div>
                <div class="right-section"></div>
            </div>
        </div>
    </MainBackground>
</template>

<script>
import MainBackground from "@/components/MainBackground.vue";
export default {
    name: "OneProposals",
    components:{
        MainBackground
    },
    data() {
        return {
            status: '' // 初始状态，您可以根据实际情况修改
        }
    }
}
</script>

<style scoped>
.proposal-detail {
    width: 90%; /* 修改宽度为90% */
    margin-left: 5%; /* 左边间距5% */
    margin-right: 5%; /* 右边间距5% */
    margin-top: 5%;
    height: 80%;
    color: white;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.header {
    width: 70%;
    height: 10%;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.proposal-title, .details span {
    margin-bottom: 5px;
    align-self: flex-start; /* 标题靠左 */
}
.proposal-title{
    font-size: 2rem; /* 字体放大一号 */
}
.details {
    display: flex;
    gap: 20px;
    align-self: flex-start; /* 详情靠左 */
    margin-top: 3%;
    font-size: 1.5rem; /* 字体放大一号 */
}

.content {
    margin-top: 3%;
    width: 90%;
    height: 80%;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.left-section {
    width: 70%;
    height: 100%;
    border: 1px solid white;
}

.right-section {
    width: 25%;
    height: 100%;
    border: 1px solid white;
}
</style>
