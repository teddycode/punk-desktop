<template>
  <div>
    <NavBar></NavBar>
    <div class="dapp-details">
      <a-row :gutter="24">
        <a-col :span="14">
          <div>
            <a-carousel autoplay>
              <div v-for="image in dappDetails.images" :key="image" class="image-carousel">
                <img :src="image" alt="Dapp Image" class="carousel-image"/>
              </div>
            </a-carousel>
          </div>
        </a-col>
        <a-col :span="10">
          <div class="details">
            <h1>{{ dappDetails.title }}</h1>
            <p>{{ dappDetails.description }}</p>
            <div class="logo-container">
              <a-avatar :src="dappDetails.logo" shape="square" class="logo"/>
              <div class="info-container">
                <p class="information">{{ truncatedInformation }}</p>
                <a-button type="link" @click="showModal">详情</a-button>
              </div>
            </div>
            <p><strong>所属区块链:</strong> {{ dappDetails.chain }}</p>
            <p><strong>类别:</strong> {{ dappDetails.category }}</p>
            <p><strong>创建时间:</strong> {{ dappDetails.createdAt }}</p>
            <p><strong>最后更新时间:</strong> {{ dappDetails.updatedAt }}</p>
            <p><strong>上传作者:</strong> {{ dappDetails.author }}</p>
            <div class="button-group">
              <a-button type="primary" @click="visitWebsite">访问网址</a-button>
              <a-button @click="editDapp" class="edit-button">编辑Dapp</a-button>
              <div class="icon-group">
                <span @click="toggleLike">
                  <LikeOutlined v-if="!liked" class="like-icon" />
                  <LikeFilled v-else class="liked-icon" />
                </span>
                <span @click="toggleFavorite">
                  <StarOutlined v-if="!favorited" class="favorite-icon" />
                  <StarFilled v-else class="favorited-icon" />
                </span>
              </div>
            </div>
          </div>
        </a-col>
      </a-row>
      <a-modal
        v-model:visible="isModalVisible"
        @cancel="handleCancel"
        :footer="null"
      >
        <div class="modal-content">
          <h2 class="modal-title">{{ dappDetails.title }}</h2>
          <p class="modal-description">{{ dappDetails.information }}</p>
        </div>
      </a-modal>
      <div class="contracts-row">
        <div v-if="dappDetails.contracts.length === 0">暂无合约数据！</div>
        <div v-else>
          <a-button @click="toggleContracts" type="link" class="show-more-button">
            <template v-if="isExpanded">
              <UpCircleTwoTone style="font-size: 24px;"/>
            </template>
            <template v-else>
              <DownCircleTwoTone style="font-size: 24px;"/>
            </template>
          </a-button>
          <div v-for="(contract, index) in displayedContracts" :key="index" class="contract-item">
            <span class="contract-index">{{ (currentPage - 1) * pageSize + index + 1 }}.</span>
            <span class="contract-address">{{ contract.address }}</span>
          </div>
          <a-pagination
            v-if="isExpanded && totalContracts > 9"
            :current="currentPage"
            :pageSize="pageSize"
            :total="totalContracts"
            @change="handlePageChange"
            class="pagination"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { message } from 'ant-design-vue';
import { dapps } from './data';
import { DownCircleTwoTone, UpCircleTwoTone, LikeOutlined, LikeFilled, StarOutlined, StarFilled } from '@ant-design/icons-vue';
import NavBar from "./NavBar.vue";

const route = useRoute();
const dappId = route.params.id;

const dappDetails = ref({
  title: '',
  description: '',
  chain: '',
  category: '',
  createdAt: '',
  updatedAt: '',
  author: '',
  website: '',
  images: [],
  logo: '',
  information: '',
  contracts: []
});

const isExpanded = ref(false);
const isModalVisible = ref(false);
const liked = ref(false);
const favorited = ref(false);

const truncatedInformation = computed(() => {
  if (isExpanded.value) {
    return dappDetails.value.information;
  }
  const lines = dappDetails.value.information.split('\n');
  return lines.slice(0, 3).join('\n') + (lines.length > 3 ? '...' : '');
});

const showModal = () => {
  isModalVisible.value = true;
};

const handleCancel = () => {
  isModalVisible.value = false;
};

const currentPage = ref(1);
const pageSize = ref(9);

const totalContracts = computed(() => dappDetails.value.contracts.length);

const displayedContracts = computed(() => {
  if (!isExpanded.value) {
    return dappDetails.value.contracts.slice(0, 3);
  } else {
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    return dappDetails.value.contracts.slice(start, end);
  }
});

const toggleContracts = () => {
  isExpanded.value = !isExpanded.value;
  currentPage.value = 1;
};

const handlePageChange = (page) => {
  currentPage.value = page;
};

onMounted(() => {
  const dapp = dapps.find(d => d.id === Number(dappId));
  if (dapp) {
    dappDetails.value = dapp;
  } else {
    message.error('Dapp not found');
  }
});

const visitWebsite = () => {
  window.open(dappDetails.value.website, '_blank');
};

const editDapp = () => {
  message.info('编辑Dapp功能暂未实现');
};

const toggleLike = () => {
  liked.value = !liked.value;
};

const toggleFavorite = () => {
  favorited.value = !favorited.value;
};
</script>

<style scoped>
.dapp-details {
  padding: 2%;
  height: 60%;
}

.image-carousel {
  height: 450px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.carousel-image {
  object-fit: cover;
  object-position: center center;
  width: 100%;
  height: 100%;
}

.details {
  padding: 2%;
  background: #f5f5f5;
  border-radius: 8px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.details h1 {
  margin-bottom: 0.5%;
  font-size: 2rem;
}

.details p {
  margin-bottom: 1%;
  font-size: 1rem;
}

.logo-container {
  display: flex;
  align-items: flex-start;
  margin-bottom: 2%;
}

.logo-container .logo {
  width: 60px;
  height: 60px;
  flex-shrink: 0;
}

.info-container {
  margin-left: 2%;
  flex-grow: 1;
}

.information {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 0;
  height: 20%;
}

.button-group {
  margin-top: 2%;
  display: flex;
  align-items: center;
}

.button-group a-button {
  margin-right: 1rem; /* Add spacing between buttons */
}

.icon-group {
  margin-left: auto;
  display: flex;
  align-items: center;
}

.like-icon, .favorite-icon, .liked-icon, .favorited-icon {
  font-size: 24px;
  cursor: pointer;
  margin-left: 16px;
}

.like-icon:hover, .favorite-icon:hover, .liked-icon:hover, .favorited-icon:hover {
  color: #1890ff; /* Change icon color on hover */
}

.modal-content {
  text-align: center;
}

.modal-title {
  font-size: 1.5rem;
  margin-bottom: 1%;
}

.modal-description {
  font-size: 1rem;
  text-align: left;
}

.contracts-row {
  position: relative;
  padding: 2%;
  background: #fafafa;
  margin-top: 20px;
  border-radius: 8px;
}

.contract-item {
  display: inline-block;
  width: 33%;
  margin-bottom: 10px; /* 增加行距 */
}

.contract-index {
  color: #ffc107; /* 黄色 */
  margin-right: 5px;
}

.contract-address {
  color: #0056b3; /* 深蓝色 */
  cursor: pointer;
}

.contract-address:hover {
  color: #000dfd; /* 更深的蓝色 */
}

.show-more-button {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1;
  font-size: 24px; /* 增加按钮大小 */
}

.pagination {
  margin-top: 20px;
  text-align: center;
}
</style>
