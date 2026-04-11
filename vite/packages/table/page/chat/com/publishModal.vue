<template>
  <Modal :maskNoClose="true" class="" >
    <div class="w-[500px] pl-4 pr-4">
      <div class="flex justify-between w-full h-[64px] items-center">
        <div class="flex justify-center w-full">
          <div class="ml-8 font-16 xt-text">写帖子</div>
        </div>
        <xt-button
          class="flex items-center justify-center border-0 rounded-md xt-bg-2 pointer"
          @click="handleOk"
          style="width: 40px; height: 40px"
        >
          <newIcon class="mt-1 text-xl text-center xt-text pointer" icon="akar-icons:cross" />
        </xt-button>
      </div>
      <div class="flex items-center justify-start w-full rounded-lg font-14 xt-text-2 xt-bg-2 h-[54px]" >
        <a-input  v-model:value="postTitle" placeholder="请输入标题" :bordered="false" />
      </div>
      <div class="w-full mt-2 xt-bg box font-16">
        <div style="font-size: 1rem !important">
          <div class="mt-3 mb-2 xt-bg-2 reply-textarea">
            <a-textarea
              v-model:value="postValue"
              placeholder="请输入内容"
              :autoSize="{ minRows: 5, maxRows: 8 }"
              :bordered="false"
            />
            <div style="font-size: 16px !important" v-if="imageLoadVisible">
              <a-upload
                v-model:file-list="fileList"
                action=""
                class="ml-2 text-base"
                list-type="picture-card"
                multiple
                @preview="handlePreview"
              >
                <div v-if="fileList.length < 6">
                  <plus-outlined style="font-size: 1.2em" class="xt-text" />
                </div>
              </a-upload>
            </div>
            <a-modal :visible="previewVisible" :title="previewTitle" :footer="null" @cancel="handleCancel">
              <img style="width: 100%" :src="previewImage" />
            </a-modal>
          </div>
          <div class="mt-3 mb-2 pl-4">
            <template v-for="(tag, index) in tags" :key="tag">
              <a-tooltip v-if="tag.length > 20" :title="tag">
                <a-tag closable @close="handleTagClose(tag)">
                  {{ `${tag.slice(0, 20)}...` }}
                </a-tag>
              </a-tooltip>
              <a-tag v-else closable @close="handleTagClose(tag)">
                {{ tag }}
              </a-tag>
            </template>
            <a-input
              v-if="inputTagVisible"
              ref="inputTagRef"
              v-model:value="inputTagValue"
              type="text"
              size="small"
              :style="{ width: '78px' }"
              @blur="handleInputConfirm"
              @keyup.enter="handleInputConfirm"
            />
            <a-tag v-else style="background: #fff; border-style: dashed" @click="showTagInput">
              <plus-outlined />
              New Tag
            </a-tag>
          </div>
          <div class="h-[45px] flex items-center justify-between">
            <div class="flex items-center justify-center xt-text-2">
              <tippy trigger=" click" placement="bottom" :interactive="true">
                <template #content>
                  <!-- <div class="w-full"> -->
                  <vue-custom-scrollbar
                    :settings="settingsScroller"
                    class="w-full h-[150px] xt-bg-2 rounded-lg flex"
                    style="flex-wrap: wrap"
                  >
                    <div
                      v-for="(item, index) in folderPath"
                      class="mb-2 ml-1 mr-1 pointer w-[32px] h-[32px]"
                      @click="addEmoji(item)"
                      :key="index"
                      style="cursor: pointer"
                    >
                      <img :src="item" class="w-[32px] h-[32px]" />
                    </div>
                  </vue-custom-scrollbar>
                  <!-- </div> -->
                </template>
                <a-button
                  type="text"
                  size="small"
                  class="ml-2 xt-text emojiVis"
                  style="color: var(--secondary-text) !important"
                  ><template #icon>
                    <!-- <SmileOutlined style="" /> -->
                    <newIcon
                      icon="fluent:emoji-smile-slight-24-regular"
                      class="text-xl xt-text-2"
                      style="vertical-align: sub; margin-right: 4px"
                    />
                  </template>
                  表情</a-button
                >
              </tippy>

              <a-upload v-model:file-list="fileList" @preview="handlePreview" :showUploadList="false"  multiple>
                <a-button type="text" size="small" class="xt-text" style="color: var(--secondary-text) !important"
                  ><template #icon>
                    <newIcon
                      icon="fluent:image-sparkle-16-regular"
                      class="text-xl xt-text-2"
                      style="vertical-align: sub; margin-right: 4px"
                    />
                  </template>
                  图片</a-button
                >
              </a-upload>
            </div>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-center h-[56px]">
        <!-- <a-button type="text" class=" xt-text xt-bg-2 font-14"
                    style="border-radius:10px ; color: var(--secondary-text) !important;">想天工作台/桌面分享 ></a-button> -->
