<template>
  <div class="submit-project">
    <div class="form-container">
      <h1>Submit a project</h1>
      <p class="description">Please fill in DApp-related information</p>
      <a-form @submit.prevent="handleSubmit">
        <div class="form-content">
          <div class="upload-section">
            <a-form-item
              label="Project logo"
              :label-col="{ span: 24 }"
              :wrapper-col="{ span: 24 }"
              name="logo"
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
                  <template v-if="form.logo">
                    <img :src="form.logo" alt="avatar" class="uploaded-image" />
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
            <a-form-item
              label="Does your project have smart contracts?"
              :label-col="{ span: 24 }"
              :wrapper-col="{ span: 24 }"
              name="smartContracts"
            >
              <a-select v-model:value="form.smartContracts" placeholder="Please select">
                <a-select-option value="yes">Yes, my project is a dapp and has smart contracts</a-select-option>
                <a-select-option value="no">No, my project does not have smart contracts</a-select-option>
              </a-select>
            </a-form-item>
            <template v-if="form.smartContracts === 'yes'">
              <a-form-item
                label="Smart Contract Addresses"
                :label-col="{ span: 24 }"
                :wrapper-col="{ span: 24 }"
                name="smartContractAddresses"
              >
                <div v-for="(item, index) in form.smartContractAddresses" :key="index" class="address-input">
                  <a-input
                    v-model:value="form.smartContractAddresses[index]"
                    placeholder="Enter smart contract address"
                    style="flex: 1; margin-right: 10px;"
                  />
                  <a-button @click="removeSmartContractAddress(index)" type="primary" shape="circle">
                    <template #icon><delete-outlined /></template>
                  </a-button>
                  <a-button @click="addSmartContractAddress" v-if="index === form.smartContractAddresses.length - 1" type="primary" shape="circle" style="margin-left: 5px;">
                    <template #icon><plus-outlined /></template>
                  </a-button>
                </div>
              </a-form-item>
            </template>

            <a-form-item label="Project Name" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }" name="projectName">
              <a-input v-model:value="form.projectName" placeholder="Your dapp name"></a-input>
            </a-form-item>
            <a-form-item label="Website" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }" name="website">
              <a-input v-model:value="form.website" placeholder="https://myweb3project.com"></a-input>
            </a-form-item>
            <a-form-item label="Short description" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }" name="description">
              <a-textarea v-model:value="form.description" placeholder="Project short description (50 characters limit)" :maxlength="160"></a-textarea>
            </a-form-item>
            <a-form-item label="Tags" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }" name="tags">
              <div class="tags-container">
                <template v-for="(tag, index) in form.tags" :key="tag">
                  <a-tooltip v-if="tag.length > 20" :title="tag">
                    <a-tag :closable="true" @close="handleClose(tag)">
                      {{ `${tag.slice(0, 20)}...` }}
                    </a-tag>
                  </a-tooltip>
                  <a-tag v-else :closable="true" @close="handleClose(tag)">
                    {{ tag }}
                  </a-tag>
                </template>
                <a-input
                  v-if="inputVisible"
                  ref="inputRef"
                  type="text"
                  size="small"
                  :style="{ width: '100px' }"
                  v-model:value="inputValue"
                  @blur="handleInputConfirm"
                  @keyup.enter="handleInputConfirm"
                />
                <a-tag v-else @click="showInput" class="new-tag">
                  <plus-outlined />
                  New Tag
                </a-tag>
              </div>
            </a-form-item>
            <a-form-item label="Add chain" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }" name="chain">
              <a-select v-model:value="form.chain" placeholder="Select chain">
                <a-select-option value="ETH">ETH</a-select-option>
                <a-select-option value="BSC">BSC</a-select-option>
                <a-select-option value="Polka">Polka</a-select-option>
                <a-select-option value="BHchain">BSC</a-select-option>
                <!-- Add more chains as needed -->
              </a-select>
            </a-form-item>
            <a-form-item label="Full description" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }" name="fullDescription">
              <a-textarea v-model:value="form.fullDescription" placeholder="Full description" :rows="4"></a-textarea>
            </a-form-item>
            <a-form-item label="Project Images" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }" name="images">
              <div class="image-uploads">
                <a-upload
                  v-model:file-list="fileList1"
                  name="image1"
                  class="avatar-uploader"
                  :show-upload-list="false"
                  :before-upload="beforeUpload"
                  @change="handleChange1"
                  @remove="handleRemove1"
                >
                  <div class="upload-placeholder">
                    <template v-if="form.images[0]">
                      <img :src="form.images[0]" alt="uploaded image" class="uploaded-image" />
                      <div class="ant-upload-remove-icon" @click.stop="handleRemove1"><delete-outlined /></div>
                    </template>
                    <template v-else>
                      <a-empty></a-empty>
                    </template>
                  </div>
                  <a-button class="upload-button">
                    Click to Upload
                  </a-button>
                </a-upload>
                <a-upload
                  v-model:file-list="fileList2"
                  name="image2"
                  class="avatar-uploader"
                  :show-upload-list="false"
                  :before-upload="beforeUpload"
                  @change="handleChange2"
                  @remove="handleRemove2"
                  style="margin-left: 10px;"
                >
                  <div class="upload-placeholder">
                    <template v-if="form.images[1]">
                      <img :src="form.images[1]" alt="uploaded image" class="uploaded-image" />
                      <div class="ant-upload-remove-icon" @click.stop="handleRemove2"><delete-outlined /></div>
                    </template>
                    <template v-else>
                      <a-empty></a-empty>
                    </template>
                  </div>
                  <a-button class="upload-button">
                    Click to Upload
                  </a-button>
                </a-upload>
                <a-upload
                  v-model:file-list="fileList3"
                  name="image3"
                  class="avatar-uploader"
                  :show-upload-list="false"
                  :before-upload="beforeUpload"
                  @change="handleChange3"
                  @remove="handleRemove3"
                  style="margin-left: 10px;"
                >
                  <div class="upload-placeholder">
                    <template v-if="form.images[2]">
                      <img :src="form.images[2]" alt="uploaded image" class="uploaded-image" />
                      <div class="ant-upload-remove-icon" @click.stop="handleRemove3"><delete-outlined /></div>
                    </template>
                    <template v-else>
                      <a-empty></a-empty>
                    </template>
                  </div>
                  <a-button class="upload-button">
                    Click to Upload
                  </a-button>
                </a-upload>
              </div>
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
import { ref, reactive, nextTick } from 'vue';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import { submitdapp } from "@js/service/dappMarket";

