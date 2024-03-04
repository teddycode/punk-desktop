import { defineStore } from 'pinia';
import { Server, sUrl } from '../consts';

const getTodayRank = sUrl('/app/com/sign/getTodayRank');
const doSignUrl = sUrl('/app/com/sign/doSign');
const getSignInfoUrl = sUrl('/app/com/sign/getSignInfo');
const getDailyNewUsersUrl = sUrl('/app/com/sign/getDailyNewUsers');
const { axios } = window.$models;
import { getConfig } from '../js/axios/serverApi';
import { getDateTime } from '../util';

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
    }
  }),
  actions: {
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
