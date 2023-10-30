<template>
    <div class="info-container">
        <h1 class="info-title">提案信息</h1>
        <div class="voting-info-content" v-if="state === 0">
            <div class="info-row">质押量：{{ stakeAmount }}</div>
        </div>
        <div class="voting-info-content" v-else-if="state === 2">
            <div class="vote-button" v-if="!isInitialized">
                <button class="button" @click="initialize">初始化</button>
            </div>
            <div class="vote-button" v-if="isInitialized">
                <div class="info-row">支持：{{ votingYes }}</div>
                <div class="info-row">反对：{{ votingNo }}</div>
                <div class="support-against-button">
                    <button class="button" @click="castVoteFor">支持</button>
                    <button class="button" @click="castVoteAgainst">反对</button>
                </div>
            </div>
        </div>
        <div class="voting-info-content" v-else-if="state === 3">
            <div class="info-row">支持：{{ votingYes }}</div>
            <div class="info-row">反对：{{ votingNo }}</div>
            <div class="failed">
                失败
            </div>
        </div>
        <div class="voting-info-content" v-else-if="state === 4">
            <div class="info-row">支持：{{ votingYes }}</div>
            <div class="info-row">反对：{{ votingNo }}</div>
            <div class="failed">
                成功
            </div>
        </div>
        <div class="voting-info-content" v-else-if="state === 5">
            <div class="vote-button" v-if="isInitialized">
                <div class="info-row">支持：{{ votingYes }}</div>
                <div class="info-row">反对：{{ votingNo }}</div>
            </div>
            <div class="failed">
                过期
            </div>
        </div>
        <div class="voting-info-content" v-else-if="state === 6">
            <div class="info-row">支持：{{ votingYes }}</div>
            <div class="info-row">反对：{{ votingNo }}</div>
            <div class="failed">
                执行
            </div>
        </div>
        <div class="voting-info-content" v-else-if="state === 7">
            <div class="info-row">支持：{{ votingYes }}</div>
            <div class="info-row">反对：{{ votingNo }}</div>
            <div class="failed">
                入队
            </div>
        </div>
        <div class="voting-info-content" v-else>
            <div class="failed">
                取消
            </div>
        </div>
    </div>
</template>

<script>
import { governance, governanceAddr, factory, implementation, review } from "@/views/Governances/function/address";
import { ethers } from "ethers";
import {useRouter} from "vue-router";

export default {
    name: "votingInfo",

    data() {
        return {
          route: useRouter(),
            isInitialized: null,
            state: null,
            stakeAmount: null,
            votingYes: null, // 用于存储从后台获取的数据
            votingNo: null,
        };
    },
    async mounted() {
      let state = await governance.getProposalState(route.params.proposalId);
        this.state = state;
      let isInitialized = await review.isInitialized(route.params.proposalId);
        this.isInitialized = isInitialized;
        if (state == 0) {
          let proposalInfo = await governance.getProposalById(route.params.proposalId);
            this.stakeAmount = proposalInfo.stakeAmount;
        }
        // else if (state == 2 || state == 3|| state == 4|| state == 5|| state == 6|| state == 7) {
        else {
          let address = await factory.getContractAddress(governanceAddr, route.params.proposalId);
            let contract = implementation.attach(address);
            if (isInitialized) {
                this.votingYes = ethers.utils.formatEther(await contract.forVotes());
                this.votingNo = ethers.utils.formatEther(await contract.againstVotes());
            }
        }
    },
    methods: {
        async castVoteFor() {
          let address = await factory.getContractAddress(governanceAddr, route.params.proposalId);
            let contract = implementation.attach(address);
            contract.castVote(true);
        },
        async castVoteAgainst() {
          let address = await factory.getContractAddress(governanceAddr, route.params.proposalId);
            let contract = implementation.attach(address);
            contract.castVote(false);
        },
        async initialize() {
          await review.createReview(governanceAddr, route.params.proposalId);
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

.vote-button {
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.support-against-button {
    margin-top: 12px;
    display: flex;
    flex-direction: row;
    justify-content: center;
}

.button {
    padding: 7px 10px;
    background: transparent;
    border: 1px solid white;
    color: white;
    margin-right: 40px;
}
</style>
