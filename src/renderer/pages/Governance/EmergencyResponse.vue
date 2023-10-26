<template>
  <MainBackground>
    <div class="emergency-response-wrapper">
      <div class="emergency-response">
        <div class="left-section">
          <h1>现任应急委员会列表</h1>
        </div>
        <div class="right-section">
          <div class="upper-div">
            <h2>应急软件发布位置</h2>
          </div>
          <div class="lower-div">
            <h2>软件验证</h2>
          </div>
        </div>
      </div>
    </div>
  </MainBackground>
</template>

<script>
import MainBackground from "@renderer/components/common/MainBackground.vue";

export default {
  name: "EmergencyResponse",
  components: {
    MainBackground,
  }
}
</script>

<style scoped>
.emergency-response-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 80%;
  height: 80%;
  margin: 5% auto; /* 使其在父元素中居中 */
}

.emergency-response {
  display: flex;
  justify-content: space-between;
  width: 100%;
  height: 100%;
}

.left-section {
  flex: 0.6;
  border: 1px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.right-section {
  flex: 0.3;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-left: 5%;
  padding-right: 5%;
}

.upper-div {
  height: 65%;
  border: 1px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lower-div {
  height: 15%;
  border: 1px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
}

h1, h2 {
  color: white;
}
</style>
