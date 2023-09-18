<template>
    <div class="entrust-container">
        <h1 class="entrust-title">委托</h1>
        <p class="entrust-person">委托人</p>
        <addnode-button>委托</addnode-button>
    </div>
</template>

<script>
import addnodeButton from "@/components/buttons/addnodeButton.vue"; // 请确保路径是正确的

export default {
    name: "myEntrust",
    components: {
        addnodeButton
    }
}
</script>

<style scoped>
.entrust-container {
    text-align: center;
}

.entrust-title {
    color: white;
    font-size: 1.5rem;
    margin-top: 5%;
    margin-bottom: 5%;
}

.entrust-person {
    color: white;
    font-size: 1.2rem;
    margin-bottom: 2%;
}
</style>
