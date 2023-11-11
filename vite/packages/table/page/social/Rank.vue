<template>
  <div class="page-container rounded-xl xt-bg">
    <!-- 榜单tab -->
    <div class="flex flex-row rounded-lg p-1 h-11"
         style="color: var(--primary-text); background: var(--primary-bg); z-index:2;">
      <div v-for="(item,index) in navList" :key="index" :class="activeIndex===index ? 'select-item':''"
           class="h-full nav-item flex justify-center btn-active items-center relative rounded-lg pointer"
           style="width:25%;" @click.stop="clickNav(item,index)">
        <a-avatar :size="24" :src="item.icon"></a-avatar>
        <span class="ml-2">{{ item.title }}</span>
        <div v-if="item.state === true" class="state-dot ml-2"></div>
      </div>
    </div>
    <!-- 在线榜 -->
    <div v-if="defaultNavList.name === 'onlineUser'" class="scroll-list">
      <!-- 前三排名 -->
      <template v-if="top3[rankName].length>0">
        <ThreeRank :rankList="top3.onlineUserSum" :showSelect="true" lastName="total" selectValue="总"
                   unit="小时"></ThreeRank>
      </template>

      <!-- 切换时长 -->
      <div class="toggle-duration" hidden="">
        <a-select v-model:value="selectValue"
                  :bordered="false" :dropdownStyle="{ 'z-index': 9, backgroundColor: 'var(--secondary-bg)' }" :style="selectStyle"
                  class="select rounded-lg  text-xs flex items-center" size="large">
          <a-select-option v-for="item in sortType" :key="item" :value="item.value" class="no-drag">{{
              item.name
            }}
          </a-select-option>
        </a-select>
      </div>
      <!-- 在线榜列表 -->
      <div class="box">
        <a-row class="box-head">
          <a-col :lg="7" :md="12" :sm="12" :xs="12" class="head-col">用户</a-col>
          <a-col :lg="5" :md="6" :sm="6" :xs="6" class="head-col" style="font-weight: bold">
            <icon icon="trophy" style="font-size:20px"></icon>
            总在线时长
          </a-col>
          <a-col :lg="5" :md="6" :sm="6" :xs="6" class="head-col">净在线时长</a-col>
          <a-col :lg="7" :md="0" :sm="0" :xs="0" class="head-col last-col">小队</a-col>
        </a-row>
        <a-row v-for="(item,index) in list" :key="item.id"
               :class="getExtraClass(item.no)"
               class="box-list hovered pointer" @click="showCard(item.uid,item.userInfo)">
          <a-col :lg="7" :md="12" :sm="12" :xs="12" class="box-col px-4 ">
            <MedalNo :no="item.no"></MedalNo>
            <span class="mx-4">
              <FrameAvatar :avatar-size="50"
                           :avatar-url="item.userInfo.avatar" :frame-url="item.userInfo.equippedItems.frameDetail?.image"></FrameAvatar>
            </span>
            <span class="xt-text truncate" style="font-size: 16px;">{{ item.userInfo.nickname }}</span>
          </a-col>
          <a-col :lg="5" :md="6" :sm="6" :xs="6" class="box-col justify-center">
            <span>{{ parseHours(item.totalTime) }} 小时</span>
          </a-col>
          <a-col :lg="5" :md="6" :sm="6" :xs="6" class="box-col justify-center">
            {{ parseHours(item.onlineInfo.total_time) }}
            小时
          </a-col>
          <a-col v-if="item.teamInfo" :lg="7" :md="0" :sm="0" :xs="0" class="box-col last-col truncate">
            <span class="mr-4 team-box">
              <a-avatar :size="40" :src="item.teamInfo.teamInfo.avatar"></a-avatar>
            </span>
            <span class="min-back mr-1">{{ item.teamInfo.teamInfo.no }}</span><span> {{
              item.teamInfo.teamInfo.name
            }}</span>
          </a-col>
          <a-col v-else :span="6" class="box-col last-col flex justify-center">-</a-col>
        </a-row>
      </div>


    </div>

    <!-- 小队榜 -->
    <div v-if="defaultNavList.name === 'onlineTeamSum'" class="scroll-list">
      <!-- 前三排名 -->
      <template v-if="top3[rankName].length>0">
        <ThreeRank :rankList="top3.onlineTeamSum" :showSelect="true" lastName="total" selectValue="总"
                   unit="小时"></ThreeRank>
      </template>

      <!-- 小队榜列表 -->
      <div class="box">
        <a-row class="box-head">
          <a-col :lg="8" :md="14" :sm="12" :xs="12" class="head-col">小队</a-col>
          <a-col :lg="5" :md="10" :sm="12" :xs="12" class="head-col">在线时长</a-col>
          <a-col :lg="11" :md="0" :sm="0" :xs="0" class="head-col last-col" style="text-align:left;padding-left: 60px;">
            小队成员
          </a-col>
        </a-row>
        <a-row v-for="item in list" :key="item.no" class="box-list">
          <a-col :lg="8" :md="14" :sm="12" :xs="12" class="box-col box-right px-4">
            <MedalNo :no="item.no"></MedalNo>

            <span class="mx-4">
              <a-avatar :size="40" :src="item.teamInfo.avatar"></a-avatar>
            </span>
            <span class="xt-text truncate" style="font-size: 16px;"><span class="min-back mr-1">{{ item.teamNo }}</span><span>{{
                item.teamInfo.name
              }}</span></span>
            <span class="ml-2 min-back">{{ item.unknown }}</span>
          </a-col>
          <a-col :lg="5" :md="10" :sm="12" :xs="12" class="box-col box-right justify-center">
            {{ parseHours(item.totalTime, 2) }}
            小时
          </a-col>
          <a-col :lg="11" :md="0" :sm="0" :xs="0" class="box-col box-right last-col flex pl-10">
            <div class="mx-2 hovered pointer" style="position:relative;"
                 @click="showCard(item.leader.userInfo.uid,item.leader.userInfo)">
              <a-avatar :size="40" :src="item.leader.userInfo.avatar"></a-avatar>
              <span class="captain">队长</span>
            </div>
            <div v-for="i in item.members" :key="i.id" class="mx-2 pointer hovered" style="position:relative;"
                 @click="showCard(i.uid,i.userInfo)">
              <a-avatar :size="40" :src="i.userInfo.avatar"></a-avatar>
            </div>
          </a-col>
        </a-row>
      </div>
      <!-- 切换数据 -->
      <div v-if="teamList.length > 10" class="switch-data">
        <div :class="paging === 1 ? 'pag-active' : ''" class="mr-3">
          <Icon icon="xiangzuo" style="font-size: 1.5em;"></Icon>
        </div>
        <div>
          <Icon icon="xiangyou" style="font-size: 1.5em;"></Icon>
        </div>
      </div>

    </div>

    <!-- 邀请榜 -->
    <div v-if="defaultNavList.name === 'invite'" class="scroll-list">
      <!-- 前三排名 -->
      <ThreeRank :rankList="inviteList" lastName="invite" unit="人"></ThreeRank>
      <!-- 邀请榜列表 -->
      <div class="box">
        <a-row class="box-head">
          <a-col :lg="7" :md="12" :sm="11" :xs="11" class="head-col">用户</a-col>
          <a-col :lg="10" :md="5" :sm="5" :xs="5" class="head-col">已邀请</a-col>
          <a-col :lg="7" :md="7" :sm="8" :xs="8" class="head-col">小队</a-col>
        </a-row>
        <a-row v-for="item in inviteList" :key="item.id" class="box-list">
          <a-col :lg="7" :md="12" :sm="11" :xs="11" class="box-col px-4">

            <MedalNo :no="item.id"></MedalNo>
            <span class="mx-4" @click="showCard(item.uid)">
              <a-avatar :size="40" :src="item.avatar"></a-avatar>
            </span>
            <span class="xt-text truncate" style="font-size: 16px;">{{ item.nickname }}</span>
          </a-col>
          <a-col :lg="10" :md="5" :sm="5" :xs="5" class="box-col justify-center">{{ item.invite }} 人</a-col>
          <a-col v-if="item.team" :lg="7" :md="7" :sm="8" :xs="8" class="box-col">
            <span class="mr-4 team-box">
              <a-avatar :size="40" :src="item.icon"></a-avatar>
            </span>
            <span>{{ item.team }}</span>
          </a-col>
          <a-col v-else :lg="7" :md="7" :sm="8" :xs="8" class="box-col flex justify-center">-</a-col>
        </a-row>
      </div>
      <!-- 切换数据 -->
      <div v-if="inviteList.length > 10" class="switch-data">
        <div :class="paging === 1 ? 'pag-active' : ''" class="mr-3">
          <Icon icon="xiangzuo" style="font-size: 1.5em;"></Icon>
        </div>
        <div>
          <Icon icon="xiangyou" style="font-size: 1.5em;"></Icon>
        </div>
      </div>
      <!-- 我的排名 -->
      <div class="my-style">
        <a-row class="box-list my-rank xt-mask">
          <a-col :lg="7" :md="12" :sm="11" :xs="11" class="box-col px-4">
            <div class="ranking-back">{{ myInvite.id }}</div>
            <span class="mx-4" @click="showCard(item.uid)">
              <a-avatar :size="40" :src="myInvite.avatar"></a-avatar>
            </span>
            <span class="xt-text truncate" style="font-size: 16px;">{{ myInvite.nickname }}</span>
            <span class="min-back ml-2">我</span>
          </a-col>
          <a-col :lg="10" :md="5" :sm="5" :xs="5" class="box-col justify-center">{{ myInvite.invite }} 人</a-col>
          <a-col :lg="7" :md="7" :sm="8" :xs="8" class="box-col">
            <span class="mr-4 team-box">
              <a-avatar :size="40" :src="myInvite.icon"></a-avatar>
            </span>
            <span>{{ myInvite.team }}</span>
          </a-col>
        </a-row>
      </div>
    </div>

    <!-- 签到榜 -->
    <div v-if="defaultNavList.name === 'signIn'" class="scroll-list">
      <!-- 前三排名 -->
      <ThreeRank :rankList="signInList" lastName="signInTime"></ThreeRank>
      <!-- 切换签到日期 -->
      <div class="toggle-duration">
        <a-select v-model:value="selectSignInValue"
                  :bordered="false" :dropdownStyle="{ 'z-index': 9, backgroundColor: 'var(--secondary-bg)' }" :style="selectStyle"
                  class="select rounded-lg  text-xs s-item flex items-center"
                  size="large">
          <a-select-option v-for="item in sortSignInType" :key="item" :value="item.value" class="no-drag">{{
              item.name
            }}
          </a-select-option>
        </a-select>
      </div>
      <!-- 签到榜列表 -->
      <div class="box">
        <a-row class="box-head">
          <a-col :lg="7" :md="12" :sm="11" :xs="11" class="head-col">用户</a-col>
          <a-col :lg="10" :md="5" :sm="5" :xs="5" class="head-col">签到时间</a-col>
          <a-col :lg="7" :md="7" :sm="8" :xs="8" class="head-col">小队</a-col>
        </a-row>
        <a-row v-for="item in signInList" :key="item.id" class="box-list">
          <a-col :lg="7" :md="12" :sm="11" :xs="11" class="box-col px-4">
            <span v-if="item.id === 1">
              <a-avatar :size="32" src="../../../../public/img/rankingList/one.png"></a-avatar>
            </span>
            <span v-else-if="item.id === 2">
              <a-avatar :size="32" src="../../../../public/img/rankingList/two.png"></a-avatar>
            </span>
            <span v-else-if="item.id === 3">
              <a-avatar :size="32" src="../../../../public/img/rankingList/three.png"></a-avatar>
            </span>
            <div v-else class="ranking-back">{{ item.id }}</div>
            <span class="mx-4" @click="showCard(item.uid)">
              <a-avatar :size="40" :src="item.avatar"></a-avatar>
            </span>
            <span class="xt-text truncate" style="font-size: 16px;">{{ item.nickname }}</span>
          </a-col>
          <a-col :lg="10" :md="5" :sm="5" :xs="5" class="box-col justify-center">{{ item.signInTime }}</a-col>
          <a-col v-if="item.team" :lg="7" :md="7" :sm="8" :xs="8" class="box-col">
            <span class="mr-4 team-box">
              <a-avatar :size="40" :src="item.icon"></a-avatar>
            </span>
            <span>{{ item.team }}</span>
          </a-col>
          <a-col v-else :lg="7" :md="7" :sm="8" :xs="8" class="box-col flex justify-center">-</a-col>
        </a-row>
      </div>
      <!-- 切换数据 -->

      <!-- 我的排名 -->
      <div class="my-style">
        <a-row class="box-list my-rank xt-mask">
          <a-col :lg="7" :md="12" :sm="11" :xs="11" class="box-col px-4">
            <div class="ranking-back">{{ mySignIn.id }}</div>
            <span class="mx-4" @click="showCard(item.uid)">
              <a-avatar :size="40" :src="mySignIn.avatar"></a-avatar>
            </span>
            <span class="xt-text truncate" style="font-size: 16px;">{{ mySignIn.nickname }}</span>
            <span class="min-back ml-2">我</span>
          </a-col>
          <a-col :lg="10" :md="5" :sm="5" :xs="5" class="box-col justify-center">{{ mySignIn.signInTime }}</a-col>
          <a-col :lg="7" :md="7" :sm="8" :xs="8" class="box-col">
            <span class="mr-4 team-box">
              <a-avatar :size="40" :src="mySignIn.icon"></a-avatar>
            </span>
            <span>{{ mySignIn.team }}</span>
          </a-col>
        </a-row>
      </div>

    </div>

    <div style="position:absolute;bottom: 0;width: 100%">
      <div v-if="true" class="switch-data" style="z-index: 999999">
        <div :class="page === 1 ? 'pag-active' : ''" class="mr-3" @click.stop='homePage'>
          <icon icon="henggang" style="font-size: 1.7em;transform: rotate(90deg);margin-right: -10px"></icon>
          <Icon icon="xiangzuo" style="font-size: 1.5em;"></Icon>

        </div>
        <div :class="page === 1 ? 'pag-active' : ''" class="mr-3" @click.stop='prevPage'>
          <Icon icon="xiangzuo" style="font-size: 1.5em;"></Icon>
        </div>
        <div :class="page>=pageInfo.pages?'pag-active':''" class="mr-3" @click.stop="nextPage">
          <Icon icon="xiangyou" style="font-size: 1.5em;"></Icon>
        </div>
        <div :class="page>=pageInfo.pages?'pag-active':''" @click.stop="endPage">
          <Icon icon="xiangyou" style="font-size: 1.5em;"></Icon>
          <icon icon="henggang" style="font-size: 1.7em;transform: rotate(90deg);margin-left: -10px"></icon>
        </div>
      </div>
      <!-- 我的排名 -->
      <div v-if="rankName!=='onlineTeamSum'" class="my-style">
        <a-row v-if="myRank" class="box-list my-rank xt-mask">
          <a-col :lg="7" :md="12" :sm="12" :xs="12" class="box-col px-4">
            <MedalNo :no="myRank.no"></MedalNo>
            <span class="mx-4" @click="showCard(myRank.uid)">
              <a-avatar :size="40" :src="myRank.userInfo.avatar"></a-avatar>
            </span>
            <span class="xt-text truncate" style="font-size: 16px;">{{ myRank.userInfo.nickname }}</span>
            <span class="min-back ml-2">我</span>
          </a-col>
          <a-col :lg="5" :md="6" :sm="6" :xs="6" class="box-col justify-center">
            <span>{{ parseHours(myRank.totalTime) }} 小时</span>
          </a-col>
          <a-col :lg="5" :md="6" :sm="6" :xs="6" class="box-col justify-center">
            {{ parseHours(myRank.onlineInfo.total_time) }} 小时
          </a-col>
          <a-col :lg="7" :md="0" :sm="0" :xs="0" class="box-col last-col">
            <span class="mr-4 team-box">
              <a-avatar :size="40" :src="myRank.teamInfo.avatar"></a-avatar>
            </span>
            <span>{{ myRank.teamInfo.name }}</span>
          </a-col>
        </a-row>
      </div>
      <!-- 我的排名 -->
      <div v-else class="my-style">
        <a-row v-if="team && myRank" class="box-list my-rank xt-mask">
          <a-col :lg="9" :md="14" :sm="12" :xs="12" class="box-col box-right px-4">
            <MedalNo :no="myRank.no"></MedalNo>
            <span class="mx-4">
              <a-avatar :size="40" :src="myRank.teamInfo.avatar"></a-avatar>
            </span>
            <span class="mr-2 min-back">{{ myRank.teamInfo.no }}</span>
            <span class="xt-text truncate" style="font-size: 16px;">{{ myRank.teamInfo.name }}</span>

          </a-col>
          <a-col :lg="5" :md="10" :sm="12" :xs="12" class="box-col box-right justify-center">
            {{ parseHours(myRank.onlineInfo.total_time, 2) }}
            小时
          </a-col>
          <a-col :lg="10" :md="0" :sm="0" :xs="0" class="box-col box-right last-col flex pl-10">
            <div class="mx-2" style="position:relative;">
              <a-avatar :size="40" :src="myRank.leader.userInfo.avatar"></a-avatar>
              <span class="captain">队长</span>
            </div>
            <div v-for="i in myRank.members" :key="i.id" class="mx-2" style="position:relative;">
              <a-avatar :size="40" :src="i.userInfo.avatar"></a-avatar>
            </div>
          </a-col>
        </a-row>
      </div>
    </div>
  </div>

