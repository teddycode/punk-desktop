<template>
  <div class="toolbox-container">
    <h1 class="toolbox-title">
      工具箱
      <font-awesome-icon class="icon" icon="wrench"/>
    </h1>
    <p class="description" @click="navToRC">李嘉图合约</p>
    <p class="description">测试环境入口</p>
    <p class="description" @click="navToER">紧急投票 </p>
  </div>
</template>

<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

export default {
  name: 'toolBox',
  components: {
    FontAwesomeIcon
  },
  methods: {
    navToRC () {
      this.$router.push({ name: 'RicardianContract' })
    },
    navToER () {
      this.$router.push({ name: 'EmergencyResponse' })
    }
  }
}

</script>

<style scoped>
.toolbox-container {
  text-align: center;
  margin-top: 7%;
}

.toolbox-title {
  font-size: 1.5rem;
  color: black;
  display: flex;
  justify-content: center; /* To center the title and the icon */
  align-items: center;
  gap: 0.5rem;
}

.icon {
  font-size: 1.2rem;
}

.description {
  margin-top: 5%;
  color: black;
  font-size: 1rem;
}
</style>
