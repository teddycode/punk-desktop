<template>
    <div class="message-box">
        <dv-border-box10>
            <div class="title">最新消息</div>
            <div class="message-content">
                <ul :style="{ 'margin-top': marginTop + 'px' }">
                    <li v-for="(item, index) in displayedData" :key="index" @click="handleClick(item)">
                        <a>
                            <font-awesome-icon icon="volume-up" size="lg" class="icon"></font-awesome-icon>
                            {{ item.date }} &nbsp;&nbsp;{{ item.message }}
                        </a>
                    </li>
                </ul>
            </div>
            <div class="ad-button">
                <addnode-button>发布</addnode-button>
                <addnode-button>筛选</addnode-button>
            </div>
        </dv-border-box10>
    </div>
</template>


<script>
import { library } from '@fortawesome/fontawesome-svg-core';
import { faVolumeUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import addnodeButton from "@/components/buttons/addnodeButton.vue";
library.add(faVolumeUp);


export default {
    components: {
        addnodeButton,
        'font-awesome-icon': FontAwesomeIcon,
    },
    data() {
        return {
            data: [
                { date: '2023-07-01', message: 'Message 1' },
                { date: '2023-07-02', message: 'Message 2' },
                { date: '2023-07-03', message: 'Message 3' },
                { date: '2023-07-04', message: 'Message 4' },
                { date: '2023-07-05', message: 'Message 5' },
                { date: '2023-07-06', message: 'Message 6' },
                { date: '2023-07-07', message: 'Message 7' },
                { date: '2023-07-08', message: 'Message 8' },
                { date: '2023-07-09', message: 'Message 9' },
                // add more items here
            ],
            activeIndex: 0,
        };
    },
    computed: {
        marginTop() {
            return -this.activeIndex * 40; // adjust this according to your li item's height
        },
        displayedData() {
            return [...this.data, ...this.data];
        }
    },
    methods: {
        handleClick(item) {
            // Perform an action when a list item is clicked
            // For example, navigate to a new page or open a modal
            // This is just a placeholder. Replace with your actual code.
            console.log(item);
        },
    },
    mounted() {
        setInterval(() => {
            if (this.data.length > 0) {
                if (this.activeIndex < this.displayedData.length - 1) {
                    this.activeIndex %= 9;
                    // console.log(this.activeIndex)
                    this.activeIndex += 1;
                } else {
                    this.activeIndex = 0;
                }
            } else {
                this.activeIndex = 0;
            }
        }, 2000);
    }
};
</script>

<style scoped>
.message-box {
    position: relative;
    width: 100%;
    height: 84%;
    padding: 15px;
    overflow: hidden;
}

.title {
    padding-top: 20px;
    color: #5ab1ef;
}

.message-content {
    width: 100%;
    height: 55%;
    overflow: hidden;
    padding-top: 4px;
    padding-right: 20px;
    color: white;
}

ul {
    width: 100%;
    height: 100%;
    position: relative;
    transition: margin-top 0.5s;
}

li {
    width: 100%;
    height: 40px;
    padding: 5px 0;
    overflow: hidden;
    display: flex;
    align-items: center;
}

a {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #333;
    text-decoration: none;
    background: rgba(216, 191, 216, 0.1);
    border-radius: 5px;
    padding-left: 10px;
}

.icon {
    margin-right: 10px;
    color: #eb8a00;
}

.ad-button{
    margin-left: 30px;
    margin-top: 10%;
}

.ad-button-top{
    margin-top: 20px;
}
.ad-button-bottom {
    margin-bottom: 20px;
    /* additional styles for the bottom button */
}
</style>
