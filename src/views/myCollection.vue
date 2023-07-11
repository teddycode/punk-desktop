<template>
    <div class="collections-page">
        <div class="title-section">
            <h1>我的藏品</h1>
        </div>
        <div class="table-section">
            <table class="collections-table">
                <thead>
                <tr>
                    <th>藏品名称</th>
                    <th>价格</th>
                    <th>价格涨幅</th>
                    <th>参数1</th>
                    <th>参数2</th>
                    <th>参数3</th>
                    <th>详情</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="(collectionData, index) in collections" :key="collectionData.name">
                    <td>{{ collectionData.name }}</td>
                    <td>{{ collectionData.price }}</td>
                    <td :class="getPriceChangeClass(collectionData.priceChange)">{{ collectionData.priceChange }}</td>
                    <td>{{ collectionData.param1 }}</td>
                    <td>{{ collectionData.param2 }}</td>
                    <td>{{ collectionData.param3 }}</td>
                    <td>
                        <button @click="navigateToCollectionDetails(collectionData.name)">查看详情</button>
                    </td>
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
            collections: [
                { name: '藏品1', price: '$2000', priceChange: '+2%', param1: 'A', param2: 'B', param3: 'C' },
                { name: '藏品2', price: '$3000', priceChange: '-1%', param1: 'D', param2: 'E', param3: 'F' },
                { name: '藏品3', price: '$4000', priceChange: '+3%', param1: 'G', param2: 'H', param3: 'I' },
                { name: '藏品4', price: '$5000', priceChange: '-2%', param1: 'J', param2: 'K', param3: 'L' },
            ],
        };
    },

    methods:{
        getPriceChangeClass(priceChange) {
            if (priceChange.startsWith('-')) {
                return 'negative-change';
            } else if (priceChange.startsWith('+')) {
                return 'positive-change';
            } else {
                return '';
            }
        },

        navigateToCollectionDetails(collectionName) {
            this.$router.push({ name: 'CollectionDetails', params: { collectionName: collectionName } });
        }
    },
};
</script>

<style scoped>
.collections-page {
    min-height: 100vh;
    width: 90%;
    margin: 0 auto;
}

.title-section h1 {
    text-align: center;
    margin-bottom: 60px;
}

.table-section {
    padding: 0 5%;
}

.collections-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0 15px;
}

.collections-table th,
.collections-table td {
    padding: 8px;
    text-align: center;
}

.collections-table tr:first-child th {
    border: none;
    background-color: #4caf50;
    color: white;
}

.collections-table tr {
    background-color: #f2f2f2;
    border: 1px solid #ddd;
    border-radius: 5px;
}

.collections-table tr td {
    border: none;
    text-align: center;
}

.collections-table tr td.negative-change {
    color: green;
}

.collections-table tr td.positive-change {
    color: red;
}

.collections-table tr:hover {
    background-color: #eaf4ff;
    box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.1);
    cursor: pointer;
}

.collections-table tr button {
    padding: 8px 16px;
    background-color: #3aafa9;
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.collections-table tr button:hover {
    background-color: #1f7d79;
}
</style>
