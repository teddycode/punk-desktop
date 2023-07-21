<template>
    <div class="main" v-if="proposal">
        <router-link to="/myGovernance" class="back-button">
            <img src="@/assets/left-arrow.jpg" alt="Back">
            <span>返回</span>
        </router-link>
        <div class="content">
            <div class="left-panel">
                <div class="proposal-header">
                    <h1 class="proposal-title">{{ proposal.title }}</h1>
                </div>
                <p class="proposal-end-time">结束时间: {{ proposal.endTime.substring(0,10) }}</p>
                <div :class="['proposal-status', getProposalStatusClass(proposal.status)]">{{ proposal.status }}</div>
                <div class="proposal-content">{{ proposal.content }}</div>
            </div>
            <div class="right-panel">
                <div class="voting-info">
                    <h2>your vote info</h2>
                    <p>your voting power: 0</p>
                </div>
                <div class="voting-results">
                    <h2>Voting Results</h2>
                    <div class="progress-container" v-if="totalVote!==0" >
                        <div class="progress-bar pass" :style="{ width: votesPassPercentage + '%' }"></div>
                        <span class="pass-label">{{ votesPassPercentage.toFixed(1) }}%</span>
                    </div>
                    <div class="progress-container" v-if="totalVote!==0" >
                        <div class="progress-bar against" :style="{ width: votesAgainstPercentage + '%' }"></div>
                        <span class="against-label">{{ votesAgainstPercentage.toFixed(1) }}%</span>
                    </div>
                    <p>投票总数: {{totalVote}}</p>
                </div>
                <div class="proposal-details">
                    <h2>Proposal Details</h2>
                    <p>Initiator: {{ proposal.author }}</p>
                    <p>Start Time: {{ proposal.startTime.substring(0,10) }}</p>
                    <p>End Time: {{ proposal.endTime.substring(0,10) }}</p>
                    <p>Block Creation Time: unknown</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data(){
        return{
            proposals: [],
        }
    },
    created() {
        this.proposals = this.$store.state.proposals;
        console.log(this.proposals);
    },
    computed: {
        proposal() {
            const id = parseInt(this.$route.params.id, 10);
            return this.proposals.find(proposal => proposal.id === id);
        },
        totalVote() {
            return this.proposal ? this.proposal.votesPass + this.proposal.votesAgainst : 0;
        },
        votesPassPercentage() {
            return this.proposal ? (this.proposal.votesPass / this.totalVote) * 100 : 0;
        },
        votesAgainstPercentage() {
            return this.proposal ? (this.proposal.votesAgainst / this.totalVote) * 100 : 0;
        },
    },
    methods: {
        getProposalStatusClass(status) {
            console.log(status.toLowerCase());
            return status.toLowerCase();
        },
    },
};
</script>

<style scoped>
.main{
    min-height: 100vh;
}
.content {
    display: flex;
    justify-content: space-between;
    padding: 40px;
}
.back-button {
    display: flex;
    align-items: center;
    cursor: pointer;
    margin-bottom: 20px;
    text-decoration: none;
    color: inherit;
}

.back-button img {
    width: 20px;
    height: 20px;
}

.back-button span {
    margin-left: 5px;
}

.left-panel {
    flex: 3;
    border: 1px solid #ddd;
    padding: 20px;
    margin-right: 20px;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
    text-align: left;
}

.right-panel {
    flex: 2;
    display: flex;
    flex-direction: column;
    padding: 20px;
}

.proposal-title {
    font-weight: bold;
    font-size: 2rem;
    margin-bottom: 10px;
    text-align: left;
}
.proposal-status {
    font-size: small;
    padding: 5px;
    border-width: 1px;
    border-style: solid;
    border-radius: 5px;
    display: inline-block;
    text-align: left;
}

.proposal-status.waiting {
    background-color: purple;
    color: white;
}
.proposal-status.active {
    background-color:  blue;
    color: white;
}
.proposal-status.passed {
    background-color:  green;
    color: white;
}
.proposal-status.rejected {
    background-color:  red;
    color: white;
}
.proposal-title,
.proposal-end-time {
    margin: 0.5rem 0;
    text-align: left;
}

.proposal-content {
    padding: 5px;
    font-size: 1.3rem;
    text-align: left;
}

.voting-info,
.voting-results,
.proposal-details {
    border: 1px solid #ddd;
    padding: 10px;
    margin-bottom: 20px;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
}

.progress-container {
    position: relative;
    margin-top: 10px;
    width: 90%;
    height: 15px;
    background-color: #f2f2f2;
    margin-bottom: 10px;
    border-radius: 10px;
}

.progress-bar {
    height: 100%;
    border-radius: 10px;
    background-color: #4CAF50;
    text-align: center;
    line-height: 8px;
    color: #ffffff;
    transition: width 0.5s ease-in-out;
}

.progress-bar.pass {
    background-color: green;
}

.progress-bar.against {
    background-color: red;
}

.pass-label,
.against-label {
    margin-top: 8px;
    position: absolute;
    top: 0;
    right: 0;
    transform: translate(100%, -50%);
}
.pass-label {
    color: green;
    position: absolute;
}

.against-label {
    color: red;
    position: absolute;
}
</style>
