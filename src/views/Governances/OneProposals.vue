<template>
    <MainBackground>
        <div class="proposal-detail">
            <div class="header">
                <div class="proposal-title">提案标题</div>
                <div class="details">
                    <span>创建者: <span>{{ proposalInfo ? proposalInfo.creator : "" }}</span></span>
                    <span>提案 Id: <span>{{ $route.params.proposalId }}</span></span>
                    <span>类型: <span>{{ proposalInfo ? proposalInfo.proposalType : "" }}</span></span>
                    <span>状态: <span>{{ proposalInfo ? proposalInfo.state : "" }}</span></span>
                </div>
            </div>
            <div class="content">
                <div class="left-section"></div>
                <div class="right-section">
                    <div class="self-info">
                        <cast-vote></cast-vote>

                    </div>

                    <div class="voting-info">
                        <votingInfo></votingInfo>
                    </div>
                </div>

            </div>
        </div>
    </MainBackground>
</template>

<script>
import MainBackground from "@/components/MainBackground.vue";
import { governance } from "@/views/Governances/function/address";
import selfInfoInSingleProposal from "@/views/Governances/selfInfoInSingleProposal.vue";
import votingInfo from "@/views/Governances/votingInfo.vue";

export default {
    name: "OneProposals",
    components: {
        MainBackground, selfInfoInSingleProposal, votingInfo,
        "cast-vote":selfInfoInSingleProposal,
    },
    data() {
        return {
            proposalInfo: null,
        }
    },
    async mounted() {
        let proposalInfo;
        let proposalState;
        const numberToState = new Map([
            [0, "Pending"],
            [1, "Canceled"],
            [2, "Active"],
            [3, "Failed"],
            [4, "Succeeded"],
            [5, "Expired"],
            [6, "Executed"],
            [7, "Queued"],
        ]);
        proposalInfo = await governance.getProposalById(this.$route.params.proposalId);
        proposalInfo = this.convertObjectToExtend(proposalInfo);
        proposalState = await governance.getProposalState(this.$route.params.proposalId);
        proposalInfo.state = numberToState.get(proposalState);
        this.proposalInfo = proposalInfo;
        console.log(this.proposalInfo);
    },
    methods: {
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
        },
    }
}
</script>

<style scoped>
.proposal-detail {
    width: 90%;
    /* 修改宽度为90% */
    margin-left: 5%;
    /* 左边间距5% */
    margin-right: 5%;
    /* 右边间距5% */
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

.proposal-title,
.details span {
    margin-bottom: 5px;
    align-self: flex-start;
    /* 标题靠左 */
}

.proposal-title {
    font-size: 2rem;
    /* 字体放大一号 */
}

.details {
    display: flex;
    gap: 20px;
    align-self: flex-start;
    /* 详情靠左 */
    margin-top: 3%;
    font-size: 1.5rem;
    /* 字体放大一号 */
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
    display: flex;
    width: 25%;
    height: 100%;
    flex-direction: column;
    justify-content: space-between;

}

.self-info{
    padding-bottom: 12px;
    margin-bottom: 12px;
    height: 45%;
    border: 1px solid white;
}

.voting-info{
    height: 45%;
    margin-top: 12px;
    border: 1px solid white;
}
</style>