<!--        <a-select-->
<!--          v-model:value="cascaderValue"-->
<!--          :options="options"-->
<!--          :placeholder="holderName?.name"-->
<!--          :loadData="loadData"-->
<!--          :bordered="false"-->
<!--          @change="handleChange"-->
<!--          style="font-size: 16px; border-radius: 10px; width: 120px; height: 40px"-->
<!--          change-on-select-->
<!--        >-->
<!--          <template #suffixIcon>-->
<!--            <newIcon icon="fluent:chevron-left-16-filled" class="text-base rotate-180"></newIcon>-->
<!--          </template>-->
<!--        </a-select>-->
        <div class="flex items-center">
          <xt-button
            type="text"
            class="xt-text xt-bg-2"
            style="border-radius: 10px; color: var(--secondary-text) !important; width: 64px; height: 40px"
            @click="handleOk"
            >取消</xt-button
          >
          <xt-button
            type="primary"
            class="ml-2"
            style="
              border-radius: 10px;
              color: var(--secondary-text) !important;
              width: 64px;
              height: 40px;
              background-color: var(--active-bg);
            "
            @click="publishPost"
            >发布</xt-button
          >
        </div>
      </div>
    </div>
  </Modal>
</template>
<script setup lang="ts">
import {computed, nextTick, reactive, ref} from 'vue';
import {PlusOutlined} from '@ant-design/icons-vue';
import type {CascaderProps, UploadProps} from 'ant-design-vue';
import {message} from 'ant-design-vue';
import Modal from '../../../components/Modal.vue';
import {Icon as newIcon} from '@iconify/vue';
import {comStore} from "@store/com";
import {addForum} from "@js/service/socialNetwork_forum";
const store = comStore();
// const useCommunStore = useCommunityStore();
// const imageLoadVisible = ref(true)
// const goYuan = () => {
//   browser.openInUserSelect(`https://s.apps.vip/forum?id=${props.forumId}`);
// };

const imageLoadVisible = computed(() => {
  return fileList.value?.length > 0;
});

const inputTagRef = ref();
const tags = ref([]);
const inputTagVisible = ref(false);
const inputTagValue = ref('');
// const state = reactive({
//   tags: ['Unremovable', 'Tag 2', 'Tag 3Tag 3Tag 3Tag 3Tag 3Tag 3Tag 3'],
//   inputTagVisible: false,
//   inputTagValue: '',
// });
const handleTagClose = (removedTag: string) => {
  const newTags = tags.value.filter(tag => tag !== removedTag);
  console.log(newTags);
  tags.value = newTags;
};

const showTagInput = () => {
  inputTagVisible.value = true;
  nextTick(() => {
    inputTagRef.value.focus();
  });
};

const handleInputConfirm = () => {
  const inputValue = inputTagValue.value;
  let newTags = tags.value;
  if (inputValue && newTags.indexOf(inputValue) === -1) {
    newTags = [...newTags, inputValue];
  }
  console.log(newTags);
  tags.value = newTags;
  inputTagVisible.value = false;
  inputTagValue.value = '';
};



