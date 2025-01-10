<template>
  <div style="background-color: rgba(222, 134, 222, 0.19);padding: 30px;">
    <a-row :gutter="16" style="max-width: 1000px; margin: auto;">
      <!-- Proposal Details 占3/4宽度 -->
      <a-col :span="16">
        <a-card title="Proposal Overview" :bordered="true" style="background-color: rgba(222, 134, 222, 0.15);" :headStyle="{ fontSize: '20px' }">
          <div style="display: flex; align-items: center; margin-bottom: 16px;">
            <h3 style="margin: 0;">{{ proposalOverview.title }}</h3>
            <a-tag :color="getStatusColor" style="margin-left: 30px;">{{ status }}</a-tag>
          </div>
          <a-list
            item-layout="vertical"
            style="margin: 15px;"
          >
          <a-list-item>
              <a-list-item-meta
                title="Target"
              >
              </a-list-item-meta>
              <div>{{ proposal.target }}</div>
            </a-list-item>
            <a-list-item>
              <a-list-item-meta
                title="Upgrade Type"
              >
              </a-list-item-meta>
              <div>{{ proposal.upgradeType }}</div>
            </a-list-item>
            <a-list-item>
              <a-list-item-meta
                title="Executor"
              >
              </a-list-item-meta>
              <div>{{ proposal.executor }}</div>
            </a-list-item>
            <a-list-item>
              <a-list-item-meta
                title="Start Time"
              >
              </a-list-item-meta>
              <div>{{ proposal.startTime }}</div>
            </a-list-item>
            <a-list-item>
              <a-list-item-meta
                title="End Time"
              >
              </a-list-item-meta>
              <div>{{ proposal.endTime }}</div>
            </a-list-item>
            <a-list-item>
              <a-list-item-meta
                title="Proposer"
              >
              </a-list-item-meta>
              <div>{{ proposal.proposer }}</div>
            </a-list-item>
            <a-list-item>
              <a-list-item-meta
                title="Version"
              >
              </a-list-item-meta>
              <div>{{ proposal.version }}</div>
            </a-list-item>
            <a-list-item>
              <a-list-item-meta
                title="Upgrade Parameter"
              >
              </a-list-item-meta>
              <div>{{ proposal.upgradeParameter }}</div>
            </a-list-item>
            <a-list-item>
              <a-list-item-meta
                title="Target Address"
              >
              </a-list-item-meta>
              <div>{{ proposal.targetAddress }}</div>
            </a-list-item>
            <a-list-item>
              <a-list-item-meta
                title="Manage Permission"
              >
              </a-list-item-meta>
              <div>{{ proposal.managePermission }}</div>
            </a-list-item>
            <a-list-item>
              <a-list-item-meta
                title="Switch To"
              >
              </a-list-item-meta>
              <div>{{ proposal.switchTo }}</div>
            </a-list-item>
            <a-list-item>
              <a-list-item-meta
                title="Upgrade To"
              >
              </a-list-item-meta>
              <div>{{ proposal.upgradeTo }}</div>
            </a-list-item>
          </a-list>
        </a-card>
      </a-col>

      <!-- 其他信息 占1/4宽度 -->
      <a-col :span="8">
        <!-- User Voting Info -->
        <a-card v-if="!hasVotingPower" title="Your Voting Info" style="margin-bottom: 16px;background-color: rgba(222, 134, 222, 0.19);" :body-style="{ padding: '10px' }">
          <p style="padding-left: 15px">You did not participate in this proposal.</p>
          <a-button size="large" style="width: 80%; background-color: rgba(102, 23, 188, 0.73); margin: 0 auto; display: block;color: aliceblue;" :loading="loadingForGetVotingPower" @click="getVotingPower">
            Get Voting Power
          </a-button>
        </a-card>
        <a-card v-else title="Your Voting Info" style="margin-bottom: 16px;background-color: rgba(222, 134, 222, 0.19);" :body-style="{ padding: '10px' }">
          <a-card style="background-color: rgba(222, 134, 222, 0.19);margin: 10px;" :body-style="{ padding: '10px' }">
            <div class="center-content"style="display: flex; justify-content: space-between;text-align: center;margin-left: 10px;margin-right: 10px;align-items: center;">
              <div>
                <p>Yes</p>
                <p style="font-size: 18px; font-weight: bold;">{{ userInfo.yesVotes }}</p>
              </div>
              <div>
                <p>No</p>
                <p style="font-size: 18px; font-weight: bold;">{{ userInfo.noVotes }}</p>
              </div>
              <a-divider type="vertical" style="background-color: black;height: 60px;"></a-divider>
              <div>
                <p>Remainder CGI</p>
                <p style="font-size: 18px; font-weight: bold;">{{ userInfo.votingPower }}</p>
              </div>
            </div>
          </a-card>
          <div style="display: flex;justify-content: space-around;margin-left: -10px;margin-right: -10px;">
            <a-button size="large" style="width: 120px;background-color: rgba(36, 190, 111, 0.35)" @click="showModal">
            <template #icon>
              <UserOutlined />
            </template>
                Vote
            </a-button>
            <a-button size="large" style="width: 120px;background-color: rgba(36, 164, 190, 0.60)">
              <template #icon>
                <TeamOutlined />
              </template>
                  Delegate
            </a-button>
          </div>
        </a-card>

        <!-- Voting Results -->
        <a-card title="Voting Results" style="margin-bottom: 16px;background-color: rgba(222, 134, 222, 0.19);">
          <p style="margin: 0;font-size: 17px;font-family: Arial, sans-serif;">Yes <strong><span style="margin-left: 8px;">{{ votingResults.yes }}</span></strong></p>
          <a-progress
            :percent="votingResults.yesPercent"
            stroke-color="green"
          />
          <p style="margin: 0;font-size: 17px;font-family: Arial, sans-serif;">No <strong><span style="margin-left: 8px;">{{ votingResults.no }}</span></strong></p>
          <a-progress
            :percent="votingResults.noPercent"
            stroke-color="red"
          />
        </a-card>

        <!-- Proposal Details -->
        <a-card title="Proposal Details" style="background-color: rgba(222, 134, 222, 0.19);">
          <!-- <a-timeline>
            <a-timeline-item color="green">
              <template #dot><check-circle-filled style="font-size: 16px;" /></template>
              Created at   <span>{{ proposalDetails.created }}</span>
            </a-timeline-item>
            <a-timeline-item color="green">
              <template #dot><check-circle-filled style="font-size: 16px;" /></template>
              Opening for Voting at   <span>{{ proposalDetails.openingForVote }}</span>
            </a-timeline-item>
            <a-timeline-item color="gray">
              <template #dot><close-circle-filled style="font-size: 16px;" /></template>
              Close Vote at   <span>{{ proposalDetails.closeVote }}</span>
            </a-timeline-item>
            <a-timeline-item color="gray">
              <template #dot><close-circle-filled style="font-size: 16px;" /></template>
              Proxy Executed at   <span>{{ proposalDetails.proxyExecuted }}</span>
            </a-timeline-item>
          </a-timeline> -->
          <a-timeline>
            <a-timeline-item v-for="item in timelineItems" :key="item.label" :color="item.color" :dot="item.icon">
              {{ item.label }}
            </a-timeline-item>
          </a-timeline>
          <a-button size="large" style="width: 100%; background-color: #3915dea6; margin: 0 auto; display: block;" :disabled="!isExecutable" :loading="loadingForExecute" @click="planExecute">
            <!-- <template #icon>
              <TeamOutlined />
            </template> -->
            Execute
          </a-button>
        </a-card>
      </a-col>
    </a-row>
    <VoteModal :open="modalVisible" :userInfo="userInfo" @update:open="cancelVote" @confirm="confirmVote" />
    </div>
