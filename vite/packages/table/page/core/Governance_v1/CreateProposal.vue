<template>
  <div style="background-color: rgba(222, 134, 222, 0.19);padding: 80px 30px 30px 30px;min-height: 100vh;">
    <a-card title="Create Proposal" style="max-width: 800px; margin: auto;background-color: rgba(84, 188, 189, 0.25);" :headStyle="{ fontSize: '20px' }">
      <a-form :model="form" layout="vertical">
        <!-- Target -->
        <a-form-item label="Target" name="target" required>
          <a-select v-model:value="form.target" placeholder="Select target" @change="onTargetChange">
            <a-select-option value="Governance">Governance</a-select-option>
            <a-select-option value="CrossChain">CrossChain</a-select-option>
            <a-select-option value="PoT">PoT</a-select-option>
            <a-select-option value="Cryptography">Cryptography</a-select-option>
          </a-select>
        </a-form-item>

        <!-- Upgrade type -->
        <a-form-item label="Upgrade type" name="upgradeType" required>
          <a-select v-model:value="form.upgradeType" placeholder="Select upgrade type" @change="onUpgradeTypeChange">
            <a-select-option v-if="form.target === 'Governance'" value="Upgrade the governance contract">Upgrade the governance contract</a-select-option>
            <a-select-option v-if="form.target === 'Governance'" value="Stop the treasury">Stop the treasury</a-select-option>
            <a-select-option v-if="form.target === 'Governance'" value="Open the treasury">Open the treasury</a-select-option>
            <a-select-option v-if="form.target === 'Governance'" value="The treasury transfers money">The treasury transfers money</a-select-option>
            <a-select-option v-if="form.target === 'CrossChain'" value="Cross-chain manage permissions">Cross-chain manage permissions</a-select-option>
            <a-select-option v-if="form.target === 'PoT'" value="Consensus switch">Consensus switch</a-select-option>
            <a-select-option v-if="form.target === 'Cryptography'" value="Cryptographic library upgrade">Cryptographic library upgrade</a-select-option>
          </a-select>
        </a-form-item>

        <!-- Executor -->
        <a-form-item label="Executor" name="executor" required>
          <a-input-number v-model:value="form.executor" placeholder="Enter executor (uint256)" style="width: 100%" />
        </a-form-item>

        <!-- Start time -->
        <a-form-item label="Start time" name="startTime" required>
          <a-date-picker v-model:value="form.startTime" show-time style="width: 100%" />
        </a-form-item>

        <!-- End time -->
        <a-form-item label="End time" name="endTime" required>
          <a-date-picker v-model:value="form.endTime" show-time style="width: 100%" />
        </a-form-item>

        <!-- Proposer -->
        <a-form-item label="Proposer" name="proposer" required>
          <a-input v-model:value="form.proposer" placeholder="Enter proposer address" />
        </a-form-item>

        <!-- Conditional Fields -->
        <a-form-item v-if="showFields.version" label="Version" name="version">
          <a-input v-model:value="form.version" placeholder="Enter version (e.g., 2.0.1)" />
        </a-form-item>

        <a-form-item v-if="showFields.upgradeParameter" label="Upgrade parameter" name="upgradeParameter">
          <a-input v-model:value="form.upgradeParameter" placeholder="Enter upgrade parameter" />
        </a-form-item>

        <a-form-item v-if="showFields.targetAddress" label="Target address" name="targetAddress">
          <a-input v-model:value="form.targetAddress" placeholder="Enter target address" />
        </a-form-item>

        <a-form-item v-if="showFields.managePermission" label="Manage permission" name="managePermission">
          <a-input v-model:value="form.managePermission" placeholder="Enter manage permission role" />
        </a-form-item>

        <a-form-item v-if="showFields.switchTo" label="Switch to" name="switchTo">
          <a-input v-model:value="form.switchTo" placeholder="Enter switch to address" />
        </a-form-item>

        <a-form-item v-if="showFields.upgradeTo" label="Upgrade to" name="upgradeTo">
          <a-input v-model:value="form.upgradeTo" placeholder="Enter upgrade to address" />
        </a-form-item>

        <!-- Submit Button -->
        <a-form-item>
          <a-button style="background-color: rgba(85, 65, 184, 0.73);" type="primary" block @click="showModal">Create Proposal</a-button>
        </a-form-item>
      </a-form>

      <!-- Modal Component -->
      <Modal
        :open="isModalOpen"
        @update:open="isModalOpen = $event"
        @confirm="createProposal"
      />
    </a-card>
  </div>
</template>

<script>
import Modal from "./component/Modal.vue";
import { useProposalStore } from "@page/core/Governance_v1/store/governance";

export default {
  name: "CreateProposal",
  components: {
    Modal,
  },
  data() {
    return {
      form: {
        target: null,
        upgradeType: null,
        executor: null,
        startTime: null,
        endTime: null,
        proposer: null,
        version: "",
        upgradeParameter: "",
        targetAddress: "",
        managePermission: "",
        switchTo: "",
        upgradeTo: "",
      },
      showFields: {
        version: false,
        upgradeParameter: false,
        targetAddress: false,
        managePermission: false,
        switchTo: false,
        upgradeTo: false,
      },
      isModalOpen: false, // 控制 Modal 显示
    };
  },
  computed: {
    // 计算属性
    proposals() {
      return useProposalStore().proposals;
    },
  },
  methods: {
    onTargetChange() {
      this.form.upgradeType = null;
      this.updateVisibleFields();
    },
    onUpgradeTypeChange() {
      this.updateVisibleFields();
    },
    updateVisibleFields() {
      const { target, upgradeType } = this.form;

      this.showFields = {
        version: target === "Governance" && upgradeType === "Upgrade the governance contract",
        upgradeParameter: target === "Governance" && upgradeType === "Upgrade the governance contract",
        targetAddress: target === "Governance" && upgradeType === "The treasury transfers money",
        managePermission: target === "CrossChain" && upgradeType === "Cross-chain manage permissions",
        switchTo: target === "PoT" && upgradeType === "Consensus switch",
        upgradeTo: target === "Cryptography" && upgradeType === "Cryptographic library upgrade",
      };
    },
    showModal() {
      this.isModalOpen = true; // 打开 Modal
    },
    createProposal() {
      const store = useProposalStore();
      // console.log("Proposal Data:", this.form);
      // 添加提交提案的逻辑
      const newProposal = {
        id: store.proposals.length + 1,
        ...this.form,
      };
      store.addProposal(newProposal);
      // console.log("Proposal Data:", store.ProposalList);
      this.$router.push({ name: "GovernancePage" });
    },
  },
};
</script>

<style scoped>
/* .card {
  background-color: #543166;
  padding: 16px;
  border-radius: 8px;
} */
</style>