// const userName = ref('我是皮克斯呀')
const postValue = ref('');
const postTitle = ref('');
const props = defineProps({
  replyVisible: Boolean,
  showPublishModal: Boolean,
  forumId: Number,
});
// 添加表情
const addEmoji = (item) => {
  const lastSlashIndex = item.lastIndexOf('/');
  const emoiiValue = item.substring(lastSlashIndex + 1);
  // console.log(emoiiValue);

  const key = Object.entries(fluentEmojis).find(([k, v]) => v === emoiiValue)[0];
  postValue.value += `${key}`;
};
const visible = ref(false);
function getBase64(file: File) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}
const emit = defineEmits(['handle-ok']);
const previewVisible = ref(false);
const previewImage = ref('');
const previewTitle = ref('');
// 用于在动态和评论中使用的表情
// str.replace(/\[([^(\]|\[)]*)\]/g,(item,index) => {})
// https://sad.apps.vip/public/static/emoji/emojistatic/
let folderPath = reactive([]);
// onMounted(() => {
//   Object.values(fulentEmojis).forEach((item) => {
//     folderPath.push(`https://sad.apps.vip/public/static/emoji/emojistatic/${item}`);
//   });
//   let textareaElement = window.document.querySelector('textarea');
//   // console.log(textareaElement);
//
//   textareaElement?.focus();
//   useCommunStore.getCommunityInfo(props.forumId);
//   useCommunStore.getCommunityCate(props.forumId);
//   console.log(useCommunStore.communityInfo.forum?.name);
//   // console.log(navigator.plugins);
// });
// const communCate = computed(() => useCommunStore.communityCate);
// let arr = ref([]);
// communCate.value.forEach((item) => {
//   arr.value.push({
//     value: item.id,
//     label: item.name,
//   });
// });
let cascaderValue = ref([]);
const options = ref<CascaderProps['options']>([]);
// arr.value.forEach((item) => {
//   options.value.push(item);
// });
// const loadData: CascaderProps['loadData'] = (selectedOptions) => {
//   const targetOption = selectedOptions[selectedOptions.length - 1];
//   targetOption.loading = true;
//   arr.value.forEach((item) => {
//     targetOption.children?.push(item);
//   });
//   options.value = [...options.value];
// };
const handleChange = (value) => {
  cascaderValue.value = value;
  console.log(cascaderValue.value);
};
// const holderName = computed(() => {
//   return useCommunStore.communityInfo.forum;
// });
const settingsScroller = reactive({
  useBothWheelAxes: true,
  swipeEasing: true,
  suppressScrollY: false,
  suppressScrollX: true,
  wheelPropagation: true,
});
const fileList = ref<UploadProps['fileList']>([]);

const handleCancel = () => {
  previewVisible.value = false;
  previewTitle.value = '';
};
const handlePreview = async (file: UploadProps['fileList'][number]) => {
  if (!file.url && !file.preview) {
    file.preview = (await getBase64(file.originFileObj)) as string;
  }
  previewImage.value = file.url || file.preview;
  previewVisible.value = true;
  previewTitle.value = file.name || file.url.substring(file.url.lastIndexOf('/') + 1);
};
const handleOk = () => {
  // console.log(e);
  visible.value = false;
  emit('handle-ok', visible);
};
import { useWeb3Modal, useWeb3ModalAccount,createWeb3Modal } from '@punkos/ethers5/vue';
import { walletConfig } from "@store/wallet";
import { socialContractABI, socialContractAddress} from "@page/channels/mock";
import { ethers } from 'ethers'
const modal2 = createWeb3Modal(walletConfig());
const postForum = async (_forumId,_userId,_title,_content,_imagesCID) => {
  message.info("正在同步数据至区块链，请在手机钱包签名确认此操作！")
  try {
    const walletProvider = modal2.getWalletProvider()
    if (!walletProvider) throw Error('User disconnected')
    const ethersProvider = new ethers.providers.Web3Provider(walletProvider)
    const signer = await ethersProvider.getSigner()
    const socialContract = new ethers.Contract(socialContractAddress,socialContractABI,signer)
    await socialContract.postForum(_forumId,_userId,_title,_content,_imagesCID).then(res=>{
      console.log('交易信息：',res)
      message.success("帖子信息成功上链！")
    });
  }catch (error){
    console.error('帖子信息上链出错:', error);
  }
}
// 发布帖子
// const titleValue = ref('');
const publishPost = async () => {
  console.log(postTitle.value, 'titleValue.value');
  console.log(postValue.value, 'postValue.value');
  if(postTitle.value.length == 0 || postValue.value.length == 0){
    message.error('标题和内容不能为空');
    return;
  }
  let postData = {};
  postData.userId = store.user.id;
  postData.title = postTitle.value;
  postData.content = postValue.value;
  //遍历tags，并将其转换为新列表postTags,postTags中每一个元素的tagName为tags中的每一个元素
  let postTags = [];
  tags.value.forEach((item) => {
    postTags.push({tagName: item});
  });
  postData.tags = postTags;
  const imagesCID = [];
  if(fileList.value.length > 0){
    const imageUrlList = await Promise.all(
      fileList.value.map(async (item) => {
        // const url = await fileUpload(item.originFileObj);
        // return url;
        const url = await tsbApi.punkos.storage._imgUploadIpfs(item.originFileObj);
        imagesCID.push(url)
        return {
          img: url
        }
      })
    );
    postData.imgs = imageUrlList;
  }
  console.log(postData);
  console.log("imagesCID:" , imagesCID)
  await addForum(postData).then( response => {
      message.success('发布成功');
      postTitle.value = '';
      postValue.value = '';
      store._getTopTagList(); //更新首页的热门标签
      handleOk();
      //postForum(response.data.id,response.data.userId,response.data.title,response.data.content,imagesCID);
  })








  //if (postValue.value || fileList.value.length > 0) {
    // const imageUrlList = await Promise.all(
    //   fileList.value.map(async (item) => {
    //     // const url = await fileUpload(item.originFileObj);
    //     // return url;
    //     const url = await store._imgUpload(item.originFileObj);
    //     return {
    //       img: url
    //     }
    //   }),
    // );
    // console.log(imageUrlList)
    // // let image = JSON.stringify(imageUrlList.value)
    // let forumId = props.forumId;
    // let content = postValue.value;
    // let title = computed(() => {
    //   if (!titleValue.value || titleValue.value.length < 5) {
    //     return postValue.value.slice(0, 5);
    //   }
    //   return titleValue.value;
    // });
    // console.log(title.value, 'title.value');

    // setTimeout(async () => {
    //   // console.log(forumId, content, title.value, image, 'titleValue.value');
    //   const imageList = JSON.stringify(imageUrlList);
    //   await useCommunStore.getCommunityPublishPost(forumId, imageList, content, title.value, cascaderValue);
    //
    //   message.success('发布成功');
    //   titleValue.value = '';
    //   postValue.value = '';
    //   fileList.value = [];
    //   handleOk();
    //   await useCommunStore.getCommunityPost(forumId);
    // });
  //}
};
</script>
<style lang="scss" scoped>
:deep(.ant-upload-list-text-container) {
  display: none;
}
.box {
  border-radius: 12px;
}

