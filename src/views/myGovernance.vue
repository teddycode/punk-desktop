<template>
    <MainBackground>
    <div class="governance-page">
        <h1 class="governance-title">提案</h1>
        <div class="search-bar">
            <div class="search-input">
                <img class="search-icon" src="@/assets/search.jpg" />
                <input type="text" placeholder="Search" v-model="searchQuery" />
                <select v-model="statusFilter">
                    <option>All</option>
                    <option>Active</option>
                    <option>Waiting</option>
                    <option>Passed</option>
                    <option>Rejected</option>
                </select>
            </div>
            <button @click="search" class="search-button">Search</button>
        </div>
        <div class="content">
            <div class="proposals-container">
                <div
                v-for="proposal in displayedProposals"
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
                        <div class="vote-progress-container">
                            <div class="progress-container">
                                <div class="progress-bar pass" :style="{ width: votesPassPercentage(proposal) + '%' }"></div>
                            </div>
                            <span class="pass-label">{{ votesPassPercentage(proposal).toFixed(1) }}%</span>
                            <button v-if="proposal.status==='Active'" class="vote-button" @click.stop="castVote(proposal.id, 'pass')">投票通过</button>
                        </div>
                        <div class="vote-progress-container">
                            <div class="progress-container">
                                <div class="progress-bar against" :style="{ width: votesAgainstPercentage(proposal) + '%' }"></div>
                            </div>
                            <span class="against-label">{{ votesAgainstPercentage(proposal).toFixed(1) }}%</span>
                            <button v-if="proposal.status==='Active'" class="vote-button" @click.stop="castVote(proposal.id, 'against')">投票反对</button>
                        </div>
                    </div>
                    <div class="proposal-totol-vote">
                        <p>总票数： {{totalVote(proposal)}}</p>
                        <p v-if="proposal.voted">已投票</p>
                    </div>
                <div class="proposal-footer">
                    <div class="proposal-end-time">End Time: {{ proposal.endTime.substring(0,10) }}</div>
                </div>
            </div>
            </div>
            <div class="sidebar">
                <div class="icon"><img src="@/assets/governance.jpg"></div>
                <div class="name">Stargate DAO</div>
                <div class="members">成员人数: {{ members }}</div>
                <button class="join-btn" @click="join">加入</button>
                <div class="menu-item" @click="goToPage('newProposal')">新提案</div>
                <div class="menu-item" @click="goToPage('myEntrust')">委托</div>
                <div class="menu-item" @click="goToPage('about')">关于</div>
                <div class="menu-item" @click="goToPage('settings')">设置</div>
            </div>
        </div>
        <myPagination :total="totalItems" :pagesize="itemsPerPage" :currentPage="1"  @change-page="updatePage"></myPagination>
    </div>
    </MainBackground>
</template>

<script>
import axios from "axios";
import myPagination from "@/components/myPagination.vue";
import MainBackground from "@/components/MainBackground.vue";
export default {
    components:{
        myPagination,MainBackground
    },
    data() {
        return {
            proposals: [],
            displayedProposals: [],
            members: 100,  // 模拟的成员数量
            hasVote: false,
            totalItems:0,
            page: 1,
            itemsPerPage: 3,
            searchQuery: '',
            statusFilter: 'All',
        };
    },
    created() {
        axios.get("http://localhost:8080/myGovernance",{
            params: {
                walletAddress: localStorage.getItem('userAddress')
            }
        }) // 请求提案数据
            .then(response => {
                console.log(localStorage.getItem('userAddress'))
                this.proposals = response.data.proposals; // 将返回的数据存储到proposals
                this.totalItems = this.proposals.length; //计算当前card总数
                console.log("totalItems:" + this.totalItems);
                this.updatePage(this.page);
                localStorage.setItem('proposals', JSON.stringify(response.data.proposals));
                this.$store.dispatch('setProposals',this.proposals);
                console.log(this.proposals); // 在获取数据后打印值
            })
            .catch(error => {
                console.log(error); // 打印错误信息 console.log(response.data);
            });

    },
    computed: {
    },
    methods: {
        search() {
            // 这里处理你的搜索逻辑
        },
        updatePage(newPage) {
            this.page = newPage;
            let start = (this.page - 1) * this.itemsPerPage;
            let end = start + this.itemsPerPage;
            this.displayedProposals = this.proposals.slice(start, end);
        },
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
        castVote(proposalId, voteType) {
            // 这里的具体实现取决于你的后端API
            // 假设你有一个API可以接受proposalId和voteType ('pass'或'against')，并返回更新后的proposal
            if (!this.$store.state.userAddress){
                alert("钱包未登录,不能投票");
            }else {
                axios.post("http://localhost:8080/myGovernance", {
                    ProposalID: proposalId,
                    voteType: voteType,
                    WalletAddress: this.$store.state.userAddress,
                })
                    .then(response => {
                        // 根据你的后端返回的数据更新proposals
                        console.log(proposalId);
                        const updatedProposal = response.data;
                        const index = this.proposals.findIndex(proposal => proposal.id === updatedProposal.id);
                        if (index !== -1) {
                            this.$set(this.proposals, index, updatedProposal);
                        }
                    })
                    .catch(error => {
                        // 捕获后端返回的错误
                        if (error.response && error.response.data && error.response.data.error) {
                            alert(error.response.data.error);
                        } else {
                            console.log(error);
                        }
                    });
            }
        },
        goToPage(page) {
            switch (page) {
                 case 'newProposal':
                    // 导航到新提案页面
                    this.$router.push('/Governances/newProposal');
                    console.log(this.proposals);
                    break;
                case 'myEntrust':
                    this.$router.push('/Governances/myEntrust');
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
.search-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    /*margin: 1rem 0;*/
    margin: 0 11%;
    width: 40%;
}

.search-input {
    display: flex;
    align-items: center;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 20px;
    width: 100%;
}

.search-input input {
    border: none;
    margin-left: 0.5rem;
    flex-grow: 1;
}

.search-icon {
    display: inline-block;
    width: 20px;
    height: 20px;
    background-size: cover;
}

.search-input select {
    margin-left: 0.5rem;
    padding: 6px;
    border: 1px solid #34D399;
    border-radius: 4px;
    font-size: 16px;
    background-color: #F5F7FA;
}

.search-button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 20px;
    background-color: #3aafa9;
    color: white;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.search-button:hover {
    background-color: #1f7d79;
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
    text-align: left;
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
    width: 90%;
    height: 15px;
    background-color: #f2f2f2;
    margin-bottom: 10px;
    border-radius: 10px;
}
/* 进度条进度 */
.vote-progress-container {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    /*margin-bottom: 10px;*/
    margin-right: 40%;
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
    width: 20%;
    text-align: left;
    margin-top: 8px;
}
.pass-label {
    color: green;
}

.against-label {
    color: red;
}
.proposal-totol-vote{
    text-align: left;
}
.vote-button {
    width: 20%;
    padding: 5px 10px;
    background-color: #4CAF50;
    color: white;
    border: none;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.vote-button:hover {
    background-color: #45a049;
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

