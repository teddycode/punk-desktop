<template>
  <div class="my-projects">
    <!-- 顶部统计卡片 -->
    <div class="overview">
      <div class="stat-card">
        <div class="stat-icon submitted">
          <AppstoreOutlined />
        </div>
        <div class="stat-content">
          <h3>已提交应用</h3>
          <p>{{ submittedProjects }}</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon approved">
          <CheckCircleOutlined />
        </div>
        <div class="stat-content">
          <h3>已通过应用</h3>
          <p>{{ approvedProjects }}</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon pending">
          <ClockCircleOutlined />
        </div>
        <div class="stat-content">
          <h3>待审核应用</h3>
          <p>{{ pendingReviews }}</p>
        </div>
      </div>
    </div>

    <!-- 操作栏 -->
    <div class="action-bar">
      <h2>我的应用列表</h2>
      <a-button type="primary" size="large" @click="showSubmitModal = true" class="submit-btn">
        <PlusOutlined />
        提交新应用
      </a-button>
    </div>

    <!-- 项目表格 -->
    <div class="table-container">
      <a-table
        :columns="columns"
        :data-source="projectList"
        :pagination="pagination"
        :loading="loading"
        row-key="id"
        class="projects-table"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'name'">
            <div class="project-name-cell">
              <img :src="record.logo || 'https://pic1.imgdb.cn/item/69889816ac0326447d74a5e0.png'" class="project-logo" />
              <div class="project-info">
                <span class="name">{{ record.name }}</span>
                <span class="type-badge" :class="record.type">{{ record.type === 'dapp' ? 'DApp' : 'CApp' }}</span>
              </div>
            </div>
          </template>
          <template v-else-if="column.key === 'state'">
            <a-tag :color="getStatusColor(record.state)" class="status-tag">
              {{ getStatusText(record.state) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-button type="link" @click="handleRowClick(record.id)">
              <EyeOutlined /> 查看详情
            </a-button>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 提交应用模态框 -->
    <a-modal
      v-model:open="showSubmitModal"
      :title="submitStep === 1 ? '选择应用类型' : (projectType === 'dapp' ? '提交 DApp 应用' : '提交 CApp 应用')"
      :width="submitStep === 1 ? 600 : 900"
      :footer="null"
      @cancel="resetSubmitForm"
      class="submit-modal"
    >
      <!-- 步骤1: 选择应用类型 -->
      <div v-if="submitStep === 1" class="type-selection">
        <div class="type-card" @click="selectProjectType('dapp')">
          <div class="type-icon dapp">
            <GlobalOutlined />
          </div>
          <h3>DApp 应用</h3>
          <p>去中心化应用,包含智能合约</p>
        </div>
        <div class="type-card" @click="selectProjectType('capp')">
          <div class="type-icon capp">
            <AppstoreAddOutlined />
          </div>
          <h3>CApp 应用</h3>
          <p>客户端应用,PunkOS 扩展程序</p>
        </div>
      </div>

      <!-- 步骤2: DApp 提交表单 -->
      <div v-else-if="submitStep === 2 && projectType === 'dapp'" class="submit-form">
        <a-form :model="dappForm" layout="vertical">
          <a-row :gutter="16">
            <a-col :span="24">
              <a-form-item label="应用 Logo">
                <a-upload
                  list-type="picture-card"
                  :show-upload-list="false"
                  :before-upload="beforeUpload"
                  @change="handleLogoChange"
                >
                  <div v-if="dappForm.logo" class="upload-preview">
                    <img :src="dappForm.logo" alt="logo" />
                  </div>
                  <div v-else class="upload-placeholder">
                    <PlusOutlined />
                    <div>上传 Logo</div>
                  </div>
                </a-upload>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="应用名称" required>
                <a-input v-model:value="dappForm.projectName" placeholder="输入应用名称" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="选择链" required>
                <a-select v-model:value="dappForm.chain" placeholder="选择区块链">
                  <a-select-option value="ETH">Ethereum</a-select-option>
                  <a-select-option value="BSC">BSC</a-select-option>
                  <a-select-option value="Polka">Polkadot</a-select-option>
                  <a-select-option value="BHchain">BHchain</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item label="网站地址">
                <a-input v-model:value="dappForm.website" placeholder="https://example.com" />
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item label="简短描述" required>
                <a-textarea v-model:value="dappForm.description" :rows="3" placeholder="应用简介 (最多160字)" :maxlength="160" />
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item label="智能合约地址">
                <div v-for="(addr, index) in dappForm.smartContractAddresses" :key="index" class="address-input">
                  <a-input v-model:value="dappForm.smartContractAddresses[index]" placeholder="输入合约地址" />
                  <a-button @click="removeAddress(index)" danger v-if="dappForm.smartContractAddresses.length > 1">
                    <DeleteOutlined />
                  </a-button>
                  <a-button @click="addAddress" type="primary" v-if="index === dappForm.smartContractAddresses.length - 1">
                    <PlusOutlined />
                  </a-button>
                </div>
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item label="标签">
                <div class="tags-input">
                  <a-tag v-for="tag in dappForm.tags" :key="tag" closable @close="removeTag(tag)">
                    {{ tag }}
                  </a-tag>
                  <a-input
                    v-if="tagInputVisible"
                    ref="tagInputRef"
                    v-model:value="tagInputValue"
                    size="small"
                    style="width: 100px"
                    @blur="handleTagInputConfirm"
                    @keyup.enter="handleTagInputConfirm"
                  />
                  <a-tag v-else @click="showTagInput" class="add-tag">
                    <PlusOutlined /> 添加标签
                  </a-tag>
                </div>
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item label="详细描述">
                <a-textarea v-model:value="dappForm.fullDescription" :rows="4" placeholder="详细介绍应用功能和特点" />
              </a-form-item>
            </a-col>
          </a-row>
          <div class="form-actions">
            <a-button @click="resetSubmitForm">取消</a-button>
            <a-button type="primary" @click="submitDApp">提交 DApp</a-button>
          </div>
        </a-form>
      </div>

      <!-- 步骤2: CApp 提交表单 -->
      <div v-else-if="submitStep === 2 && projectType === 'capp'" class="submit-form">
        <a-form :model="cappForm" layout="vertical">
          <a-row :gutter="16">
            <a-col :span="24">
              <a-form-item label="应用图标">
                <a-upload
                  list-type="picture-card"
                  :show-upload-list="false"
                  :before-upload="beforeUpload"
                  @change="handleCappLogoChange"
                >
                  <div v-if="cappForm.icon" class="upload-preview">
                    <img :src="cappForm.icon" alt="icon" />
                  </div>
                  <div v-else class="upload-placeholder">
                    <PlusOutlined />
                    <div>上传图标</div>
                  </div>
                </a-upload>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="应用名称" required>
                <a-input v-model:value="cappForm.name" placeholder="输入应用名称" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="版本号" required>
                <a-input v-model:value="cappForm.version" placeholder="例如: 1.0.0" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="应用分类" required>
                <a-select v-model:value="cappForm.category" placeholder="选择分类">
                  <a-select-option value="dev-tools">开发工具</a-select-option>
                  <a-select-option value="finance">金融分析</a-select-option>
                  <a-select-option value="asset">资产管理</a-select-option>
                  <a-select-option value="agent">Agent服务</a-select-option>
                  <a-select-option value="social">社交网络</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="发布者">
                <a-input v-model:value="cappForm.publisher" placeholder="发布者名称" />
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item label="应用简介" required>
                <a-textarea v-model:value="cappForm.description" :rows="3" placeholder="应用简介" />
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item label="功能特性">
                <div v-for="(feature, index) in cappForm.features" :key="index" class="feature-input">
                  <a-input v-model:value="cappForm.features[index]" placeholder="输入功能特性" />
                  <a-button @click="removeFeature(index)" danger v-if="cappForm.features.length > 1">
                    <DeleteOutlined />
                  </a-button>
                  <a-button @click="addFeature" type="primary" v-if="index === cappForm.features.length - 1">
                    <PlusOutlined />
                  </a-button>
                </div>
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="支持系统">
                <a-input v-model:value="cappForm.requirements.os" placeholder="例如: Windows 10+" />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="最低版本">
                <a-input v-model:value="cappForm.requirements.minVersion" placeholder="例如: PunkOS 1.0.0+" />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="文件大小">
                <a-input v-model:value="cappForm.requirements.size" placeholder="例如: 12.5 MB" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="官方网站">
                <a-input v-model:value="cappForm.website" placeholder="https://example.com" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="GitHub">
                <a-input v-model:value="cappForm.github" placeholder="https://github.com/..." />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="使用文档">
                <a-input v-model:value="cappForm.documentation" placeholder="https://docs.example.com" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="教程视频">
                <a-input v-model:value="cappForm.videoTutorial" placeholder="https://youtube.com/..." />
              </a-form-item>
            </a-col>
          </a-row>
          <div class="form-actions">
            <a-button @click="resetSubmitForm">取消</a-button>
            <a-button type="primary" @click="submitCApp">提交 CApp</a-button>
          </div>
        </a-form>
      </div>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, reactive, nextTick } from 'vue';
import {
  AppstoreOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  PlusOutlined,
  EyeOutlined,
  GlobalOutlined,
  AppstoreAddOutlined,
  DeleteOutlined,
} from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import { getUserDapps } from "@js/service/dappMarket";

const emit = defineEmits(['viewProject']);

// 统计数据
const submittedProjects = ref(0);
const approvedProjects = ref(0);
const pendingReviews = ref(0);
const loading = ref(false);

// 项目列表
const projectList = ref([]);

// 表格列定义
const columns = [
  {
    title: '应用名称',
    dataIndex: 'name',
    key: 'name',
    width: '30%',
  },
  {
    title: '所在区块链',
    dataIndex: 'chain',
    key: 'chain',
    width: '15%',
  },
  {
    title: '状态',
    dataIndex: 'state',
    key: 'state',
    width: '10%',
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
    width: '15%',
  },
  {
    title: '操作',
    key: 'action',
    width: '15%',
  },
];

// 分页配置
const pagination = {
  pageSize: 10,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 个应用`,
};

// 提交模态框
const showSubmitModal = ref(false);
const submitStep = ref(1); // 1: 选择类型, 2: 填写表单
const projectType = ref(''); // 'dapp' or 'capp'

// DApp 表单
const dappForm = reactive({
  logo: '',
  projectName: '',
  chain: '',
  website: '',
  description: '',
  smartContractAddresses: [''],
  tags: [],
  fullDescription: '',
});

// CApp 表单
const cappForm = reactive({
  icon: '',
  name: '',
  version: '',
  category: '',
  publisher: '',
  description: '',
  features: [''],
  requirements: {
    os: '',
    minVersion: '',
    size: '',
  },
  website: '',
  github: '',
  documentation: '',
  videoTutorial: '',
});

// 标签输入
const tagInputVisible = ref(false);
const tagInputValue = ref('');
const tagInputRef = ref();

// 获取用户项目
async function fetchUserDapps() {
  loading.value = true;
  try {
    const response = await getUserDapps(1, -1);
    projectList.value = response.data.map((item: any) => ({
      ...item,
      type: item.type || 'dapp', // 默认为 dapp
      logo: item.logo || 'https://pic1.imgdb.cn/item/69889816ac0326447d74a5e0.png',
    }));
    
    submittedProjects.value = response.data.length;
    pendingReviews.value = response.data.filter((item: any) => item.state === 0).length;
    approvedProjects.value = response.data.filter((item: any) => item.state === 2).length;
  } catch (error) {
    message.error('获取应用列表失败');
  } finally {
    loading.value = false;
  }
}

// 状态相关
const getStatusColor = (state: number) => {
  const colorMap = {
    0: 'orange',
    1: 'red',
    2: 'green',
  };
  return colorMap[state] || 'default';
};

const getStatusText = (state: number) => {
  const textMap = {
    0: '待审核',
    1: '已拒绝',
    2: '已通过',
  };
  return textMap[state] || '未知';
};

// 选择项目类型
const selectProjectType = (type: string) => {
  projectType.value = type;
  submitStep.value = 2;
};

// 重置提交表单
const resetSubmitForm = () => {
  showSubmitModal.value = false;
  submitStep.value = 1;
  projectType.value = '';
  
  // 重置 DApp 表单
  Object.assign(dappForm, {
    logo: '',
    projectName: '',
    chain: '',
    website: '',
    description: '',
    smartContractAddresses: [''],
    tags: [],
    fullDescription: '',
  });
  
  // 重置 CApp 表单
  Object.assign(cappForm, {
    icon: '',
    name: '',
    version: '',
    category: '',
    publisher: '',
    description: '',
    features: [''],
    requirements: {
      os: '',
      minVersion: '',
      size: '',
    },
    website: '',
    github: '',
    documentation: '',
    videoTutorial: '',
  });
};

// 图片上传
const beforeUpload = (file: File) => {
  const isImage = file.type.startsWith('image/');
  if (!isImage) {
    message.error('只能上传图片文件!');
    return false;
  }
  const isLt5M = file.size / 1024 / 1024 < 5;
  if (!isLt5M) {
    message.error('图片必须小于 5MB!');
    return false;
  }
  return false; // 阻止自动上传
};

const getBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const handleLogoChange = async (info: any) => {
  const file = info.file;
  if (file) {
    dappForm.logo = await getBase64(file);
  }
};

const handleCappLogoChange = async (info: any) => {
  const file = info.file;
  if (file) {
    cappForm.icon = await getBase64(file);
  }
};

// 地址管理
const addAddress = () => {
  dappForm.smartContractAddresses.push('');
};

const removeAddress = (index: number) => {
  dappForm.smartContractAddresses.splice(index, 1);
};

// 功能特性管理
const addFeature = () => {
  cappForm.features.push('');
};

const removeFeature = (index: number) => {
  cappForm.features.splice(index, 1);
};

// 标签管理
const removeTag = (tag: string) => {
  dappForm.tags = dappForm.tags.filter(t => t !== tag);
};

const showTagInput = () => {
  tagInputVisible.value = true;
  nextTick(() => {
    tagInputRef.value?.focus();
  });
};

const handleTagInputConfirm = () => {
  const value = tagInputValue.value.trim();
  if (value && !dappForm.tags.includes(value)) {
    dappForm.tags.push(value);
  }
  tagInputVisible.value = false;
  tagInputValue.value = '';
};

// 提交 DApp
const submitDApp = () => {
  if (!dappForm.projectName || !dappForm.chain || !dappForm.description) {
    message.warning('请填写必填项');
    return;
  }
  
  // 创建临时项目
  const newProject = {
    id: Date.now(),
    name: dappForm.projectName,
    logo: dappForm.logo,
    createTime: new Date().toLocaleDateString('zh-CN'),
    chain: dappForm.chain,
    state: 0, // 待审核
    type: 'dapp',
    description: dappForm.description,
    website: dappForm.website,
    smartContractAddresses: dappForm.smartContractAddresses.filter(addr => addr.trim()),
    tags: dappForm.tags,
    fullDescription: dappForm.fullDescription,
  };
  
  // 添加到列表
  projectList.value.unshift(newProject);
  submittedProjects.value++;
  pendingReviews.value++;
  
  message.success('DApp 应用提交成功!');
  resetSubmitForm();
};

// 提交 CApp
const submitCApp = () => {
  if (!cappForm.name || !cappForm.version || !cappForm.category || !cappForm.description) {
    message.warning('请填写必填项');
    return;
  }
  
  // 创建临时项目
  const newProject = {
    id: Date.now(),
    name: cappForm.name,
    logo: cappForm.icon,
    createTime: new Date().toLocaleDateString('zh-CN'),
    chain: 'PunkOS', // CApp 运行在 PunkOS 平台
    state: 0, // 待审核
    type: 'capp',
    version: cappForm.version,
    category: cappForm.category,
    publisher: cappForm.publisher,
    description: cappForm.description,
    features: cappForm.features.filter(f => f.trim()),
    requirements: cappForm.requirements,
    website: cappForm.website,
    github: cappForm.github,
    documentation: cappForm.documentation,
    videoTutorial: cappForm.videoTutorial,
  };
  
  // 添加到列表
  projectList.value.unshift(newProject);
  submittedProjects.value++;
  pendingReviews.value++;
  
  message.success('CApp 应用提交成功!');
  resetSubmitForm();
};

// 查看项目详情
const handleRowClick = (projectId: number) => {
  emit('viewProject', projectId);
};

onMounted(async () => {
  await fetchUserDapps();
});
</script>

<style scoped>
.my-projects {
  padding: 24px;
  color: var(--primary-text);
}

/* 统计卡片 */
.overview {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  background: linear-gradient(135deg, rgba(167, 217, 254, 0.08) 0%, rgba(138, 180, 248, 0.05) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(167, 217, 254, 0.2);
  border-color: rgba(167, 217, 254, 0.3);
}

.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.stat-icon.submitted {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.stat-icon.approved {
  background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%);
  color: #fff;
}

.stat-icon.pending {
  background: linear-gradient(135deg, #ffa940 0%, #fa8c16 100%);
  color: #fff;
}

.stat-content h3 {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--secondary-text);
}

.stat-content p {
  margin: 0;
  font-size: 32px;
  font-weight: 700;
  color: var(--primary-text);
}

/* 操作栏 */
.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.action-bar h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--primary-text);
}

.submit-btn {
  background: linear-gradient(135deg, #a7d9fe 0%, #8ab4f8 100%);
  border: none;
  font-weight: 600;
  height: 40px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(167, 217, 254, 0.3);
}

.submit-btn:hover {
  background: linear-gradient(135deg, #8ab4f8 0%, #6a94d8 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(167, 217, 254, 0.4);
}

/* 表格容器 */
.table-container {
  background: linear-gradient(135deg, rgba(167, 217, 254, 0.08) 0%, rgba(138, 180, 248, 0.05) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

/* 表格样式 */
:deep(.projects-table) {
  background: transparent;
}

:deep(.projects-table .ant-table) {
  background: transparent;
  color: var(--primary-text);
}

:deep(.projects-table .ant-table-thead > tr > th) {
  background: rgba(255, 255, 255, 0.05);
  color: var(--primary-text);
  font-weight: 600;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

:deep(.projects-table .ant-table-tbody > tr) {
  transition: all 0.3s ease;
}

:deep(.projects-table .ant-table-tbody > tr:hover) {
  background: rgba(255, 255, 255, 0.05);
}

:deep(.projects-table .ant-table-tbody > tr > td) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  color: var(--primary-text);
}

.project-name-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.project-logo {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.project-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.project-info .name {
  font-weight: 600;
  color: var(--primary-text);
}

.type-badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 600;
  width: fit-content;
}

.type-badge.dapp {
  background: rgba(103, 126, 234, 0.2);
  color: #677eea;
}

.type-badge.capp {
  background: rgba(82, 196, 26, 0.2);
  color: #52c41a;
}

.status-tag {
  font-weight: 600;
  border-radius: 6px;
  padding: 4px 12px;
}

/* 模态框样式 */
:deep(.submit-modal .ant-modal-content) {
  background: linear-gradient(135deg, rgba(30, 30, 40, 0.98) 0%, rgba(20, 20, 30, 0.98) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
}

:deep(.submit-modal .ant-modal-header) {
  background: transparent;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

:deep(.submit-modal .ant-modal-title) {
  color: var(--primary-text);
  font-weight: 700;
  font-size: 18px;
}

:deep(.submit-modal .ant-modal-close-x) {
  color: var(--primary-text);
}

/* 类型选择 */
.type-selection {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  padding: 24px 0;
}

.type-card {
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 32px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.type-card:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(167, 217, 254, 0.4);
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(167, 217, 254, 0.2);
}

.type-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  color: #fff;
}

.type-icon.dapp {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.type-icon.capp {
  background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%);
}

.type-card h3 {
  margin: 0 0 12px 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--primary-text);
}

.type-card p {
  margin: 0;
  color: var(--secondary-text);
  font-size: 14px;
}

/* 提交表单 */
.submit-form {
  max-height: 600px;
  overflow-y: auto;
  padding: 16px 0;
}

.submit-form::-webkit-scrollbar {
  width: 6px;
}

.submit-form::-webkit-scrollbar-track {
  background: transparent;
}

.submit-form::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

:deep(.submit-form .ant-form-item-label > label) {
  color: var(--primary-text);
  font-weight: 600;
}

:deep(.submit-form .ant-input),
:deep(.submit-form .ant-select-selector),
:deep(.submit-form .ant-input-textarea textarea) {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
  color: var(--primary-text);
  border-radius: 8px;
}

:deep(.submit-form .ant-input:focus),
:deep(.submit-form .ant-select-focused .ant-select-selector),
:deep(.submit-form .ant-input-textarea-focused textarea) {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(167, 217, 254, 0.5);
}

.upload-preview {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-preview img {
  max-width: 100%;
  max-height: 100%;
  border-radius: 8px;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--secondary-text);
  font-size: 14px;
}

.upload-placeholder .anticon {
  font-size: 32px;
  margin-bottom: 8px;
}

.address-input,
.feature-input {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.address-input .ant-input,
.feature-input .ant-input {
  flex: 1;
}

.tags-input {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

:deep(.tags-input .ant-tag) {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  color: var(--primary-text);
  border-radius: 6px;
  padding: 4px 12px;
}

.add-tag {
  background: rgba(255, 255, 255, 0.05);
  border-style: dashed;
  cursor: pointer;
}

.add-tag:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(167, 217, 254, 0.5);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}
</style>
