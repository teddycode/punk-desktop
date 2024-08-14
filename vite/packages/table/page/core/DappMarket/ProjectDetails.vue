<template>
  <div class="project-details">
    <h1>Project Details</h1>
    <a-steps :current="currentStep" class="steps-container">
      <a-step v-for="step in steps" :key="step.title" :title="step.title" />
    </a-steps>
    <div class="details-container">
      <div class="form-container">
        <a-form>
          <div class="form-content">
            <div class="upload-section">
              <a-form-item
                label="Project logo"
                :label-col="{ span: 24 }"
                :wrapper-col="{ span: 24 }"
              >
                <div class="upload-placeholder">
                  <img :src="projectDetails.logo" alt="avatar" class="uploaded-image" />
                </div>
              </a-form-item>
            </div>
            <div class="form-fields">
              <div class="form-row">
                <a-form-item
                  label="Does your project have smart contracts?"
                  :label-col="{ span: 24 }"
                  :wrapper-col="{ span: 24 }"
                  class="form-item-half"
                >
                  <a-select v-model="projectDetails.smartContracts" disabled>
                    <a-select-option value="yes">Yes, my project is a dapp and has smart contracts</a-select-option>
                    <a-select-option value="no">No, my project does not have smart contracts</a-select-option>
                  </a-select>
                </a-form-item>
                <a-form-item
                  label="Has your dapp been released?"
                  :label-col="{ span: 24 }"
                  :wrapper-col="{ span: 24 }"
                  class="form-item-half"
                >
                  <a-select v-model="projectDetails.released" disabled>
                    <a-select-option value="yes">Yes, my dapp is released</a-select-option>
                    <a-select-option value="no">No, my dapp is not released</a-select-option>
                  </a-select>
                </a-form-item>
              </div>
              <a-form-item label="Project Name" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }">
                <a-input v-model="projectDetails.projectName" disabled></a-input>
              </a-form-item>
              <a-form-item label="Categories" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }">
                <a-select v-model="projectDetails.categories" mode="multiple" disabled>
                  <a-select-option value="category1">Category 1</a-select-option>
                  <a-select-option value="category2">Category 2</a-select-option>
                </a-select>
              </a-form-item>
              <a-form-item label="Website" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }">
                <a-input v-model="projectDetails.website" disabled></a-input>
              </a-form-item>
              <a-form-item label="Short description" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }">
                <a-textarea v-model="projectDetails.description" :maxlength="160" disabled></a-textarea>
              </a-form-item>
              <div class="form-row">
                <a-form-item
                  label="Tags"
                  :label-col="{ span: 24 }"
                  :wrapper-col="{ span: 24 }"
                  class="form-item-half"
                >
                  <a-select v-model="projectDetails.tags" mode="multiple" disabled>
                    <a-select-option value="tag1">Tag 1</a-select-option>
                    <a-select-option value="tag2">Tag 2</a-select-option>
                  </a-select>
                </a-form-item>
                <a-form-item
                  label="Add chain"
                  :label-col="{ span: 24 }"
                  :wrapper-col="{ span: 24 }"
                  class="form-item-half"
                >
                  <a-select v-model="projectDetails.chain" disabled>
                    <a-select-option value="chain1">Chain 1</a-select-option>
                    <a-select-option value="chain2">Chain 2</a-select-option>
                  </a-select>
                </a-form-item>
              </div>
              <a-form-item label="Full description" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }">
                <a-textarea v-model="projectDetails.fullDescription" :rows="4" disabled></a-textarea>
              </a-form-item>
            </div>
          </div>
        </a-form>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

interface ProjectDetails {
  smartContracts: string;
  released: string;
  projectName: string;
  categories: string[];
  website: string;
  description: string;
  tags: string[];
  chain: string;
  fullDescription: string;
  logo: string;
}

const route = useRoute();
const projectId = route.params.id;

const currentStep = ref(1); // Example current step, should be set based on project status
const steps = ref([
  { title: 'Step 1' },
  { title: 'Step 2' },
  { title: 'Step 3' },
  { title: 'Completed' }
]);

const projectDetails = ref<ProjectDetails>({
  smartContracts: '',
  released: '',
  projectName: '',
  categories: [],
  website: '',
  description: '',
  tags: [],
  chain: '',
  fullDescription: '',
  logo: ''
});

onMounted(() => {
  // Fetch project details based on projectId
  // This should be replaced with an actual API call to fetch project details
  projectDetails.value = {
    smartContracts: 'yes',
    released: 'yes',
    projectName: 'Example Project',
    categories: ['category1', 'category2'],
    website: 'https://example.com',
    description: 'This is a short description of the project.',
    tags: ['tag1', 'tag2'],
    chain: 'chain1',
    fullDescription: 'This is a full description of the project.',
    logo: 'https://via.placeholder.com/200'
  };
});
</script>

<style scoped>
.project-details {
  padding: 20px;
}

.steps-container {
  margin-bottom: 20px;
}

.details-container {
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
  border: 1px dashed #d9d9d9;
  border-radius: 8px;
}

.form-content {
  display: flex;
}

.form-fields {
  flex: 1;
  margin-left: 20px;
}

.form-row {
  display: flex;
  justify-content: space-between;
}

.form-item-half {
  width: 48%;
}
</style>
