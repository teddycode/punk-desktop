<template>
  <dv-border-box10 class="box">
    <div class="main-left-top-title">Together</div>
    <div v-if="loggedIn" class="content">
      <div class="together-content">
        <div class="room-controls">
          <el-button type="primary" @click="openDialog">查看房间</el-button>
          <el-button type="primary" @click="openCreateRoom">新建房间</el-button>
          <el-button type="primary" @click="openMyRoomDialog">我的房间</el-button>
        </div>
        <el-dialog v-model="dialogVisible" title="房间列表" width="600">
          <el-table :data="rooms" @row-click="openInviteDialog">
            <el-table-column label="房主" property="owner" width="150"></el-table-column>
            <el-table-column label="主题" property="theme" width="150"></el-table-column>
            <el-table-column label="房间号" property="roomNumber" width="150"></el-table-column>
            <el-table-column label="房间人数" property="roomCount" width="150"></el-table-column>
          </el-table>
        </el-dialog>
        <el-dialog v-model="inviteDialogVisible" title="输入邀请码" width="400">
          <el-input v-model="inviteCodeInput" placeholder="请输入邀请码"></el-input>
          <template v-slot:footer>
            <el-button @click="inviteDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="checkInviteCode">确认</el-button>
          </template>
        </el-dialog>
        <el-dialog v-model="createRoomDialogVisible" title="创建新房间" width="400">
          <el-input v-model="roomThemeInput" placeholder="请输入房间主题"></el-input>
          <template v-slot:footer>
            <el-button @click="createRoomDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="createNewRoom">确认</el-button>
          </template>
        </el-dialog>
        <el-dialog v-model="myRoomDialogVisible" title="我的房间" width="600">
          <el-table :data="myRooms" style="width: 100%">
            <el-table-column label="房主" property="owner" width="150"></el-table-column>
            <el-table-column label="主题" property="theme" width="150"></el-table-column>
            <el-table-column label="房间号" property="roomNumber" width="150"></el-table-column>
            <el-table-column label="房间人数" property="roomCount" width="150"></el-table-column>
          </el-table>
        </el-dialog>
        <div class="friend-list-wrapper">
          <h4 class="friend-list-title">好友列表</h4>
          <div class="friend-list">
            <div v-for="friend in friends" :key="friend.name" class="friend">
              <img :alt="friend.name" :src="friend.avatar" class="friend-avatar">
              <p class="friend-name">{{ friend.name }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="content">
      <div class="main-left-top-tip">
        <font-awesome-icon class="icon" icon="exclamation-circle"/>
        您还没有登录！
      </div>
    </div>
  </dv-border-box10>
</template>

<script lang="ts">
import {ref, watch, defineComponent} from 'vue';
import {library} from '@fortawesome/fontawesome-svg-core';
import {faExclamationCircle} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome';
import {useUserStore} from "@store/users";

library.add(faExclamationCircle);

export default defineComponent({
  name: "Together",
  components: {
    FontAwesomeIcon,
  },
  setup() {
    const store = useUserStore();
    const loggedIn = ref(checkUserLoggedIn());
    const user = ref({
      nickname: 'User Name',
    });
    const rooms = ref([
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
    ]);
    const myRooms = ref([
      {
        id: 1,
        owner: '小小禾',
        theme: 'Test code',
        roomNumber: '666',
        roomCount: 1,
        inviteCode: '123456'
      }
    ]);
    const friends = ref([
      {
        name: 'Alice',
        avatar: 'images/room/Alice.webp'
      },
      {
        name: 'Bob',
        avatar: 'images/room/Bob.png'
      },
      // 更多好友...
    ]);
    const dialogVisible = ref(false);
    const inviteDialogVisible = ref(false);
    const selectedRoom = ref(null);
    const inviteCodeInput = ref('');
    const roomThemeInput = ref('');
    const createRoomDialogVisible = ref(false);
    const myRoomDialogVisible = ref(false);

    watch(() => store.state.token, () => {
      loggedIn.value = checkUserLoggedIn();
    });

    function checkUserLoggedIn() {
      const token = localStorage.getItem('token');
      return !!token;
    }

    function openDialog() {
      dialogVisible.value = true;
      console.log('Dialog opened');
    }

    function openInviteDialog(room) {
      selectedRoom.value = room;
      inviteDialogVisible.value = true;
    }

    function inviteFriend() {
      // 用户邀请好友的逻辑
    }

    function openCreateRoom() {
      createRoomDialogVisible.value = true;
    }

    function checkInviteCode() {
      if (inviteCodeInput.value === selectedRoom.value.inviteCode) {
        myRooms.value.push(selectedRoom.value);
        inviteDialogVisible.value = false;
        dialogVisible.value = false;
        inviteCodeInput.value = '';
        // 进入房间的逻辑
      } else {
        alert('邀请码错误，请重新输入！');
        inviteCodeInput.value = '';
      }
    }

    function createNewRoom() {
      // 在这里添加创建新房间的逻辑
      console.log(roomThemeInput.value);  // 可以查看输入的主题
      roomThemeInput.value = '';  // 清空输入框
      createRoomDialogVisible.value = false;  // 关闭对话框
    }

    function openMyRoomDialog() {
      myRoomDialogVisible.value = true;
    }

    return {
      loggedIn,
      user,
      rooms,
      myRooms,
      friends,
      dialogVisible,
      inviteDialogVisible,
      selectedRoom,
      inviteCodeInput,
      roomThemeInput,
      createRoomDialogVisible,
      myRoomDialogVisible,
      openDialog,
      openInviteDialog,
      checkUserLoggedIn,
      inviteFriend,
      openCreateRoom,
      checkInviteCode,
      createNewRoom,
      openMyRoomDialog,
    };
  },
  mounted() {
    this.loggedIn = this.checkUserLoggedIn();
  },
});
</script>


<style scoped>
.box {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
}

.main-left-top-title {
  color: #5ab1ef;
  font-size: x-large;
}

.content {
  overflow: hidden;
  height: 80%;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.main-left-top-tip {
  height: 30%;
  font-size: x-large;
  margin-bottom: 20px;
  color: white;
  text-align: center;
}

.icon {
  color: deepskyblue;
}

.together-content {
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
