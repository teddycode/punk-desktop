<template>
  <div class="NavBar">
    <router-link class="NavBarFirstItem" :to="navItem.FirstLink">{{
      navItem.FirstItem
    }}</router-link>
    <div style="display: inline-block;" v-for="item in navItem.ItemList" :key="item.id">
      <span class="NavBarItem">/</span>
      <span class="NavBarItem">{{ item.name }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: "NavBar",
  components: {},
  // 接收父组件提供的数据
  inject: ["navItem"],
  data() {
    return {};
  },
};
</script>

<style>
.NavBar {
  font-size: 24px;
  margin-top: 20px;
  padding-bottom: 10px;
  text-align: left;
  border-bottom: 2px solid #ffffff;
}

.NavBarFirstItem {
  margin-right: 10px;
  width: fit-content;
  color: #3498da;
  text-decoration-line: none;
}

.NavBarItem {
  font-family: "Microsoft Yahei Light";
  font-size: 20px;
  margin-left: 5px;
  margin-right: 5px;
  width: fit-content;
}
</style>
