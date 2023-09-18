<template>
    <div class="process-guide-container">
        <h1 class="process-guide-title">治理流程引导</h1>
        <div class="process-guide-content">
            <div class="process-guide-content-title">业务导览</div>
            <div class="process-guide-row">提案发布</div>
            <div class="process-guide-row">提案评议</div>
            <div class="process-guide-row">升级响应</div>
            <div class="process-guide-row">升级治理</div>
        </div>
        <div class="process-guide-content">
            <div class="process-guide-content-title">角色导览</div>
            <div class="process-guide-row">提案参与者</div>
            <div class="process-guide-row">技术委员会</div>
            <div class="process-guide-row">国库专家</div> 
        </div>
    </div>
</template>

<script>
export default {
    name: "processGuide"
}
</script>

<style scoped>
.process-guide-container {
    color: white;
}

.process-guide-content-title {
    font-size: 1.3rem;
    text-align: left;
    margin-left: 7%;
}

.process-guide-title {
    font-size: 1.5rem;
    margin-top: 7%;
    margin-bottom: 5%; /* 标题与内容部分的间距 */
}

.process-guide-content {
    padding-left: 1rem; /* 为内容部分增加左填充，以强调“靠左”效果 */
    margin-bottom: 3%;
    margin-top: 4%;
}

.process-guide-row {
    font-size: 1rem; /* 使用rem单位 */
    margin-top: 4%; /* 使用百分比定义行距 */
    margin-left: 14%;
    text-align: left;
}
</style>
