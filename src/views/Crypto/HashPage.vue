<template>
  <MainBackground>
    <div class="PageContent">
      <!-- 导航栏 -->
      <NavBar></NavBar>
      <!-- 简要说明 -->
      <div class="UpdateRecordListHeader">哈希函数</div>
      哈希函数又称散列函数、散列算法，是一种从任何一种数据中创建小的数字 “指纹”
      的方法。
      的方法。

      <!-- 更新列表 -->
      <UpdateRecords> </UpdateRecords>
    </div>
  </MainBackground>
</template>

<script>
import MainBackground from "@/components/MainBackground.vue";
import NavBar from "@/components/crypto/NavBar.vue";
import UpdateRecords from "@/components/crypto/UpdateRecords.vue";
import { sha256 } from "js-sha256";
export default {
  components: { MainBackground, NavBar, UpdateRecords },
  // mounted() {
  //   // 读取文件
  //   this.axios.get("/test.md").then((res) => {
  //     this.markdownData = res;
  //   });
  // },
  // 提供数据给子组件
  provide() {
    return {
      updateRecordList: this.updateRecordList,
      // 导航窗格内容
      navItem: {
        FirstLink: "/Crypto",
        FirstItem: "密码学库",
        ItemList: [{ id: 1, name: "哈希函数" }],
      },
    };
  },
  methods: {
    calcHash() {
      this.output = sha256(this.input);
    },
    reset() {
      this.input = "";
      this.output = "";
    },
  },
  data() {
    return {
      markdownData:
        "# 标题 adsnoasdnasopdnasdfnasofasnfoasdnfsoafndoasdnfgoasdngoadl;sgnkvadfkgnaodjgnasdfjkongajfgn",
      showDoc: false,
      showExample: false,
      options: [
        {
          value: "SHA-256",
          label: "SHA-256",
        },
        {
          value: "SHA-512",
          label: "SHA-512",
        },
        {
          value: "RIPEMD-160",
          label: "RIPEMD-160",
        },
        {
          value: "SHA3-256",
          label: "SHA3-256",
        },
        {
          value: "SHA3-512",
          label: "SHA3-512",
        },
        {
          value: "Keccak-256",
          label: "Keccak-256",
        },
        {
          value: "Keccak-512",
          label: "Keccak-512",
        },
        {
          value: "Scrypt-256",
          label: "Scrypt-256",
        },
      ],
      hashType: "SHA-256",
      input: "",
      output: "",

      updateRecordList: [
        {
          id: 1,
          time: "2023-08-28 19:00:05",
          title: "更新记录标题1",
          content: "第 3 条更新记录内容",
        },
        {
          id: 2,
          time: "2023-08-21 19:00:05",
          title: "更新记录标题2",
          content: "第 2 条更新记录内容",
        },
        {
          id: 3,
          time: "2023-07-28 11:00:05",
          title: "更新记录标题3",
          content: "第 1 条更新记录内容",
        },
      ],
    };
  },
};
</script>

<style>
* {
  color: #ffffff;
  font-family: "Microsoft Yahei";
}

.PageContent {
  margin-left: 10%;
  margin-right: 10%;
}

.UpdateRecordListHeader {
  font-size: 28px;
  text-align: left;
  margin-top: 10px;
  margin-bottom: 20px;
  font-weight: bold;
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

.fade-enter-active,
.fade-leave-active {
  transition: all 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  height: 0;
  opacity: 0;
}

/* 表格 */
table th,
table td {
  padding: 4px 4px;
  text-align: center;
  font-size: 16px;
  border-bottom: 1px solid #fff;
  color: white;
}

/*  */
.selector {
  background-color: transparent;
  display: inline-block;
  width: 100%;
}

.ButtonGroup {
  padding-top: 20px;
}
/* //下拉框 */
.el-select-dropdown {
  border: none;
  background-color: rgba(1, 28, 82, 0.8);
}
/* //输入框 */
.el-input__inner {
  color: #eee;
  border-color: #00fff6;
  background-color: rgba(1, 28, 82, 0.8);
}
/* //聚焦时的样式 */
.el-select .el-input.is-focus .el-input__inner {
  border-color: #0b61aa;
  background-color: rgba(1, 28, 82, 0.8);
  color: #00d3e9;
}
/* //下拉框选中 */
.el-select-dropdown__item {
  color: #eee;
}
/* //鼠标经过下拉框 */
.el-select-dropdown__item.hover,
.el-select-dropdown__item:hover {
  color: #00d3e9;
  background-color: #0f3360;
}
</style>