</template>

<script>
import {mapActions, mapState} from 'pinia'
import {appStore} from '../../store'
import {inviteList, myInvite, myRanking, mySignIn, myTeam, onLineList, signInList, teamList} from '../../js/rank'
import ThreeRank from '../../components/rank/ThreeRank.vue'
import {rankStore} from '../../store/rank'
import Template from '../../../user/pages/Template.vue'
import {teamStore} from '../../store/team'
import MedalNo from './MedalNo.vue'
import FrameAvatar from '../../components/avatar/FrameAvatar.vue'

export default {
  name: 'Rank',
  components: {
    FrameAvatar,
    MedalNo,
    Template,
    ThreeRank
  },
  data() {
    return {
      page: 1,//分页
      onLineList,// 在线榜
      top3: {
        onlineUserSum: [],
        onlineTeamSum: []
      },//前3名，用于格式化前三名的头像

      myRanking,// 我的在线榜排行
      teamList, // 小队榜
      myTeam,// 我的小队榜排行
      inviteList,// 邀请榜
      myInvite,// 我的邀请榜排行
      signInList,// 签到榜
      mySignIn,// 我的签到榜排行
      paging: 1,
      // 榜单tab
      navList: [
        {title: '在线榜', icon: '../../../../public/img/rankingList/rocket.png', name: 'onlineUser'},
        {title: '小队榜', icon: '../../../../public/img/rankingList/tiny_spot.png', name: 'onlineTeamSum'},
        // { title: '邀请榜', icon: '../../../../public/img/rankingList/handshake.png', name: 'invite' },
        // { title: '签到榜', icon: '../../../../public/img/rankingList/mantelpiece.png', name: 'signIn' }
      ],
      // 默认选中
      defaultNavList: {title: '在线榜', icon: '../../../../public/img/rankingList/rocket.png', name: 'onlineUser'},
      activeIndex: 0,
      onLineListTitle: ['用户', '总在线时长', '净在线时长', '小队'],
      selectValue: 'sum',
      sortType: [
        {name: '总在线时长', value: 'sum'},
        {name: '净在线时长', value: 'pure'},
      ],
      selectSignInValue: '今日签到榜',
      sortSignInType: [
        {name: '今日签到榜', value: '今日签到榜'},
        {name: '累计签到榜', value: '累计签到榜'},
        {name: '连续签到榜', value: '连续签到榜'},
      ],
      teamListTitle: ['用户', '在线时长', '小队成员'],
      onLineLists: []
    }
  },
  mounted() {
    this.page = 1
    this.reload()
    this.reloadMy()
  },
  computed: {
    ...mapState(rankStore, ['rankLists', 'pageInfos', 'myRanks']),
    ...mapState(teamStore, ['team', 'teamMembers', 'teamLeader']),
    /**
     * 榜单英文名
     * @returns {string}
     */
    rankName() {
      if (this.defaultNavList.name === 'onlineUser') {
        if (this.selectValue === 'sum') {
          return 'onlineUserSum'
        }
      } else {
        return this.defaultNavList.name
      }
    },
    /**
     * 翻页信息
     * @returns {*}
     */
    pageInfo() {
      if (this.pageInfos) {
        return this.pageInfos[this.rankName]
      } else {
        return {
          pages: 0
        }
      }

    },
    /**
     * 主数据列表
     * @returns {*}
     */
    list() {
      if (this.rankLists[this.rankName]) {
        return this.rankLists[this.rankName][this.page]
      }
      return []
    },
    myRank() {
      if (this.myRanks[this.rankName]) {
        return this.myRanks[this.rankName]
      }
      return false
    },
  },
  methods: {
    ...mapActions(appStore, ['showUserCard']),
    ...mapActions(rankStore, ['getRank', 'getMy']),
    homePage() {
      this.page = 1
      this.reload()
    },
    prevPage() {
      if (this.page > 1) {
        this.page--
        this.reload()
      }
    },
    endPage() {
      this.page = this.pageInfo.pages
      this.reload()
    },
    nextPage() {
      if (this.page >= this.pageInfo.pages) {
        return
      }
      this.page++
      this.reload()
    },
    reloadMy() {
      this.getMy(this.rankName)
    },
    getTop3FromUserSumRank() {
      let top3 = [
        {
          ...this.rankLists.onlineUserSum[1][0],
          uid: this.rankLists.onlineUserSum[1][0].uid,
          name: this.rankLists.onlineUserSum[1][0].userInfo.nickname,
          avatar: this.rankLists.onlineUserSum[1][0].userInfo.avatar
        },
        {
          ...this.rankLists.onlineUserSum[1][1],
          uid: this.rankLists.onlineUserSum[1][1].uid,
          name: this.rankLists.onlineUserSum[1][1].userInfo.nickname,
          avatar: this.rankLists.onlineUserSum[1][1].userInfo.avatar
        },
        {
          ...this.rankLists.onlineUserSum[1][2],
          uid: this.rankLists.onlineUserSum[1][2].uid,
          name: this.rankLists.onlineUserSum[1][2].userInfo.nickname,
          avatar: this.rankLists.onlineUserSum[1][2].userInfo.avatar
        },
      ]
      top3[0].total = this.parseHours(top3[0].totalTime)
      top3[1].total = this.parseHours(top3[1].totalTime)
      top3[2].total = this.parseHours(top3[2].totalTime)
      return top3
    },
    reload() {
      this.getRank(this.rankName, this.page, {withTeam: 1}).then(() => {
        if (this.rankName === 'onlineUserSum') {
          this.top3['onlineUserSum'] = this.getTop3FromUserSumRank()
        } else if (this.rankName === 'onlineTeamSum') {
          let top3 = [
            {
              ...this.rankLists.onlineTeamSum[1][0],
              avatar: this.rankLists.onlineTeamSum[1][0].teamInfo.avatar,
              name: this.rankLists.onlineTeamSum[1][0].teamInfo.name,
              id: this.rankLists.onlineTeamSum[1][0].teamInfo.no
            },
            {
              ...this.rankLists.onlineTeamSum[1][1],
              avatar: this.rankLists.onlineTeamSum[1][1].teamInfo.avatar,
              name: this.rankLists.onlineTeamSum[1][1].teamInfo.name,
              id: this.rankLists.onlineTeamSum[1][1].teamInfo.no
            },
            {
              ...this.rankLists.onlineTeamSum[1][2],
              avatar: this.rankLists.onlineTeamSum[1][2].teamInfo.avatar,
              name: this.rankLists.onlineTeamSum[1][2].teamInfo.name,
              id: this.rankLists.onlineTeamSum[1][2].teamInfo.no
            },
          ]
          top3[0].total = this.parseHours(top3[0].totalTime, 2)
          top3[1].total = this.parseHours(top3[1].totalTime, 2)
          top3[2].total = this.parseHours(top3[2].totalTime, 2)
          this.top3['onlineTeamSum'] = top3
        }

      })

    },
    getExtraClass(no) {
      if (no === 1) {
        return 'first'
      }
      if (no === 2) {
        return 'second'
      }
      if (no === 3) {
        return 'third'
      }
    },
    parseHours(minutes, fixed = 0) {
      return (minutes / 60).toFixed(fixed)
    },
    clickNav(item, index) {
      this.activeIndex = index
      item.state = false  // 将消息未读状态隐藏
      this.defaultNavList = item
    },
    showCard(uid, userInfo) {
      this.showUserCard(uid, userInfo)
    },
    mySort(data, property, asc) {
      let datas = [...data]
      return datas.sort(function (a, b) {
        a = a[property]
        b = b[property]
        if (asc) return a - b
        else return b - a
      })
    },
  },
  watch: {
    'defaultNavList.name': {
      handler(newVal) {
        this.page = 1
        this.reload()
        this.reloadMy()
      }
    },

    selectValue: {
      immediate: true,
      deep: true,
      handler(newV, oldV) {
        if (newV == '总在线时长') this.onLineLists = this.mySort(this.onLineList, 'totalDuration')
        else if (newV == '更新时间') this.onLineLists = this.mySort(this.onLineList, 'netDuration')
        else this.onLineLists = this.onLineList
      }
    },
  }
}
</script>

