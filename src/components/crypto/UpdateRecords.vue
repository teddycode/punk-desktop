<template>
  <div class="UpdateRecordList">
    <div
      class="UpdateRecordListHeader"
      @click="showRecordList = !showRecordList"
    >
      <a
        ><el-icon
          :class="[showRecordList ? 'spanRotate' : 'spanReset']"
          :size="20"
        >
          <ArrowRightBold
        /></el-icon>
        更新历史
      </a>
    </div>
    <!--这里的name 和 css 类名第一个字段要一样-->
    <TransitionGroup name="fade">
      <div
        class="Record"
        v-show="showRecordList"
        v-for="record in updateRecordList"
        :key="record.id"
      >
        <div class="UpdateTime">
          <div class="Dot">●</div>
          <div class="TimeStamp">{{ record.time }}</div>
        </div>
        <div class="Information">
          <div class="Title">{{ record.title }}</div>
          <div class="Content">{{ record.content }}</div>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script>
export default {
  name: "updateRecords",
  components: {},
  // 接收父组件提供的数据
  inject: ["updateRecordList"],
  data() {
    return {
      showRecordList: false,
    };
  },
  methods: {},
};
</script>

<style scoped>
* {
  color: #ffffff;
  font-family: Arial, "Microsoft Yahei", "STHeiti", sans-serif;
}

.UpdateRecordListHeader {
  font-size: 28px;
  text-align: left;
  margin-top: 10px;
  margin-bottom: 20px;
}

.spanRotate {
  transform: rotate(90deg);
  -webkit-transform: rotate(90deg);
  transition: transform 0.5s;
}

.spanReset {
  transform: rotate(0deg);
  -webkit-transform: rotate(0deg);
  transition: transform 0.5s;
}

.Record {
  margin-left: 20px;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  /* height: 0; */
  opacity: 0;
}

.UpdateTime {
  font-size: 20px;
  text-align: left;
}

.Dot {
  margin-right: 4px;
  display: inline-block;
}

.TimeStamp {
  display: inline-block;
  margin-left: 10px;
}

.Information {
  text-align: left;
  margin-left: 6px;
  padding-top: 10px;
  padding-left: 20px;
  padding-right: 20px;
  border-left: 1px dashed #ffffff;
}

.Title {
  font-size: 24px;
  margin-bottom: 10px;
}

.Content {
  padding-bottom: 20px;
}
</style>
