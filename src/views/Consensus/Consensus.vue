<template>
    <div class="container">
        <div style="padding: 10px 10px; margin-bottom: 20px">
            <span style="font-size: 30px">共识</span>
        </div>
        <div style="padding: 10px 10px; margin-bottom: 20px">
            <span style="font-size: 20px">基础数据</span>
        </div>
        <div style="border: 1px solid; border-radius: 10px; border-color: #cdcbcb; margin-bottom: 20px">
            <el-space wrap>
                <div style="padding: 10px 10px;">
                    <div style="padding: 10px 5px;">
                        <span>PoT区块数目</span>
                    </div>
                    <div style="padding: 10px 5px;">
                        <span style="font-size: 20px">96533</span>
                    </div>
                </div>
                <div style="padding: 10px 10px;">
                    <div style="padding: 10px 5px;">
                        <span>业务区块数目</span>
                    </div>
                    <div style="padding: 10px 5px;">
                        <span style="font-size: 20px">109342</span>
                    </div>
                </div>
                <div style="padding: 10px 10px;">
                    <div style="padding: 10px 5px;">
                        <span>共识算法</span>
                    </div>
                    <div style="padding: 10px 5px;">
                        <span style="font-size: 20px">PoT</span>
                    </div>
                </div>
                <div style="padding: 10px 10px;">
                    <div style="padding: 10px 5px;">
                        <span>全网算力</span>
                    </div>
                    <div style="padding: 10px 5px;">
                        <span style="font-size: 20px">39.8 EH/s</span>
                    </div>
                </div>
                <div style="padding: 10px 10px;">
                    <div style="padding: 10px 5px;">
                        <span>全网难度</span>
                    </div>
                    <div style="padding: 10px 5px;">
                        <span style="font-size: 20px">209</span>
                    </div>
                </div>
                <div style="padding: 10px 10px;">
                    <div style="padding: 10px 5px;">
                        <span>委员会共识</span>
                    </div>
                    <div style="padding: 10px 5px;">
                        <span style="font-size: 20px">Hotstuff</span>
                    </div>
                </div>
            </el-space>
        </div>
        <div style="width: 100%; border: 1px solid; border-color: #cdcbcb; padding: 10px 10px;">
            <el-space wrap>
                <div style="width: 1000px; border: 1px solid; border-color: #cdcbcb;">
                     <div style="padding: 10px 10px;">
                        <span style="margin-right: 15px; font-size: 20px; color: blue; padding: 10px 10px;">PoT区块</span>
                        <span style="margin-right: 15px; font-size: 15px">区块高度：</span>
                        <el-input v-model="tableData.searchBlockHeight" placeholder="区块高度" class="handle-input mr10"></el-input>
                        <span style="margin-right: 15px; font-size: 15px; margin-left: 30px">区块Hash：</span>
                        <el-input v-model="tableData.searchBlockHash" placeholder="区块Hash" class="handle-input mr10"></el-input>
                        <div style="float: right">
                            <el-button icon="el-icon-refresh" @click="handleSearchInputReset()" style="color: #696969">重置</el-button>
                            <el-button type="primary" icon="el-icon-search" @click="handleSearch()">搜索</el-button>
                        </div>
                    </div>
                    <div style="padding: 10px 10px;">
                        <el-table ref="multipleTableRef"
                            :data="tableData.displayBlockInfo"
                            style="width: 100%"
                            border
                            :row-key="getRowKey"
                            height="410"
                        >
                            <el-table-column label="区块高度" width="110">
                                <template #default="scope">
                                    {{ scope.row.height }}
                                </template>
                            </el-table-column>
                            <el-table-column label="出块人">
                                <template #default="scope" >
                                    <!-- {{ scope.row.number }} -->
                                    {{ scope.row.owner }}
                                </template>
                            </el-table-column>
                            <el-table-column label="业务块数目">
                                <template #default="scope" >
                                    {{ scope.row.microBlockNum }}
                                </template>
                            </el-table-column>
                            <el-table-column label="总交易数目">
                                <template #default="scope" >
                                    {{ scope.row.transactionNum }}
                                </template>
                            </el-table-column>
                            <el-table-column label="时间">
                                <template #default="scope" >
                                    {{ scope.row.time }}
                                </template>
                            </el-table-column>
                            <el-table-column label="区块大小 (Bytes)">
                                <template #default="scope" >
                                    {{ scope.row.size }}
                                </template>
                            </el-table-column>
                            <el-table-column label="操作" width="200" align="center">
                                <template #default="scope">
                                    <el-button type="text" icon="el-icon-tickets" class="green"
                                            @click="detailDialogVisible=true;handleDetail(scope.$index, scope.row)">详细</el-button>
                                </template>
                            </el-table-column>
                        </el-table>
                        <el-dialog
                            v-model="detailDialogVisible"
                            title="区块详细信息"
                            width="30%"
                        >
                            <el-form :model="tableData.nowBlock" label-width="90px">
                                <el-form-item label="区块高度">
                                    <el-input v-model="tableData.nowBlock.height" :readonly="true"></el-input>
                                </el-form-item>
                                <el-form-item label="区块哈希">
                                    <el-input v-model="tableData.nowBlock.hash" :readonly="true"></el-input>
                                </el-form-item>
                                <el-form-item label="出块人">
                                    <el-input v-model="tableData.nowBlock.owner" :readonly="true"></el-input>
                                </el-form-item>
                                <el-form-item label="微块数目">
                                    <el-input v-model="tableData.nowBlock.microBlockNum" :readonly="true"></el-input>
                                </el-form-item>
                                <el-form-item label="交易数目">
                                    <el-input v-model="tableData.nowBlock.transactionNum" :readonly="true"></el-input>
                                </el-form-item>
                                <el-form-item label="大小(Bytes)">
                                    <el-input v-model="tableData.nowBlock.size" :readonly="true"></el-input>
                                </el-form-item>
                                <el-form-item label="父区块哈希">
                                    <el-input v-model="tableData.nowBlock.parentHash" :readonly="true"></el-input>
                                </el-form-item>
                                <el-form-item label="叔区块哈希">
                                    <div style="border: 1px solid; border-radius: 4px; border-color: #cdcbcb;">
                                        <div v-for="u in tableData.nowBlock.uncleHash" :key="u" >
                                            <span style="padding: 10px 10px;">
                                                {{ u }}
                                            </span>
                                        </div>
                                    </div>
                                </el-form-item>
                                <el-form-item label="mixDigest">
                                    <el-input v-model="tableData.nowBlock.mixDigest" :readonly="true"></el-input>
                                </el-form-item>
                                <el-form-item label="nonce">
                                    <el-input v-model="tableData.nowBlock.nonce" :readonly="true"></el-input>
                                </el-form-item>
                                <el-form-item label="难度">
                                    <el-input v-model="tableData.nowBlock.difficulty" :readonly="true"></el-input>
                                </el-form-item>
                                <el-form-item label="时间">
                                    <el-input v-model="tableData.nowBlock.time" :readonly="true"></el-input>
                                </el-form-item>
                            </el-form>
                            <template #footer>
                                <span class="dialog-footer">
                                    <el-button type="primary" @click="detailDialogVisible = false">关闭</el-button>
                                </span>
                            </template>
                        </el-dialog>
                    </div>
                </div>
                <div style="width: 1000px; border: 1px solid; border-color: #cdcbcb;">
                     <div style="padding: 10px 10px;">
                        <span style="margin-right: 15px; font-size: 20px; color: blue; padding: 10px 10px;">业务区块</span>
                        <span style="margin-right: 15px; font-size: 15px">区块高度：</span>
                        <el-input v-model="tableData.searchMicBlockHeight" placeholder="区块高度" class="handle-input mr10"></el-input>
                        <span style="margin-right: 15px; font-size: 15px; margin-left: 30px">区块Hash：</span>
                        <el-input v-model="tableData.searchMicBlockHash" placeholder="区块Hash" class="handle-input mr10"></el-input>
                        <div style="float: right">
                            <el-button icon="el-icon-refresh" @click="handleSearchInputResetForMicBlock()" style="color: #696969">重置</el-button>
                            <el-button type="primary" icon="el-icon-search" @click="handleSearchForMicBlock()">搜索</el-button>
                        </div>
                    </div>
                    <div style="padding: 10px 10px;">
                        <el-table ref="multipleTableForMicBlockRef"
                            :data="tableData.displayMicBlockInfo"
                            style="width: 100%"
                            border
                            :row-key="getRowKey"
                            height="410"
                        >
                            <el-table-column label="区块高度" width="110">
                                <template #default="scope">
                                    {{ scope.row.height }}
                                </template>
                            </el-table-column>
                            <el-table-column label="leader">
                                <template #default="scope" >
                                    <!-- {{ scope.row.number }} -->
                                    {{ scope.row.leader }}
                                </template>
                            </el-table-column>
                            <el-table-column label="总交易数目">
                                <template #default="scope" >
                                    {{ scope.row.transactionNum }}
                                </template>
                            </el-table-column>
                            <el-table-column label="时间">
                                <template #default="scope" >
                                    {{ scope.row.time }}
                                </template>
                            </el-table-column>
                            <el-table-column label="区块大小 (Bytes)">
                                <template #default="scope" >
                                    {{ scope.row.size }}
                                </template>
                            </el-table-column>
                            <el-table-column label="操作" width="200" align="center">
                                <template #default="scope">
                                    <el-button type="text" icon="el-icon-tickets" class="green"
                                            @click="detailDialogVisibleForMicBlock=true;handleDetailForMicBlock(scope.$index, scope.row)">详细</el-button>
                                </template>
                            </el-table-column>
                        </el-table>
                        <el-dialog
                            v-model="detailDialogVisibleForMicBlock"
                            title="区块详细信息"
                            width="30%"
                        >
                            <el-form :model="tableData.nowMicBlock" label-width="90px">
                                <el-form-item label="区块高度">
                                    <el-input v-model="tableData.nowMicBlock.height" :readonly="true"></el-input>
                                </el-form-item>
                                <el-form-item label="区块哈希">
                                    <el-input v-model="tableData.nowMicBlock.hash" :readonly="true"></el-input>
                                </el-form-item>
                                <el-form-item label="leader">
                                    <el-input v-model="tableData.nowMicBlock.leader" :readonly="true"></el-input>
                                </el-form-item>
                                <el-form-item label="交易数目">
                                    <el-input v-model="tableData.nowMicBlock.transactionNum" :readonly="true"></el-input>
                                </el-form-item>
                                <el-form-item label="大小(Bytes)">
                                    <el-input v-model="tableData.nowMicBlock.size" :readonly="true"></el-input>
                                </el-form-item>
                                <el-form-item label="父区块哈希">
                                    <el-input v-model="tableData.nowMicBlock.parentHash" :readonly="true"></el-input>
                                </el-form-item>
                                <el-form-item label="委员会">
                                    <div style="border: 1px solid; border-radius: 4px; border-color: #cdcbcb;">
                                        <div v-for="u in tableData.nowMicBlock.committee" :key="u" >
                                            <span style="padding: 10px 10px;">
                                                {{ u }}
                                            </span>
                                        </div>
                                    </div>
                                </el-form-item>
                                <el-form-item label="时间">
                                    <el-input v-model="tableData.nowMicBlock.time" :readonly="true"></el-input>
                                </el-form-item>
                            </el-form>
                            <template #footer>
                                <span class="dialog-footer">
                                    <el-button type="primary" @click="detailDialogVisibleForMicBlock = false">关闭</el-button>
                                </span>
                            </template>
                        </el-dialog>
                    </div>
                </div>
            </el-space>
        </div>
        
        <div class="plugins-tips">数据更新时间：{{ nowDate }}</div>
    </div>
    
