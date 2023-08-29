<template>
    <dv-border-box10 class="box">
        <div class="main-left-top-title">Together</div>
        <div class="content" v-if="loggedIn">
            <div class="together-content">
                <div class="room-controls">
                    <el-button type="primary" @click="openDialog" >查看房间</el-button>
                    <el-button type="primary" @click="openCreateRoom">新建房间</el-button>
                    <el-button type="primary" @click="openMyRoomDialog">我的房间</el-button>
                </div>
                <el-dialog title="房间列表" v-model="dialogVisible" width="600">
                    <el-table :data="rooms" @row-click="openInviteDialog">
                        <el-table-column property="owner" label="房主" width="150"></el-table-column>
                        <el-table-column property="theme" label="主题" width="150"></el-table-column>
                        <el-table-column property="roomNumber" label="房间号" width="150"></el-table-column>
                        <el-table-column property="roomCount" label="房间人数" width="150"></el-table-column>
                    </el-table>
                </el-dialog>
                <el-dialog title="输入邀请码" v-model="inviteDialogVisible" width="400" >
                    <el-input v-model="inviteCodeInput" placeholder="请输入邀请码"></el-input>
                    <template v-slot:footer>
                        <el-button @click="inviteDialogVisible = false">取消</el-button>
                        <el-button type="primary" @click="checkInviteCode">确认</el-button>
                    </template>
                </el-dialog>
                <el-dialog title="创建新房间" v-model="createRoomDialogVisible" width="400">
                <el-input v-model="roomThemeInput" placeholder="请输入房间主题"></el-input>
                <template v-slot:footer>
                    <el-button @click="createRoomDialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="createNewRoom">确认</el-button>
                </template>
                </el-dialog>
                <el-dialog title="我的房间" v-model="myRoomDialogVisible" width="600">
                    <el-table :data="myRooms" style="width: 100%">
                        <el-table-column property="owner" label="房主" width="150"></el-table-column>
                        <el-table-column property="theme" label="主题" width="150"></el-table-column>
                        <el-table-column property="roomNumber" label="房间号" width="150"></el-table-column>
                        <el-table-column property="roomCount" label="房间人数" width="150"></el-table-column>
                    </el-table>
                </el-dialog>
                <div class="friend-list-wrapper">
                    <h4 class="friend-list-title">好友列表</h4>
                    <div class="friend-list">
                        <div class="friend" v-for="friend in friends" :key="friend.name">
                            <img :src="friend.avatar" :alt="friend.name" class="friend-avatar">
                            <p class="friend-name">{{ friend.name }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="content" v-else>
            <div class="main-left-top-tip">
                <font-awesome-icon icon="exclamation-circle" class="icon"/>
                您还没有登录！
            </div>
        </div>
    </dv-border-box10>
</template>

<script>
// 引入需要的库和组件
import { library } from '@fortawesome/fontawesome-svg-core';
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { mapGetters } from 'vuex';
library.add(faExclamationCircle);

export default {
    name: "Together",
    components: {
        'font-awesome-icon': FontAwesomeIcon,
    },
    data() {
        return {
            loggedIn: this.checkUserLoggedIn(),  // 初始化时检查用户的登录状态
            user: {
                nickname: 'User Name',
            },
            rooms: [
                {
                    id: 1,
                    owner: 'Alice',
                    theme: 'Birthday Party',
                    roomNumber: '123',
                    roomCount: 5,
                    inviteCode: 'invite123'
                },
                {
                    id: 2,
                    owner: 'Bob',
                    theme: 'Game Night',
                    roomNumber: '456',
                    roomCount: 10,
                    inviteCode: 'invite456'
                },
                {
                    id: 3,
                    owner: 'Charlie',
                    theme: 'Study Group',
                    roomNumber: '789',
                    roomCount: 3,
                    inviteCode: 'invite789'
                },
                {
                    id: 4,
                    owner: 'Dave',
                    theme: 'Movie Night',
                    roomNumber: '012',
                    roomCount: 8,
                    inviteCode: 'invite012'
                },
                {
                    id: 5,
                    owner: 'Eve',
                    theme: 'Cooking Class',
                    roomNumber: '345',
                    roomCount: 7,
                    inviteCode: 'invite345'
                }
            ], // 假设这里已经有了房间的数据
            myRooms: [
                {
                    id: 1,
                    owner: '小小禾',
                    theme: 'Test code',
                    roomNumber: '666',
                    roomCount: 1,
                    inviteCode: '123456'
                }
            ],
            friends: [
                {
                    name: 'Alice',
                    avatar: require('@/assets/Alice.webp')
                },
                {
                    name: 'Bob',
                    avatar: require('@/assets/Bob.png')
                },
                // 更多好友...
            ],
            dialogVisible: false,
            inviteDialogVisible: false,
            selectedRoom: null,
            inviteCodeInput: '',
            roomThemeInput: '',
            createRoomDialogVisible: false,
            myRoomDialogVisible: false,
        }
    },
    watch: {
        '$store.state.token': function() {
            this.loggedIn = this.checkUserLoggedIn();
        },
    },
    methods: {
        //TODO 缺一个邀请朋友的识别逻辑
        openDialog() {
            this.dialogVisible = true;
            console.log('Dialog opened');
        },
        openInviteDialog(room) {
            this.selectedRoom = room;
            this.inviteDialogVisible = true;
        },
        checkUserLoggedIn() {
            const token = localStorage.getItem('token');
            return !!token;
        },
        inviteFriend() {
            // 用户邀请好友的逻辑
        },
        openCreateRoom(){
            this.createRoomDialogVisible = true;
        },
        checkInviteCode() {
            if (this.inviteCodeInput === this.selectedRoom.inviteCode) {
                this.myRooms.push(this.selectedRoom);
                this.inviteDialogVisible = false;
                this.dialogVisible = false;
                this.inviteCodeInput = '';
                // 进入房间的逻辑
            } else {
                alert('邀请码错误，请重新输入！');
                this.inviteCodeInput = '';
            }
        },
        createNewRoom() {
            // 在这里添加创建新房间的逻辑
            console.log(this.roomThemeInput);  // 可以查看输入的主题
            this.roomThemeInput = '';  // 清空输入框
            this.createRoomDialogVisible = false;  // 关闭对话框
        },
        openMyRoomDialog(){
            this.myRoomDialogVisible = true;
        },
    },
    mounted() {
        this.loggedIn = this.checkUserLoggedIn();
    },
    computed: {
        ...mapGetters(['loggedIn'])
    }
};
</script>

<style scoped>
.box {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
}

.main-left-top-title{
    color: #5ab1ef;
    font-size: x-large;
}

.content {
    overflow: hidden ;
    height: 80%;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.main-left-top-tip{
    height: 30%;
    font-size: x-large;
    margin-bottom: 20px;
    color: white;
    text-align: center;
}

.icon {
    color: deepskyblue;
}

.together-content{
    height: 80%;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
}

.room-controls {
    display: flex;
    justify-content: space-between;
    width: 100%;
}

.my-room {
    margin-top: 20px;
    width: 100%;
}
.friend-list {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    width: 100%;
}
.friend-list-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    margin-top: 20px;
}
.friend-list-title {
    color: #5ab1ef;
    font-size: large;
}

.friend-list {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    width: 100%;
}
.friend-avatar {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    margin-right: 10px;
}

.friend-name {
    font-size: medium;
}
</style>
