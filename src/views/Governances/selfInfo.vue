<template>
    <div class="info-container">
        <h1 class="info-title">个人信息</h1>
        <div class="info-content">
            <div class="info-row">代币余额：</div>
            <div class="info-row">投票权：</div>
            <div class="info-row">锁定数量：</div>
        </div>
    </div>
</template>

<script>
export default {
    name: "selfInfo"
}
</script>

<style scoped>
.info-container {
    color: white;
}

.info-title {
    font-size: 1.5rem;
    margin-top: 10%;
    margin-bottom: 5%; /* 标题与内容部分的间距 */
}

.info-content {
    padding-left: 1rem; /* 为内容部分增加左填充，以强调“靠左”效果 */
}

.info-row {
    font-size: 1rem; /* 使用rem单位 */
    margin-top: 5%; /* 使用百分比定义行距 */
    text-align: left;
}
</style>