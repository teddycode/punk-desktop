<template>
  <div>
    <div v-if="dappDetails" class="dapp-details">
      <a-row :gutter="24">
        <a-col :span="14">
          <div>
            <a-carousel autoplay>
              <div v-for="image in dappDetails.imgs" :key="image" class="image-carousel">
                <img :src="image.img" alt="Dapp Image" class="carousel-image"/>
              </div>
            </a-carousel>
          </div>
        </a-col>
        <a-col :span="10">
          <div class="details">
            <h1>{{ dappDetails.name }}</h1>
            <p>{{ dappDetails.description }}</p>
            <div class="logo-container">
              <a-avatar :src="dappDetails.logo" shape="square" class="logo"/>
              <div class="info-container">
                <p class="information">{{ truncatedInformation }}</p>
                <a-button type="link" @click="showModal">详情</a-button>
              </div>
            </div>
            <p><strong>所属区块链:</strong> {{ dappDetails.chain }}</p>
            <p><strong>类别:</strong> {{ dappDetails.tags[0].tagName }}</p>
            <p><strong>创建时间:</strong> {{ dappDetails.createTime }}</p>
            <p><strong>最后更新时间:</strong> {{ dappDetails.updateTime }}</p>
            <p><strong>上传作者:</strong> {{ dappDetails.user.nickname }}</p>
            <div class="button-group">
              <span>
                <a-button type="primary" @click="visitWebsite">访问网址</a-button>
              </span>
              <span>
                <a-button type="primary" @click="editDapp" class="edit-button">编辑Dapp</a-button>
              </span>
              <span>
                <a-button v-if="!isAdded" type="primary" @click="addDappToDesk" class="edit-button">添加到桌面</a-button>
                <a-button v-else disabled type="primary"  class="edit-button">已添加到桌面</a-button>
              </span>
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
          <h2 class="modal-title">{{ dappDetails.name }}</h2>
          <p class="modal-description">{{ dappDetails.detail }}</p>
        </div>
      </a-modal>
      
      <!-- 双栏布局 -->
      <a-row :gutter="20" style="margin-top: 10px;">
        <!-- 左栏：智能合约地址 -->
        <a-col :span="12">
          <div class="section-card">
            <h3 class="section-title">
              <span class="title-icon">📜</span>
              智能合约地址
            </h3>
            <div class="section-content">
        <div v-if="dappDetails.contracts.length === 0" class="empty-state">暂无合约数据</div>
        <div v-else>
          <a-button @click="toggleContracts" type="link" class="show-more-button">
            <template v-if="isExpanded">
              <UpCircleTwoTone style="font-size: 24px;"/>
            </template>
            <template v-else>
              <DownCircleTwoTone style="font-size: 24px;"/>
            </template>
          </a-button>
          <div class="scrollable-container">
            <div v-for="(contract, index) in displayedContracts" :key="index" class="contract-item">
              <span class="contract-index">{{ (currentPage - 1) * pageSize + index + 1 }}.</span>
              <span class="contract-address">{{ contract.address }}</span>
            </div>
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
        </a-col>
        
        <!-- 右栏：用户评分 -->
        <a-col :span="12">
          <div class="section-card">
            <h3 class="section-title">
              <span class="title-icon">⭐</span>
              用户评分
            </h3>
            <div class="section-content">
        <div class="rating-container">
          <!-- Overall Rating Display -->
          <div v-if="totalReviews == 0" class="overall-rating">
            <h2>暂无评分</h2>
          </div>
          <div v-else class="overall-rating">
            <h2>{{ overallRating }} 分</h2>
            <a-rate v-model:value="overallRating" allow-half disabled />
            <p>{{ totalReviews }} 人已评分</p>
          </div>

          <!-- Detailed Rating Breakdown -->
          <div class="rating-breakdown">
            <div class="rating-item" v-for="(percentage, index) in ratingPercentages" :key="index">
              <span>{{ 5 - index }}分</span>
              <a-progress :percent="percentage" :show-info="false" />
            </div>
          </div>
        </div>

        <!-- User Rating Section -->
        <div class="user-rating">
          <a-avatar size="large" :src="config.user.avatar" shape="square" />
          <div class="user-comment">
            <h3>Hi, {{config.user.username}}！请为此小程序评分吧</h3>
            <a-rate v-model:value="userRating" />
            <span class="ant-rate-text">{{ desc[userRating - 1] }}</span>
          </div>
          <a-button v-if="userRating == 0" type="primary" @click="submitRating" class="rate-button">
            提交评分
          </a-button>
          <a-button v-else disabled type="primary" @click="submitRating" class="rate-button">
            您已评分
          </a-button>
        </div>
            </div>
          </div>
        </a-col>
      </a-row>
      
      <u-comment upload :config="config" @submit="submit" relative-time>
        <!-- <template>导航栏卡槽</template> -->
        <!-- <template #header>头部卡槽</template> -->
        <!-- <template #info>信息卡槽</template> -->
        <!-- <template #card>用户信息卡片卡槽</template> -->
        <!-- <template #func>功能区域卡槽</template> -->
      </u-comment>
    </div>
  </div>
