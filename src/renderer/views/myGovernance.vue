<template>
    <MainBackground>
        <div class="governance-page">
            <h1 class="governance-title">治理</h1>
            <div class="content-container">
                <div class="side-div left-div">
                    <div class="upper-div">
                        <process-guide></process-guide>
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
                    <div class="main-content">

                        <div class="content-box">
                            <div class="box-title">
                                <div class="box-title-left">最新提出</div>
                                <div class="box-title-more" @click="navigateToProposalsList">更多>></div>
                            </div>
                            <div class="box-main-content">
                                <img src="/images/modules/governance/pos_gov.jpg" alt="" class="main-img" @click="navigateToProposalInformation">
                            </div>
                        </div>

                        <div class="content-box">
                            <div class="box-title">
                                <div class="box-title-left">数据看板</div>
                                <div class="box-title-more" @click="navigateToProposalsList">更多>></div>
                            </div>
                            <div class="box-main-content">
                                <img src="/images/modules/governance/treasure.jpg" alt="" class="main-img">
                            </div>
                        </div>

                        <div class="content-box">
                            <div class="box-title">
                                <div class="box-title-left">热门提案</div>
                                <div class="box-title-more" @click="navigateToProposalsList">更多>></div>
                            </div>
                            <div class="box-main-content">
                                <ul class="proposal-list">
                                    <li @click="navigateToProposalInformation">Proof-of-Stake 网络的区块奖励调整提案</li>
                                    <li @click="navigateToProposalInformation">去中心化金融 (DeFi) 协议的安全增强提案</li>
                                    <li @click="navigateToProposalInformation">跨链桥接协议的多链集成提案</li>
                                    <li @click="navigateToProposalInformation">稳定币发行和抵押品参数的调整</li>
                                    <li @click="navigateToProposalInformation">区块链社区治理流程改进提案</li>
                                </ul>
                            </div>
                        </div>
                        
                        <div class="content-box">
                            <div class="box-title">
                                <div class="box-title-left">正在评议</div>
                                <div class="box-title-more" @click="navigateToProposalsList">更多>></div>
                            </div>
                            <div class="box-main-content">
                                <ul class="proposal-list">
                                    <li @click="navigateToProposalInformation">Proof-of-Stake 网络的区块奖励调整提案</li>
                                    <li @click="navigateToProposalInformation">去中心化金融 (DeFi) 协议的安全增强提案</li>
                                    <li @click="navigateToProposalInformation">跨链桥接协议的多链集成提案</li>
                                    <li @click="navigateToProposalInformation">稳定币发行和抵押品参数的调整</li>
                                    <li @click="navigateToProposalInformation">区块链社区治理流程改进提案</li>
                                </ul>
                            </div>
                        </div>
                        <!-- <div class="white-box">最新提出</div>
                        <div class="white-box">数据看板</div>
                        <div class="white-box">热门提案</div>
                        <div class="white-box">正在评议</div> -->
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
import processGuide from "@/views/Governances/processGuide.vue";
import toolBox from "@/views/Governances/toolBox.vue";
import newProposal from "@/views/Governances/newProposal.vue";
import myProposals from "@/views/Governances/myProposals.vue";
export default {
    components:{
        MainBackground,processGuide,toolBox,newProposal,myProposals
    },
    data() {
        return {
        };
    },
    methods: {
        navigateToProposalInformation() {
            this.$router.push({ path: '/Governances/OneProposals' });
        },
        navigateToProposalsList() {
            this.$router.push({ path: '/Governances/proposalHomePage' });
        },
    }
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
.main-content {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    width: 95%;
    height: 90%;
}

/* .white-box {
    color: white;
    font-size: 1.5rem;
    margin-top: 2%;
    padding-top: 2%;
    flex-basis: calc(50% - 1%);
    height: 40%;
    border-bottom-width: 1px;
    border-bottom-style: solid;
    border-bottom-color: rgb(202, 224, 243);
    background-color: transparent;
} */
.content-box {
    padding-top: 2%;
    flex-basis: calc(50% - 3%);
    height: 40%;
    color: white;
}

.proposal-list {
    padding-left: 10%;
    margin-top: 3%;
    font-size: 1rem;
    list-style-type: none;
}

.proposal-list li::marker{
    color:white ;
}

.proposal-list li{
    margin-bottom: 3%;
    list-style-type: disc;
}

.box-title {
    font-size: 1.2rem;
    text-align: left;
    padding-left: 4%;
    border-bottom-width: 1px;
    border-bottom-style: solid;
    border-bottom-color: rgb(202, 224, 243);
}

.box-main-content{
    text-align: left;
}

.box-title-left{
    display: inline-block;
    color: #1479d7;
    border-bottom-width: 4px;
    border-bottom-style: solid;
    border-bottom-color: rgb(20, 121, 215);
}

.box-title-more{
    display: block;
    float: right;
}

.main-img {
    max-width: 100%; /* 图片最大宽度为容器宽度 */
    height: auto; /* 保持图片宽高比 */
    display: block; /* 去掉默认行内元素的下方空白间隙 */
}


</style>
