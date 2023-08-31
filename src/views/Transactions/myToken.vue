<template>
    <div class="token-page">
        <!-- <div class="title-section">
            <h1>代币</h1>
        </div> -->
        <!-- <div class="selection-section">
            <div class="token-selection">
                <select id="token-select" v-model="selectedToken" class="token-select">
                    <option class="token-select-option" value="">选择代币</option>
                    <option class="token-select-option" v-for="token in tokens" :key="token" :value="token">{{ token }}</option>
                </select>
            </div>
            <div class="time-selection">
                <select id="time-select" v-model="selectedTime" class="time-select">
                    <option class="time-select-option" value="">选择时间</option>
                    <option class="time-select-option" value="1小时">1小时</option>
                    <option class="time-select-option" value="1天">1天</option>
                    <option class="time-select-option" value="1周">1周</option>
                    <option class="time-select-option" value="1月">1月</option>
                    <option class="time-select-option" value="1年">1年</option>
                </select>
            </div>
            <div class="search-bar">
                <i class="fas fa-search search-icon"></i>
                <input type="text" class="search-input" placeholder="Search..." v-model.lazy="searchKeyword">
                <addnode-button class="search-button" @click="search_token">Search</addnode-button>
            </div>
        </div> -->
        <div class="table-section">
            <table class="table">
                <thead>
                <tr>
                    <th>#</th>
                    <th>代币名称</th>
                    <th>价格</th>
                    <th>变化</th>
                    <th>成交量</th>
                </tr>
                </thead>
                <tr v-for="(tokenData, index) in filteredTokenDataList" :key="tokenData.name">
                    <td>{{ index + 1 }}</td>
                    <td>{{ tokenData.name }}</td>
                    <td>{{ getTokenPrice(tokenData.name) }}</td>
                    <td :class="getTokenChangeClass(tokenData.change)">{{ tokenData.change }}</td>
                    <td>{{ tokenData.param1 }}</td>
                </tr>
            </table>
        </div>
    </div>
</template>

<script>
import addnodeButton from "@/components/buttons/addnodeButton.vue";
export default {
    name: "TokenPage",
    components: {
        addnodeButton,
    },
    data() {
        return {
            tokens: ['ETH', 'BTC', 'BNB', 'ADA', 'DOGE', 'XRP'],
            selectedToken: '',
            selectedTime: '',
            tokenDataList: [
                { name: 'ETH', change: '-2%', param1: '134M'},
                { name: 'BTC', change: '+5%', param1: '224M' },
                { name: 'BNB', change: '-3%', param1: '10M' },
                { name: 'ADA', change: '+1%', param1: '1M' },
                { name: 'DOGE', change: '+10%', param1: '2M' },
            ],
            searchKeyword: '',
            rates: {},
            ratesUpdateTime: null,
        };
    },
    //hello!
    created() {
        this.fetchRates();
    },
    computed: {
        filteredTokenDataList() {
            let filteredList = this.tokenDataList;

            if (this.selectedToken) {
                filteredList = filteredList.filter(tokenData => tokenData.name === this.selectedToken);
            }

            if (this.selectedTime) {
                // 根据 selectedTime 进行筛选
            }

            if (this.searchKeyword) {
                const keyword = this.searchKeyword.toLowerCase().trim();
                filteredList = filteredList.filter(tokenData => {
                    return (
                        tokenData.name.toLowerCase().includes(keyword) ||
                        tokenData.change.toLowerCase().includes(keyword) ||
                        tokenData.param1.toLowerCase().includes(keyword) ||
                        tokenData.param2.toLowerCase().includes(keyword) ||
                        tokenData.param3.toLowerCase().includes(keyword)
                    );
                });
            }

            return filteredList;
        },
    },
    methods: {
        async fetchRates() {
            try {
                let response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum,bitcoin,binancecoin,cardano,dogecoin,ripple,usd-coin&vs_currencies=usd');
                let data = await response.json();
                this.rates = {
                    'ETH': data.ethereum.usd,
                    'BTC': data.bitcoin.usd,
                    'BNB': data.binancecoin.usd,
                    'ADA': data.cardano.usd,
                    'DOGE': data.dogecoin.usd,
                    'XRP': data.ripple.usd,
                    'USDC': data['usd-coin'].usd,
                };
                this.ratesUpdateTime = new Date();
            } catch (error) {
                console.error('Failed to fetch rates:', error);
            }
        },
        getTokenPrice(token) {
            // eslint-disable-next-line no-prototype-builtins
            if (this.rates.hasOwnProperty(token)) {
                return '$' + this.rates[token].toFixed(2);
            }
            return '';
        },
        getTokenChangeClass(change) {
            if (change.startsWith('-')) {
                return 'negative-change';
            } else if (change.startsWith('+')) {
                return 'positive-change';
            } else {
                return '';
            }
        },
        search_token() {
            // 获取搜索关键字
            const keyword = this.searchKeyword.toLowerCase().trim();

            // 如果关键字为空，则显示所有代币数据
            if (keyword === '') {
                this.filteredTokenDataList = this.tokenDataList;
            } else {
                // 根据关键字筛选匹配的代币数据
                this.filteredTokenDataList = this.tokenDataList.filter(tokenData =>
                    tokenData.name.toLowerCase().includes(keyword)
                );
            }
        },
    },
};
</script>

<style scoped>
@import "@/assets/global_table.css";

.token-page {
    width: 90%;
    margin: 0 auto;
    color: white; /* 设置字体颜色为白色 */
}

.title-section h1 {
    text-align: center;
    margin-bottom: 60px;
}

.selection-section {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    margin-bottom: 20px;
    padding: 0 5%;
}

.selection-group label {
    margin-right: 5px;
}


.token-selection,
.time-selection {
    display: flex;
    align-items: center;
    margin-right: 20px;

}

.token-select, .time-select {
    padding: 6px;
    border: 1px solid white; /* 边框颜色为白色 */
    border-radius: 4px;
    font-size: 16px;
    background-color: transparent; /* 设置背景颜色为透明 */
    color: white; /* 设置字体颜色为白色 */
    height: 2.5em;
}
.token-select-option, .time-select-option{
    color: white;
    background-color: #2D3748;
}
.table-section {
    padding: 0 5%;
}

table tr td.negative-change {
    color: green;
}

table tr td.positive-change {
    color: red;
}

.search-bar {
    margin-top: 10px;
    width: 80%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    margin-bottom: 10px;
}

.search-icon {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: white;
}

.search-input {
    width: 85%;
    height: 2.5em;
    background: transparent;
    border: 1px solid white;
    border-radius: 15px;
    color: white;
    padding-left: 30px;
    padding-right: 20px;
}

.search-button {
    margin-left: 20px;
    width: 100px;
    height: 40px !important;
}
</style>