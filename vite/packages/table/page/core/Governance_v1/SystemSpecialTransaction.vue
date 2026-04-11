<template>
  <div class="governance-container">
    <a-row justify="center">
      <a-col :span="20">
        <a-card :bordered="false" class="main-card" style="background-color: rgb(160 179 224 / 25%);">
          <a-tabs v-model:activeKey="activeTab" type="card" size="large">
            <!-- Tab 1: 账户锁定交易 -->
            <a-tab-pane key="lock" tab="账户锁定交易">
              <div class="transaction-content">
                <div class="input-section">
                  <h4>输入地址列表 ({{ lockAddresses.length }}/20)</h4>
                  <div style="display: flex; gap: 10px; margin-bottom: 16px;">
                    <a-input 
                      v-model:value="currentLockInput" 
                      placeholder="请输入以 0x 开头的地址" 
                      @pressEnter="addAddress('lock')"
                      allow-clear
                    />
                    <a-button type="primary" @click="addAddress('lock')">添加</a-button>
                    <a-button @click="generateRandomAddress('lock')">生成随机地址</a-button>
                  </div>

                  <div class="list-container">
                    <a-list bordered :data-source="lockAddresses" class="address-list">
                      <template #renderItem="{ item, index }">
                        <a-list-item>
                          <span class="address-text">{{ item }}</span>
                          <template #actions>
                            <a-button type="text" @click="copyToClipboard(item)">
                              <template #icon><copy-outlined /></template>
                            </a-button>
                            <a-button type="text" danger @click="removeAddress('lock', index)">
                              <template #icon><delete-outlined /></template>
                            </a-button>
                          </template>
                        </a-list-item>
                      </template>
                      <template #header>
                        <div v-if="lockAddresses.length === 0" class="empty-list-placeholder">
                          暂无地址，请添加
                        </div>
                      </template>
                    </a-list>
                  </div>

                  <div class="action-footer">
                    <a-button type="primary" size="large" :disabled="lockAddresses.length === 0" :loading="submitting.lock" @click="submitTransaction('lock')">
                      发起锁定交易
                    </a-button>
                  </div>
                </div>
              </div>
            </a-tab-pane>

            <!-- Tab 2: 账户解锁交易 -->
            <a-tab-pane key="unlock" tab="账户解锁交易">
              <div class="transaction-content">
                <div class="input-section">
                  <h4>输入地址列表 ({{ unlockAddresses.length }}/20)</h4>
                  <div style="display: flex; gap: 10px; margin-bottom: 16px;">
                    <a-input 
                      v-model:value="currentUnlockInput" 
                      placeholder="请输入以 0x 开头的地址" 
                      @pressEnter="addAddress('unlock')"
                      allow-clear
                    />
                    <a-button type="primary" @click="addAddress('unlock')">添加</a-button>
                    <a-button @click="generateRandomAddress('unlock')">生成随机地址</a-button>
                  </div>

                  <div class="list-container">
                    <a-list bordered :data-source="unlockAddresses" class="address-list">
                      <template #renderItem="{ item, index }">
                        <a-list-item>
                          <span class="address-text">{{ item }}</span>
                          <template #actions>
                            <a-button type="text" @click="copyToClipboard(item)">
                              <template #icon><copy-outlined /></template>
                            </a-button>
                            <a-button type="text" danger @click="removeAddress('unlock', index)">
                              <template #icon><delete-outlined /></template>
                            </a-button>
                          </template>
                        </a-list-item>
                      </template>
                      <template #header>
                        <div v-if="unlockAddresses.length === 0" class="empty-list-placeholder">
                          暂无地址，请添加
                        </div>
                      </template>
                    </a-list>
                  </div>

                  <div class="action-footer">
                    <a-button type="primary" size="large" :disabled="unlockAddresses.length === 0" :loading="submitting.unlock" @click="submitTransaction('unlock')">
                      发起解锁交易
                    </a-button>
                  </div>
                </div>
              </div>
            </a-tab-pane>
          </a-tabs>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { message } from 'ant-design-vue';
import { CopyOutlined, DeleteOutlined } from '@ant-design/icons-vue';
import axios from 'axios';

const activeTab = ref('lock');
const API_BASE_URL = 'http://47.243.174.71:39095/api';

// 数据状态
const currentLockInput = ref('');
const lockAddresses = ref<string[]>([]);

const currentUnlockInput = ref('');
const unlockAddresses = ref<string[]>([]);

// 复制地址
const copyToClipboard = (text: string) => {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      message.success('地址已复制');
    }).catch(() => {
      fallbackCopy(text);
    });
  } else {
    fallbackCopy(text);
  }
};

