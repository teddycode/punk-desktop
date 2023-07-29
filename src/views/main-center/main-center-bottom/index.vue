<template>
    <div class="main-container">
        <div class="recent-container">
            <h2 class="title">最近关注</h2>
            <div class="chart-container">
                <div id="chart" class="chart"></div>
                <Dropdown
                    v-model="selectedCoin"
                    :options="coins"
                    optionLabel="coin"
                    @change="fetchData(selectedCoin.coin)"
                    class="coin-select">
                </Dropdown>
            </div>
        </div>
        <div class="apps-container">
            <h2 class="title">应用广场</h2>
            <div class="apps-grid">
                <div v-for="app in apps" :key="app.name" class="app-card">
                    <img :src="app.icon" alt="" class="app-icon">
                    <p class="app-name">{{ app.name }}</p>
                </div>
                <add-node-button class="dapp-button">探索更多</add-node-button>
            </div>
        </div>
    </div>
</template>

<script>
import * as echarts from 'echarts';
import axios from 'axios';
import Dropdown from 'primevue/dropdown';
import AddNodeButton from "@/components/buttons/addnodeButton.vue";
export default {
    name: "MainCenterButton",
    components: {
        AddNodeButton,
        Dropdown,
    },
    data() {
        return {
            coins: [
                {coin: 'ethereum'},
                {coin: 'bitcoin'},
                {coin: 'binancecoin'},
                {coin: 'cardano'},
                {coin: 'dogecoin'},
                {coin: 'ripple'},
                {coin: 'usd-coin'},
                {coin: 'dai'}
            ],
            selectedCoin: {coin: 'ethereum'},
            prices: [],
            times: [],
            minPrice: 0,
            maxPrice: 0,
            apps: [
                {name: 'Uniswap', icon: require("@/assets/uniswap.png")},
                {name: 'MakerDAO', icon: require("@/assets/maker.webp")},
                {name: 'Compound', icon: require("@/assets/compound.png")},
                {name: 'CryptoKitties', icon: require("@/assets/CryptoKitties.webp")},
            ],
        };
    },
    methods: {
        fetchData(coin) {
            axios.get(`https://api.coingecko.com/api/v3/coins/${coin}/market_chart`, {
                params: {
                    vs_currency: 'usd',
                    days: 1,
                }
            }).then(response => {
                this.prices = response.data.prices.map(p => p[1]);
                this.times = response.data.prices.map(p => {
                    const date = new Date(p[0]);
                    return `${date.getHours()}:${date.getMinutes()}`;
                });
                this.calculateYAxisRange();
                this.drawChart();
            });
        },
        calculateYAxisRange() {
            let min = Math.min(...this.prices);
            let max = Math.max(...this.prices);
            let diff = max - min;

            if (diff > 1) {
                this.minPrice = Math.floor(min * 0.98);
                this.maxPrice = Math.ceil(max * 1.02);
            } else {
                this.minPrice = min - (diff * 0.02);
                this.maxPrice = max + (diff * 0.02);
            }
        },
        drawChart() {
            let chart = echarts.init(document.getElementById('chart'));
            let option = {
                title: {
                    text: `${this.selectedCoin.coin} 价格变化（最近24小时）`,
                    left: 'center',
                    textStyle: { // 修改标题颜色
                        color: '#FFFFFF'
                    }
                },
                tooltip: {
                    trigger: 'axis',
                    formatter: (params) => {
                        const data = params[0];
                        return `${this.times[data.dataIndex]}<br/>${this.selectedCoin.coin}: ${data.value}`
                    }
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    show: false,
                },
                yAxis: {
                    type: 'value',
                    min: this.minPrice,
                    max: this.maxPrice,
                },
                series: [{
                    data: this.prices,
                    type: 'line',
                    smooth: true,
                    itemStyle: {
                        color: '#0088CC'
                    },
                }],
            };
            chart.setOption(option);
        }
    },
    created() {
        this.fetchData(this.selectedCoin.coin);
    }
};
</script>

<style scoped>
.main-container {
    height: 100%;
    display: flex;
    flex-direction: column;
}

.recent-container {
    flex: 0.7;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 1rem;
}

.apps-container {
    flex: 0.3;
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
    padding: 1rem;
}

.title {
    font-size: 1.5rem;
    color: #5ab1ef;
}

.chart-container {
    position: relative;
    width: 100%;
    height: 100%;
    padding-right:10%
}

.chart {
    width: 100%;
    height: 100%;
}

.coin-select {
    position: absolute;
    top: 0;
    right: 0;

}
.apps-container {
    flex: 0.3;
    display: flex;
    flex-direction: column;
    padding: 1rem;
}

.apps-grid {
    display: flex;
    justify-content: space-around;
    flex-wrap: wrap;
}

.app-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 1rem;
}

.app-icon {
    width: 50px;
    height: 50px;
}

.app-name {
    margin-top: 0.5rem;
    text-align: center;
    color:white;
}
.dapp-button{
    margin-top: 15px;
    margin-left: 20px;
}

</style>
