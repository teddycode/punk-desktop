<template>
  <div class="content">
    <!-- POT交易信息 -->
    <a-card size="default" title="POT交易" :bordered="true">
      <a-card-meta title="POT当前高度" />
      <a-card-body>
        <a-row :gutter="16">
          <a-col :span="4">
            <a-statistic :value="33" />
          </a-col>
        </a-row>
      </a-card-body>
    </a-card>

    <!-- 交易操作区域 -->
    <div class="transaction-control-area">
      <div class="control-group">
        <h3 class="section-title1">POT交易单</h3>
        <a-select
          v-model:value="selectedTransactionType"
          style="width: 200px; margin-left: 16px;"
          placeholder="请选择交易类型"
        >
          <a-select-option value="initial">初始锁定交易</a-select-option>
          <a-select-option value="locked">锁定流通交易</a-select-option>
          <a-select-option value="unlocked">非锁定流通交易</a-select-option>
          <a-select-option value="bci">Bci销毁交易</a-select-option>
        </a-select>
      </div>

      <!-- 输入框区域 -->
      <div class="input-area">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="Txid" :rules="[{ required: true, message: '请输入Txid' }]">
              <a-input v-model:value="txid" placeholder="请输入Txid" :disabled="isTxidDisabled"/>
            </a-form-item>
          </a-col>

          <a-col :span="12">
            <a-form-item label="交易费用" :rules="[{ required: true, message: '请输入交易费用' }]">
              <a-input
                v-model:value="transactionFee"
                :min="0"
                :precision="8"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="24">
            <a-form-item label="私钥">
              <a-input-password
                v-model:value="privateKey"
                placeholder="请输入私钥"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <!-- 按钮区域 -->
        <a-row :gutter="16">
          <a-col :span="12">
            <a-button
              type="dashed"
              @click="openTxInputModal"
              style="width: 100%; margin-top: 16px;"
            >
              + 新增 TxInput
            </a-button>
          </a-col>
          <a-col :span="12">
            <a-button
              type="dashed"
              @click="openTxOutputModal"
              style="width: 100%; margin-top: 16px;"
              :disabled="(selectedTransactionType === 'initial' || selectedTransactionType === 'bci') && txoutputs.length >= 1"
            >
              + 新增 TxOutput
            </a-button>
          </a-col>
        </a-row>
      </div>

      <!-- 交易输入输出展示区域 -->
      <a-row :gutter="24" class="io-display-area">
        <!-- TxInputs 列 -->
        <a-col :span="12">
          <div class="pending-transactions">
            <div class="header-container">
              <h3 class="section-title">TxInputs ({{ txinputs.length }})</h3>
              <a-pagination
                v-if="txinputs.length > pageSize"
                size="small"
                :current="currentPageInput"
                :pageSize="pageSize"
                :total="txinputs.length"
                @change="page => currentPageInput = page"
                class="pagination"
              />
            </div>
            <div v-if="txinputs.length === 0" class="empty-tip">暂无输入信息</div>
            <div v-else class="transaction-list">
              <a-tag
                v-for="(txInput, index) in paginatedInputs"
                :key="`input-${index}`"
                closable
                @close="removeTxInput(getRealIndex('input', index))"
                @click="openEditModal('input', getRealIndex('input', index))"
                class="transaction-tag"
              >
                <span class="tx-index">TxInput#{{ getRealIndex('input', index) + 1 }}</span>
                <span class="tx-value">{{ txInput.txInputValue }} POT</span>
              </a-tag>
            </div>
          </div>
        </a-col>

        <!-- TxOutputs 列 -->
        <a-col :span="12">
          <div class="pending-transactions">
            <div class="header-container">
              <h3 class="section-title">TxOutputs ({{ txoutputs.length }})</h3>
              <a-pagination
                v-if="txoutputs.length > pageSize"
                size="small"
                :current="currentPageOutput"
                :pageSize="pageSize"
                :total="txoutputs.length"
                @change="page => currentPageOutput = page"
                class="pagination"
              />
            </div>
            <div v-if="txoutputs.length === 0" class="empty-tip">暂无输出信息</div>
            <div v-else class="transaction-list">
              <a-tag
                v-for="(txOutput, index) in paginatedOutputs"
                :key="`output-${index}`"
                closable
                @close="removeTxOutput(getRealIndex('output', index))"
                @click="openEditModal('output', getRealIndex('output', index))"
                class="transaction-tag"
              >
                <span class="tx-index">TxOutput#{{ getRealIndex('output', index) + 1 }}</span>
                <span class="tx-value">{{ txOutput.txOutputValue }} POT</span>
              </a-tag>
            </div>
          </div>
        </a-col>
      </a-row>


      <!-- TxInput 模态框 -->
      <a-modal
        v-model:visible="txInputModalVisible"
        title="Add Transaction Input"
        width="800px"
        @ok="saveTxInput"
      >
        <a-form layout="vertical">
          <a-row :gutter="24">
            <a-col :span="12">
              <a-form-item label="Txid">
                <a-input v-model:value="currentTxInput.txInputTxid" placeholder="Input transaction ID"/>
              </a-form-item>
              <a-form-item label="Voutput">
                <a-input v-model:value="currentTxInput.txInputVoutput" placeholder="Input vout index"/>
              </a-form-item>
              <a-form-item label="Value">
                <a-input v-model:value="currentTxInput.txInputValue" placeholder="Input amount in POT"/>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="Address">
                <a-input v-model:value="currentTxInput.txInputAddress" placeholder="Input wallet address"/>
              </a-form-item>
              <a-form-item label="Scriptsig">
                <a-row :gutter="8">
                  <a-col :span="16">
                    <a-input v-model:value="currentTxInput.txInputScriptsig" placeholder="Click button to generate"/>
                  </a-col>
                  <a-col :span="8">
                    <a-button @click="calculateSignature" block>Generate</a-button>
                  </a-col>
                </a-row>
              </a-form-item>
              <a-form-item label="BciType">
                <a-input v-model:value="currentTxInput.txInputBciType" placeholder="Input BCI type"/>
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </a-modal>

      <!-- TxOutput 模态框 -->
      <a-modal
        v-model:visible="txOutputModalVisible"
        title="Add Transaction Output"
        width="800px"
        @ok="saveTxOutput"
      >
        <a-form layout="vertical">
          <a-row :gutter="24">
            <a-col :span="12">
              <a-form-item label="Address">
                <a-input v-model:value="currentTxOutput.txOutputAddress" placeholder="Receiver address"/>
              </a-form-item>
              <a-form-item label="Value">
                <a-input v-model:value="currentTxOutput.txOutputValue" placeholder="Amount in POT"/>
              </a-form-item>
              <a-form-item label="Interest">
                <a-input v-model:value="currentTxOutput.txOutputInterest" placeholder="Interest rate"/>
              </a-form-item>
              <a-form-item label="Proof">
                <a-input v-model:value="currentTxOutput.txOutputProof" placeholder="Transaction proof"/>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="LockTime">
                <a-input v-model:value="currentTxOutput.txOutputLockTime" placeholder="Lock time in blocks"/>
              </a-form-item>
              <a-form-item label="BciType">
                <a-input v-model:value="currentTxOutput.txOutputBciType" placeholder="BCI type"/>
              </a-form-item>
              <a-form-item label="Data">
                <a-input v-model:value="currentTxOutput.txOutputData" placeholder="Additional data"/>
              </a-form-item>
              <a-form-item label="BurnLock">
                <a-input v-model:value="currentTxOutput.txOutputBurnLock" placeholder="Burn lock status"/>
              </a-form-item>
              <a-form-item label="Rate">
                <a-input v-model:value="currentTxOutput.txOutputRate" placeholder="Exchange rate"/>
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </a-modal>
      <!-- 添加编辑模态框 -->
      <a-modal
        v-model:visible="editModalVisible"
        :title="editModalTitle"
        width="800px"
        @ok="handleEditSubmit"
        @cancel="cancelEdit"
      >
        <!-- TxInput编辑表单 -->
        <a-form layout="vertical" v-if="editingType === 'input'">
          <a-row :gutter="24">
            <a-col :span="12">
              <a-form-item label="Txid">
                <a-input v-model:value="currentEditItem.txInputTxid"/>
              </a-form-item>
              <a-form-item label="Voutput">
                <a-input v-model:value="currentEditItem.txInputVoutput"/>
              </a-form-item>
              <a-form-item label="Value">
                <a-input v-model:value="currentEditItem.txInputValue"/>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="Address">
                <a-input v-model:value="currentEditItem.txInputAddress"/>
              </a-form-item>
              <a-form-item label="Scriptsig">
                <a-input v-model:value="currentEditItem.txInputScriptsig"/>
              </a-form-item>
              <a-form-item label="BciType">
                <a-input v-model:value="currentEditItem.txInputBciType"/>
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>

        <!-- TxOutput编辑表单 -->
        <a-form layout="vertical" v-if="editingType === 'output'">
          <a-row :gutter="24">
            <!-- 左列 -->
            <a-col :span="12">
              <a-form-item label="Address">
                <a-input v-model:value="currentEditItem.txOutputAddress"/>
              </a-form-item>
              <a-form-item label="Value">
                <a-input v-model:value="currentEditItem.txOutputValue"/>
              </a-form-item>
              <a-form-item label="Interest">
                <a-input v-model:value="currentEditItem.txOutputInterest"/>
              </a-form-item>
              <a-form-item label="LockTime">
                <a-input v-model:value="currentEditItem.txOutputLockTime"/>
              </a-form-item>
            </a-col>

            <!-- 右列 -->
            <a-col :span="12">
              <a-form-item label="BciType">
                <a-input v-model:value="currentEditItem.txOutputBciType"/>
              </a-form-item>
              <a-form-item label="BurnLock">
                <a-input v-model:value="currentEditItem.txOutputBurnLock"/>
              </a-form-item>
              <a-form-item label="Proof">
                <a-input v-model:value="currentEditItem.txOutputProof"/>
              </a-form-item>
              <a-form-item label="Data">
                <a-input v-model:value="currentEditItem.txOutputData"/>
              </a-form-item>
              <a-form-item label="Rate">
                <a-input v-model:value="currentEditItem.txOutputRate"/>
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>

      </a-modal>


      <div class="submit-area">
        <a-space>
          <a-button
            type="dashed"
            @click="generateTestData"
            style="margin-right: 16px;"
          >
            生成测试样例
          </a-button>
          <a-button
            type="primary"
            size="large"
            @click="submitForm"
            class="submit-all-button"
          >
            提交交易（{{ txinputs.length }}输入 / {{ txoutputs.length }}输出）
          </a-button>
        </a-space>
      </div>
    </div>

    <!-- 已提交交易 -->
    <a-card
      size="default"
      title="已提交交易"
      :bordered="true"
      class="submitted-transactions-card"
      style="margin-top: 24px;"
    >
      <a-card-body>
        <!-- 搜索框 -->
        <a-row :gutter="[16, 16]" style="margin-bottom: 16px;">
          <a-col :span="8">
            <a-input-search
              placeholder="搜索 Txid"
              v-model:value="transactionSearchTxid"
              enter-button
              style="width: 100%;"
            />
          </a-col>
          <a-col :span="4">
            <a-button @click="resetTransactionSearch" style="width: 100%;">重置</a-button>
          </a-col>
        </a-row>

        <!-- 修改表格列定义 -->
        <a-table
          :columns="transactionColumns"
          :data-source="filteredTransactions"
          :row-key="record => record.id"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'action'">
              <a-space>
                <a-button
                  type="link"
                  @click="showTransactionDetail(record)"
                  :icon="h(EyeOutlined)"
                />
              </a-space>
            </template>
            <template v-else-if="column.dataIndex === 'inputCount'">
              {{ record.inputs.length }}
            </template>
            <template v-else-if="column.dataIndex === 'outputCount'">
              {{ record.outputs.length }}
            </template>
          </template>
        </a-table>

        <a-modal
          v-model:visible="transactionDetailVisible"
          title="交易详情"
          width="800px"
          :footer="null"
        >
          <a-descriptions :column="2" bordered>
            <!-- 基础信息 -->
            <a-descriptions-item label="交易ID" span="2">
              {{ selectedTransaction.txid }}
            </a-descriptions-item>
            <a-descriptions-item label="手续费">
              {{ selectedTransaction.transactionFee }} POT
            </a-descriptions-item>
            <a-descriptions-item label="提交时间">
              {{ selectedTransaction.time }}
            </a-descriptions-item>

            <!-- 输入列表增强 -->
            <a-descriptions-item label="输入详情" span="2">
              <a-list size="small" bordered>
                <a-list-item
                  v-for="(input, index) in selectedTransaction.inputs"
                  :key="index"
                >
                  <a-space direction="vertical">
                    <div>地址：{{ input.Address }}</div>
                    <div>金额：{{ input.Value }} POT</div>
                    <div>类型：{{ input.BciType }}</div>
                    <div>来源交易：{{ input.Txid }}</div>
                  </a-space>
                </a-list-item>
              </a-list>
            </a-descriptions-item>

            <!-- 输出列表增强 -->
            <a-descriptions-item label="输出详情" span="2">
              <a-list size="small" bordered>
                <a-list-item
                  v-for="(output, index) in selectedTransaction.outputs"
                  :key="index"
                >
                  <a-space direction="vertical">
                    <div>地址：{{ output.Address }}</div>
                    <div>金额：{{ output.Value }} POT</div>
                    <div>锁定时间：{{ output.LockTime }} 区块</div>
                    <div>类型：{{ output.BciType }}</div>
                  </a-space>
                </a-list-item>
              </a-list>
            </a-descriptions-item>
          </a-descriptions>
        </a-modal>

      </a-card-body>
    </a-card>
  </div>