const fallbackCopy = (text: string) => {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.left = "-9999px";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  
  try {
    const successful = document.execCommand('copy');
    if (successful) {
      message.success('地址已复制');
    } else {
      message.error('复制失败');
    }
  } catch (err) {
    message.error('复制失败');
  }
  
  document.body.removeChild(textArea);
};

// 生成随机地址
const generateRandomAddress = (type: 'lock' | 'unlock') => {
  const chars = '0123456789abcdef';
  let address = '0x';
  for (let i = 0; i < 40; i++) {
    address += chars[Math.floor(Math.random() * 16)];
  }
  
  const inputRef = type === 'lock' ? currentLockInput : currentUnlockInput;
  inputRef.value = address;
  addAddress(type);
};

// 校验地址格式 (简单校验)
const isValidAddress = (addr: string) => {
  return /^0x[a-fA-F0-9]{40}$/.test(addr);
};

// 添加地址
const addAddress = (type: 'lock' | 'unlock') => {
  const inputRef = type === 'lock' ? currentLockInput : currentUnlockInput;
  const listRef = type === 'lock' ? lockAddresses : unlockAddresses;
  const addr = inputRef.value.trim();

  if (!addr) {
    message.warning('请输入地址');
    return;
  }

  if (!isValidAddress(addr)) {
    message.error('地址格式不正确 (需以0x开头，长度42位)');
    return;
  }

  if (listRef.value.includes(addr)) {
    message.warning('该地址已存在列表中');
    return;
  }

  if (listRef.value.length >= 20) {
    message.warning('最多只能添加20个地址');
    return;
  }

  listRef.value.push(addr);
  inputRef.value = '';
};

// 删除地址
const removeAddress = (type: 'lock' | 'unlock', index: number) => {
  const listRef = type === 'lock' ? lockAddresses : unlockAddresses;
  listRef.value.splice(index, 1);
};

// 提交交易（调用后端接口）
const submitting = reactive({ lock: false, unlock: false });
const submitTransaction = async (type: 'lock' | 'unlock') => {
  const listRef = type === 'lock' ? lockAddresses : unlockAddresses;
  const addresses = listRef.value;

  if (!addresses || addresses.length === 0) {
    message.warning('请先添加至少一个地址');
    return;
  }

  submitting[type] = true;
  try {
    const url =
      type === 'lock'
        ? `${API_BASE_URL}/tx/account-lock`
        : `${API_BASE_URL}/tx/account-unlock`;
    const payload = { addresses, gasLimit: '100000' };
    const resp = await axios.post(url, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 20000,
    });
    const data = resp?.data ?? {};
    if (data?.success) {
      const txHash = data?.txHash || '-';
      message.success(`已发起${type === 'lock' ? '锁定' : '解锁'}交易（${addresses.length} 个地址），Tx: ${txHash}`);
      console.log('[SystemSpecialTransaction] response:', data);
    } else {
      const errMsg = data?.error || '请求失败';
      message.error(errMsg);
      console.warn('[SystemSpecialTransaction] server error:', data);
    }
  } catch (error: any) {
    console.error('[SystemSpecialTransaction] submit error:', error);
    const msg = error?.message || error?.data?.msg || '请求失败，请稍后重试';
    message.error(msg);
  } finally {
    submitting[type] = false;
  }
};

</script>

<style scoped>
.governance-container {
  background-color: rgba(222, 134, 222, 0.19);
  padding: 30px 70px;
  min-height: 100vh;
}

.main-card {
  /* background-color removed to be inline style for reactive update or just specific match */
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.transaction-content {
  padding: 20px;
}

.code-block {
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  font-family: monospace;
  margin-bottom: 20px;
  border: 1px solid #e8e8e8;
}

.field-table {
  margin-bottom: 30px;
}

.input-section {
  background-color: #fafafa;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
}

.list-container {
  /* Removed min-height as the list itself has fixed height */
}

.address-list {
  background-color: white;
  height: 350px; /* Fixed height for approx 7 items */
  overflow-y: auto;
}

.empty-list-placeholder {
  text-align: center; 
  color: #999;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.address-text {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
  font-size: 14px;
  color: #4a4a4a;
  letter-spacing: 0.02em;
  background-color: #f5f7fa;
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
}

.action-footer {
  text-align: center;
  margin-top: 20px;
}

:deep(.ant-card-head) {
  border-bottom: 1px solid #f0f0f0;
}

:deep(.ant-tabs-nav) {
  margin-bottom: 0;
}
</style>




