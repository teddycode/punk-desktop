<template>
    <div class="toolbox-container">
        <h1 class="toolbox-title">
            工具箱
            <font-awesome-icon icon="wrench" class="icon"/>
        </h1>
        <p class="description" @click="navigateToRicardianContract">李嘉图合约</p>
        <p class="description">测试环境入口</p>
        <p class="description" @click="navigateToEmergencyResponse">紧急投票 </p>
    </div>
</template>

<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

export default {
    name: "toolBox",
    components: {
        FontAwesomeIcon
    },
    methods: {
        navigateToRicardianContract() {
            this.$router.push({ path: '/Governances/RicardianContract' });
        },
        navigateToEmergencyResponse() {
            this.$router.push({ path: '/Governances/EmergencyResponse' });
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
    color: white;
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
    color: white;
    font-size: 1rem;
}
</style>
