<template>
    <MainBackground>
        <div class="container-ricardian">
            <!-- 单选框部分 -->
            <div class="radio-div">
                <div
                    class="custom-radio"
                    :class="{ selected: selected === 'edit' }"
                    @click="select('edit')"
                >
                    编辑
                </div>
                <div
                    class="custom-radio"
                    :class="{ selected: selected === 'view' }"
                    @click="select('view')"
                >
                    查看
                </div>
            </div>

            <!-- 第二个div -->
            <div class="content-div">
                <div class="box left">
                    <h2>智能合约代码</h2>
                    <div class="button-group">
                        <addnode-button class="action-button">生成</addnode-button>
                        <addnode-button class="action-button">部署</addnode-button>
                    </div>
                </div>
                <div class="box right">
                    <h2>李嘉图合约代码</h2>
                    <div class="button-group">
                    <addnode-button class="action-button">链接</addnode-button>
                    </div>
                </div>
            </div>
        </div>
    </MainBackground>
</template>

<script>
import MainBackground from "@/components/MainBackground.vue";
import addnodeButton from "@/components/buttons/addnodeButton.vue";

export default {
    name: "RicardianContract",
    components: {
        MainBackground,addnodeButton,
    },
    data() {
        return {
            selected: 'edit'
        };
    },
    methods: {
        select(choice) {
            this.selected = choice;
        }
    }
}
</script>

<style scoped>
.container-ricardian {
    width: 90%;
    height: 100%;
    margin-left: 5%;
}

.radio-div {
    color: white;
    height: 10%;
    width: 15%; /* 将宽度设置为15% */
    display: flex;
    align-items: center;
    gap: 0; /* 移除间距 */
}

.custom-radio {
    flex: 1;
    height: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 2px solid white;
    cursor: pointer;
    transition: all 0.3s;
    box-sizing: border-box; /* 确保边框宽度包含在元素的总宽度和高度中 */
}

.custom-radio.selected {
    color: rgb(58, 134, 255);
    border-color: rgb(58, 134, 255);
}

.content-div {
    color: white;
    width: 100%;
    height: 80%;
    display: flex;
    justify-content: center;
    align-items: center;
}

.box {
    position: relative; /* 添加此属性以确保子元素可以进行相对于此元素的绝对定位 */
    margin-top: 2%;
    height: 100%;
    width: 40%;
    display: flex;
    flex-direction: column; /* 使标题和按钮组垂直排列 */
    justify-content: space-between; /* 使标题和按钮组在垂直方向上分开 */
    align-items: center;
    border: 1px solid white;
}

.button-group {
    position: absolute; /* 使用绝对定位将按钮定位到.box的右下角 */
    bottom: 5%;
    right: 5%;
    display: flex;
    gap: 10px;
}
.action-button{
    width: 100px;
}
.left {
    margin-left: 5%;
    margin-right: 5%;
}

.right {
    margin-left: 5%;
    margin-right: 5%;
}
.button-group {
    position: absolute; /* 使用绝对定位将按钮定位到.box的右下角 */
    bottom: 5%;
    right: 5%;
    display: flex;
    gap: 10px;
}
</style>
