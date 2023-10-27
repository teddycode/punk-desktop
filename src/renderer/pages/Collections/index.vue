<template>
  <MainBackground>
    <div class="collections-page">
      <div class="title-section">
        <h1 style="color:#dddddd">数字藏品</h1>
      </div>
      <div class="table-section">
        <!--        <a-table :columns="columns" :data-source="dataSource"/>-->
        <table class="table">
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
          <tr v-for="data in collections" :key="data.name"
              @click="handleShowDetails(data.name)">
            <td>{{ data.name }}</td>
            <td>{{ data.lowestPrice }}</td>
            <td :class="getPriceChangeClass(data.lowestPriceChange)">{{
                data.lowestPriceChange
              }}
            </td>
            <td>{{ data.highestPrice }}</td>
            <td :class="getPriceChangeClass(data.highestPriceChange)">{{
                data.highestPriceChange
              }}
            </td>
            <td>{{ data.quantity }}</td>
            <td>{{ data.owners }}</td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  </MainBackground>
</template>

<script lang="ts">
import {Web3} from "web3";
import {defineComponent, onMounted, ref} from "vue";
import MainBackground from "@components/common/MainBackground.vue";
import {collectionList} from "@renderer/mock/collections/mock";
import {useRouter} from "vue-router";

export default defineComponent({
  components: {
    MainBackground,
  },
  setup() {
    const router = useRouter();
    const web3 = ref<Web3>(new Web3(null));
    // TODO what is this?
    const contractAddress = ref("0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB");
    const tokenURI = ref("");
    const collections = collectionList;

    // const columns = [
    //   {
    //     title: '藏品名称',
    //     dataIndex: 'name',
    //     key: 'name',
    //   },
    //   {
    //     title: '最低价格',
    //     dataIndex: 'lowestPrice',
    //     key: 'lowestPrice',
    //   },{
    //     title: '最低价涨跌',
    //     dataIndex: 'lowestPriceChange',
    //     key: 'lowestPriceChange',
    //   },{
    //     title: '最高价',
    //     dataIndex: 'highestPrice',
    //     key: 'highestPrice',
    //   },{
    //     title: '最高价涨跌',
    //     dataIndex: 'highestPriceChange',
    //     key: 'highestPriceChange',
    //   },{
    //     title: '件数',
    //     dataIndex: 'quantity',
    //     key: 'quantity',
    //   },{
    //     title: '拥有者人数',
    //     dataIndex: 'owners',
    //     key: 'owners',
    //   },
    // ];

    // let dataSource = computed(()=>collectionList);

    onMounted(() => {
      web3.value = new Web3("https://goerli.infura.io/v3/b8feaebcfe234f0c83af0e97c070e5f5");
    })

    if (typeof window.ethereum !== "undefined") {
      web3.value = new Web3(window.ethereum);
    }

    function getPriceChangeClass(priceChange: string) {
      if (priceChange.startsWith("-")) {
        return "negative-change";
      } else if (priceChange.startsWith("+")) {
        return "positive-change";
      } else {
        return "";
      }
    }

    function handleShowDetails(name: string) {
      router.push({name: "CollectionDetails", params: {name}});
    }

    return {
      web3,
      // columns,
      // dataSource,
      collections,
      contractAddress,
      tokenURI,
      getPriceChangeClass,
      handleShowDetails,
    };
  },
});
</script>

<style scoped>
@import "@renderer/assets/global_table.css";

.collections-page {
  /*min-height: 100%;*/
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

table tr td.negative-change {
  color: green;
}

table tr td.positive-change {
  color: red;
}

.collections-table tr:hover {
  background-color: #eaf4ff;
  box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.1);
  cursor: pointer;
}
</style>
