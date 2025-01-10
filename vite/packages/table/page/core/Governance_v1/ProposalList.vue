<template>
  <a-row :gutter="16"
          style="padding: 30px 70px 30px 70px; background-color: rgba(222, 134, 222, 0.19); min-height: 100vh;"
  >
    <!-- Proposals Section -->
    <a-col :span="18">
      <a-card title="Proposals" style="background-color: rgba(222, 134, 222, 0.15);" :headStyle="{ fontSize: '20px' }">
        <!-- Filter and Search -->
        <div style="display: flex; justify-content: right; margin-bottom: 16px;">
          <a-button style="background-color: rgba(85, 65, 184, 0.73);margin-right: 535px;width: 150px;" type="primary" @click="createProposal">Create Proposal</a-button>
          <a-select v-model:value="filter" placeholder="All proposals" style="width: 200px; color: black;">
              <a-select-option value="All proposals">All proposals</a-select-option>
              <a-select-option value="Created">Created</a-select-option>
              <a-select-option value="Open for voting">Open for voting</a-select-option>
              <a-select-option value="Executed">Executed</a-select-option>
              <a-select-option value="Cancelled">Cancelled</a-select-option>
          </a-select>
          <a-input v-model:value="search" placeholder="Search proposal" allow-clear style="width: 200px; margin-left: 16px;">
              <template #suffix>
                  <search-outlined style="color:rgba(16, 16, 16, 0.46);"/>
              </template>
          </a-input>
        </div>

        <!-- Proposal List -->
        <a-list
          :data-source="filteredProposals"
        >
          <template #renderItem="{ item }">
            <a-list-item style="background-color: rgba(84, 188, 189, 0.17);border: #f8bbd0;" @click="enterProposal(item.id)">
              <div style="display: flex; justify-content: right; align-items: flex-start; width: 970px;height: 95px;">
                <!-- 左侧部分 -->
                <div style="flex: 8; padding-right: 160px;font-size: 19px;">
                  <a-tag :color="getStatusColor(item.status)">{{ item.status }}</a-tag>
                  <!-- Title -->
                  <h4 style="margin: 8px 0;">{{ item.title }}</h4>
                </div>

                <!-- 右侧部分,位于最右侧 -->
                <div style="flex: 3;position: relative;left: 10px">
                  <p style="margin: 0;font-size: 17px;font-family: Arial, sans-serif;">Yes <strong><span style="margin-left: 8px;">{{ item.yesVotes }}</span></strong></p>
                  <a-progress
                    :percent="getPercentage(item.yesVotes, item.noVotes)"
                    stroke-color="rgb(76, 175, 80)"
                  />
                  <p style="margin: 0;font-size: 17px;font-family: Arial, sans-serif;">No <strong><span style="margin-left: 8px;">{{ item.noVotes }}</span></strong></p>
                  <a-progress
                    :percent="getPercentage(item.noVotes, item.yesVotes)"
                    stroke-color="rgb(244, 67, 54, 0.85)"
                  />
                </div>
              </div>
            </a-list-item>
          </template>
        </a-list>
      </a-card>
    </a-col>

    <!-- User Info Section -->
    <a-col :span="6">
      <a-card title="User info" style="background-color: rgba(222, 134, 222, 0.15); ">
        <!-- Avatar and Address -->
        <div style="margin-bottom: 16px;display: flex;">
          <!-- <a-avatar
            size="large"
            src="https://joeschmoe.io/api/v1/random"
            style="margin-bottom: 8px;margin-right: 10px;"
          /> -->
          <a-avatar
            size="large"
            style="margin-bottom: 8px;margin-right: 10px;color:rgb(97 56 105);"
          >USER</a-avatar>
          <div style="display: flex; align-items: center; justify-content: center; gap: 4px;">
            <span>{{ userInfo.address }}</span>
            <copy-filled style="font-size: medium;position: relative;top: -6px;" @click="copyAddress" />
          </div>
        </div>

        <!-- User Stats -->
        <div style="display: flex; justify-content: space-between;text-align: center;margin-left: 20px;margin-right: 20px;">
          <div>
            <p>BCI</p>
            <p style="font-size: 18px; font-weight: bold;">{{ userInfo.bci }}</p>
          </div>
          <div>
            <p>CGI</p>
            <p style="font-size: 18px; font-weight: bold;">{{ userInfo.cgi }}</p>
          </div>
          <div>
            <p>PUNK</p>
            <p style="font-size: 18px; font-weight: bold;">{{ userInfo.punk }}</p>
          </div>
        </div>
      </a-card>
    </a-col>
  </a-row>
