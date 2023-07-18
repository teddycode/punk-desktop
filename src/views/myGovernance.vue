<template>
    <div class="governance-page">
        <h1 class="governance-title">提案</h1>
        <div class="content">
            <div class="proposals-container">
                <div
                v-for="proposal in sortProposalsByEndtime"
                :key="proposal.id"
                class="proposal-card"
                @click="goToProposal(proposal.id)"
            >
                <div class="proposal-header">
                    <div class="proposal-title">{{ proposal.title }}</div>
                    <div :class="['proposal-status', proposal.status.toLowerCase()]">{{ proposal.status }}</div>
                </div>
                <div class="proposal-content">{{ getTruncatedContent(proposal.content) }}</div>
                    <div v-if="proposal.status !== 'Waiting'" class="proposal-votes">
                        <div class="progress-container">
                            <div class="progress-bar pass" :style="{ width: votesPassPercentage(proposal) + '%' }"></div>
                            <span class="pass-label">{{ votesPassPercentage(proposal).toFixed(1) }}%</span>
                        </div>
                        <div class="progress-container">
                            <div class="progress-bar against" :style="{ width: votesAgainstPercentage(proposal) + '%' }"></div>
                            <span class="against-label">{{ votesAgainstPercentage(proposal).toFixed(1) }}%</span>
                        </div>
                    </div>
                    <div class="proposal-totol-vote">总票数： {{totalVote(proposal)}}</div>
                <div class="proposal-footer">
                    <div class="proposal-end-time">End Time: {{ proposal.endTime }}</div>
                </div>
            </div>
            </div>
            <div class="sidebar">
                <div class="icon"><img src="@/assets/governance.jpg"></div>
                <div class="name">Stargate DAO</div>
                <div class="members">成员人数: {{ members }}</div>
                <button class="join-btn" @click="join">加入</button>
                <div class="menu-item" @click="goToPage('newProposal')">新提案</div>
                <div class="menu-item" @click="goToPage('delegation')">委托</div>
                <div class="menu-item" @click="goToPage('about')">关于</div>
                <div class="menu-item" @click="goToPage('settings')">设置</div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            proposals: [
                { id: 1, author: '0x3f0a0ea339f208dbb0ad90f5e3d6e5b3d21a2c71', title: 'Proposal 1', content: 'Add Metis Chain support for MAI Bridging\n' +
                        '\n' +
                        '--MAI and Stargate--\n' +
                        'MAI is currently listed on Stargate on Optimism, Arbitrum, Polygon, Ethereum, Avalanche, and BNB.\n' +
                        '\n' +
                        'MAI\'s deployment on Stargate enjoys liquidity support from QiDao. This reduces the cost of capital for Stargate to 0% for maintaining liquidity for MAI.', status: 'Passed', votesPass:210, votesAgainst: 20,endTime: '2023-07-15' },
                { id: 2, author: '0x3f0a0ea339f208dbb0ad90f5e3d6e5b3d21a2c72', title: 'Proposal 2', content: 'Stargate should re-enable support for the Fantom chain by creating pools using the USDC token (https://ftmscan.com/address/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48). This would allow Stargate to once again support Fantom and provide the protocol with a way to use safe and trusted assets to do so.', status: 'Rejected', votesPass:50, votesAgainst: 67,endTime: '2023-07-20' },
                { id: 3, author: '0x3f0a0ea339f208dbb0ad90f5e3d6e5b3d21a2c73', title: 'Proposal 3', content: 'Following the recent PolyNetwork exploit over the past weekend that significantly impacted the Metis token on BSC, we hereby propose the deprecation of METIS-BSC pool and pathway on the Stargate bridge. This measure will eliminate potential vulnerabilities that might jeopardize the safety of our community members\' assets.', status: 'Waiting', votesPass:0, votesAgainst: 0,endTime: '2023-07-25' },
                { id: 4, author: '0x3f0a0ea339f208dbb0ad90f5e3d6e5b3d21a2c74', title: 'Proposal 4', content: 'The Kava Origin Foundation proposes for Stargate to launch on Kava now that there is the LayerZero endpoint on Kava mainnet. To start, the Foundation would like to request one pool: USDT (Ethereum, Arbitrum, Optimism, Polygon, BNB Chain and Avalanche)', status: 'Active', votesPass:110, votesAgainst: 10,endTime: '2023-07-30' },
            ],
            members: 100,  // 模拟的成员数量
        };
    },
    created() {
            this.$store.dispatch('setProposals',this.proposals);
    },
    computed: {
        sortProposalsByEndtime() {
            return this.proposals.slice().sort((a, b) => {
                const dateA = new Date(a.endTime);
                const dateB = new Date(b.endTime);
                return dateB - dateA;  // 从早到晚排序，如果想要从晚到早排序，你可以返回 dateB - dateA
            });
        },
    },
    methods: {
        goToProposal(id) {
            this.$router.push({ name: 'myProposals', params: { id: id } });
            // 根据提案ID跳转到相应的二级页面
        },
        totalVote(proposal){
            return proposal.votesPass+proposal.votesAgainst;
        },
        votesPassPercentage(proposal) {
            return (proposal.votesPass / (proposal.votesPass + proposal.votesAgainst)) * 100;
        },
        votesAgainstPercentage(proposal) {
            return (proposal.votesAgainst / (proposal.votesPass + proposal.votesAgainst)) * 100;
        },
        getProposalStatusClass(status) {
            // Directly return the lowercase status
            return status.toLowerCase();
        },
        getTruncatedContent(content) {
            return content.length > 150 ? content.substring(0, 150) + '...' : content;
        },
        getShortenedAuthor(author) {
            return author.substring(0, 4) + '...' + author.substring(author.length - 4);
        },
        join() {
            // 处理点击加入按钮的逻辑
        },
        goToPage(page) {
            switch (page) {
                case 'proposals':
                    // 导航到提案页面
                    // 例如：this.$router.push('/proposals');
                    break;
                case 'newProposal':
                    // 导航到新提案页面
                    this.$router.push('/Governances/newProposal');
                    break;
                case 'delegation':
                    // 导航到委托页面
                    // 例如：this.$router.push('/delegation');
                    break;
                case 'about':
                    // 导航到关于页面
                    // 例如：this.$router.push('/about');
                    break;
                case 'settings':
                    // 导航到设置页面
                    // 例如：this.$router.push('/settings');
                    break;
                default:
                    break;
            }
        },
    },
};
</script>
<style scoped>

