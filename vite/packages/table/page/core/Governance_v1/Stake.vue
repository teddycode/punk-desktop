<template>
    <div style="background-color: rgba(222, 134, 222, 0.19);padding: 30px;min-height: 100vh;">
        <a-row :gutter="16" style="max-width: 1000px; margin:40px auto;">
            <!-- All Stakes 占2/3宽度 -->
            <a-col :span="16">
                <a-card title="All Stakes" style="background-color: rgba(222, 134, 222, 0.14);" :headStyle="{ fontSize: '20px' }">
                    <div style="display: flex; justify-content: right; align-items: center; margin-bottom: 16px;">
                        <a-select v-model:value="filter" placeholder="Filter Stakes" style="width: 180px;color: black;">
                            <a-select-option value="All Stakes">All Stakes</a-select-option>
                            <a-select-option value="supplied">Supplied</a-select-option>
                            <a-select-option value="supplying">Supplying</a-select-option>
                        </a-select>
                        <a-input
                            v-model:value="search"
                            placeholder="Search stake"
                            :allow-clear="true"
                            style="width: 180px;margin-left: 30px;"
                        >
                            <template #suffix>
                                <search-outlined style="color:rgba(16, 16, 16, 0.46);"/>
                            </template>
                        </a-input>
                    </div>
                    <a-table
                        :columns="columns"
                        :data-source="filteredStakes"
                        :bordered="false"
                        row-key="id"
                        style="text-align: center;"
                        :pagination="{ pageSize: 5 }"
                    >
                      <template #bodyCell="{ column, record }">
                          <template v-if="column.key === 'status'">
                              <a-tag :color="record.status === 'supplied' ? 'green' : 'blue'" style="width: 70px;text-align: center;">{{ record.status }}</a-tag>
                          </template>
                      </template>
                      <template #footer>
                        <div style="display: flex; justify-content: space-between; padding: 0 16px;height: 28px;">
                          <span style="font-size: 15px;font-weight:500;">Staked BCI Overview</span>
                          <a-divider type="vertical" style="position: relative; top: -5px; height: 30px; border: 1px solid rgb(0 0 0 / 21%);"/>
                          <span style="color: #b12a2a;font-weight: 500;">Supplying CGI: {{ totalSupplyingCGI }}</span>
                          <span style="color: #1592db;font-weight: 500;">Supplied CGI: {{ totalSuppliedCGI }}</span>
                        </div>
                      </template>
                    </a-table>
                </a-card>
            </a-col>

            <!-- Stake 占1/3宽度 -->
            <a-col :span="8">
            <a-card :tab-list="tabs" :active-tab-key="activeTab" @tab-change="handleTabChange" :bordered="false" style="background-color: rgba(222, 134, 222, 0.16);max-height: 100%;">
                <div v-if="activeTab === 'stake'">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <p>Account</p>
                    <p>Balance<strong style="margin-left: 5px;">{{ userInfo.bci }} BCI</strong></p>
                  </div>
                  <div style="display: flex;justify-content: space-between;align-items: center;width: 107%;">
                    <a-input
                      v-model:value="amount"
                      placeholder="Enter stake balance"
                      style="margin-bottom: 16px;"
                    >
                      <template #suffix>BCI</template>
                    </a-input>
                    <a-divider type="vertical" style="position: relative;left: -50px;top: -9px;height: 30px;border: 1px solid rgb(0 0 0 / 21%);"/>
                  </div>
                  <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
                    <a-button
                      @click="setPercentage(20)"
                      :style="{ flex: 1, marginRight: '8px', backgroundColor: activeButton === 20 ? '#39c29437' : '' }"
                    >20%</a-button>
                    <a-button
                      @click="setPercentage(50)"
                      :style="{ flex: 1, marginRight: '8px', backgroundColor: activeButton === 50 ? '#39c29437' : '' }"
                    >50%</a-button>
                    <a-button
                      @click="setPercentage(70)"
                      :style="{ flex: 1, marginRight: '8px', backgroundColor: activeButton === 70 ? '#39c29437' : '' }"
                    >70%</a-button>
                    <a-button
                      @click="setPercentage(100)"
                      :style="{ flex: 1, backgroundColor: activeButton === 100 ? '#39c29437' : '' }"
                    >100%</a-button>
                  </div>
                  <a-divider style="margin: 16px 0;" />
                  <a-input
                      v-model:value="selectedDays"
                      placeholder="Enter stake days"
                      style="width: 100%; margin-bottom: 16px;"
                  >
                      <template #addonAfter>
                        <a-select v-model:value="DaySuffix" style="width: 70px;">
                          <a-select-option value="1">day</a-select-option>
                          <a-select-option value="365">year</a-select-option>
                        </a-select>
                      </template>
                  </a-input>
                  <div class="day" style="display: flex; justify-content: space-between; margin-bottom: 16px;">
                    <a-button
                      @click="setDays(10)"
                      :style="{ flex: 1, marginRight: '8px', backgroundColor: activeButton1 === 10 ? '#39c29437' : '', width: '60%' }"
                    >10 days</a-button>
                    <a-button
                      @click="setDays(50)"
                      :style="{ flex: 1, marginRight: '8px', backgroundColor: activeButton1 === 50 ? '#39c29437' : '', width: '60%' }"
                    >50 days</a-button>
                    <a-button
                      @click="setDays(365)"
                      :style="{ flex: 1, marginRight: '8px', backgroundColor: activeButton1 === 365 ? '#39c29437' : '', width: '60%' }"
                    >1 year</a-button>
                    <a-button
                      @click="setDays(10 * 365)"
                      :style="{ flex: 1, backgroundColor: activeButton1 === 10 * 365 ? '#39c29437' : '', width: '20%' }"
                    >10 years</a-button>
                  </div>
                  <a-divider style="margin: 16px 0;" />
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <p>You will get (Est.):</p>
                    <p style="color: green"><strong style="margin-left: 5px;">{{ estimatedReward }} CGI</strong></p>
                  </div>
                  <a-button type="primary" block @click="stakeNow" :loading="loadingStake" style="background-color: #7c70c4;">Stake Now</a-button>
                </div>
                <div v-else>
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <p>Account</p>
                    <p>Balance<strong style="margin-left: 5px;">{{ userInfo.cgi }} CGI</strong></p>
                  </div>
                  <div style="display: flex;justify-content: space-between;align-items: center;width: 107%;">
                    <a-input
                      v-model:value="amountForUnstake"
                      placeholder="Enter unstake balance"
                      style="margin-bottom: 16px;"
                    >
                      <template #suffix>CGI</template>
                    </a-input>
                    <a-divider type="vertical" style="position: relative;left: -50px;top: -9px;height: 30px;border: 1px solid rgb(0 0 0 / 21%);"/>
                  </div>
                  <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
                    <a-button
                      @click="setUnstakePercentage(20)"
                      :style="{ flex: 1, marginRight: '8px', backgroundColor: activeButtonForUnstake === 20 ? '#39c29437' : '' }"
                    >20%</a-button>
                    <a-button
                      @click="setUnstakePercentage(50)"
                      :style="{ flex: 1, marginRight: '8px', backgroundColor: activeButtonForUnstake === 50 ? '#39c29437' : '' }"
                    >50%</a-button>
                    <a-button
                      @click="setUnstakePercentage(70)"
                      :style="{ flex: 1, marginRight: '8px', backgroundColor: activeButtonForUnstake === 70 ? '#39c29437' : '' }"
                    >70%</a-button>
                    <a-button
                      @click="setUnstakePercentage(100)"
                      :style="{ flex: 1, backgroundColor: activeButtonForUnstake === 100 ? '#39c29437' : '' }"
                    >100%</a-button>
                  </div>
                  <a-divider style="margin: 16px 0;bottom: 16px; left: 16px; right: 16px;" />
                  <div style="position: relative;padding-top: 60px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <p>You will get (Est.):</p>
                      <p style="color: green"><strong style="margin-left: 5px;">{{ estimatedRewardForUnstake }} Punk</strong></p>
                    </div>
                    <a-button type="primary" block @click="unstakeNow" :loading="loadingUnstake" style="background-color: #7c70c4;">Unstake Now</a-button>
                  </div>
                </div>
            </a-card>
            </a-col>
        </a-row>
    </div>
