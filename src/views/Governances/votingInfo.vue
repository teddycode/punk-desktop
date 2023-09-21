<template>
    <div class="info-container">
        <h1 class="info-title">提案信息</h1>
        <div class="voting-info-content" v-if="state === 0">
            <div class="info-row">质押量：{{ stakeAmount }}</div>
        </div>
        <div class="voting-info-content" v-else-if="state === 2">
            <div class="info-row">支持：{{ votingYes }}</div>
            <div class="info-row">反对：{{ votingNo }}</div>
        </div>
    </div>
</template>
    
<script>
import { governance, governanceAddr, factory, implementation } from "@/views/Governances/function/address";

export default {
    name: "votingInfo",

    data() {
        return {
            state: null,
            stakeAmount:null,
            votingYes: null, // 用于存储从后台获取的数据
            votingNo: null,
        };
    },
    async mounted() {
        let state = await governance.getProposalState(this.$route.params.proposalId);
        this.state = state;
        if (state == 0) {
            let proposalInfo = await governance.getProposalById(this.$route.params.proposalId);
            console.log(proposalInfo);
            this.stakeAmount = proposalInfo.stakeAmount;
        }
        else if(state==2) {
            let address = await factory.getContractAddress(governanceAddr, this.$route.params.proposalId);
            let contract = implementation.attach(address);
            this.votingYes = await contract.forVotes();
            this.votingNo = await contract.againstVotes();
        }
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

.voting-info-content {
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