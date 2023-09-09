<template>
    <div class="info-container">
        <h1 class="info-title">投票信息</h1>
        <div class="info-content">
            <div class="info-row">支持：{{ votingYes }}</div>
            <div class="info-row">反对：{{ votingNo }}</div>
        </div>
    </div>
</template>
    
<script>
import {ethers} from "ethers";
import {governToken,userAddr,tokenPower,} from "@/views/Governances/function/address";

export default {
    name: "votingInfo",
    data() {
        return {
            votingYes:null, // 用于存储从后台获取的数据
            votingNo:null,
        };
    },
    async mounted() {
        let temp = await governToken.balanceOf(userAddr);
        this.balance = ethers.utils.formatEther(temp);
        temp = await tokenPower.getCurrentVotingPower(userAddr);
        this.votingPower = ethers.utils.formatEther(temp);
    }
}
</script>
    
<style scoped>
.info-container {
    color: white;
}

.info-title {
    font-size: 1.5rem;
    margin-top: 10%;
    margin-bottom: 5%;
    /* 标题与内容部分的间距 */
}

.info-content {
    padding-left: 1rem;
    /* 为内容部分增加左填充，以强调“靠左”效果 */
}

.info-row {
    font-size: 1rem;
    /* 使用rem单位 */
    margin-top: 5%;
    /* 使用百分比定义行距 */
    text-align: left;
}
</style>