<style lang="scss" scoped>
@media screen and (min-width: 992px) {
  .one-box-item {
    width: 231px;
    margin: 0 70px;

    .one-avatar {
      width: 231px;
      height: 231px;
      background-size: 168px;
    }

    .one-img {
      width: 87px;
      height: 87px;
    }

    .avatar-img {
      position: relative;
      top: 8px;
    }
  }
  .box-item {
    width: 178px;

    .item-avatar {
      width: 178px;
      height: 178px;
    }

    .other-img {
      width: 68px;
      height: 68px;
    }
  }
  .last-col {
    display: block;
  }
  .select {
    width: 200px;
  }
  .team-box {
    margin-left: 20%;
  }
}

@media screen and (max-width: 992px) {
  .one-box-item {
    width: 180px;
    margin: 0 25px;

    .one-avatar {
      width: 180px;
      height: 180px;
      background-size: 118px;
    }

    .one-img {
      width: 60px;
      height: 60px;
    }

    .avatar-img {
      position: relative;
      top: 6px;
    }
  }
  .box-item {
    width: 128px;

    .item-avatar {
      width: 128px;
      height: 128px;
    }

    .other-img {
      width: 48px;
      height: 48px;
    }
  }
  .two-avatar {
    background-size: 92px;
  }
  .three-avatar {
    background-size: 80px;
  }
  .last-col {
    display: none !important;
  }
  .box-col:nth-child(3),
  .box-right:nth-child(2) {
    border-right: none !important;
  }
  .select {
    width: 150px;
  }
  .team-box {
    margin-left: 10%;
  }
}