</template>

<script>
import { ref, reactive} from "vue";
import { ElLoading, ElMessage, ElMessageBox } from "element-plus";
import { getAllBlock, getBlockByHeight, getBlockByHash, getMicBlockByHeight, getMicBlockByHash} from "../api/consensus/block";

export default {
    name: "consensus",
    setup() {
        const multipleTableRef = ref();
        const multipleTableForMicBlockRef = ref();
        const tableData = reactive({
            blockInfo: [],
            displayBlockInfo: [],
            micBlockInfo: [],
            displayMicBlockInfo: [],
            nowBlock: undefined,
            nowMicBlock: undefined,
            searchBlockHeight: "",
            searchBlockHash: "",
            searchMicBlockHeight: "",
            searchMicBlockHash: "",
        });

        let detailDialogVisible = ref(false);
        let detailDialogVisibleForMicBlock = ref(false);
        let nowDate;

        const getRowKey = (row) => {
            return row.id;
        };

        // 过滤查询操作
        const handleSearch = () => {
            // displayBlockInfo 中的内容将会显示在界面的表格中
            // 清空 displayBlockInfo 数组
            tableData.displayBlockInfo.splice(0,tableData.displayBlockInfo.length);
            if (tableData.searchBlockHeight == "" && tableData.searchBlockHash == "") {
                tableData.displayBlockInfo = [].concat(tableData.blockInfo)
            } else if (tableData.searchBlockHeight == "" && tableData.searchBlockHash != "") {
                tableData.blockInfo.forEach((item)=>{
                    if (item.hash == tableData.searchBlockHash) {
                        tableData.displayBlockInfo.push(item);
                    }  
                })
            } else if (tableData.searchBlockHeight != "" && tableData.searchBlockHash == "") {
                tableData.blockInfo.forEach((item)=>{
                    if (item.height == tableData.searchBlockHeight) {
                        tableData.displayBlockInfo.push(item);
                    }  
                })
            } else {
                tableData.blockInfo.forEach((item)=>{
                    if (item.height == tableData.searchBlockHeight && item.hash == tableData.searchBlockHash) {
                        tableData.displayBlockInfo.push(item);
                    }  
                })
            }
        };

        // 过滤查询操作
        const handleSearchForMicBlock = () => {
            // displayBlockInfo 中的内容将会显示在界面的表格中
            // 清空 displayBlockInfo 数组
            tableData.displayMicBlockInfo.splice(0,tableData.displayMicBlockInfo.length);
            if (tableData.searchMicBlockHeight == "" && tableData.searchMicBlockHash == "") {
                tableData.displayMicBlockInfo = [].concat(tableData.micBlockInfo)
            } else if (tableData.searchMicBlockHeight == "" && tableData.searchMicBlockHash != "") {
                tableData.micBlockInfo.forEach((item)=>{
                    if (item.hash == tableData.searchMicBlockHash) {
                        tableData.displayMicBlockInfo.push(item);
                    }  
                })
            } else if (tableData.searchMicBlockHeight != "" && tableData.searchMicBlockHash == "") {
                tableData.micBlockInfo.forEach((item)=>{
                    if (item.height == tableData.searchMicBlockHeight) {
                        tableData.displayMicBlockInfo.push(item);
                    }  
                })
            } else {
                tableData.micBlockInfo.forEach((item)=>{
                    if (item.height == tableData.searchMicBlockHeight && item.hash == tableData.searchMicBlockHash) {
                        tableData.displayMicBlockInfo.push(item);
                    }  
                })
            }
        };

        const handleSearchInputReset = () => {
           tableData.searchBlockHeight = "";
           tableData.searchBlockHash = "";
        }

        const handleSearchInputResetForMicBlock = () => {
           tableData.searchMicBlockHeight = "";
           tableData.searchMicBlockHash = "";
        }

        const handleDetail = (index, row) => {
            console.log(row);
            // 深拷贝如下
            // 这里最好不直接使用 = ，因为修改失败时，我们不希望 tableData.nowMicBlock 的变化引起 row 的变化
            tableData.nowBlock = JSON.parse(JSON.stringify(row));
        }

        const handleDetailForMicBlock = (index, row) => {
            console.log(row);
            // 深拷贝如下
            // 这里最好不直接使用 = ，因为修改失败时，我们不希望 tableData.nowMicBlock 的变化引起 row 的变化
            tableData.nowMicBlock = JSON.parse(JSON.stringify(row));
        }

        const getAllBlockData = () => {
            getAllBlock().then((res) => {
                tableData.blockInfo=[].concat(res);
                tableData.displayBlockInfo=[].concat(res);
                let query = 0;
                if (tableData.blockInfo.length != 0) {
                    console.log(tableData.blockInfo[0].height);
                    query = tableData.blockInfo[0].height
                    getMicBlockByHeight(query).then((res) => {
                        tableData.micBlockInfo=[].concat(res);
                        tableData.displayMicBlockInfo=[].concat(res);
                    }).catch((error) => {
                        console.log(error);
                        ElMessage.error("获取消息数据失败");
                    });
                }
            }).catch((error) => {
                console.log(error);
                ElMessage.error("获取消息数据失败");
            });
            var newDate = new Date();
            nowDate = newDate.toLocaleString()
        };

        getAllBlockData();
        // getMicBlock();

        return {
            multipleTableRef,
            multipleTableForMicBlockRef,
            tableData,
            detailDialogVisible,
            detailDialogVisibleForMicBlock,
            nowDate,
            handleSearchInputReset,
            handleSearchInputResetForMicBlock,
            handleSearch,
            handleSearchForMicBlock,
            handleDetail,
            handleDetailForMicBlock,
            getRowKey,
        };
    },
};
</script>

<style>
.handle-box {
  margin-bottom: 20px;
}

.handle-input {
  width: 150px;
  display: inline-block;
}

.mr10 {
  margin-right: 10px;
}
</style>