</template>

<script lang="ts" setup>
import emoji from '../../../assets/emoji'
import { CommentApi, ConfigApi, SubmitParamApi, UToast, createObjectURL, dayjs } from 'undraw-ui'
import { appStore } from "@table/store";
import { ref, reactive, onMounted, computed, watch } from 'vue';
import { message } from 'ant-design-vue';
import { DownCircleTwoTone, UpCircleTwoTone, LikeOutlined, LikeFilled, StarOutlined, StarFilled } from '@ant-design/icons-vue';
import { getDappDetail, getisCollected,dappCollect,getisLiked,dappLiked} from "../../../js/service/dappMarket";
import { getDappCommentList, addDappComent, getDappRatingInfo, addDappRating} from "../../../js/service/dappMarket";
import { addDappCard, getisAdded,delDappCard} from "../../../js/service/dappMarket";
import { cardStore } from "@store/card";

const props = defineProps<{
  dappId: number | null;
}>();

const emit = defineEmits(['back']);

const overallRating = ref(3.9); // 总评分
const totalReviews = ref(5588); // 总评论人数
const ratingPercentages = ref([70, 20, 5, 3, 2]); // 每个评分等级的百分比
const userRating = ref(0); // 用户评分
const userAvatar = ref(''); // 用户头像URL
const desc = ref<string[]>(['1分', '2分', '3分', '4分', '5分']);


const config = reactive<ConfigApi>({
  user: {} as any,
  emoji: emoji,
  comments: [],
  showLevel: false,
  showHomeLink: false,
  showAddress: false,
  showLikes: false
})
console.log("appstore.userInfo:",appStore().userInfo)
config.user.id = appStore().userInfo.uid
config.user.username = appStore().userInfo.nickname
config.user.avatar = appStore().userInfo.avatar




// 评论提交事件
let temp_id = 100
// 提交评论事件
const submit = async ({ content, parentId, files, finish }: SubmitParamApi) => {
  console.log('提交评论: ' + content, parentId, files)
  /**
   * 上传文件后端返回图片访问地址，格式以'||'为分割; 如:  '/static/img/program.gif||/static/img/normal.webp'
   */
  let contentImg = files?.map(e => createObjectURL(e)).join('||')
  const comment: CommentApi = {
    id: String((temp_id += 1)),
    parentId: parentId,
    uid: config.user.id,
    content: content,
    createTime: dayjs().subtract(5, 'seconds').toString(),
    contentImg: contentImg,
    user: {
      username: config.user.username,
      avatar: config.user.avatar
    },
    reply: null
  }

  let imgs = [];
  if (files.length > 0) {
    imgs = await Promise.all(
      files.map(async (item) => {
        const url = await tsbApi.punkos.storage._imgUploadIpfs(item);
        return {
          img: url
        }
      })
    );
  }
  const commentData = {
    dappId: props.dappId,
    parentId: parentId,
    userId: config.user.id,
    content: content,
    imgs: imgs
  }
  addDappComent(commentData);
  setTimeout(() => {
    finish(comment)
    UToast({ message: '评论成功!', type: 'info' })
  }, 200)
}