.page-container {
  margin: 0 12px;
  padding: 12px;
  position: relative;
  // width: 98%;
  height: 100%;
}

.scroll-list {
  height: 92%;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0 0 120px;
}

.scroll-list::-webkit-scrollbar {
  display: none;
}

.top-three-box {
  height: 320px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  // position: relative;
  .box-item {
    // width: 178px;
    font-size: 16px;
    display: flex;
    flex-direction: column;
    align-items: center;

    .item-avatar {
      // width: 178px;
      // height: 178px;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .two-avatar {
      background-image: url(../../../../public/img/rankingList/silver.svg);
      background-repeat: no-repeat;
      background-position: center;
    }

    .three-avatar {
      background-image: url(../../../../public/img/rankingList/copper.svg);
      background-repeat: no-repeat;
      background-position: center;
    }
  }

  .one-box-item {
    // width: 231px;
    font-size: 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    // margin: 0 70px;
    .one-avatar {
      // width: 231px;
      // height: 231px;
      display: flex;
      justify-content: center;
      align-items: center;
      background-image: url(../../../../public/img/rankingList/metals.svg);
      // background-size: 168px;
      background-repeat: no-repeat;
      background-position: center;
      // .avatar-img{
      //   position: relative;
      //   top: 8px;
      // }
    }
  }

  .text-back {
    background: rgba(255, 255, 255, 0.40);
    border-radius: 4px;
    width: 24px;
    height: 24px;
    text-align: center;
    display: inline-block;
    font-size: 14px;
    color: var(--secondary-text)
  }
}

