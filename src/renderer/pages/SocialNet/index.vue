<template>
  <dv-border-box10>
    <div class="social-net">
      <div class="title">社交网络</div>
      <div class="main-content">
        <div class="left-container">
          <div class="controls-container">
            <hr class="white-line"/>
            <div class="radio-group">
              <div v-for="item in radioItems" :key="item.label" class="radio-item">
                <input :id="item.label" v-model="selectedItem" :value="item.label" type="radio">
                <label :for="item.label">{{ item.label }}</label>
                <div v-if="selectedItem === item.label" class="underline"></div>
              </div>
            </div>
          </div>
          <div class="button-container">
            <addnode-button style="margin-top: 10%; height:80%; width:60%;">了解更多</addnode-button>
          </div>
        </div>
        <div v-if="selectedItem === '工作'" class="right-container">
          <!-- Original content for '工作' -->
          <div class="icon-text-item" style="margin-top: 0;">
            <font-awesome-icon class="icon" icon="book-reader"/>
            文档阅读
          </div>
          <div class="icon-text-item">
            <font-awesome-icon class="icon" icon="edit"/>
            在线编辑
          </div>
          <div class="icon-text-item">
            <font-awesome-icon class="icon" icon="video"/>
            会议
          </div>
        </div>
        <div v-if="selectedItem === '社区'" class="right-container">
          <div class="controls-container">
            <div class="radio-group">
              <div v-for="topic in topics" :key="topic.label" class="radio-item">
                <input :id="topic.label" v-model="selectedTopic" :value="topic.label" type="radio">
                <label :for="topic.label">{{ topic.label }}</label>
                <div v-if="selectedTopic === topic.label" class="underline"></div>
              </div>
            </div>
          </div>
          <div v-if="selectedTopic === '话题'" class="topic-container">
            <font-awesome-icon class="icon" icon="fire"/>
            #活跃话题1<br>
            <font-awesome-icon class="icon" icon="fire"/>
            #活跃话题2
          </div>
          <div v-if="selectedTopic === '专区'" class="zone-container">
            <img alt="专区1" class="zone-logo" src="@renderer/assets/images/social/专区1logo.jpg">
            <img alt="专区2" class="zone-logo" src="@renderer/assets/images/social/专区2logo.jpg">
            <img alt="专区3" class="zone-logo" src="@renderer/assets/images/social/专区3logo.png">
          </div>
          <div v-if="selectedTopic === '关注'" class="follow-container">
            <div class="follow-logos">
              <img alt="关注1" class="follow-logo" src="@renderer/assets/images/social/专区1logo.jpg">
            </div>
          </div>
        </div>
      </div>
    </div>
  </dv-border-box10>
</template>

<script>
import addnodeButton from "@renderer/components/Buttons/addnodeButton.vue";

export default {
  name: "SocialNet",
  components: {
    addnodeButton
  },
  data() {
    return {
      radioItems: [
        {label: '工作'},
        {label: '娱乐'},
        {label: '社区'}
      ],
      topics: [
        {label: '话题'},
        {label: '专区'},
        {label: '关注'}
      ],
      selectedItem: '工作',
      selectedTopic: '话题'
    }
  }
}
</script>

<style scoped>
.social-net {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  height: 100%;
  padding: 5px 20px;
}

.title {
  padding-top: 5px;
  font-size: 1.5rem;
  color: #5ab1ef;
  margin-bottom: 10px;
}

.main-content {
  width: 100%;
  display: flex;
  flex-direction: row;
}

.left-container {
  display: flex;
  flex-direction: column;
  width: 30%; /* 使得左边的div占据30%的宽度 */
}

.controls-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.white-line {
  width: 100%; /* 保持100%的宽度 */
  height: 1px;
  color: white; /* 设置背景颜色为白色 */
  margin-bottom: 3px;
}

.radio-group {
  display: flex;
  width: 100%; /* 设置宽度为100% */
  justify-content: space-between; /* 使单选按钮之间有间隔 */
}

.radio-item {
  color: white;
  position: relative;
  cursor: pointer;
  flex: 1; /* 使每个单选按钮都有相同的宽度 */
}

.radio-item input[type="radio"] {
  display: none;
}

.radio-item label {
  cursor: pointer;
  width: 100%;
  display: block;
  text-align: center;
  padding: 5px 0;
}

.underline {
  position: absolute;
  top: -3px;
  left: 0;
  right: 0;
  height: 3px;
  background-color: #5ab1ef;
}

.button-container {
  width: 100%; /* 与 left-container 保持一致 */
  display: flex;
  justify-content: center; /* 水平居中 */
}

.right-container {
  margin-top: 1%;
  width: 50%;
  margin-left: 20%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
}

.icon-text-item {
  display: flex;
  align-items: center;
  color: white;
  margin-bottom: 3%;
  font-size: 1.5rem;
}

.icon {
  margin-right: 5px;
  font-size: 1.2rem;
}

.topic-container {
  color: white;
  font-size: 1.5rem;
  margin-top: 10px;
}

.zone-container, .follow-container {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  gap: 10%; /* 调整图片之间的间距 */
}

.zone-logo, .follow-logo {
  width: 60px; /* 保证专区和关注的logo宽度都为60px */
  height: 60px; /* 保证专区和关注的logo高度都为60px */
  border-radius: 50%;
  object-fit: cover;
}

.follow-container {
  display: flex;
  flex-direction: column;
  margin-top: 10px;
}

.icon {
  margin-right: 5px;
  font-size: 1.2rem;
}
</style>