const form = reactive({
  smartContracts: '',
  projectName: '',
  website: '',
  description: '',
  tags: [],
  chain: '',
  fullDescription: '',
  logo: '', // 新增字段
  images: [],
  smartContractAddresses: [''] // 新增字段，用于存储智能合约地址
});

let postData = {};
const fileList = ref([]);
const fileList1 = ref([]);
const fileList2 = ref([]);
const fileList3 = ref([]);
const loading = ref(false);

const inputRef = ref();
const inputVisible = ref(false);
const inputValue = ref('');

const handleClose = (removedTag: string) => {
  form.tags = form.tags.filter(tag => tag !== removedTag);
};

const showInput = () => {
  inputVisible.value = true;
  nextTick(() => {
    inputRef.value.focus();
  });
};

const handleInputConfirm = () => {
  const value = inputValue.value.trim();
  if (value && !form.tags.includes(value)) {
    form.tags.push(value);
  }
  inputVisible.value = false;
  inputValue.value = '';
};

const getBase64 = (img: File, callback: (url: string) => void) => {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result as string));
  reader.readAsDataURL(img);
};

const beforeUpload = (file: File) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
  if (!isJpgOrPng) {
    message.error('你只能上传 JPG/PNG 文件!');
    return false;
  }
  const isLt5M = file.size / 1024 / 1024 < 5;
  if (!isLt5M) {
    message.error('图片必须小于 5MB!');
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
      form.logo = url;
      loading.value = false;
    });
  }
  if (info.file.status === 'error') {
    loading.value = false;
    message.error('上传错误');
  }
};

const handleRemove = () => {
  form.logo = '';
  fileList.value = [];
};

const handleChange1 = (info: any) => {
  if (info.file.status === 'uploading') {
    loading.value = true;
    return;
  }
  if (info.file.status === 'done') {
    getBase64(info.file.originFileObj, (url: string) => {
      form.images[0] = url;
      loading.value = false;
    });
  }
  if (info.file.status === 'error') {
    loading.value = false;
    message.error('上传错误');
  }
};

const handleRemove1 = () => {
  form.images.splice(0, 1);
  fileList1.value = [];
};

const handleChange2 = (info: any) => {
  if (info.file.status === 'uploading') {
    loading.value = true;
    return;
  }
  if (info.file.status === 'done') {
    getBase64(info.file.originFileObj, (url: string) => {
      form.images[1] = url;
      loading.value = false;
    });
  }
  if (info.file.status === 'error') {
    loading.value = false;
    message.error('上传错误');
  }
};