.font-16 {
  font-size: 16px;
  // text-align: center;
  font-weight: 400;
}

.font-14 {
  font-size: 14px;
  line-height: 20px;
  font-weight: 400;
}

:deep(.ant-upload-list-picture-card .ant-upload-list-item-thumbnail) {
  font-size: 8px;
}

:deep(.ant-upload.ant-upload-select-picture-card) {
  width: 64px;
  height: 64px;
}

:deep(.ant-upload-list-picture-card-container) {
  width: 64px;
  height: 64px;
}
:deep(.ant-select-single.ant-select-show-arrow .ant-select-selection-placeholder) {
  color: var(--secondary-text);
  height: 40px;
  line-height: 40px;
}
:deep(.ant-select-single.ant-select-show-arrow .ant-select-selection-item) {
  padding-right: 0px;
}
:deep(.ant-select-single.ant-select-show-arrow .ant-select-selection-item) {
  color: var(--secondary-text);
  height: 40px;
  line-height: 40px;
}
:deep(.ant-select-arrow) {
  color: var(--secondary-text);
  font-size: 16px;
}
:deep(
    .ant-select-single.ant-select-show-arrow .ant-select-selection-item,
    .ant-select-single.ant-select-show-arrow .ant-select-selection-placeholder
  ) {
  // &::placeholder {
  font-weight: 400;
  font-size: 16px;

  color: var(--secondary-text);
  // }
}
:deep(.ant-select-open) {
  background: var(--primary-bg) !important;
  color: var(--primary-text) !important;
}
:deep(.ant-select-focused) {
  background: var(--primary-bg) !important;
  color: var(--primary-text) !important;
}
:deep(.ant-select-focused .ant-select-open) {
  background: var(--primary-bg) !important;
  color: var(--primary-text) !important;
}
:deep(.ant-input) {
  color: var(--secondary-text);
  // padding-left: 8px;
  margin-left: 4px;
  &::placeholder {
    font-weight: 400;
    font-size: 16px;

    color: var(--secondary-text);
    // padding-left: 4px;
  }
}

:deep(.tippy-box) {
  width: 51%;
  margin-left: 35%;
}

.reply-textarea {
  border-radius: 10px;

  textarea {
    border-radius: 10px;

    &:deep(.ant-input) {
      &::-webkit-scrollbar {
        display: none;
      }
    }
  }
}
</style>
