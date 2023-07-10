<template>
    <div class="token-page">
        <div class="title-section">
            <h1>代币</h1>
        </div>
        <div class="selection-section">
            <div class="token-selection">
                <select id="token-select" v-model="selectedToken" class="token-select">
                    <option value="">选择代币</option>
                    <option v-for="token in tokens" :key="token" :value="token">{{ token }}</option>
                </select>
            </div>
            <div class="time-selection">
                <select id="time-select" v-model="selectedTime" class="time-select">
                    <option value="">选择时间</option>
                    <option value="1小时">1小时</option>
                    <option value="1天">1天</option>
                    <option value="1周">1周</option>
                    <option value="1月">1月</option>
                    <option value="1年">1年</option>
                </select>
            </div>
            <div class="search-bar">
                <div class="search-input">
                    <input type="text" placeholder="搜索" v-model.lazy="searchKeyword">
                    <span class="search-icon"></span>
                </div>
                <button @click="search_token">搜索</button>
            </div>
        </div>
        <div class="table-section">
            <table class="tokens-table">
                <thead>
                <tr>
                    <th>#</th>
                    <th>代币名称</th>
                    <th>价格</th>
                    <th>变化</th>
                    <th>参数1</th>
                    <th>参数2</th>
                    <th>参数3</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="(tokenData, index) in filteredTokenDataList" :key="tokenData.name">
                    <td>{{ index + 1 }}</td>
                    <td>{{ tokenData.name }}</td>
                    <td>{{ tokenData.price }}</td>
                    <td :class="getTokenChangeClass(tokenData.change)">{{ tokenData.change }}</td>
                    <td>{{ tokenData.param1 }}</td>
                    <td>{{ tokenData.param2 }}</td>
                    <td>{{ tokenData.param3 }}</td>
                </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            tokens: ['ETH', 'BTC', 'BNB', 'ADA', 'DOGE', 'XRP'],
            selectedToken: '',
            selectedTime: '',
            tokenDataList: [
                { name: 'ETH', price: '$2000', change: '-2%', param1: 'A', param2: 'B', param3: 'C' },
                { name: 'BTC', price: '$60000', change: '+5%', param1: 'D', param2: 'E', param3: 'F' },
                { name: 'BNB', price: '$300', change: '-3%', param1: 'G', param2: 'H', param3: 'I' },
                { name: 'ADA', price: '$1', change: '+1%', param1: 'J', param2: 'K', param3: 'L' },
                { name: 'DOGE', price: '$0.1', change: '+10%', param1: 'M', param2: 'N', param3: 'O' },
            ],
            searchKeyword: '',
        };
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
                        tokenData.price.toLowerCase().includes(keyword) ||
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

    methods:{
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
.token-page {
    width: 90%;
    margin: 0 auto;
}

.title-section h1 {
    text-align: center;
    margin-bottom: 60px;
}

.selection-section {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    margin-bottom: 15px;
    padding: 0 5%;
}

.selection-group label {
    margin-right: 5px;
}
.search-input {
    flex: 1;
}

.token-selection,
.time-selection {
    display: flex;
    align-items: center;
    margin-right: 20px;
}

.token-select {
    padding: 6px;
    border: 1px solid #34D399;
    border-radius: 4px;
    font-size: 16px;
    background-color: #F5F7FA;
}

.time-select {
    padding: 6px;
    border: 1px solid #34D399;
    border-radius: 4px;
    font-size: 16px;
    background-color: #F5F7FA;
}

.table-section {
    padding: 0 5%;
}

.tokens-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0 15px;
}

.tokens-table th,
.tokens-table td {
    padding: 8px;
    text-align: center;
}

.tokens-table tr:first-child th {
    border: none;
    background-color: #4caf50;
    color: white;
}

.tokens-table tr {
    background-color: #f2f2f2;
    border: 1px solid #ddd;
    border-radius: 5px;
}

.tokens-table tr td {
    border: none;
    text-align: center;
}
.tokens-table tr td.negative-change {
    color: green;
}

.tokens-table tr td.positive-change {
    color: red;
}
.tokens-table tr:hover {
    background-color: #eaf4ff;
    box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.1);
    cursor: pointer;
}
.search-bar {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    margin-bottom: 0px;
}

.search-input {
    display: flex;
    align-items: center;
    margin-right: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
}

.search-input input {
    padding: 8px;
    width: 300px;
    border: none;
}

.search-icon {
    display: inline-block;
    width: 16px;
    height: 16px;
    background-image: url(@/assets/search.jpg);
    background-size: cover;
    margin: 0 8px;
}

.search-bar button {
    padding: 8px 16px;
    background-color: #3aafa9;
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.search-bar button:hover {
    background-color: #1f7d79;
}
</style>
