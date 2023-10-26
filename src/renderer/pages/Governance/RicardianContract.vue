<template>
  <MainBackground>
    <div class="container-ricardian">
      <!-- 单选框部分 -->
      <div class="radio-div">
        <div
          class="custom-radio"
          :class="{ selected: selected === 'edit' }"
          @click="select('edit')"
        >
          编辑
        </div>
        <div
          class="custom-radio"
          :class="{ selected: selected === 'view' }"
          @click="select('view')"
        >
          查看
        </div>
      </div>

      <!-- 编辑布局 -->
      <div v-if="selected === 'edit'" class="content-div">
        <div class="box-edit left-edit">
          <h2>智能合约代码</h2>
          <div class="button-group">
            <addnode-button class="action-button">生成</addnode-button>
            <addnode-button class="action-button">部署</addnode-button>
          </div>
        </div>
        <div class="box-edit right-edit">
          <h2>李嘉图合约代码</h2>
          <div class="button-group">
            <addnode-button class="action-button">链接</addnode-button>
          </div>
        </div>
      </div>

      <!-- 查看布局 -->
      <div v-if="selected === 'view'" class="view-layout">
        <div class="left-view">
          <div class="top-view">智能合约地址</div>
          <div class="bottom-view">合约函数名</div>
        </div>
        <div class="right-view">李嘉图合约</div>
      </div>
    </div>
  </MainBackground>
</template>

<script>
import MainBackground from "@renderer/components/common/MainBackground.vue";
import addnodeButton from "@renderer/components/Buttons/addnodeButton.vue";

export default {
  name: "RicardianContract",
  components: {
    MainBackground, addnodeButton,
  },
  data() {
    return {
      selected: 'edit'
    };
  },
  methods: {
    select(choice) {
      this.selected = choice;
    }
  }
}
</script>

<style scoped>
.container-ricardian {
  width: 90%;
  height: 100%;
  margin-left: 5%;
}

.radio-div {
  color: white;
  height: 10%;
  width: 15%;
  display: flex;
  align-items: center;
  gap: 0;
}

.custom-radio {
  flex: 1;
  height: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 2px solid white;
  cursor: pointer;
  transition: all 0.3s;
  box-sizing: border-box;
}

.custom-radio.selected {
  color: rgb(58, 134, 255);
  border-color: rgb(58, 134, 255);
}

.content-div {
  color: white;
  width: 100%;
  height: 80%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.box-edit {
  position: relative;
  margin-top: 2%;
  height: 100%;
  width: 40%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  border: 1px solid white;
}

.left-edit {
  margin-right: 10%;
}

.button-group {
  position: absolute;
  bottom: 5%;
  right: 5%;
  display: flex;
  gap: 10px;
}

.action-button {
  width: 100px;
}

.view-layout {
  color: white;
  margin-left: 10%;
  width: 90%;
  height: 80%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.left-view, .right-view {
  height: 100%;
  width: 40%;
  margin-right: 10%;
}

.right-view {
  border: 1px solid white;
}

.top-view, .bottom-view {
  margin-top: 5%;
  height: 45%;
  width: 100%;
  border: 1px solid white;
}
</style>
