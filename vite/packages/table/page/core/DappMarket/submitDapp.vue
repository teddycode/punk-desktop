<template>
  <div class="submit-project">
    <div class="form-container">
      <h1>Submit a project</h1>
      <p class="description">Learn how to optimize your project page to create more engagement</p>
      <a-form @submit.prevent="handleSubmit">
        <div class="form-content">
          <div class="upload-section">
            <a-form-item
              label="Project logo"
              :label-col="{ span: 24 }"
              :wrapper-col="{ span: 24 }"
            >
              <a-upload
                v-model:file-list="fileList"
                name="logo"
                class="avatar-uploader"
                :show-upload-list="false"
                :before-upload="beforeUpload"
                @change="handleChange"
                @remove="handleRemove"
              >
                <div class="upload-placeholder">
                  <template v-if="imageUrl">
                    <img :src="imageUrl" alt="avatar" class="uploaded-image" />
                    <div class="ant-upload-remove-icon" @click.stop="handleRemove"><delete-outlined /></div>
                  </template>
                  <template v-else>
                        <a-empty></a-empty>
                  </template>
                </div>
                <a-button class="upload-button">
                  Click to Upload
                </a-button>
              </a-upload>
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
                <a-select v-model="form.smartContracts">
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
                <a-select v-model="form.released">
                  <a-select-option value="yes">Yes, my dapp is released</a-select-option>
                  <a-select-option value="no">No, my dapp is not released</a-select-option>
                </a-select>
              </a-form-item>
            </div>
            <a-form-item label="Project Name" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }">
              <a-input v-model="form.projectName" placeholder="Your dapp name"></a-input>
            </a-form-item>
            <a-form-item label="Categories" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }">
              <a-select v-model="form.categories" mode="multiple" placeholder="Select categories">
                <a-select-option value="category1">Category 1</a-select-option>
                <a-select-option value="category2">Category 2</a-select-option>
                <!-- Add more categories as needed -->
              </a-select>
            </a-form-item>
            <a-form-item label="Website" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }">
              <a-input v-model="form.website" placeholder="https://myweb3project.com"></a-input>
            </a-form-item>
            <a-form-item label="Short description" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }">
              <a-textarea v-model="form.description" placeholder="Project short description (160 characters limit)" :maxlength="160"></a-textarea>
            </a-form-item>
            <div class="form-row">
              <a-form-item
                label="Tags"
                :label-col="{ span: 24 }"
                :wrapper-col="{ span: 24 }"
                class="form-item-half"
              >
                <a-select v-model="form.tags" mode="multiple" placeholder="Select up to 5 tags">
                  <a-select-option value="tag1">Tag 1</a-select-option>
                  <a-select-option value="tag2">Tag 2</a-select-option>
                  <!-- Add more tags as needed -->
                </a-select>
              </a-form-item>
              <a-form-item
                label="Add chain"
                :label-col="{ span: 24 }"
                :wrapper-col="{ span: 24 }"
                class="form-item-half"
              >
                <a-select v-model="form.chain" placeholder="Select chain">
                  <a-select-option value="chain1">Chain 1</a-select-option>
                  <a-select-option value="chain2">Chain 2</a-select-option>
                  <!-- Add more chains as needed -->
                </a-select>
              </a-form-item>
            </div>
            <a-form-item label="Full description" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }">
              <a-textarea v-model="form.fullDescription" placeholder="Full description" :rows="4"></a-textarea>
            </a-form-item>
            <a-form-item :wrapper-col="{ span: 24 }">
              <a-button type="primary" html-type="submit">Submit</a-button>
            </a-form-item>
          </div>
        </div>
      </a-form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { DeleteOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';

const form = ref({
  smartContracts: '',
  released: '',
  projectName: '',
  categories: [],
  website: '',
  description: '',
  tags: [],
  chain: '',
  fullDescription: ''
});

const fileList = ref([]);
const loading = ref(false);
const imageUrl = ref('');

const getBase64 = (img: File, callback: (url: string) => void) => {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result as string));
  reader.readAsDataURL(img);
};

const beforeUpload = (file: File) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
  if (!isJpgOrPng) {
    message.error('You can only upload JPG/PNG file!');
    return false;
  }
  const isLt5M = file.size / 1024 / 1024 < 5;
  if (!isLt5M) {
    message.error('Image must smaller than 5MB!');
    return false;
  }
  return isJpgOrPng && isLt5M;
};

const handleChange = (info: any) => {
  if (info.file.status === 'uploading') {
    loading.value = true;
    return;
  }
  if (info.file.status === 'done') {
    getBase64(info.file.originFileObj, (url: string) => {
      imageUrl.value = url;
      loading.value = false;
    });
  }
  if (info.file.status === 'error') {
    loading.value = false;
    message.error('Upload error');
  }
};

const handleRemove = () => {
  imageUrl.value = '';
  fileList.value = [];
};

const handleSubmit = () => {
  // Handle form submission logic
  console.log('Form submitted', form.value);
};

</script>

<style scoped>
.submit-project {
  display: flex;
  justify-content: center;
  padding: 20px;
  /*background-color: #f9f9f9;*/
}

.form-container {
  /*border: 1px solid black;*/
  width: 90%;
  padding: 20px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.upload-section {
  /*border: 1px solid black;*/
  height: 300px;
  width: 240px;
  margin-bottom: 16px;
}

.avatar-uploader > .ant-upload {
  width: 200px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed #d9d9d9;
  border-radius: 8px;
  position: relative;
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
.upload-button{
  margin-top: 10px;
}
.uploaded-image {
  width: 200px;
  height: 200px;
  object-fit: cover;
  border: 1px dashed #d9d9d9;
  border-radius: 8px;
}

.ant-upload-select-picture-card i {
  font-size: 32px;
  color: #999;
}

.ant-upload-select-picture-card .ant-upload-text {
  margin-top: 8px;
  color: #666;
}

.ant-upload-remove-icon {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 18px;
  color: red;
  cursor: pointer;
}

.details h1 {
  margin-bottom: 16px;
  font-size: 24px;
}

.details .description {
  margin-bottom: 24px;
  color: #888;
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
