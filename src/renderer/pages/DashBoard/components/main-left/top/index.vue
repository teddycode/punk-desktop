<template>
  <dv-border-box10>
    <div class="message-box">
      <div class="title">最新消息</div>
      <div class="subtitles-container">
        <hr class="white-line"/>
        <div class="subtitles">
          <div
              v-for="subtitle in subtitles"
              :key="subtitle.name"
              :class="{ active: activeSubtitle === subtitle.name }"
              @click="activeSubtitle = subtitle.name"
          >
            {{ subtitle.name }}
          </div>
        </div>
      </div>
      <div class="message-content">
        <ul :style="{ 'margin-top': marginTop + 'px' }">
          <li v-for="(item, index) in displayedData" :key="index" @click="handleClick(item)">
            <a>
              <font-awesome-icon :icon="activeSubtitle === '私信' ? 'fa-envelope':'volume-up'" class="icon"
                                 size="lg">
              </font-awesome-icon>
              {{ item.date }} &nbsp;&nbsp;{{ item.message }}
            </a>
          </li>
        </ul>
      </div>
      <div class="tools">
        <shape-button class="operate-button">发布</shape-button>
        <shape-button class="operate-button">筛选</shape-button>
      </div>
      <div>
        <a-modal v-model:open="modalSate.open" :title="modalSate.title"
                 cancel-text="取消" ok-text="确认" width="400px" @ok="hideModal">
          {{ modalSate.content }}
        </a-modal>
        <!--        <el-dialog :visible.sync="modalSate.open" :title="modalSate.title">-->
        <!--        {{ modalSate.content }}-->
        <!--        </el-dialog>-->
      </div>
    </div>
  </dv-border-box10>
</template>

<script lang="ts">
import {defineComponent, ref, computed, reactive} from 'vue'
import {library} from '@fortawesome/fontawesome-svg-core'
import {faVolumeUp} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'
import ShapeButton from "@components/buttons/ShapeButton.vue"

library.add(faVolumeUp)

export default defineComponent({
  components: {
    ShapeButton,
    FontAwesomeIcon,
  },
  setup() {
    interface MessageFormat {
      date: string,
      message: string,
    }

    interface ModalProps {
      open: boolean,
      title: string,
      content: string,
    }

    const msgData = ref<MessageFormat[]>([
      {date: '2023-07-01', message: 'Message 1'},
      {date: '2023-07-02', message: 'Message 2'},
      {date: '2023-07-03', message: 'Message 3'},
      {date: '2023-07-04', message: 'Message 4'},
      {date: '2023-07-05', message: 'Message 5'},
      {date: '2023-07-06', message: 'Message 6'},
      {date: '2023-07-07', message: 'Message 7'},
      {date: '2023-07-08', message: 'Message 8'},
      {date: '2023-07-09', message: 'Message 9'},
      // add more items here
    ])
    const activeIndex = ref(0)
    const subtitles = ref([
      {name: '系统消息'},
      {name: '私信'}
    ])
    const activeSubtitle = ref('系统消息')

    const marginTop = computed(() => -activeIndex.value * 40)
    const displayedData = computed(() => [...msgData.value, ...msgData.value])

    const handleClick = (item: any) => {
      showModal(item);
      console.log(item)
    }

    setInterval(() => {
      if (msgData.value.length > 0) {
        if (activeIndex.value < displayedData.value.length - 1) {
          activeIndex.value %= 9
          activeIndex.value += 1
        } else {
          activeIndex.value = 0
        }
      } else {
        activeIndex.value = 0
      }
    }, 2000)

    const modalSate = reactive<ModalProps>({
      open: false,
      title: '',
      content: '',
    });
    let modalText = ref<string>('');
    const showModal = (item: MessageFormat) => {
      modalSate.open = true;
      modalSate.title = "内容-" + item.date;
      modalSate.content = item.message;
      console.log(modalSate)
    };
    const hideModal = () => {
      modalSate.open = false;
      console.log(modalSate)
    };

    return {
      modalSate,
      msgData,
      hideModal,
      activeIndex,
      subtitles,
      activeSubtitle,
      marginTop,
      displayedData,
      handleClick,
      modalText
    }
  }
})
</script>


<style scoped>
.message-box {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 15px 0;
  overflow: hidden;
}

.title {
  padding-top: 10px;
  font-size: 1.5rem;
  color: #5ab1ef;
}

.message-content {
  width: 100%;
  height: 60%;
  overflow: hidden;
  padding-top: 4px;
  padding-right: 20px;
  color: white;
}

ul {
  width: 100%;
  height: 100%;
  position: relative;
  transition: margin-top 0.5s;
}

li {
  width: 100%;
  height: 40px;
  padding: 5px 0;
  overflow: hidden;
  display: flex;
  align-items: center;
}

a {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #333;
  text-decoration: none;
  background: rgba(216, 191, 216, 0.1);
  border-radius: 5px;
  padding-left: 10px;
}

.icon {
  margin-right: 10px;
  color: #eb8a00;
}

.tools {
  margin-left: 10%;
  margin-right: 10%;
  margin-top: 3%;
  /*padding:5%;*/
}

.operate-button {
  width: 30%;
  height: 40%;
  margin-right: 5%;
}

.subtitles-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.white-line {
  color: white;
  width: 100%;
  height: 1px;
  background-color: white;
  margin: 10px 0;
}

.subtitles {
  color: white;
  display: flex;
  justify-content: space-around;
  width: 100%;
  margin-bottom: 10px;
}

.subtitles > div {
  flex: 1;
  text-align: center;
  padding: 5px 0;
  cursor: pointer;
  position: relative; /* 将每个子标题都设为相对定位 */
}

.subtitles > div.active:before { /* 使用before伪元素来创建选中的子标题上方的蓝色条带 */
  content: '';
  position: absolute;
  top: -10px; /* 设置位置在选中的子标题上方 */
  left: 0;
  right: 0;
  height: 5px;
  background-color: #5ab1ef; /* or any color of your choice for the active state */
}
</style>
