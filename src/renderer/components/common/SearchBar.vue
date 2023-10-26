<template>
  <div class="search-bar">
    <i class="fas fa-search search-icon"></i>
    <input v-model="searchInput" class="search-input" placeholder="Search..." type="text">
    <shape-button class="search-button" @click="doSearch">Search</shape-button>
  </div>
</template>

<script lang="ts">
import ShapeButton from "@renderer/components/buttons/ShapeButton.vue";
import {ref} from "vue";

let {ipcRenderer} = window;

export default {
  name: "SearchBar",
  components: {
    ShapeButton,
  },

  setup() {
    let searchInput = ref('');
    const doSearch = async () => {
      const value = searchInput.value;
      console.log("pre search:", value);
      ipcRenderer.send("open-search-window", value);
    };

    const closeWindow = async () => {
      ipcRenderer.send("close-search-window");
    };

    return {
      searchInput,
      doSearch,
      closeWindow
    };
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
