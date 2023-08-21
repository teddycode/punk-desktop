<template>
    <div class="myOrder-page">
        <div class="myOrder-card" v-for="(order, index) in displayedOrders" :key="index">
            <div class="myOrder-title-container">
                <h1 class="myOrder-title">My Orders</h1>
                <font-awesome-icon class="info-icon" icon="info-circle" @click="showDetails(order)"/>
            </div>
            <div class="myOrder-limitOrder">
                <!-- 左边框 -->
                <div class="myOrder-panel">
                    <div class="myOrder-limitOrder-token-pair">
                        <h2 class="token-pair-title">代币对</h2>
                        <div class="data-box">{{ order.sell }}</div>
                        <div class="data-box">{{ order.buy }}</div>
                    </div>
                    <div class="fee-options">
                        <h3 class="fee-title">Fee Rates</h3>
                        <div class="data-box">{{ order.feeRates }}</div>
                    </div>
                    <div class="selected-tokens">{{ order.sell }} -> {{ order.buy }}</div>
                </div>
                <!-- 右边框 -->
                <div class="myOrder-panel">
                    <div class="myOrder-input-section">
                        <label for="amount" class="myOrder-limitOrder-token-label">Amount</label>
                        <div class="input-with-token">
                            <div class="data-box">{{ Number(order.amount) }}</div>
                        </div>
                    </div>
                    <div class="myOrder-input-section">
                        <label for="price" class="myOrder-limitOrder-token-label">Price</label>
                        <div class="input-with-token">
                            <div class="data-box">{{ Number(order.price) }} <span>{{ order.sell }}/{{ order.buy }}</span></div>
                        </div>
                    </div>
                    <!-- 你的数据中似乎没有Filled字段，如果需要可以自行添加 -->
                    <div class="myOrder-input-section">
                    <label for="filled" class="myOrder-limitOrder-token-label">Filled</label>
                    <div class="input-with-token">
                        <div :class="getStatusClass(order.status)" class="data-box">{{ order.status }} </div>
                    </div>
                </div>

                </div>
            </div>
            <div class="button-group">
                <addnode-button class="addnode-button"
                                :disabled="order.status !== '成交'"
                                @click="withdraw(Number(order.epoch),order.id)">
                    withdraw
                </addnode-button>
                <addnode-button class="addnode-button"
                                :disabled="order.status !== '待成交'"
                                @click="kill(order.sell,order.buy,Number(order.price),order.id)">
                    cancel
                </addnode-button>
            </div>
        </div>

    </div>
    <myPagination :total="totalItems" :pagesize="itemsPerPage" :currentPage="1"  @change-page="updatePage"></myPagination>
</template>


<script>
import addnodeButton from "@/components/buttons/addnodeButton.vue";
import {killLimitOrderFrontend} from "@/views/Transactions/function/kill"
import {limitOrderPoolKey, token0, token1} from "@/views/Transactions/function/address";
import {ethers} from "ethers";
import {withdraw_main} from "@/views/Transactions/function/withdraw";
import axios from "axios";
import myPagination from "@/components/myPagination.vue";
import { library } from '@fortawesome/fontawesome-svg-core'
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons'