.governance-page {
    min-height: 100vh;
    padding: 2rem;
}

.governance-title {
    font-size: 1.875rem;
    margin-bottom: 2rem;
    text-align: center;
}

.content {
    display: flex;
    justify-content: space-between;
    margin: 0 10%;
}
.icon img{
    width: 40%;
}
.proposals-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    flex: 6;
}

.proposal-card {
    position: relative;
    background: #fff;
    border: 1px solid #ddd;
    padding: 1rem 2rem 1rem 1rem;
    margin: 1rem;
    transition: all 0.3s ease;
    width: calc(100%);
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
    cursor: pointer;
}

.proposal-card:hover {
    transform: scale(1.02);
    background-color: #eaf4ff;
    box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.2);
}

.proposal-title {
    font-weight: bold;
    font-size: x-large;
    text-align: left;
}
.proposal-content {
    text-align: left;  /* 添加了这一行 */
}
.proposal-status {
    font-size: small;
    padding: 5px;
    position: absolute;
    top: 10px;
    right: 10px;
    border-width: 1px;
    border-style: solid;
    border-radius: 5px;
    text-align: center;
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
.proposal-status,
.proposal-end-time {
    margin: 0.5rem 0;
    text-align: left;
}
/* 进度条容器 */
.progress-container {
    position: relative;
    margin-top: 10px;
    width: 50%;
    height: 15px;
    background-color: #f2f2f2;
    margin-bottom: 10px;
    border-radius: 10px;
}
/* 进度条进度 */
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
    float: left;
}

.progress-bar.against {
    background-color: red;
    float: left;
}
.progress-label {
    display: flex;
    justify-content: space-between;
    font-size: 0.875rem;
    margin-top: 0.5rem;
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
.proposal-totol-vote{
    text-align: left;
}
.sidebar {
    flex: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    border: 1px solid #ddd;
    padding: 1rem;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
    margin-left: 20px;
    margin-top: 1rem;
    margin-bottom: auto;
}

.sidebar .icon {
    font-size: 2rem;
    margin-bottom: 1rem;
}

.sidebar .name {
    font-size: 1.5rem;
    margin-bottom: 1rem;
}

.sidebar .members {
    font-size: 1.25rem;
    margin-bottom: 1rem;
}

.sidebar .join-btn {
    margin-bottom: 1rem;
    padding: 0.5rem 1rem;
    font-size: 1.25rem;
    border: none;
    background-color: #00a86b;
    color: white;
    cursor: pointer;
    transition: all 0.3s ease;
}

.sidebar .join-btn:hover {
    background-color: #008552;
}

.sidebar .menu-item {
    font-size: large;
    cursor: pointer;
    width: 100%;
    padding: 1rem;
    text-align: center;
    margin-bottom: 1rem;
    transition: all 0.3s ease;
}

.sidebar .menu-item:hover {
    background-color: #eaf4ff;
    box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.2);
}
</style>