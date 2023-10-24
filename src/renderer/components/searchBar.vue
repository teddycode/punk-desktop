<template>
  <div class="search-bar">
    <i class="fas fa-search search-icon"></i>
    <input ref="searchInput" type="text" class="search-input" placeholder="Search...">
    <addnode-button class="search-button" @click="search">Search</addnode-button>
  </div>
</template>

<script>
import addnodeButton from "@renderer/components/buttons/addnodeButton.vue";

export default {
  name: "searchBar",
  components: {
    addnodeButton,
  },
  methods: {
    search() {
      const query = this.$refs.searchInput.value;
      window.electronAPI.sendSearchQuery(query);
    },
    closeWindow() {
      window.electronAPI.closeSearchWindow();
    }
  }
}
</script>

<style scoped>
.search-bar {
  margin-top: 10px;
  width: 40%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  margin-bottom: 20px;
}

.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: white;
}

.search-input {
  width: 85%;
  height: 2.5em; /* Increase the height to 1.5em */
  background: transparent;
  border: 1px solid white; /* 更改这行代码 */
  border-radius: 15px; /* Add this line to make the search box round */
  color: white;
  padding-left: 30px; /* Provide enough space for the magnifying glass icon */
  padding-right: 20px;
}

.search-button {
  margin-left: 20px;
  width: 100px;
  height: 50%;
}
</style>