const handleRemove2 = () => {
  form.images.splice(1, 1);
  fileList2.value = [];
};

const handleChange3 = (info: any) => {
  if (info.file.status === 'uploading') {
    loading.value = true;
    return;
  }
  if (info.file.status === 'done') {
    getBase64(info.file.originFileObj, (url: string) => {
      form.images[2] = url;
      loading.value = false;
    });
  }
  if (info.file.status === 'error') {
    loading.value = false;
    message.error('上传错误');
  }
};

const handleRemove3 = () => {
  form.images.splice(2, 1);
  fileList3.value = [];
};

const addSmartContractAddress = () => {
  form.smartContractAddresses.push('');
};

const removeSmartContractAddress = (index: number) => {
  if (form.smartContractAddresses.length > 1) {
    form.smartContractAddresses.splice(index, 1);
  }
};

const handleSubmit = () => {
  const requiredFields = ['smartContracts', 'projectName', 'website', 'description', 'tags', 'chain', 'fullDescription', 'logo', 'images','smartContractAddresses'];
  const emptyFields = [];

  requiredFields.forEach(field => {
    const value = form[field];
    if ((typeof value === 'string' && value.trim() === '') || (Array.isArray(value) && value.length === 0)) {
      emptyFields.push(field);
    }
    console.log(`${field}:`, value); // 输出每个字段的值以便调试
  });

  if (emptyFields.length > 0) {
    console.log('未填写的字段:', emptyFields);
    message.info('请填写所有字段.');
  } else {
    console.log('表单已完成:', form);
    // 这里处理表单提交逻辑
    postData.userId = 1;
    postData.name = form.projectName;
    postData.chain = form.chain;
    postData.description = form.description;
    postData.detail = form.fullDescription;
    postData.website = form.website;
    postData.logo = "https://pics7.baidu.com/feed/18d8bc3eb13533fa14a1a91332148d1140345bc9.jpeg";
    postData.imgs = [
      {
        "img": "https://pics7.baidu.com/feed/18d8bc3eb13533fa14a1a91332148d1140345bc9.jpeg"
      }
    ];
    let postTags = [];
    form.tags.forEach((item) => {
      postTags.push({
        tagName: item
      })
    });
    let postContracts = [];
    form.smartContractAddresses.forEach((item)=>{
      postContracts.push({
        address:item
      })
    })
    postData.contracts = postContracts;
    postData.tags = postTags;
    submitdapp(postData).then(response=>{
      message.success('发布成功')
    })
  }
};
</script>

<style scoped>
.submit-project {
  display: flex;
  justify-content: center;
  padding: 10px;
  color: var(--primary-text);
}

.submit-project h1 {
  color: var(--primary-text);
}

.submit-project .description {
  color: rgba(0, 0, 0, 0.7);
}

.form-container {
  width: 100%;
  padding: 12px;
  background: var(--secondary-bg);
  border-radius: 12px;
}

.upload-section {
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
  border: 1px dashed rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  position: relative;
  background: rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
}

.avatar-uploader > .ant-upload:hover {
  border-color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.1);
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

.upload-button {
  margin-top: 10px;
  border-radius: 8px;
}

.uploaded-image {
  width: 200px;
  height: 200px;
  object-fit: cover;
  border-radius: 12px;
}

.ant-upload-select-picture-card i {
  font-size: 32px;
  color: var(--primary-text);
}

.ant-upload-select-picture-card .ant-upload-text {
  margin-top: 8px;
  color: rgba(255, 255, 255, 0.7);
}

.ant-upload-remove-icon {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 18px;
  color: #ff4d4f;
  cursor: pointer;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
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

:deep(.ant-input),
:deep(.ant-select-selector),
:deep(.ant-input-textarea textarea) {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  color: var(--primary-text);
  border-radius: 8px;
}

:deep(.ant-input:focus),
:deep(.ant-select-focused .ant-select-selector),
:deep(.ant-input-textarea-focused textarea) {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.4);
}

:deep(.ant-input::placeholder),
:deep(.ant-input-textarea textarea::placeholder) {
  color: rgba(0, 0, 0, 0.4);
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

:deep(.ant-tag) {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  color: var(--primary-text);
  border-radius: 6px;
}

.new-tag {
  background: rgba(255, 255, 255, 0.05);
  border-style: dashed;
  cursor: pointer;
  transition: all 0.3s ease;
}

.new-tag:hover {
  background: rgba(255, 255, 255, 0.1);
}

.image-uploads {
  display: flex;
  gap: 10px;
}

.address-input {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.address-input .ant-btn {
  margin-left: 5px;
  border-radius: 8px;
}
</style>
