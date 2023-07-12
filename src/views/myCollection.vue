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
                    <th>最低价</th>
                    <th>最低价涨跌</th>
                    <th>最高价</th>
                    <th>最高价涨跌</th>
                    <th>件数</th>
                    <th>拥有者人数</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="collectionData in collections" :key="collectionData.name" @click="goToDetails(collectionData.name)">
                <td>{{ collectionData.name }}</td>
                    <td>{{ collectionData.lowestPrice }}</td>
                    <td :class="getPriceChangeClass(collectionData.lowestPriceChange)">{{ collectionData.lowestPriceChange }}</td>
                    <td>{{ collectionData.highestPrice }}</td>
                    <td :class="getPriceChangeClass(collectionData.highestPriceChange)">{{ collectionData.highestPriceChange }}</td>
                    <td>{{ collectionData.quantity }}</td>
                    <td>{{ collectionData.owners }}</td>
                </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script>
import {Web3} from "web3";

export default {
    data() {
        return {
            collections: [
                { name: '猫猫', lowestPrice: '$1500', lowestPriceChange: '+2%', highestPrice: '$2000', highestPriceChange: '-1%', quantity: '5', owners: '3' },
                { name: '狗子', lowestPrice: '$2500', lowestPriceChange: '-1%', highestPrice: '$3000', highestPriceChange: '+2%', quantity: '10', owners: '5' },
                { name: 'LOL', lowestPrice: '$3500', lowestPriceChange: '+3%', highestPrice: '$4000', highestPriceChange: '-2%', quantity: '15', owners: '7' },
                { name: '空洞骑士', lowestPrice: '$4500', lowestPriceChange: '-2%', highestPrice: '$5000', highestPriceChange: '+1%', quantity: '20', owners: '10' },
            ],
            web3:null,
            contract:null,
            contractAddress: 0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB,
            contractAbi:[{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"punksOfferedForSale","outputs":[{"name":"isForSale","type":"bool"},{"name":"punkIndex","type":"uint256"},{"name":"seller","type":"address"},{"name":"minValue","type":"uint256"},{"name":"onlySellTo","type":"address"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"punkIndex","type":"uint256"}],"name":"enterBidForPunk","outputs":[],"payable":true,"type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"punkIndex","type":"uint256"},{"name":"minPrice","type":"uint256"}],"name":"acceptBidForPunk","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"addresses","type":"address[]"},{"name":"indices","type":"uint256[]"}],"name":"setInitialOwners","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"withdraw","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"imageHash","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"nextPunkIndexToAssign","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"punkIndexToAddress","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"standard","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"punkBids","outputs":[{"name":"hasBid","type":"bool"},{"name":"punkIndex","type":"uint256"},{"name":"bidder","type":"address"},{"name":"value","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"allInitialOwnersAssigned","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"allPunksAssigned","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"punkIndex","type":"uint256"}],"name":"buyPunk","outputs":[],"payable":true,"type":"function"},{"constant":false,"inputs":[{"name":"to","type":"address"},{"name":"punkIndex","type":"uint256"}],"name":"transferPunk","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"punkIndex","type":"uint256"}],"name":"withdrawBidForPunk","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"to","type":"address"},{"name":"punkIndex","type":"uint256"}],"name":"setInitialOwner","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"punkIndex","type":"uint256"},{"name":"minSalePriceInWei","type":"uint256"},{"name":"toAddress","type":"address"}],"name":"offerPunkForSaleToAddress","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"punksRemainingToAssign","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"punkIndex","type":"uint256"},{"name":"minSalePriceInWei","type":"uint256"}],"name":"offerPunkForSale","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"punkIndex","type":"uint256"}],"name":"getPunk","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"pendingWithdrawals","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"punkIndex","type":"uint256"}],"name":"punkNoLongerForSale","outputs":[],"payable":false,"type":"function"},{"inputs":[],"payable":true,"type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"punkIndex","type":"uint256"}],"name":"Assign","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"punkIndex","type":"uint256"}],"name":"PunkTransfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"punkIndex","type":"uint256"},{"indexed":false,"name":"minValue","type":"uint256"},{"indexed":true,"name":"toAddress","type":"address"}],"name":"PunkOffered","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"punkIndex","type":"uint256"},{"indexed":false,"name":"value","type":"uint256"},{"indexed":true,"name":"fromAddress","type":"address"}],"name":"PunkBidEntered","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"punkIndex","type":"uint256"},{"indexed":false,"name":"value","type":"uint256"},{"indexed":true,"name":"fromAddress","type":"address"}],"name":"PunkBidWithdrawn","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"punkIndex","type":"uint256"},{"indexed":false,"name":"value","type":"uint256"},{"indexed":true,"name":"fromAddress","type":"address"},{"indexed":true,"name":"toAddress","type":"address"}],"name":"PunkBought","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"punkIndex","type":"uint256"}],"name":"PunkNoLongerForSale","type":"event"}],
            tokenURI:'',
        };
    },
    beforeMount() {
        this.web3 = new Web3('https://goerli.infura.io/v3/b8feaebcfe234f0c83af0e97c070e5f5');
    },
    created:function() {
        if (typeof window.ethereum !== 'undefined') {
            this.web3 = new Web3(window.ethereum);
        }
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
        goToDetails(name) {
            this.$router.push({ name: 'CollectionDetails', params: { name } });
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
</style>
