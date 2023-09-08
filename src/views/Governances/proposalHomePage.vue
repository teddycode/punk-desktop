<template>
    <MainBackground>
        <div class="proposal-home-page">
            <div class="left-section">
                <div class="header">
                    <h1 class="title">提案</h1>
                    <addnode-button @click="navigateToCreateProposal">创建提案</addnode-button>
                </div>
                <div class="proposal-card" v-for="item in proposals" :key="item.id">
                    <h3 class="proposal-card-title">
                        提案标题
                    </h3>
                    <div class="proposal-card-info">
                        <span class="proposal-card-info-id">
                            {{ item.id }}
                        </span>
                        <span class="proposal-card-info-state">
                            {{ item.state }}
                        </span>
                        <span class="proposal-card-info-time">
                            {{ item.startBlock }}
                        </span>
                    </div>
                </div>
            </div>
            <div class="right-section">
                <div class="upper-div">
                    <selfInfo></selfInfo>
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
import { ethers } from "ethers";
import { governance } from "@/views/Governances/function/address";

export default {
    name: "proposalHomePage",
    components: {
        MainBackground, addnodeButton, selfInfo, myEntrust,
    },
    data() {
        return {
            proposals: null,
        }
    },
    async mounted() {
        let proposalInfo;
        let proposalState;
        let proposals = [];
        let proposalCount = await governance.getProposalsCount()
        for (let i = proposalCount - 1; i >= 0; i--) {
            proposalInfo = await governance.getProposalById(i)
            proposalInfo = this.convertObjectToExtend(proposalInfo);
            proposalState = await governance.getProposalState(i);
            proposalInfo.state = proposalState;
            proposals.push(proposalInfo);
        };
        this.proposals=proposals;
    },
    methods: {
        navigateToCreateProposal() {
            this.$router.push({ path: '/Governances/newProposal' });
        },

        convertObjectToExtend(obj) {
            return {
                id: obj.id,
                creator: obj.creator,
                proposalType: obj.proposalType,
                executor: obj.executor,
                targets: obj.targets,
                values: obj.values,
                signatures: obj.signatures,
                calldatas: obj.calldatas,
                withDelegatecal: obj.withDelegatecalls,
                startBlock: obj.startBlock,
                endBlock: obj.endBlock,
                executionBlock: obj.executionBlock,
                executed: obj.executed,
                canceled: obj.canceled,
                marketReview: obj.marketReview,
                stakeAmount: obj.stakeAmount,
                strategy: obj.strategy,
                ipfsHash: obj.ipfsHash,
            }
        }
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

.right-section {
    flex: 3;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.upper-div,
.lower-div {
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

.proposal-card {
    color: white;
    width: 90%;
    height: 25%;
    border: 2px solid white;
    padding: 32px 24px;
    margin-top: 2%;
    display: flex;
    justify-content: flex-start;
    flex-direction: column;
}

.proposal-card-title {
    font-size: 1.125rem;
    display: block;
    text-align: left;
    margin-bottom: 6.3px;
}

.proposal-card-info {
    font-size: 1.125rem;
    display: block;
    text-align: left;
}
</style>
