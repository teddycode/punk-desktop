<template>
  <div>
    <NavBar></NavBar>
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
          <h2 class="modal-title">{{ dappDetails.name }}</h2>
          <p class="modal-description">{{ dappDetails.detail }}</p>
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
      <div class="rating-section">
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
            <h3>Hi, {{config.user.username}}</h3>
            <p>请为此小程序评分吧</p>
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
import { ref, reactive, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { message } from 'ant-design-vue';
import { DownCircleTwoTone, UpCircleTwoTone, LikeOutlined, LikeFilled, StarOutlined, StarFilled } from '@ant-design/icons-vue';
import NavBar from "./NavBar.vue";
import { getDappDetail, getisCollected,dappCollect,getisLiked,dappLiked} from "../../../js/service/dappMarket.ts";
import { getDappCommentList, addDappComent, getDappRatingInfo, addDappRating} from "../../../js/service/dappMarket.ts";
const route = useRoute();
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
    dappId: route.params.id,
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
    dappId: route.params.id,
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
  await getDappDetail(route.params.id).then(response => {
    dappDetails.value = response.data
  })
};
async function fetchIsCollected() {
  await getisCollected(1, route.params.id).then(response => {
    favorited.value = response.data
  })
}
async function fetchDappCommentList() {
  await getDappCommentList(route.params.id, ).then(response => {
    config.comments = response.data;
  })
}
async function fetchDappRatingInfo() {
  await getDappRatingInfo(route.params.id, appStore().userInfo.uid).then(response => {
    totalReviews.value = response.data.totalReviews
    overallRating.value = response.data.overallRating
    ratingPercentages.value = response.data.ratingPercentages
    userRating.value = response.data.userRating
  })
}
async function fetchIsLiked() {
  await getisLiked(1, route.params.id).then(response => {
    liked.value = response.data
  })
}
onMounted(async () => {
  await fetchDappDetail();
  await fetchIsCollected();
  await fetchIsLiked();
  await fetchDappCommentList();
  await fetchDappRatingInfo();
});

const visitWebsite = () => {
  window.open(dappDetails.value.website, '_blank');
};

const editDapp = () => {
  message.info('编辑Dapp功能暂未实现');
};

const toggleLike = () => {
  liked.value = !liked.value;
  dappLiked(1,route.params.id);
};

const toggleFavorite = () => {
  favorited.value = !favorited.value;
  dappCollect(1,route.params.id);
};
</script>

<style scoped>
.rating-section {
  margin-top: 20px;
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Flex container for overall rating and breakdown */
.rating-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.overall-rating {
  text-align: center;
  margin-right: 20px; /* Adjust spacing between overall rating and breakdown */
}

.overall-rating h2 {
  font-size: 36px;
  margin: 0;
}

.rating-breakdown {
  flex-grow: 1;
  padding-left: 20px;
}

.rating-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.rating-item span {
  width: 40px;
  text-align: right;
  margin-right: 10px;
}

.user-rating {
  display: flex;
  align-items: center;
  justify-content: space-between; /* Ensure button aligns right */
  margin-top: 20px;
}

.user-comment {
  margin-left: 10px;
}

.user-comment h3 {
  margin: 0;
}

.user-comment p {
  margin: 5px 0;
}

/* Styles for the rating button */
.rate-button {
  margin-left: auto; /* Pushes button to the right */
}
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
  background-color: #fff;
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
  background-color: #fff;
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
