<template>
    <MainBackground>
    <div class="proposal-home-page">
        <div class="left-section">
            <div class="header">
                <h1 class="title">提案</h1>
                <addnode-button>创建提案</addnode-button>
            </div>
            <div class="proposal-card">
                一条提案
            </div>
        </div>
        <div class="right-section">
            <div class="upper-div">
                <self-info></self-info>
            </div>
            <div class="lower-div">
                <my-entrust></my-entrust>
            </div>
        </div>
    </div>
    </MainBackground>
</template>

<script>
import MainBackground from "@/components/MainBackground.vue";
import addnodeButton from "@/components/buttons/addnodeButton.vue";
import selfInfo from "@/views/Governances/selfInfo.vue";
import myEntrust from "@/views/Governances/myEntrust.vue";

export default {
    name: "proposalHomePage",
    components:{
        MainBackground,addnodeButton,selfInfo,myEntrust,
    }
}
</script>

<style scoped>
.proposal-home-page {
    display: flex;
    justify-content: space-between;
    margin-top: 5%;
    height: 80%;
}

.left-section {
    margin-left: 2%;
    flex: 6;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.header {
    display: flex;
    justify-content: space-between;
    width: 90%;
}

.title {
    font-size: 1.5rem;
    margin-right: 1rem;
    color: white;
}


.proposal-card {
    color: white;
    width: 90%;
    height: 25%;
    border: 2px solid white;
    margin-top: 2%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.right-section {
    flex: 3;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.upper-div, .lower-div {
    border: 2px solid white;
    width: 90%;
    margin-right: 5%;
}

.upper-div {
    height: 50%;
}

.lower-div {
    height: 30%;
    margin-bottom: 10%;
}
</style>
