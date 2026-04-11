<template>
  <div class="project-details">
    <h1>Project Details</h1>
    <a-steps :current="currentStep" class="steps-container">
      <a-step title="提交完成" />
      <a-step title="审核中" :status="secondStepStatus" />
      <a-step :title="finalStepTitle" :status="finalStepStatus" />
    </a-steps>
    <div class="form-container">
      <a-form>
        <div class="form-content">
          <div class="upload-section">
            <a-form-item
              label="Project logo"
              :label-col="{ span: 24 }"
              :wrapper-col="{ span: 24 }"
              name="logo"
            >
              <div class="upload-placeholder">
                <img :src="projectDetails.logo" alt="avatar" class="uploaded-image" />
              </div>
            </a-form-item>
          </div>
          <div class="form-fields">
            <a-row :gutter="24">
              <!-- 左栏 -->
              <a-col :span="12">
                <a-form-item label="Project Name" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }" name="projectName">
                  <a-input v-model:value="projectDetails.name" disabled></a-input>
                </a-form-item>
                <a-form-item label="Website" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }" name="website">
                  <a-input v-model:value="projectDetails.website" disabled></a-input>
                </a-form-item>
                <a-form-item label="Short description" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }" name="description">
                  <a-textarea v-model:value="projectDetails.description" :maxlength="160" disabled></a-textarea>
                </a-form-item>
              </a-col>

              <!-- 右栏 -->
              <a-col :span="12">
                <a-form-item label="Tags" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }" name="tags">
                  <div class="tags-container">
                    <template v-for="(tag, index) in projectDetails.tags" :key="index">
                      <a-tag>{{ tag.tagName }}</a-tag>
                    </template>
                  </div>
                </a-form-item>
                <a-form-item label="Add chain" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }" name="chain">
                  <a-textarea v-model:value="projectDetails.chain" disabled></a-textarea>
                </a-form-item>
                <a-form-item label="Full description" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }" name="fullDescription">
                  <a-textarea v-model:value="projectDetails.detail" :rows="4" disabled></a-textarea>
                </a-form-item>
              </a-col>
            </a-row>

            <!-- Project Images 独占一行 -->
            <a-form-item label="Project Images" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }" name="images">
              <div class="image-uploads">
                <div v-for="(image, index) in projectDetails.imgs" :key="index" class="upload-placeholder">
                  <img :src="image.img" alt="uploaded image" class="uploaded-image" />
                </div>
              </div>
            </a-form-item>
          </div>
        </div>
      </a-form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue';
import { getDappDetail } from "@js/service/dappMarket";

const props = defineProps<{
  projectId: number | null;
}>();

const currentStep = ref(0);  // 初始化为 0，即显示 "提交完成" 的步骤
const secondStepStatus = ref('process');  // 第二步初始状态
const finalStepTitle = ref('审核完成');
const finalStepStatus = ref('process');

const projectDetails = ref({
  name: '',
  website: '',
  description: '',
  tags: [],
  chain: '',
  detail: '',
  logo: '',
  imgs: []
});

async function fetchProjectDetails() {
  if (!props.projectId) return;
  await getDappDetail(props.projectId).then(response => {
    projectDetails.value = response.data;

    // 根据 state 更新步骤条状态
    if (response.data.state === 0) {
      currentStep.value = 1;  // 当前处于 "审核中" 步骤
      secondStepStatus.value = 'process';  // "审核中" 正在进行中
      finalStepTitle.value = '审核完成';  // 第三步显示 "审核完成"
      finalStepStatus.value = 'wait';  // 它在等待完成
    } else if (response.data.state === 1) {
      currentStep.value = 2;  // 当前处于最后一步 "审核失败"
      secondStepStatus.value = 'finish';  // 审核中已完成
      finalStepTitle.value = '审核失败';
      finalStepStatus.value = 'error'; // 红色
    } else if (response.data.state === 2) {
      currentStep.value = 2;  // 当前处于最后一步 "审核通过"
      secondStepStatus.value = 'finish';  // 审核中已完成
      finalStepTitle.value = '审核通过';
      finalStepStatus.value = 'finish'; // 绿色
    }
  });
}

onMounted(async () => {
  await fetchProjectDetails();
});

watch(() => props.projectId, async (newId) => {
  if (newId) {
    await fetchProjectDetails();
  }
});
</script>

<style scoped>
.project-details {
  padding: 20px;
  color: var(--primary-text);
}

.project-details h1 {
  color: var(--primary-text);
  margin-bottom: 20px;
}

.steps-container {
  margin-bottom: 20px;
  background: var(--secondary-bg);
  padding: 20px;
  border-radius: 12px;
}

:deep(.ant-steps-item-title) {
  color: var(--primary-text) !important;
}

:deep(.ant-steps-item-description) {
  color: rgba(255, 255, 255, 0.7) !important;
}

.form-container {
  background: var(--secondary-bg);
  padding: 24px;
  border-radius: 12px;
}

.upload-section {
  height: 300px;
  width: 240px;
  margin-bottom: 16px;
}

.upload-placeholder {
  width: 200px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
}

.uploaded-image {
  width: 200px;
  height: 200px;
  object-fit: cover;
  border-radius: 12px;
}

.form-content {
  display: flex;
}

.form-fields {
  flex: 1;
  margin-left: 20px;
}

:deep(.ant-form-item-label > label) {
  color: var(--primary-text);
  font-weight: 600;
}

:deep(.ant-input[disabled]),
:deep(.ant-input-textarea-disabled textarea) {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
  color: #000000;
  border-radius: 8px;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

:deep(.ant-tag) {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  color: var(--primary-text);
  border-radius: 6px;
}

.image-uploads {
  display: flex;
  gap: 10px;
}
</style>