</template>

<script>
import { SearchOutlined} from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import { useProposalStore } from './store/governance';
import { computed } from 'vue';
import { Footer } from 'ant-design-vue/es/layout/layout';
export default {
  name: "Stake",
  components: {
    SearchOutlined,
  },
  setup() {
    const store = useProposalStore();
    const stakes = computed(() => store.getUserStakes);
    const userInfo = computed(() => store.getUserInfo);
    return { stakes, userInfo};
  },
  data() {
    return {
      // 左侧 All Stakes 数据
      filter: "All Stakes",
      search: "",
      columns: [
        {
          title: "Staked BCI",
          dataIndex: "stakedBCI",
          key: "stakedBCI",
          sorter: (a, b) => a.stakedBCI - b.stakedBCI,
        },
        {
          title: "Staked Time",
          dataIndex: "stakedTime",
          key: "stakedTime",
          sorter: (a, b) => a.stakedTime - b.stakedTime,
        },
        {
          title: "Get CGI",
          dataIndex: "getCGI",
          key: "getCGI",
          sorter: (a, b) => a.getCGI - b.getCGI,
        },
        {
          title: "Staked Status",
          dataIndex: "status",
          key: "status",
        },
      ],
      // stakes: [
      //   { id: 1, stakedBCI: 100, stakedTime: "10 days", getCGI: 100, status: "supplied" },
      //   { id: 2, stakedBCI: 200, stakedTime: "20 days", getCGI: 200, status: "supplied" },
      //   { id: 3, stakedBCI: 150, stakedTime: "5 days", getCGI: 150, status: "supplying" },
      //   { id: 4, stakedBCI: 300, stakedTime: "30 days", getCGI: 300, status: "supplying" },
      //   { id: 5, stakedBCI: 250, stakedTime: "25 days", getCGI: 250, status: "supplied" },
      //   { id: 6, stakedBCI: 350, stakedTime: "35 days", getCGI: 350, status: "supplied" },
      //   { id: 7, stakedBCI: 400, stakedTime: "40 days", getCGI: 400, status: "supplying" },
      //   { id: 8, stakedBCI: 450, stakedTime: "45 days", getCGI: 450, status: "supplying" },
      //   { id: 9, stakedBCI: 500, stakedTime: "50 days", getCGI: 500, status: "supplied" },
      //   { id: 10, stakedBCI: 550, stakedTime: "55 days", getCGI: 550, status: "supplied" },
      // ],

      // 右侧 Stake 数据
      tabs: [
        { key: "stake", tab: "Stake" },
        { key: "unstake", tab: "Unstake" },
      ],
      activeTab: "stake",
      amount: "", // 输入的数量
      amountForUnstake: "", // 输入的数量
      selectedDays: null, // 选中的天数
      DaySuffix: "1", // 选择的天数后缀
      estimatedReward: 0, // 预估奖励
      estimatedRewardForUnstake: 0, // 预估奖励
      activeButton: null, // 选中的按钮
      activeButton1: null, // 选中的按钮
      activeButtonForUnstake: null, // 选中的按钮
      loadingStake: false,
      loadingUnstake: false,
    };
  },
  computed: {
    filteredStakes() {
      let filtered = this.stakes;
      if (this.filter !== "All Stakes") {
        filtered = filtered.filter(stake => stake.status === this.filter);
      }
      if (this.search) {
        filtered = filtered.filter(stake =>
          stake.stakedVSI.toString().includes(this.search) ||
          stake.stakedTime.includes(this.search) ||
          stake.status.includes(this.search)
        );
      }
      return filtered;
    },
    totalSupplyingCGI() {
      return this.stakes.reduce((total, stake) => {
        if (stake.status === "supplying") {
          total += stake.getCGI;
        }
        return total;
      }, 0);
    },
    totalSuppliedCGI() {
      return this.stakes.reduce((total, stake) => {
        if (stake.status === "supplied") {
          total += stake.getCGI;
        }
        return total;
      }, 0);
    },
},
  methods: {
    handleTabChange(key) {
      this.activeTab = key;
    },
    setPercentage(percentage) {
      this.amount = Math.floor((this.userInfo.bci * percentage) / 100);
      this.calculateReward();
      this.activeButton = percentage;
    },
    setUnstakePercentage(percentage) {
      this.amountForUnstake = Math.floor((this.userInfo.cgi * percentage) / 100);
      this.calculateReward();
      this.activeButtonForUnstake = percentage;
    },
    setDays(days) {
      if(days === 10){
        this.selectedDays = 10;
        this.DaySuffix = "1";
      }else if(days === 50){
        this.selectedDays = 50;
        this.DaySuffix = "1";
      }else if(days === 365){
        this.selectedDays = 1;
        this.DaySuffix = "365";
      }else if(days === 10 * 365){
        this.selectedDays = 10;
        this.DaySuffix = "365";
      }
      this.calculateReward();
      this.activeButton1 = days;
    },
    calculateReward() {
      // 简单的奖励计算逻辑:使用amount selectedDays DaySuffix
      // this.estimatedReward = this.amount * this.selectedDays;
      // this.estimatedReward = this.DaySuffix === "1" ? this.estimatedReward : this.estimatedReward * 3;
      if(this.activeTab === "stake"){
        this.estimatedReward = this.amount * this.selectedDays;
        this.estimatedReward = this.DaySuffix === "1" ? this.estimatedReward : this.estimatedReward * 3;
      }else{
        this.estimatedRewardForUnstake = this.amountForUnstake * 2;
      }
    },
    stakeNow() {
      if (!this.amount || !this.selectedDays) {
        message.error("Please enter stake amount and days!");
        return;
      }
      const store = useProposalStore();
      this.loadingStake = true;
      setTimeout(() => {
        try {
          const data = {
            stakedBCI: this.amount,
            stakedTime: this.selectedDays + " " + (this.DaySuffix === "1" ? "days" : "years"),
            getCGI: this.estimatedReward,
          }
          store.stake(data);
          message.success(`Stake ${this.amount} BCI for ${this.selectedDays} ${this.DaySuffix === "1" ? "days" : "years"} successfully!`);
          this.amount = "";
          this.selectedDays = null;
          this.activeButton = null;
          this.activeButton1 = null;
        } catch (error) {
          message.error(error.message);
        } finally {
          this.loadingStake = false;
        }
      }, 1000);
    },
    unstakeNow() {
      if (!this.amountForUnstake) {
        message.error("Please enter unstake amount!");
        return;
      }
      const store = useProposalStore();
      this.loadingUnstake = true;
      setTimeout(() => {
        try {
          const data = {
            stakedCGI: this.amountForUnstake,
            getPunk: this.estimatedRewardForUnstake,
          }
          store.unstake(data);
          message.success(`Withdraw ${this.amountForUnstake} CGI successfully!`);
          this.amountForUnstake = "";
          this.activeButtonForUnstake = null;
        } catch (error) {
          message.error(error.message);
        } finally {
          this.loadingUnstake = false;
        }
      }, 1000);
    },
  },
  watch: {
    amount() {
      this.calculateReward();
    },
    amountForUnstake() {
      this.calculateReward();
    },
    selectedDays() {
      this.calculateReward();
    },
  },
};
</script>