library.add(faInfoCircle)
export default {
    name: "myOrder",
    components:{
        myPagination,
        addnodeButton
    },
    data() {
        return {
            orders: [],
            currentPage: 0,
            itemsPerPage: 1,
            totalItems:0,
            page: 1,
            displayedOrders: [],
            price:'',
            selectedToken1:'',
            selectedToken2:'',
            myAddress:''
        }
    },
    async mounted() {
        await this.getAddress();
        await this.fetchOrders();
    },
    methods:{
        showDetails(order) {
            let message = `提交时间: ${order.submitTime}\n`;
            if (order.status === '提取成功') {
                message += `成交时间: ${order.dealTime}\n`;
            } else if (order.status === '已取消') {
                message += `取消时间: ${order.cancelTime}\n`;
            }
            alert(message);
        },
        async getAddress() {
            if (typeof window.ethereum !== 'undefined') {
                // 使用MetaMask提供的provider
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                try {
                    // 请求账户访问
                    await window.ethereum.request({ method: 'eth_requestAccounts' });
                    const signer = provider.getSigner();
                    this.myAddress = await signer.getAddress(); // 设置第一个账户为默认账户
                    console.log("address: ", this.myAddress);
                } catch (error) {
                    console.error("Error accessing accounts: ", error);
                }
            } else {
                console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
            }
        },
        getStatusClass(status) {
            switch (status) {
                case '待成交':
                    return 'status-pending';
                case '成交':
                    return 'status-done';
                case '提取成功':
                    return 'status-withdrawn';
                case '已取消':
                    return 'status-cancelled';
                default:
                    return '';
            }
        },
        updatePage(newPage) {
            this.page = newPage;
            let start = (this.page - 1) * this.itemsPerPage;
            let end = start + this.itemsPerPage;
            this.displayedOrders = this.orders.slice(start, end);
            console.log("displayorders" , this.displayedOrders)
        },
        async fetchOrders() {
            try {
                const response = await axios.post("http://localhost:8080/Transactions/myOrder", { action: "getOrders", userAddress: this.myAddress });
                this.orders = response.data;
                this.totalItems = this.orders.length;
                // Initialize displayedOrders for the first page
                this.updatePage(1);
            } catch (error) {
                console.error("Error fetching orders:", error);
            }
        },
        changePage(page) {
            this.currentPage = page - 1;
        },
        async withdraw(epoch, id) {
            try {
                await withdraw_main(epoch);
                // 发送请求到后端，更新订单状态为 "提取成功"

                const currentDate = new Date();
                const formattedDate = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()} ${currentDate.getHours()}:${currentDate.getMinutes()}:${currentDate.getSeconds()}`;

                console.log("withdrawtime: " , formattedDate)
                const response = await axios.post("http://localhost:8080/Transactions/myOrder", {
                    action: "withdraw",
                    id: id,
                    currentTime: formattedDate
                });
                if (response.data.message === "Order status updated to 提取成功") {
                    alert("操作成功");
                    await this.fetchOrders();
                } else {
                    alert("更新订单状态失败");
                }
            } catch (err) {
                console.log(err);
                alert("操作失败");
            }
        },
        async kill(sell,buy,price,id){
            console.log("sell: " + sell)
            console.log("buy: " + buy)
            console.log("price: " + price)
            try {
                if(sell === 'token0' && buy === 'token1'){
                    await killLimitOrderFrontend(token0.address,token1.address,price,limitOrderPoolKey,this.myAddress)
                    alert("取消成功")
                }else if (sell === 'token1' && buy === 'token0'){
                    await killLimitOrderFrontend(token1.address,token0.address,price,limitOrderPoolKey,this.myAddress)
                    alert("取消成功")
                }
                const currentDate = new Date();
                const formattedDate = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()} ${currentDate.getHours()}:${currentDate.getMinutes()}:${currentDate.getSeconds()}`;

                console.log("canceltime: " , formattedDate)
                const response = await axios.post("http://localhost:8080/Transactions/myOrder", {
                    action: "cancel",
                    id: id,
                    currentTime: formattedDate
                });
                if (response.data.message === "Order status updated to 已取消") {
                    alert("操作成功");
                    await this.fetchOrders();
                } else {
                    alert("更新订单状态失败");
                }
            }catch (err){
                console.log(err)
                alert("取消失败")
            }
        },
    }
}
</script>

<style scoped>
.myOrder-page {
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    margin-top: 1%;
}

.myOrder-card {
    width: 90%;
    padding: 20px;
    border-radius: 10px;
    border: 1px solid white;
    margin: 0 auto;
}

.myOrder-title {
    text-align: center;
    font-size: 2rem;
    font-weight: bold;
    color: white;
    margin-bottom: 1em;
}

.myOrder-limitOrder {
    display: flex;
    justify-content: space-between;
    gap: 30px;
    margin-bottom: 5%;
}

.myOrder-panel {
    flex: 1;
    background: transparent;
    padding: 20px;
    border-radius: 20px;
    border: 1px solid white;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.myOrder-input-section {
    margin-bottom: 20px;
}

.myOrder-limitOrder-token-label {
    font-size: 1.5rem;
    display: inline-block;
    margin-right: 10px;
    vertical-align: middle;
}

.input-with-token {
    position: relative;
    width: 100%;
}


.selected-tokens {
    text-align: center;
    margin-top: 10px;
    font-size: 1.2rem;
}


.token-pair-title {
    font-size: 1.5rem;
    text-align: center;
    color: white;
    margin-bottom: 10px;
}

.token-select {
    width: 46%;
    display: inline-block;
    margin: 0 2%;
    border-color: white;
    border-radius: 1px;
}

.fee-title {
    text-align: center;
    margin-bottom: 10px;
}


.fee-title{
    font-size: 1.5rem;
}

.addnode-button {
    flex: 1; /* 使得两个按钮平均分配空间 */
    padding: 10px 20px;
    cursor: pointer;
    margin: 10px; /* 为第一个按钮增加右边距 */
}
.data-box {
    border: 1px solid white;
    border-radius: 4px;
    padding: 8px 12px;
    margin: 5px 0;
    color: white;
    text-align: center;
}
.pagination {
    display: flex;
    justify-content: center;
    margin-top: 20px;
}

.pagination button {
    margin: 0 5px;
    padding: 5px 10px;
    cursor: pointer;
}
.addnode-button[disabled] {
    opacity: 0.5;
    pointer-events: none; /* 禁止所有鼠标事件，包括点击 */
    cursor: not-allowed;
}
.myOrder-card {
    position: relative;
}
.myOrder-title-container {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
}

.info-icon {
    position: absolute;
    right: 0;
    top: 0;
    cursor: pointer;
    color: white;
    font-size: 24px;
}
.status-pending {
    color: deepskyblue;
}

.status-done {
    color: white;
}

.status-withdrawn {
    color: green;
}

.status-cancelled {
    color: red;
}
</style>