.toggle-duration {
  position: absolute;
  right: 16px;
  top: 66px;
  z-index: 9;
}

.box {
  .box-head {
    margin-top: 20px;

    .head-col {
      text-align: center;
      font-size: 16px;
      color: var(--primary-text);
    }
  }
}

.hovered {
  &:hover {
    opacity: 0.8;
  }
}

.box-list {


  width: 100%;
  height: 72px;
  margin: 12px 0 0;
  border-radius: 12px;
  display: flex;
  align-items: center;

  .box-col {
    display: flex;
    align-items: center;
    border-right: 1px solid var(--divider);
    height: 40px;
    font-size: 16px;
    color: var(--primary-text);
  }

  .box-col:last-child {
    border-right: none;
  }


}

.my-rank {
  box-shadow: 0px 0px 20px 0px rgba(0, 0, 0, 0.2);
  margin-top: 0;
}

.my-style {
  z-index: 99;
  position: absolute;
  bottom: 16px;
  width: 100%;
  padding-right: 24px;
}

.switch-data {
  margin: -145px 0 0;
  display: flex;
  justify-content: center;
  color: var(--primary-text);

  > div {
    background: var(--secondary-bg);
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 8px;
    width: 160px;
    height: 48px;
    cursor: pointer;
  }

  > div:hover {
    opacity: 0.3;
  }
}

.select {
  // width:200px;
  height: 48px;
  color: var(--primary-text);
  background: var(--secondary-bg);
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 16px;
}

.min-back {
  background: rgba(255, 255, 255, 0.40);
  color: var(--disable-text);
  border-radius: 4px;
  padding: 0 5px;
  font-size: 14px;
  color: var(--primary-text);
  font-weight: 400;
}

.captain {
  position: absolute;
  bottom: -4px;
  left: 0;
  right: 0;
  opacity: 0.8;
  background: var(--modal-bg);
  box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  font-size: 10px;
  color: var(-secondary-text);
  height: 16px;
  line-height: 16px;
  text-align: center;
  font-weight: 600;
}

.pag-active {
  opacity: 0.5;
}

.box > .box-list.first {
  background: rgba(254, 44, 70, 0.4);
}

.box > .box-list.second {
  background: rgba(255, 102, 0, 0.4);
}

.box > .box-list.third {
  background: rgba(153, 103, 10, 0.4);
}

.select-item {
  background: var(--active-bg);
  color: var(--active-text) !important;
}
</style>