</template>

<script>

import {defineComponent, reactive, ref, computed, h} from 'vue';
import {Modal} from 'ant-design-vue';
import axios from 'axios';
import { EyeOutlined } from '@ant-design/icons-vue';

export default defineComponent({
  methods: {h},
  setup() {
    // 交易基本信息
    const txid = ref('');
    const transactionFee = ref('');
    const privateKey = ref('');
    const selectedTransactionType = ref(null);

    // 输入输出列表
    const txinputs = ref([]);
    const txoutputs = ref([]);

    // 模态框状态
    const txInputModalVisible = ref(false);
    const txOutputModalVisible = ref(false);

    // 编辑相关状态
    const editModalVisible = ref(false);
    const editingType = ref('input'); // 'input' 或 'output'
    const editingIndex = ref(-1);
    const currentEditItem = reactive({});

    const pageSize = ref(9);
    const currentPageInput = ref(1);
    const currentPageOutput = ref(1);

    const transactionColumns = ref([
      { title: '交易ID', dataIndex: 'txid', key: 'txid' },
      { title: '手续费 (POT)', dataIndex: 'transactionFee', key: 'fee' },
      { title: '提交时间', dataIndex: 'time', key: 'time' },
      { title: '输入数量', dataIndex: 'inputCount', key: 'inputCount' },
      { title: '输出数量', dataIndex: 'outputCount', key: 'outputCount' },
      { title: '操作', dataIndex: 'action', key: 'action' }
    ]);
    // 计算分页后的数据
    const paginatedInputs = computed(() => {
      const start = (currentPageInput.value - 1) * pageSize.value;
      return txinputs.value.slice(start, start + pageSize.value);
    });

    const paginatedOutputs = computed(() => {
      const start = (currentPageOutput.value - 1) * pageSize.value;
      return txoutputs.value.slice(start, start + pageSize.value);
    });
    // 当前编辑的输入输出
    const currentTxInput = reactive({
      txInputTxid: '',
      txInputVoutput: '',
      txInputScriptsig: '',
      txInputValue: '',
      txInputAddress: '',
      txInputBciType: ''
    });

    const currentTxOutput = reactive({
      txOutputAddress: '',
      txOutputValue: '',
      txOutputInterest: '',
      txOutputProof: '',
      txOutputLockTime: '',
      txOutputBciType: '',
      txOutputData: '',
      txOutputBurnLock: '',
      txOutputRate: '',
      txOutputCreatedAt: ''
    });

    const isRestrictedType = computed(() =>
      ['initial', 'bci'].includes(selectedTransactionType.value)
    );

    const generateTestData = () => {
      // 清空现有数据
      txinputs.value = [];
      txoutputs.value = [];

      // 填充基础信息
      txid.value = '0x57c4c61bdf2f66e53bffc594cc9e7a75b15d38c54b74703a2129a3c4958015bf';
      transactionFee.value = '0';
      privateKey.value = '123456';

      // 添加TxInput
      txinputs.value.push({
        txInputTxid: '0x89e5feab71c9ccd7f3a999605d012eaf208703a6130b91dc6328fd4a9e976d0d',
        txInputVoutput: '0',
        txInputValue: '32768',
        txInputAddress: '0xa47155b42648816998e576ffbfa045ab00000000000000007662a30d4b5875b73a8768fcf01bf52d2326a7660e24033a',
        txInputScriptsig: '0xa47155b42648816998e576ffbfa045ab00000000000000007662a30d4b5875b73a8768fcf01bf52d2326a7660e24033a',
        txInputBciType: '1'
      });

      // 添加TxOutput
      txoutputs.value.push({
        txOutputAddress: '0xa47155b42648816998e576ffbfa045ab00000000000000007662a30d4b5875b73a8768fcf01bf52d2326a7660e24033a',
        txOutputValue: '32768',
        txOutputInterest: '10',
        txOutputLockTime: '7',
        txOutputBciType: '1',
        txOutputBurnLock: '0',
        txOutputProof: '0x00',
        txOutputData: '0x00',
        txOutputRate: '0.00'
      });
    };

    // 提交记录相关
    const transactionSearchTxid = ref('');
    const transactionDetailVisible = ref(false);
    const selectedTransaction = ref({});
    const transactionHistory = ref([]);

    // 打开编辑模态框
    const openEditModal = (type, index) => {
      editingType.value = type;
      editingIndex.value = index;

      if (type === 'input') {
        Object.assign(currentEditItem, txinputs.value[index]);
      } else {
        Object.assign(currentEditItem, txoutputs.value[index]);
      }

      editModalVisible.value = true;
    };

    // 提交编辑
    const handleEditSubmit = () => {
      if (editingType.value === 'input') {
        txinputs.value.splice(editingIndex.value, 1, {...currentEditItem});
      } else {
        txoutputs.value.splice(editingIndex.value, 1, {...currentEditItem});
      }
      editModalVisible.value = false;
    };

    // 取消编辑
    const cancelEdit = () => {
      editingIndex.value = -1;
      Object.keys(currentEditItem).forEach(key => delete currentEditItem[key]);
      editModalVisible.value = false;
    };

    // 计算模态框标题
    const editModalTitle = computed(() =>
      `${editingType.value === 'input' ? 'Edit TxInput' : 'Edit TxOutput'} #${editingIndex.value + 1}`
    );
    // 方法
    const openTxInputModal = () => {
      Object.assign(currentTxInput, {
        txInputTxid: '',
        txInputVoutput: '',
        txInputScriptsig: '',
        txInputValue: '',
        txInputAddress: '',
        txInputBciType: ''
      });
      txInputModalVisible.value = true;
    };

    const calculateSignature = () => {
      // 简单模拟签名生成
      currentTxInput.txInputScriptsig = `SIG_${Math.random().toString(36).substr(2, 9)}`;
    };

    const saveTxInput = () => {
      txinputs.value.push({...currentTxInput});
      txInputModalVisible.value = false;
    };

    const openTxOutputModal = () => {
      if (isRestrictedType.value && txoutputs.value.length >= 1) {
        Modal.error({
          title: '操作限制',
          content: '初始锁定交易和Bci销毁交易只能有一个输出'
        });
        return;
      }
      Object.assign(currentTxOutput, {
        txOutputAddress: '',
        txOutputValue: '',
        txOutputInterest: '',
        txOutputLockTime: '',
        txOutputBciType: '',
        txOutputScriptPk: ''
      });
      txOutputModalVisible.value = true;
    };

    const saveTxOutput = () => {
      txoutputs.value.push({...currentTxOutput});
      txOutputModalVisible.value = false;
    };

    const submitForm = async () => {
      try {
        // 字段验证
        if (txinputs.value.length === 0 || txoutputs.value.length === 0) {
          Modal.error({
            title: '交易未完成',
            content: '请至少添加一个输入和一个输出'
          });
          return;
        }

        // 验证所有输入项
        for (const [index, input] of txinputs.value.entries()) {
          const requiredFields = [
            input.txInputTxid,
            input.txInputVoutput,
            input.txInputScriptsig,
            input.txInputValue,
            input.txInputAddress,
            input.txInputBciType
          ];

          if (requiredFields.some(field => !field)) {
            Modal.error({
              title: '输入信息不完整',
              content: `TxInput#${index + 1} 缺少必填字段，请检查后重试！`
            });
            return;
          }
        }

        // 验证所有输出项
        for (const [index, output] of txoutputs.value.entries()) {
          const requiredFields = [
            output.txOutputAddress,
            output.txOutputValue,
            output.txOutputInterest,
            output.txOutputLockTime,
            output.txOutputBciType,
            output.txOutputBurnLock
          ];

          if (requiredFields.some(field => !field)) {
            Modal.error({
              title: '输出信息不完整',
              content: `TxOutput#${index + 1} 缺少必填字段，请检查后重试！`
            });
            return;
          }
        }

        // 转换交易类型
        const typeMapping = {
          'initial': '1',
          'locked': '2',
          'unlocked': '3',
          'bci': '4'
        };

        // 构建请求数据
        const requestData = {
          transaction: {
            Txid: txid.value,
            TxInputs: txinputs.value.map(input => ({
              Txid: String(input.txInputTxid),
              Voutput: String(input.txInputVoutput),
              ScriptSig: String(input.txInputScriptsig),
              Value: String(input.txInputValue),
              Address: String(input.txInputAddress),
              BciType: String(input.txInputBciType)
            })),
            TxOutputs: txoutputs.value.map(output => ({
              Address: String(output.txOutputAddress),
              Value: String(output.txOutputValue),
              Interest: String(output.txOutputInterest || '0'),
              Proof: String(output.txOutputProof || '0x00'),
              LockTime: String(output.txOutputLockTime),
              BciType: String(output.txOutputBciType),
              Data: String(output.txOutputData || '0x00'),
              BurnLock: String(output.txOutputBurnLock),
              Rate: String(output.txOutputRate || '0.00')
            })),
            TransactionFee: String(transactionFee.value)
          },
          type: typeMapping[selectedTransactionType.value] || '1'
        };

        const response = await axios.post(
          'http://47.243.174.71:18025/api/createlocktransaction',
          requestData,
          { headers: { 'Content-Type': 'application/json' } }
        );

        if (response.data.code === 200) {
          const newTransaction = {
            id: Date.now().toString(),
            txid: txid.value,
            transactionFee: transactionFee.value,
            time: new Date().toLocaleString(),
            inputs: txinputs.value.map(input => ({
              Address: input.txInputAddress,
              Value: input.txInputValue
            })),
            outputs: txoutputs.value.map(output => ({
              Address: output.txOutputAddress,
              Value: output.txOutputValue
            })),
            rawData: requestData.transaction // 保存完整数据
          };

          // 添加到交易历史
          transactionHistory.value.unshift(newTransaction);
          console.log('提交成功，交易记录:', JSON.stringify(transactionHistory.value));

          Modal.success({
            title: '提交成功',
            content: `交易成功`
          });
          resetForm();
        } else {
          Modal.error({
            title: '提交失败',
            content: response.data.message || '未知错误'
          });
        }
      } catch (error) {
        console.error('提交出错:', error);
        Modal.error({
          title: '请求失败',
          content: error.response?.data?.message || error.message
        });
      }
    };


    const resetForm = () => {
      txid.value = '';
      transactionFee.value = 0;
      privateKey.value = '';
      txinputs.value = [];
      txoutputs.value = [];
    };

// 完善显示详情方法
    const showTransactionDetail = (record) => {
      selectedTransaction.value = {
        ...record,
        inputs: record.rawData.TxInputs.map(input => ({
          Address: input.Address,
          Value: input.Value,
          BciType: input.BciType,
          Txid: input.Txid
        })),
        outputs: record.rawData.TxOutputs.map(output => ({
          Address: output.Address,
          Value: output.Value,
          LockTime: output.LockTime,
          BciType: output.BciType
        }))
      };
      transactionDetailVisible.value = true;
    };
    const getRealIndex = (type, index) => {
      const start = type === 'input'
        ? (currentPageInput.value - 1) * pageSize.value
        : (currentPageOutput.value - 1) * pageSize.value;
      return start + index;
    };
    return {
      // 状态变量
      txid,
      transactionFee,
      privateKey,
      selectedTransactionType,
      txinputs,
      txoutputs,
      txInputModalVisible,
      txOutputModalVisible,
      currentTxInput,
      currentTxOutput,
      transactionSearchTxid,
      transactionDetailVisible,
      selectedTransaction,
      transactionHistory,
      editModalVisible,
      editingType,
      currentEditItem,
      editModalTitle,
      pageSize,
      currentPageOutput,
      currentPageInput,
      paginatedInputs,
      paginatedOutputs,
      isRestrictedType,
      transactionColumns,
      EyeOutlined: () => h(EyeOutlined),
      
      // 方法
      openTxInputModal,
      saveTxInput,
      removeTxInput: (index) => txinputs.value.splice(index, 1),
      openTxOutputModal,
      saveTxOutput,
      removeTxOutput: (index) => txoutputs.value.splice(index, 1),
      submitForm,
      resetForm,
      showTransactionDetail,
      calculateSignature,
      resetTransactionSearch: () => transactionSearchTxid.value = '',
      openEditModal,
      handleEditSubmit,
      cancelEdit,
      getRealIndex,
      generateTestData,

      filteredTransactions: computed(() =>
        transactionHistory.value.filter(tx =>
          tx.txid.includes(transactionSearchTxid.value.trim())
        )
      )
    };
  },
});
</script>



