// store/index.ts
import create from '@ant-design/icons-vue/lib/components/IconFont';
import { defineStore } from 'pinia';

export const useProposalStore = defineStore('proposal', {
  state: () => ({
    proposals: [] as Array<{ id: number; target: string; upgradeType: string; executor: number; startTime: string; endTime: string; proposer: string; version?: string; upgradeParameter?: string; targetAddress?: string; managePermission?: string; switchTo?: string; upgradeTo?: string }>,
    ProposalList: [
        {
          id: 1,
          title: "Upgrade the governance contract for Governance",
          status: "Created",
          yesVotes: 0,
          noVotes: 0,
        },
        {
          id: 2,
          title: "Upgrade the governance contract for Governance",
          status: "Open for voting",
          yesVotes: 345,
          noVotes: 104,
        },
        {
          id: 3,
          title: "Upgrade the governance contract for Governance",
          status: "Executed",
          yesVotes: 100,
          noVotes: 20,
        },
        {
          id: 4,
          title: "Upgrade the governance contract for Governance",
          status: "Cancelled",
          yesVotes: 100,
          noVotes: 300,
        },
        {
          id: 5,
          title: "Open the treasury for Governance",
          status: "Cancelled",
          yesVotes: 100,
          noVotes: 700,
        },
        {
          id: 6,
          title: "Open the treasury for Governance",
          status: "Executed",
          yesVotes: 1000,
          noVotes: 300,
        },
        {
          id: 7,
          title: "Open the treasury for Governance",
          status: "Open for voting",
          yesVotes: 100,
          noVotes: 20,
        },
        {
          id: 8,
          title: "Stop the treasury for Governance",
          status: "Open for voting",
          yesVotes: 20,
          noVotes: 0,
        },
        {
          id: 9,
          title: "Stop the treasury for Governance",
          status: "Cancelled",
          yesVotes: 200,
          noVotes: 1000,
        },
        {
          id: 10,
          title: "The treasury transfers money for Governance",
          status: "Executed",
          yesVotes: 760,
          noVotes: 10,
        },
        {
          id: 11,
          title: "Cross-chain manage permissions for CrossChain",
          status: "Open for voting",
          yesVotes: 300,
          noVotes: 45,
        },
        {
          id: 12,
          title: "Cross-chain manage permissions for CrossChain",
          status: "Cancelled",
          yesVotes: 100,
          noVotes: 500,
        },
        {
          id: 13,
          title: "Consensus switch for PoT",
          status: "Created",
          yesVotes: 0,
          noVotes: 0,
        },
        {
          id: 14,
          title: "Consensus switch for PoT",
          status: "Open for voting",
          yesVotes: 462,
          noVotes: 123,
        },
        {
          id: 15,
          title: "Cryptographic library upgrade for Cryptography",
          status: "Cancelled",
          yesVotes: 100,
          noVotes: 456,
        },
        {
          id: 16,
          title: "Cryptographic library upgrade for Cryptography",
          status: "Executed",
          yesVotes: 1000,
          noVotes: 300,
        }
    ],
    // 提案详情列表，与ProposalList对应
    proposalInfoList: [
      {
        id: 1,
        target: "Governance",
        upgradeType: "Upgrade the governance contract",
        executor: 1,
        createdTime: "2025-01-07 13:23:15",
        startTime: "2025-01-15 00:00:00",
        endTime: "2025-01-18 00:00:00",
        executeTime: "2025-01-18 00:03:00",
        proposer: "0xc3e8bd231d6r6s68c19c0df",
        version: "1.0.0",
        upgradeParameter: "0x1234",
        targetAddress: null,
        managePermission: null,
        switchTo: null,
        upgradeTo: null
      },
      {
        id: 2,
        target: "Governance",
        upgradeType: "Upgrade the governance contract",
        executor: 1,
        createdTime: "2025-01-06 11:23:50",
        startTime: "2025-01-07 00:00:00",
        endTime: "2025-01-18 00:00:00",
        executeTime: "2025-01-18 00:03:00",
        proposer: "0xc3e8bd231d6r6s68c19c0df",
        version: "1.0.0",
        upgradeParameter: "0x1234",
        targetAddress: null,
        managePermission: null,
        switchTo: null,
        upgradeTo: null
      },
      {
        id: 3,
        target: "Governance",
        upgradeType: "Upgrade the governance contract",
        executor: 1,
        createdTime: "2025-01-06 13:23:15",
        startTime: "2025-01-07 00:00:00",
        endTime: "2025-01-08 00:00:00",
        executeTime: "2025-01-08 00:03:00",
        proposer: "0xc3e8bd231d6r6s68c19c0df",
        version: "1.0.0",
        upgradeParameter: "0x1234",
        targetAddress: null,
        managePermission: null,
        switchTo: null,
        upgradeTo: null
      },
      {
        id: 4,
        target: "Governance",
        upgradeType: "Upgrade the governance contract",
        executor: 1,
        createdTime: "2025-01-06 13:23:15",
        startTime: "2025-01-10 00:00:00",
        endTime: "2025-01-18 00:00:00",
        executeTime: "2025-01-18 00:03:00",
        proposer: "0xc3e8bd231d6r6s68c19c0df",
        version: "1.0.0",
        upgradeParameter: "0x1234",
        targetAddress: null,
        managePermission: null,
        switchTo: null,
        upgradeTo: null
      },
      {
        id: 5,
        target: "Governance",
        upgradeType: "Open the treasury",
        executor: 1,
        createdTime: "2025-01-06 13:23:15",
        startTime: "2025-01-07 00:00:00",
        endTime: "2025-01-18 00:00:00",
        executeTime: "2025-01-18 00:03:00",
        proposer: "0xc3e8bd231d6r6s68c19c0df",
        version: null,
        upgradeParameter: null,
        targetAddress: null,
        managePermission: null,
        switchTo: null,
        upgradeTo: null
      },
      {
        id: 6,
        target: "Governance",
        upgradeType: "Open the treasury",
        executor: 1,
        createdTime: "2025-01-06 13:23:15",
        startTime: "2025-01-07 00:00:00",
        endTime: "2025-01-09 00:00:00",
        executeTime: "2025-01-09 00:03:00",
        proposer: "0xc3e8bd231d6r6s68c19c0df",
        version: null,
        upgradeParameter: null,
        targetAddress: null,
        managePermission: null,
        switchTo: null,
        upgradeTo: null
      },
      {
        id: 7,
        target: "Governance",
        upgradeType: "Open the treasury",
        executor: 1,
        createdTime: "2025-01-06 13:23:15",
        startTime: "2025-01-07 00:00:00",
        endTime: "2025-01-20 00:00:00",
        executeTime: "2025-01-20 00:03:00",
        proposer: "0xc3e8bd231d6r6s68c19c0df",
        version: null,
        upgradeParameter: null,
        targetAddress: null,
        managePermission: null,
        switchTo: null,
        upgradeTo: null
      },
      {
        id: 8,
        target: "Governance",
        upgradeType: "Stop the treasury",
        executor: 1,
        createdTime: "2025-01-06 13:23:15",
        startTime: "2025-01-10 00:00:00",
        endTime: "2025-01-18 00:00:00",
        executeTime: "2025-01-18 00:03:00",
        proposer: "0xc3e8bd231d6r6s68c19c0df",
        version: null,
        upgradeParameter: null,
        targetAddress: null,
        managePermission: null,
        switchTo: null,
        upgradeTo: null
      },
      {
        id: 9,
        target: "Governance",
        upgradeType: "Stop the treasury",
        executor: 1,
        createdTime: "2025-01-06 13:34:12",
        startTime: "2025-01-15 00:00:00",
        endTime: "2025-01-18 00:00:00",
        executeTime: "2025-01-18 00:03:00",
        proposer: "0xc3e8bd231d6r6s68c19c0df",
        version: null,
        upgradeParameter: null,
        targetAddress: null,
        managePermission: null,
        switchTo: null,
        upgradeTo: null
      },
      {
        id: 10,
        target: "Governance",
        upgradeType: "The treasury transfers money",
        executor: 1,
        createdTime: "2025-01-06 12:34:12",
        startTime: "2025-01-07 00:00:00",
        endTime: "2025-01-09 00:00:00",
        executeTime: "2025-01-09 00:03:00",
        proposer: "0xc3e8bd231d6r6s68c19c0df",
        version: null,
        upgradeParameter: null,
        targetAddress: "0xa0Ee7A142d267C1f36714E4a8F75612F20a79720",
        managePermission: null,
        switchTo: null,
        upgradeTo: null
      },
      {
        id: 11,
        target: "CrossChain",
        upgradeType: "Cross-chain manage permissions",
        executor: 1,
        createdTime: "2025-01-06 13:34:12",
        startTime: "2025-01-08 00:00:00",
        endTime: "2025-01-18 00:00:00",
        executeTime: "2025-01-18 00:03:00",
        proposer: "0xc3e8bd231d6r6s68c19c0df",
        version: null,
        upgradeParameter: null,
        targetAddress: null,
        managePermission: "0xa0Ee7A142d267C1f36714E4a8F75612F20a79720",
        switchTo: null,
        upgradeTo: null
      },
      {
        id: 12,
        target: "CrossChain",
        upgradeType: "Cross-chain manage permissions",
        executor: 1,
        createdTime: "2025-01-06 13:56:12",
        startTime: "2025-01-11 00:00:00",
        endTime: "2025-01-18 00:00:00",
        executeTime: "2025-01-18 00:03:00",
        proposer: "0xc3e8bd231d6r6s68c19c0df",
        version: null,
        upgradeParameter: null,
        targetAddress: null,
        managePermission: "0xa0Ee7A142d267C1f36714E4a8F75612F20a79720",
        switchTo: null,
        upgradeTo: null
      },
      {
        id: 13,
        target: "PoT",
        upgradeType: "Consensus switch",
        executor: 1,
        createdTime: "2025-01-06 13:56:12",
        startTime: "2025-01-12 00:00:00",
        endTime: "2025-01-18 00:00:00",
        executeTime: "2025-01-18 00:03:00",
        proposer: "0xc3e8bd231d6r6s68c19c0df",
        version: null,
        upgradeParameter: null,
        targetAddress: null,
        managePermission: null,
        switchTo: "PoS",
        upgradeTo: null
      },
      {
        id: 14,
        target: "PoT",
        upgradeType: "Consensus switch",
        executor: 1,
        createdTime: "2025-01-06 13:56:12",
        startTime: "2025-01-07 00:00:00",
        endTime: "2025-01-18 00:00:00",
        executeTime: "2025-01-18 00:03:00",
        proposer: "0xc3e8bd231d6r6s68c19c0df",
        version: null,
        upgradeParameter: null,
        targetAddress: null,
        managePermission: null,
        switchTo: "PoW",
        upgradeTo: null
      },
      {
        id: 15,
        target: "Cryptography",
        upgradeType: "Cryptographic library upgrade",
        executor: 1,
        createdTime: "2025-01-10 23:47:12",
        startTime: "2025-01-17 00:00:00",
        endTime: "2025-01-18 00:00:00",
        executeTime: "2025-01-18 00:03:00",
        proposer: "0xc3e8bd231d6r6s68c19c0df",
        version: null,
        upgradeParameter: null,
        targetAddress: null,
        managePermission: null,
        switchTo: null,
        upgradeTo: "sha256"
      },
      {
        id: 16,
        target: "Cryptography",
        upgradeType: "Cryptographic library upgrade",
        executor: 1,
        createdTime: "2025-01-06 13:56:12",
        startTime: "2025-01-07 00:00:00",
        endTime: "2025-01-08 00:00:00",
        executeTime: "2025-01-08 00:03:00",
        proposer: "0xc3e8bd231d6r6s68c19c0df",
        version: null,
        upgradeParameter: null,
        targetAddress: null,
        managePermission: null,
        switchTo: null,
        upgradeTo: "sha256"
      }
    ],
    userInfo: {
      id: 1,
      address: "0xc3e8bd231d6r6s68c19c0df",
      bci: 1000,
      cgi: 300,
      punk: 100,
      proposals: [
        // {
        //   id: 1,
        //   yes: 0,
        //   no: 0
        // },
        {
          id: 2,
          yes: 30,
          no: 100
        },
        {
          id: 3,
          yes: 100,
          no: 30
        },
        {
          id: 4,
          yes: 10,
          no: 70
        },
        {
          id: 5,
          yes: 100,
          no: 30
        },
        {
          id: 6,
          yes: 10,
          no: 30
        },
        {
          id: 7,
          yes: 100,
          no: 20
        },
        {
          id: 8,
          yes: 20,
          no: 0
        },
        {
          id: 9,
          yes: 200,
          no: 10
        },
        {
          id: 10,
          yes: 76,
          no: 10
        },
        {
          id: 11,
          yes: 30,
          no: 45
        },
        {
          id: 12,
          yes: 100,
          no: 50
        },
        {
          id: 13,
          yes: 0,
          no: 0
        },
        {
          id: 14,
          yes: 46,
          no: 123
        },
        {
          id: 15,
          yes: 100,
          no: 45
        },
        {
          id: 16,
          yes: 10,
          no: 300
        }
      ],
      stakes: [
        { id: 1, stakedBCI: 100, stakedTime: "10 days", getCGI: 100, status: "supplied" },
        { id: 2, stakedBCI: 200, stakedTime: "20 days", getCGI: 200, status: "supplied" },
        { id: 3, stakedBCI: 150, stakedTime: "5 days", getCGI: 150, status: "supplying" },
        { id: 4, stakedBCI: 300, stakedTime: "30 days", getCGI: 300, status: "supplying" },
        { id: 5, stakedBCI: 250, stakedTime: "25 days", getCGI: 250, status: "supplied" },
        { id: 6, stakedBCI: 350, stakedTime: "35 days", getCGI: 350, status: "supplied" },
        { id: 7, stakedBCI: 400, stakedTime: "40 days", getCGI: 400, status: "supplying" },
        { id: 8, stakedBCI: 450, stakedTime: "45 days", getCGI: 450, status: "supplying" },
        { id: 9, stakedBCI: 500, stakedTime: "50 days", getCGI: 500, status: "supplied" },
        { id: 10, stakedBCI: 550, stakedTime: "55 days", getCGI: 550, status: "supplied" },
      ],
    },
  }),
  getters: {
    getProposals: (state) => state.proposals,
    getProposalById: (state) => (id: number) => state.proposalInfoList.find(proposal => proposal.id === Number(id)),
    getUserInfo: (state) => state.userInfo,
    getProposalListById: (state) => (id: number) => state.ProposalList.find(proposal => proposal.id === Number(id)),
    getUserStakes: (state) => state.userInfo.stakes,
  },
  actions: {
    addProposal(proposal: { id: number; target: string; upgradeType: string; executor: number; startTime: string; endTime: string; proposer: string; version?: string; upgradeParameter?: string; targetAddress?: string; managePermission?: string; switchTo?: string; upgradeTo?: string }) {
      this.proposals.push(proposal);
      this.addForList(proposal);
      this.addForInfoList(proposal);
    },
    addForList(proposal: { id: number; target: string; upgradeType: string; executor: number; startTime: string; endTime: string; proposer: string; version?: string; upgradeParameter?: string; targetAddress?: string; managePermission?: string; switchTo?: string; upgradeTo?: string }) {
      const newProposal = {
        id: this.ProposalList.length + 1,
        title: proposal.upgradeType + " for " + proposal.target,
        status: "Created",
        yesVotes: 0,
        noVotes: 0,
      }
      this.ProposalList.push(newProposal);
    },
    addForInfoList(proposal: { id: number; target: string; upgradeType: string; executor: number; startTime: string; endTime: string; proposer: string; version?: string; upgradeParameter?: string; targetAddress?: string; managePermission?: string; switchTo?: string; upgradeTo?: string }) {
      proposal.id = this.proposalInfoList.length + 1;
      //添加新字段createdTime, executeTime
      proposal.startTime = new Date(proposal.startTime).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true });
      proposal.endTime = new Date(proposal.endTime).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true });
      const newProposal = {
        ...proposal,
        createdTime: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true }),
        executeTime: new Date(new Date(proposal.endTime).getTime() + 6 * 60 * 60 * 1000).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true }),
      }
      console.log(newProposal);
      this.proposalInfoList.push(newProposal);
    },
    addVotingPower(proposalId: number) {
      const proposal = this.userInfo.proposals.find(p => p.id === Number(proposalId));
      if (!proposal) {
        this.userInfo.proposals.push({ id: Number(proposalId), yes: 0, no: 0 });
      }
    },
    confirmVote(data: { proposalId: number, voteOption: 'yes' | 'no', voteCount: number }) {
      const proposal = this.ProposalList.find(p => p.id === data.proposalId);
      if (proposal) {
        if (data.voteOption === 'yes') {
          proposal.yesVotes += data.voteCount;
        } else {
          proposal.noVotes += data.voteCount;
        }
      }

      const userProposal = this.userInfo.proposals.find(p => p.id === data.proposalId);
      if (data.voteOption === 'yes') {
        userProposal.yes += data.voteCount;
      } else {
        userProposal.no += data.voteCount;
      }
    },
    stake(data: { stakedBCI: number, stakedTime: string, getCGI: number }) {
      console.log(data);
      const newStake = {
        id: this.userInfo.stakes.length + 1,
        stakedBCI: data.stakedBCI,
        stakedTime: data.stakedTime,
        getCGI: data.getCGI,
        status: "supplying"
      }
      this.userInfo.stakes.push(newStake);
      this.userInfo.bci -= data.stakedBCI;
      this.userInfo.cgi += data.getCGI;
    },
    unstake(data: { stakedCGI: number, getPunk: number}) {
      this.userInfo.cgi -= data.stakedCGI;
      this.userInfo.punk += data.getPunk;
    }
  }
});