<style scoped>
/* .ant-card {
  background-color: #e0f2f1;
  border-radius: 8px;
}

a-button {
  width: 80px;
}

.ant-table {
  margin-top: 16px;
}

a-input,
a-select {
  margin-bottom: 16px;
} */

:deep(.ant-table-column-title){
    text-align: center;
}

:deep(.ant-table-cell){
    text-align: center !important;
}

:deep(.ant-table-wrapper table){
    border-spacing:0 0px;
}

:deep(thead.ant-table-thead > tr > th){
    /* background-color: rgba(84, 188, 189, 0.27); */
    /* background-color: rgb(213 217 245 / 90%); */
    background-color: rgb(181 201 217 / 70%);
}

:deep(tbody.ant-table-tbody > tr > td){
    /* background-color: rgba(84, 188, 189, 0.15); */
    /* background-color: rgb(160 179 222 / 40%); */
    background-color: rgb(181 201 217 / 57%);
}

:deep(.ant-input-group-addon .ant-select){
  background-color: #fff !important;
  border-radius: 8px;
  position: relative;
  .ant-select-selector{
    height: 30px;
  }
}

:deep(.day .ant-btn){
  padding: 2px;
}

:deep(.ant-table-wrapper .ant-table) {
    border-radius: 8px;
}

:deep(.ant-table-wrapper .ant-table-footer) {
    border-radius: 0 0 8px 8px;
    background-color: rgba(135, 161, 182, 0.4);
    padding-top: 10px;
    padding-bottom: 5px;
}
</style>