</template>

<script>
import { UserOutlined, TeamOutlined, CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import VoteModal from '@page/core/Governance_v1/component/VoteModal.vue';
import { useRoute } from 'vue-router';
import { computed, h } from 'vue';
import { useProposalStore } from "@page/core/Governance_v1/store/governance";
export default {
name: "ProposalOverview",
components: {
    UserOutlined, TeamOutlined, CheckCircleFilled, CloseCircleFilled,
    message,
    VoteModal,
},
setup() {
  const route = useRoute();
  const store = useProposalStore();
  const proposalId = Number(route.params.id);
  // console.log('----------')
  // console.log(store.ProposalList);
  // console.log('----------')
  // console.log(store.proposalInfoList);
  const proposal = computed(() => store.getProposalById(proposalId));
  proposal.value.createdTime = new Date(proposal.value.startTime).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true });
  proposal.value.startTime = new Date(proposal.value.startTime).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true });
  proposal.value.endTime = new Date(proposal.value.endTime).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true });
  proposal.value.executeTime = new Date(proposal.value.executeTime).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true });
  // console.log(proposal.value);
  const user = computed(() => store.getUserInfo);
  // 在user.proposals中查找当前提案,若找到则设置hasVotingPower为true，否则为false,其中user.proposals是一个数组,数组中的每个元素是一个对象，对象中包含提案的id，投票数等信息
  const hasVotingPower = computed(() => {
    return user.value.proposals.some((item) => item.id === proposalId);
  });
  const userInfo = computed(() => {
    if (hasVotingPower.value) {
      const yes = user.value.proposals.find((item) => item.id === proposalId).yes;
      const no = user.value.proposals.find((item) => item.id === proposalId).no;
      return {
        votingPower: user.value.cgi - yes - no,
        yesVotes: yes,
        noVotes: no,
      };
    } else {
      return {
        votingPower: 0,
        yesVotes: 0,
        noVotes: 0,
      };
    }
  });
  const votingResults = computed(() => {
    const proposalOverview = computed(() => store.getProposalListById(proposalId));
    return {
      yes: proposalOverview.value.yesVotes,
      no: proposalOverview.value.noVotes,
      yesPercent: Number((proposalOverview.value.yesVotes / (proposalOverview.value.yesVotes + proposalOverview.value.noVotes) * 100).toFixed(1)),
      noPercent: Number((proposalOverview.value.noVotes / (proposalOverview.value.yesVotes + proposalOverview.value.noVotes) * 100).toFixed(1)),
    };
  });
  const proposalDetails = computed(() => {
      return {
        created: proposal.value.createdTime,
        openingForVote: proposal.value.startTime,
        closeVote: proposal.value.endTime,
        proxyExecuted: proposal.value.executeTime,
      };
    });
  const proposalOverview = computed(() => store.getProposalListById(proposalId));
  const status = computed(() => proposalOverview.value.status);
  const getStatusColor = computed(() => {
    switch (status.value) {
      case 'Created':
        return 'blue';
      case 'Open for voting':
        return 'green';
      case 'Executed':
        return 'purple';
      case 'Cancelled':
        return 'red';
      default:
        return 'default';
    }
  });

  const timelineItems = computed(() => {
    const now = new Date();
    return [
      {
        label: `Created at ${proposalDetails.value.created}`,
        color: now >= new Date(proposal.value.startTime) ? 'green' : 'gray',
        icon: now >= new Date(proposal.value.startTime) ? h(CheckCircleFilled) : h(CloseCircleFilled),
      },
      {
        label: `Opening for Vote at ${proposalDetails.value.openingForVote}`,
        color: now >= new Date(proposal.value.startTime) ? 'green' : 'gray',
        icon: now >= new Date(proposal.value.startTime) ? h(CheckCircleFilled) : h(CloseCircleFilled),
      },
      {
        label: `Close Vote at ${proposalDetails.value.closeVote}`,
        color: now >= new Date(proposal.value.endTime) ? 'green' : 'gray',
        icon: now >= new Date(proposal.value.endTime) ? h(CheckCircleFilled) : h(CloseCircleFilled),
      },
      {
        label: `Proxy Executed at ${proposalDetails.value.proxyExecuted}`,
        color: now >= new Date(proposal.value.endTime) ? 'green' : 'gray',
        icon: now >= new Date(proposal.value.endTime) ? h(CheckCircleFilled) : h(CloseCircleFilled),
      },
    ];
  });

  const isExecutable = computed(() => status.value === 'Executed');


  return {
    proposalId,
    proposal,
    proposalOverview,
    userInfo,
    votingResults,
    proposalDetails,
    hasVotingPower,
    status,
    getStatusColor,
    timelineItems,
    isExecutable};
},
data() {
    return {
    // Proposal主内容
    // proposal: {
    //     title: "Change Parameters for Storage",
    //     target: "Storage",
    //     upgradeType: "Parameter",
    //     executor: "0x12345",
    //     startTime: "Dec 4, 2024 9:16 PM",
    //     endTime: "Dec 5, 2024 9:16 PM",
    //     proposer: "0x0000000000000000000000000000000000000000",
    //     version: "2.0.1",
    //     upgradeParameter: "0x1234",
    //     targetAddress: "0xabc123",
    //     managePermission: "true",
    //     switchTo: "true",
    //     upgradeTo: "2.0.2",
    // },
    // // 用户投票信息
    // userInfo: {
    //     votingPower: 123,
    //     yesVotes: 100,
    //     noVotes: 12,
    // },
    // // 投票结果
    // votingResults: {
    //     yes: 100,
    //     no: 0,
    //     yesPercent: 100,
    //     noPercent: 0,
    // },
    // // 提案时间线详情
    // proposalDetails: {
    //     created: "Dec 4, 2024 9:16 PM",
    //     openingForVote: "Dec 4, 2024 9:16 PM",
    //     closeVote: "Dec 5, 2024 9:16 PM",
    //     proxyExecuted: "Dec 5, 2024 10:00 PM",
    // },
    modalVisible: false,
    loadingForExecute: false,
    loadingForGetVotingPower: false,
  };
},
methods: {
  showModal() {
      this.modalVisible = true;
  },
  cancelVote(data) {
      this.modalVisible = data;
  },
  planExecute() {
    this.loadingForExecute = true;
    setTimeout(() => {
        this.loadingForExecute = false;
        message.success('The plan for proposal begins execution, executor is ' + this.proposal.executor);
    }, 1000);
  },
  getVotingPower() {
    const store = useProposalStore();
    this.loadingForGetVotingPower = true;
    setTimeout(() => {
      this.loadingForGetVotingPower = false;
      store.addVotingPower(this.proposalId);
      message.success('You have successfully obtained the voting power.');
    }, 1000);
  },
  confirmVote(data) {
    const store = useProposalStore();
    store.confirmVote({ proposalId: this.proposalId, ...data });
  }
}
}
</script>

<style scoped>
/* .ant-card {
    background-color: #fff0f5;
    border-radius: 8px;
}

a-button {
    width: 100px;
}

a-progress {
    margin-bottom: 16px;
}

.ant-timeline-item {
    font-size: 14px;
} */
:deep(.ant-list-item-meta) {
  margin: 0 !important;
  height: 30px;
}

.center-content p {
  margin-top: 2px;
  margin-bottom: 2px;
}

:deep(.ant-timeline-item-head) {
  background-color: transparent;
}

:deep(.ant-timeline-item-last){
  padding-bottom: 0;
}
</style>
