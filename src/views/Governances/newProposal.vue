<template>
    <div class="main">
        <router-link to="/myGovernance" class="back-button">
            <img src="@/assets/left-arrow.jpg" alt="Back">
            <span>返回</span>
        </router-link>
        <form @submit.prevent="submitProposal">
            <div class="input-group">
                <label for="title">标题</label>
                <input id="title" v-model="title" required>
            </div>
            <div class="input-group">
                <label for="description">描述（可选）</label>
                <textarea id="description" v-model="description"></textarea>
            </div>
            <button type="submit">提交</button>
        </form>
    </div>
</template>

<script>
export default {
    name: "newProposal",
    data() {
        return {
            title: '',
            description: ''
        }
    },
    methods: {
        submitProposal() {
            // 处理提交提案的逻辑
        }
    }
}
</script>

<style scoped>
.main {
    min-height: 100vh;
    padding: 40px;
    background: #fff;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
}

.back-button {
    display: flex;
    align-items: center;
    cursor: pointer;
    margin-bottom: 20px;
    text-decoration: none;
    color: inherit;
}

.back-button img {
    width: 20px;
    height: 20px;
}

.back-button span {
    margin-left: 5px;
}

.input-group {
    margin-bottom: 20px;
}

.input-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
}

.input-group input,
.input-group textarea {
    width: 100%;
    padding: 10px;
    box-sizing: border-box;
    border: 1px solid #ddd;
    border-radius: 5px;
}

.input-group textarea {
    min-height: 200px;
}

button {
    padding: 10px 20px;
    background-color: #00a86b;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.3s ease;
}

button:hover {
    background-color: #008552;
}
</style>