<style>
.content {
  padding: 24px;
}

.transaction-control-area {
  margin-top: 28px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 16px;
}

.ant-select {
  flex: 1;
  max-width: 240px;
}

.create-button {
  margin-left: auto;
}

/* 交易输入输出区域 */
.io-display-area {
  margin-top: 24px;
}

.pending-transactions {
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  padding: 16px;
  min-height: 200px;
  display: flex;
  flex-direction: column;
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-title {
  font-size: 16px;
  color: rgba(0, 0, 0, 0.85);
  margin: 0;
  flex: 1;
  text-align: center;
}
.section-title1 {
  font-size: 24px;
  color: rgba(0, 0, 0, 0.85);
  margin: 0;
  flex: 1;
}
.pagination {
  flex: 0 0 auto;
  margin-left: 12px;
}


.transaction-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(150px, 1fr)); /* 固定3列 */
  grid-template-rows: repeat(3, 60px); /* 固定3行 */
  gap: 8px;
  max-height: 212px; /* (60px * 3) + (gap 8px * 2) */
  overflow-y: auto;
  flex: 1;
}

.transaction-tag {
  width: 100%;
  height: 100%;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  box-sizing: border-box;
}

.transaction-tag:hover {
  background: #e6f7ff;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-color: #40a9ff;
}

.tx-index {
  font-weight: 500;
  margin-right: 8px;
  white-space: nowrap;
}

.tx-value {
  color: #1890ff;
  white-space: nowrap;
}

/* 其他保持不变的样式 */
.input-section {
  margin: 12px 0;
  padding: 12px;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
}

.submitted-transactions-card {
  margin-top: 24px;
}

.submit-area {
  margin-top: 24px;
  text-align: left; /* 改为左对齐 */
}
.submit-area .ant-space {
  width: 100%;
  justify-content: space-between;
}
.submit-all-button {
  width: 100%;
  max-width: 400px;
  height: 40px;
  font-size: 16px;
}

.empty-tip {
  color: rgba(0, 0, 0, 0.25);
  text-align: center;
  padding: 20px 0;
}

/* 添加表格行hover效果 */
.ant-table-row:hover {
  background-color: #fafafa;
  cursor: pointer;
}

/* 详情列表样式 */
.ant-list-item {
  padding: 12px 24px;
}

</style>