const submitRating = () => {
  if(userRating.value == 0){
    message.info("请至少选择1分！")
    return;
  }
  let ratingData = {
    dappId: props.dappId,
    userId: appStore().userInfo.uid,
    score: userRating.value
  }
  addDappRating(ratingData).then(res => {
    message.success("评分成功！")
    fetchDappRatingInfo()
  })
}

const dappDetails = ref(null);

const isExpanded = ref(false);
const isModalVisible = ref(false);
const liked = ref(false);
const favorited = ref(false);
const isAdded = ref(false);

const truncatedInformation = computed(() => {
  if (isExpanded.value) {
    return dappDetails.value.detail;
  }
  const lines = dappDetails.value.detail.split('\n');
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

async function fetchDappDetail() {
  if (!props.dappId) return;
  await getDappDetail(props.dappId).then(response => {
    dappDetails.value = response.data
  })
};

async function fetchIsCollected() {
  if (!props.dappId) return;
  await getisCollected(appStore().userInfo.uid, props.dappId).then(response => {
    favorited.value = response.data
  })
}

async function fetchDappCommentList() {
  if (!props.dappId) return;
  await getDappCommentList(props.dappId).then(response => {
    config.comments = response.data;
  })
}

async function fetchDappRatingInfo() {
  if (!props.dappId) return;
  await getDappRatingInfo(props.dappId, appStore().userInfo.uid).then(response => {
    totalReviews.value = response.data.totalReviews
    overallRating.value = response.data.overallRating
    ratingPercentages.value = response.data.ratingPercentages
    userRating.value = response.data.userRating
  })
}

async function fetchIsLiked() {
  if (!props.dappId) return;
  await getisLiked(appStore().userInfo.uid, props.dappId).then(response => {
    liked.value = response.data
  })
}

//判断dapp是否已添加到桌面
async function fetchIsAdded() {
  if (!props.dappId) return;
    await getisAdded(appStore().userInfo.uid, props.dappId).then(response => {
        isAdded.value = response.data
    })
}

async function loadDappData() {
  await fetchDappDetail();
  await fetchIsCollected();
  await fetchIsLiked();
  await fetchIsAdded();
  await fetchDappCommentList();
  await fetchDappRatingInfo();
}

onMounted(async () => {
  await loadDappData();
});

watch(() => props.dappId, async (newId) => {
  if (newId) {
    await loadDappData();
  }
});

const visitWebsite = () => {
  window.open(dappDetails.value.website, '_blank');
};

const addDappToDesk = async () => {
  isAdded.value = !isAdded.value;
  await addDappCard(appStore().userInfo.uid, props.dappId)
  cardStore().getUserDappDesk(appStore().userInfo.uid) //更新桌面
  message.success("已成功添加到桌面")
}

const editDapp = () => {
  message.info('编辑Dapp功能暂未实现');
};

const toggleLike = () => {
  liked.value = !liked.value;
  dappLiked(appStore().userInfo.uid, props.dappId);
};

const toggleFavorite = () => {
  favorited.value = !favorited.value;
  dappCollect(appStore().userInfo.uid, props.dappId);
};
</script>

<style scoped>
/* 双栏卡片容器 */
.section-card {
  background: var(--secondary-bg);
  border-radius: 12px;
  padding: 12px 16px;
  height: 100%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.section-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

/* 区域标题样式 */
.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #000000 !important;
  margin: 0 0 10px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-icon {
  font-size: 1.4rem;
}

/* 内容区域 */
.section-content {
  color: var(--primary-text);
}

/* 滚动容器样式 */
.scrollable-container {
  max-height: 300px;
  overflow-y: auto;
  padding-right: 8px;
}

.scrollable-container::-webkit-scrollbar {
  width: 6px;
}

.scrollable-container::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
}

.scrollable-container::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.scrollable-container::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

/* 空状态样式 */
.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: rgba(0, 0, 0, 0.6);
  font-size: 1rem;
}

.rating-section {
  margin-top: 20px;
  background: var(--secondary-bg);
  padding: 20px;
  border-radius: 12px;
  color: var(--primary-text);
}

/* Flex container for overall rating and breakdown */
.rating-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.overall-rating {
  text-align: center;
  margin-right: 15px;
}

.overall-rating h2 {
  font-size: 32px;
  margin: 0 0 4px 0;
  color: var(--primary-text);
}

.overall-rating p {
  margin: 4px 0 0 0;
  font-size: 0.9rem;
}

.rating-breakdown {
  flex-grow: 1;
  padding-left: 20px;
}

.rating-item {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.rating-item span {
  width: 40px;
  text-align: right;
  margin-right: 10px;
  color: var(--primary-text);
}

.user-rating {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.user-comment {
  margin-left: 10px;
  flex-grow: 1;
}

.user-comment h3 {
  margin: 0 0 6px 0;
  font-size: 1rem;
  color: var(--primary-text);
}

.user-comment p {
  margin: 5px 0;
  color: rgba(0, 0, 0, 0.7);
}

/* Styles for the rating button */
.rate-button {
  margin-left: auto;
  border-radius: 8px;
}

.dapp-details {
  padding: 20px;
  height: 100%;
  color: var(--primary-text);
}

.image-carousel {
  height: 450px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: var(--secondary-bg);
}

.carousel-image {
  object-fit: cover;
  object-position: center center;
  width: 100%;
  height: 100%;
}

.details {
  padding: 20px;
  background: var(--secondary-bg);
  border-radius: 12px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.details h1 {
  margin-bottom: 12px;
  font-size: 2rem;
  color: var(--primary-text);
}

.details p {
  margin-bottom: 12px;
  font-size: 1rem;
  color: rgba(0, 0, 0, 0.8);
}

.logo-container {
  display: flex;
  align-items: flex-start;
  margin-bottom: 16px;
}

.logo-container .logo {
  width: 60px;
  height: 60px;
  flex-shrink: 0;
  border-radius: 8px;
}

.info-container {
  margin-left: 16px;
  flex-grow: 1;
}

.information {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 0;
  color: rgba(0, 0, 0, 0.7);
}

.button-group {
  margin-top: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.button-group span {
  margin-right: 0;
}

:deep(.ant-btn) {
  border-radius: 8px;
}

.icon-group {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 16px;
}

.like-icon, .favorite-icon, .liked-icon, .favorited-icon {
  font-size: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.like-icon:hover, .favorite-icon:hover {
  color: #1890ff;
  transform: scale(1.2);
}

.liked-icon, .favorited-icon {
  color: #ff4d4f;
}

.liked-icon:hover, .favorited-icon:hover {
  color: #ff7875;
  transform: scale(1.2);
}

:deep(.ant-modal-content) {
  background: var(--secondary-bg);
  border-radius: 12px;
}

:deep(.ant-modal-header) {
  background: transparent;
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

:deep(.ant-modal-title) {
  color: var(--primary-text);
}

:deep(.ant-modal-close-x) {
  color: var(--primary-text);
}

.modal-content {
  text-align: center;
}

.modal-title {
  font-size: 1.5rem;
  margin-bottom: 16px;
  color: var(--primary-text);
}

.modal-description {
  font-size: 1rem;
  text-align: left;
  color: rgba(0, 0, 0, 0.8);
}

.contracts-row {
  position: relative;
  padding: 20px;
  background: var(--secondary-bg);
  margin-top: 20px;
  border-radius: 12px;
}

.contracts-row > div {
  color: var(--primary-text);
}

.contract-item {
  display: inline-block;
  width: 33%;
  margin-bottom: 10px;
}

.contract-index {
  color: #ffa940;
  margin-right: 5px;
  font-weight: 600;
}

.contract-address {
  color: #40a9ff;
  cursor: pointer;
  transition: all 0.3s ease;
}

.contract-address:hover {
  color: #69c0ff;
  text-decoration: underline;
}

.show-more-button {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1;
  font-size: 24px;
}

.pagination {
  margin-top: 20px;
  text-align: center;
}

:deep(.u-comment) {
  background: var(--secondary-bg);
  border-radius: 12px;
  margin-top: 20px;
  padding: 20px;
  color: var(--primary-text);
}

:deep(.u-comment-container) {
  background: transparent;
}
</style>
