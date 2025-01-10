<template>
    <div style="background-color: rgba(222, 134, 222, 0.19);padding: 30px;min-height: 100vh;">
    <p style="text-align: center;font-size: 30px">Treasury</p>
    <a-row gutter="16" style="max-width: 1000px; margin:10px auto;">
      <!-- Treasury 概览信息 -->
      <a-col :span="24">
        <a-card :bordered="false" style="margin-bottom: 24px; background-color: rgb(213 217 245 / 90%);">
          <a-row justify="space-between">
            <a-col v-for="(item, index) in summary" :key="index" :span="4" style="text-align: center;">
              <p style="font-size: 24px; font-weight: bold; margin-bottom: 8px;">{{ item.value }}</p>
              <p style="font-size: 16px; color: #757575;">{{ item.label }}</p>
            </a-col>
          </a-row>
        </a-card>
      </a-col>
  
      <!-- Treasury 事件表格 -->
      <a-col :span="24">
        <a-card title="Treasury Events" :bordered="false" style="background-color: rgb(160 179 224 / 25%);" :headStyle="{ fontSize: '20px' }">
          <a-table
            :columns="columns"
            :data-source="events"
            :bordered="false"
            row-key="id"
            style="text-align: center;"
            pagination="{ pageSize: 5 }"
            >
            <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'status'">
                    <a-tag :color="record.status === 'income' ? 'green' : 'red'" style="width: 70px;text-align: center;position: relative;margin-left: 7px;">{{ record.status }}</a-tag> 
                </template>
            </template>
          </a-table>
        </a-card>
      </a-col>
    </a-row>
    </div>
</template>
  
<script>
export default {
name: "Treasury",
data() {
    return {
    // 概览信息
    summary: [
        { label: "Total balance", value: 2000 },
        { label: "Last month income", value: 2000 },
        { label: "Last month spend", value: 2000 },
        { label: "Total income", value: 2000 },
        { label: "Total spend", value: 2000 },
    ],
    // 事件表格列定义
    columns: [
        {
            title: "Reason",
            dataIndex: "reason",
            key: "reason",
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
        },
        {
            title: "Address",
            dataIndex: "address",
            key: "address",
        },
        {
            title: "Balance",
            dataIndex: "balance",
            key: "balance",
        },
    ],
    // 事件数据
    events: [
        { id: 1, reason: "income", status: "income", address: "100", balance: "100" },
        { id: 2, reason: "100", status: "outcome", address: "100", balance: "100" },
        { id: 3, reason: "100", status: "income", address: "100", balance: "100" },
        { id: 4, reason: "100", status: "outcome", address: "100", balance: "100" },
        { id: 5, reason: "100", status: "income", address: "100", balance: "100" },
    ],
    };
},
};
</script>

<style scoped>
.ant-card {
border-radius: 8px;
}

:deep(.ant-table-cell){
    text-align: center !important;
}

:deep(.ant-table-wrapper table){
    border-spacing:0 0px;
}

:deep(thead.ant-table-thead > tr > th){
    /* background-color: rgba(84, 188, 189, 0.27); */
    background-color: rgb(134 158 214 / 38%);
    font-size: 17px;
}

:deep(tbody.ant-table-tbody > tr > td){
    /* background-color: rgba(84 188 189 / 25%); */
    background-color: rgb(160 179 224 / 35%);
}
</style>
  