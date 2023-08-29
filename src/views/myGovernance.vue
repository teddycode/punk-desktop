<template>
    <MainBackground>
        <div class="governance-page">
            <h1 class="governance-title">治理</h1>
            <div class="content-container">
                <div class="side-div left-div">
                    <div class="upper-div">
                        <self-info></self-info>
                    </div>
                    <div class="lower-div">
                        <tool-box></tool-box>
                    </div>
                </div>
                <div class="center-div">
                    <div class="nav-container">
                        <button class="nav-btn">共识</button>
                        <button class="nav-btn">网络</button>
                        <button class="nav-btn">公共物品</button>
                        <button class="nav-btn">交易</button>
                        <button class="nav-btn">国库</button>
                    </div>
                    <div class="white-boxes">
                        <div class="white-box">最新提出</div>
                        <div class="white-box">数据看板</div>
                        <div class="white-box">热门提案</div>
                        <div class="white-box">正在评议</div>
                    </div>
                </div>
                <div class="side-div right-div">
                    <div class="upper-div">
                        <new-proposal></new-proposal>
                    </div>
                    <div class="lower-div">
                        <my-proposals></my-proposals>
                    </div>
                </div>
            </div>
        </div>
    </MainBackground>
</template>

<script>
import MainBackground from "@/components/MainBackground.vue";
import selfInfo from "@/views/Governances/selfInfo.vue";
import toolBox from "@/views/Governances/toolBox.vue";
import newProposal from "@/views/Governances/newProposal.vue";
import myProposals from "@/views/Governances/myProposals.vue";
export default {
    components:{
        MainBackground,selfInfo,toolBox,newProposal,myProposals
    },
    data() {
        return {
        };
    },
};
</script>

<style scoped>
.governance-page {
    padding: 2rem;
    height: 100%;
}

.governance-title {
    font-size: 1.875rem;
    margin-bottom: 2rem;
    text-align: center;
    color: white;
}

.content-container {
    display: flex;
    justify-content: space-between;
    height: 90%;
    align-items: stretch;
}

.center-div {
    border: 2px solid white;
    border-radius: 15px;
    box-sizing: border-box;
    background-color: transparent;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start; /* Change here */
}

.nav-container {
    display: flex;
    justify-content: space-between;
    width: 95%;
    margin: 20px;
    background-color: #2D3748;
    padding: 10px;
}


.nav-btn {
    color: white;
    padding: 10px 20px;
    background-color: transparent;
    border-radius: 5px;
    border: none;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.nav-btn:hover {
    background-color: #4FD1C5; /* 当鼠标悬停时的颜色变化 */
}

.left-div, .right-div {
    flex: 2;
    margin-right: 3%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.right-div {
    margin-right: 0;
    margin-left: 3%;
}

.center-div {
    flex: 5;
}

.upper-div, .lower-div {
    border: 2px solid white;
    border-radius: 15px;
    box-sizing: border-box;
    background-color: transparent;
}

.upper-div {
    height: 65%;
}

.lower-div {
    height: 30%;
}
.white-boxes {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    width: 95%;
    height: 90%;
}

.white-box {
    color: white;
    font-size: 1.5rem;
    margin-top: 3%;
    flex-basis: calc(50% - 1%);
    height: 40%;
    border: 2px solid white;
    border-radius: 15px;
    box-sizing: border-box;
    background-color: transparent;
}
</style>
