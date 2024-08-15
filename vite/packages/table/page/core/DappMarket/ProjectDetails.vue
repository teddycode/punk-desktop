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
            <a-form-item label="Project Name" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }" name="projectName">
              <a-input v-model:value="projectDetails.name" disabled></a-input>
            </a-form-item>
            <a-form-item label="Website" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }" name="website">
              <a-input v-model:value="projectDetails.website" disabled></a-input>
            </a-form-item>
            <a-form-item label="Short description" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }" name="description">
              <a-textarea v-model:value="projectDetails.description" :maxlength="160" disabled></a-textarea>
            </a-form-item>

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
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { getDappDetail } from "@js/service/dappMarket";

const route = useRoute();
const projectId = route.params.id;

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
  await getDappDetail(projectId).then(response => {
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
</script>

<style scoped>
.project-details {
  padding: 20px;
}

.steps-container {
  margin-bottom: 20px;
}

.form-container {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
  border: 1px dashed #d9d9d9;
  border-radius: 8px;
}

.uploaded-image {
  width: 200px;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
}

.form-content {
  display: flex;
}

.form-fields {
  flex: 1;
  margin-left: 20px;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.image-uploads {
  display: flex;
  gap: 10px;
}
</style>