</template>

<script>
import { SearchOutlined, CopyFilled } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import { useProposalStore} from "@page/core/Governance_v1/store/governance";
import { computed } from 'vue';

export default {
  name: "ProposalList",
  components: {
      SearchOutlined,
      CopyFilled,
  },
  setup() {
    const store = useProposalStore();
    const falseProposalsLength = store.ProposalList.length - store.proposals.length;
    const trueProposalsLength = store.proposals.length;
    let proposals = [];
    for (let i = 0; i < falseProposalsLength; i++) {
      proposals[i + trueProposalsLength] = store.ProposalList[i];
    }
    for (let i = 0; i < trueProposalsLength; i++) {
      proposals[i] = store.ProposalList[store.ProposalList.length - 1 - i];
    }
    const userInfo = computed(() => store.getUserInfo);
    return { proposals, userInfo };
  },
  data() {
    return {
      // proposals: [
      //   {
      //     id: 1,
      //     title: "Change software parameter for storage",
      //     status: "Created",
      //     yesVotes: 100,
      //     noVotes: 100,
      //   },
      //   {
      //     id: 2,
      //     title: "Change software parameter for storage",
      //     status: "Open for voting",
      //     yesVotes: 100,
      //     noVotes: 40,
      //   },
      //   {
      //     id: 3,
      //     title: "Change software parameter for storage",
      //     status: "Executed",
      //     yesVotes: 100,
      //     noVotes: 20,
      //   },
      //   {
      //     id: 4,
      //     title: "Change software parameter for storage",
      //     status: "Cancelled",
      //     yesVotes: 100,
      //     noVotes: 800,
      //   },
      //   {
      //     id: 5,
      //     title: "Change software parameter for storage",
      //     status: "Cancelled",
      //     yesVotes: 100,
      //     noVotes: 70,
      //   },
      //   {
      //     id: 6,
      //     title: "Change software parameter for storageere",
      //     status: "Cancelled",
      //     yesVotes: 100,
      //     noVotes: 0,
      //   },
      // ],
      // userInfo: {
      //   address: "0xc3e8bd231d6r6s68c19c0df",
      //   bci: 100,
      //   cgi: 200,
      //   punk: 300,
      // },
      filter: "All proposals",
      search: "",
      count: 0,
    };
  },
  computed: {
    filteredProposals() {
      let filtered = this.proposals;
      if (this.filter !== "All proposals") {
        filtered = filtered.filter((proposal) => proposal.status === this.filter);
      }
      if (this.search) {
        filtered = filtered.filter((proposal) =>
          proposal.title.toLowerCase().includes(this.search.toLowerCase())
        );
      }
      return filtered;
    },
  },
  methods: {
    getStatusColor(status) {
      switch (status) {
        case "Created":
          return "purple";
        case "Open for voting":
          return "green";
        case "Executed":
          return "blue";
        case "Cancelled":
          return "red";
        default:
          return "default";
      }
    },
    getPercentage(votes, totalVotes) {
      const total = votes + totalVotes;
      return total === 0 ? 0 : Number(((votes / total) * 100).toFixed(1));
    },
    copyAddress() {
      navigator.clipboard.writeText(this.userInfo.address).then(() => {
        message.success("Address copied");
      });
    },
    createProposal() {
      setTimeout(() => {
        this.$router.push({ name: "CreateProposal" });
      }, 500);
    },
    enterProposal(id) {
      console.log("Enter proposal with id", id);
      this.$router.push({ name: "Proposal", params: { id } });
    },
  },
};
</script>

<style scoped>
.ant-list-item {
    background-color: #fce4ec;
    border: 1px solid #f8bbd0;
    border-radius: 8px;
    margin-bottom: 16px;
    padding: 16px;
    cursor: pointer;
}

/* ::v-deep .ant-select-selection-placeholder {
  color: rgb(0, 0, 0) !important;
} */
</style>
