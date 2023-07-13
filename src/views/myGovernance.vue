<template>
    <div class="governance-page">
        <h1 class="governance-title">Proposals</h1>
        <div class="governance-table">
        <table class="table">
            <thead>
            <tr>
                <th>#ID</th>
                <th>Title</th>
                <th>Type</th>
                <th>Status</th>
                <th>End Time</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="proposal in proposals" :key="proposal.id" @click="goToProposal(proposal.id)">
                <td>{{ proposal.id }}</td>
                <td>{{ proposal.title }}</td>
                <td>{{ proposal.type }}</td>
                <td :class="getProposalStatusClass(proposal.status)">{{ proposal.status }}</td>
                <td>{{ proposal.endTime }}</td>
            </tr>
            </tbody>
        </table>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            proposals: [
                { id: 1, title: 'Proposal 1', type: 'Type 1', status: 'Passed', endTime: '2023-07-15' },
                { id: 2, title: 'Proposal 2', type: 'Type 2', status: 'Rejected', endTime: '2023-07-20' },
                { id: 3, title: 'Proposal 3', type: 'Type 1', status: 'Passed', endTime: '2023-07-25' },
                { id: 4, title: 'Proposal 4', type: 'Type 3', status: 'Rejected', endTime: '2023-07-30' },
            ],
        };
    },
    methods: {
        goToProposal(id) {
            // 根据提案ID跳转到相应的二级页面
        },
        getProposalStatusClass(status) {
            if (status === 'Passed') {
                return 'proposal-passed';
            } else if (status === 'Rejected') {
                return 'proposal-rejected';
            } else {
                return '';
            }
        },
    },
};
</script>

<style scoped>
@import "@/assets/global.css";
.governance-page {
    min-height: 100vh;
    padding: 2rem;
}

.governance-title {
    font-size: 1.875rem;
    margin-bottom: 2rem;
    text-align: center;
}
.governance-table{
    padding: 0 8%;
}
.proposal-passed {
    color: green;
}

.proposal-rejected {
    color: red;
}
</style>
