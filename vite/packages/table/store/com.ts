import { defineStore } from 'pinia';
import { Server, sUrl } from '../consts';

const getTodayRank = sUrl('/app/com/sign/getTodayRank');
const doSignUrl = sUrl('/app/com/sign/doSign');
const getSignInfoUrl = sUrl('/app/com/sign/getSignInfo');
const getDailyNewUsersUrl = sUrl('/app/com/sign/getDailyNewUsers');
const { axios } = window.$models;
import { getConfig } from '../js/axios/serverApi';
import { getDateTime } from '../util';


import {getUserDetail, userLove, userCollect, userFollow} from "../../../src/api/socialNetwork_user";
import { getTopTagList } from "../../../src/api/socialNetwork_tag";

export const comStore = defineStore('comStore', {
  state: () => ({
    signIn: {},
    todayRank: [],
    user : {
      id:1,
      nickname: 'luckysheep',
      avatar: 'https://static.juzicon.com/avatars/avatar-200602130320-HMR2.jpeg?x-oss-process=image/resize,w_100',
      ip_home: {
        region: '河南',
      },
      likeNum:2,
      likeIds: [0,1],
      collectNum:1,
      collectIds:[0]
    },

    collectList:[],
    loveList:[],
    followList:[],
    fansList:[],
    topTagList: [],
  }),
  actions: {
    //获取登录用户信息
    async _updateUserInfo(){
      await getUserDetail(1).then(response=>{
        this.user = response.data.user
        this.collectList = response.data.collectList
        this.loveList = response.data.loveList
        this.followList = response.data.followList
        this.fansList = response.data.fansList
      })
    },
    //获取热门标签
    async _getTopTagList(){
      await getTopTagList(3).then(response=>{
        this.topTagList = response.data
      })
    },
    //用户点赞
    async _userLove(forumId){
      await userLove(this.user.id, forumId)
    },
    //用户收藏
    async _userCollect(forumId){
      await userCollect(this.user.id, forumId)
    },
    //用户关注
    async _userFollow(User){
      this.followList.push(User)
      await userFollow(this.user.id, User.id)
    },
    //用户取消关注
    async _userUnFollow(User){
      this.followList = this.followList.filter(item=>item.id!=User.id)
      await userFollow(this.user.id, User.id)
    },

    isFollowed(followId){
      var index = this.followList.findIndex(item => item.id == followId);
      return index != -1
    },



    async updateTodayRank() {
      let response = await axios.get(getTodayRank, await getConfig());
      if (response.code === 1000) {
        let rankResponse = response.data;
        if (rankResponse.status === 1) {
          this.todayRank = rankResponse.data.rankInfo.map((r) => {
            // { id: 1, headSculpture: '', username: '阳光小葵', time: '00:01' },
            if (!r.userInfo) {
              r.userInfo = {};
            }
            const time = getDateTime(new Date(Number(r.signTime)));
            return {
              id: r.rank,
              uid: r.uid,
              avatar: r.userInfo.avatar || '',
              nickname: r.userInfo.nickname || '',
              equippedItems: r.userInfo.equippedItems,
              time: time.hours + ':' + time.minutes + ':' + time.seconds,
            };
          });
        }
      }
    },
    async doSign() {
      let response = await axios.post(doSignUrl, {}, await getConfig());
      if (response.code === 1000) {
        if (response.data.status === 1) {
          return true;
        } else {
          return false;
        }
      }
    },
    async getSignInfo() {
      let response = await axios.get(getSignInfoUrl, await getConfig());
      if (response.code === 1000) {
        return response.data;
      } else {
        return false;
      }
    },
    async getDailyNewUsers(page) {
      let response = await axios.get(getDailyNewUsersUrl, {
        params: {
          page: page,
        },
        ...(await getConfig()),
      });
      if (response.code === 1000) {
        return response.data;
      } else {
        return false;
      }
    },
  },
});
