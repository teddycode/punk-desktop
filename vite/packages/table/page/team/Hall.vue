<template>

  <a-row :gutter="20">
    <a-col :span="8">
      <HorizontalPanel v-model:selectType="teamType" :navList="teamNavList"></HorizontalPanel>
    </a-col>
    <a-col :span="3">
      <div class="s-bg pointer h-12 w-24 rounded-lg flex justify-center items-center px-3"
           style="background: var(--primary-bg);;color: var(--primary-text);"
           @click="random">
        <icon class="mr-1" icon="shuaxin" style="font-size: 1.2em"></icon>
        换一换
      </div>
    </a-col>
  </a-row>
  <div class="" style="flex: 1;overflow:hidden;">
    <vue-custom-scrollbar id="containerWrapper" :settings="settingsScroller" style="height: 100%">
      <TeamList :list="showTeam" @showAction="showAction"></TeamList>
    </vue-custom-scrollbar>
  </div>


  <a-drawer v-model:visible="actionVisible" placement="right">
    <div class="line-title" style="color:var(--primary-text)">
      选中的小队：
    </div>
    <div v-if="selectTeam" class="ml-5 bg-mask p-5 rounded-lg"
         style="color:var(--primary-text);background: var(--primary-bg);">
      <a-avatar :size="50" :src="selectTeam.avatar"></a-avatar>
      <strong class="text-lg ml-5">{{ selectTeam.name }}</strong>
      <div v-if="selectTeam.leaderInfo" class="mt-3">
        队长：
        <div class="mt-2 ml-2">
          <a-avatar :size="40"
                    :src="selectTeam.leaderInfo.data.userInfo.avatar" class="mr-3 pointer"
                    @click.stop="showUserCard(selectTeam.leaderInfo.data.uid,selectTeam.leaderInfo.data.userInfo)"></a-avatar>
          {{ selectTeam.leaderInfo.data.userInfo.nickname }}
        </div>
      </div>

      <div v-if="selectTeam.members.data.length">
        <div class="mb-3 mt-3">
          队员：
        </div>
        <div v-for="member in selectTeam.members.data" :span="4" class="mb-3 ml-3">
          <a-avatar v-if="member.userInfo" :src="member.userInfo.avatar"
                    class="mr-2 pointer" @click="showUserCard(member.userInfo.uid,member.userInfo)"></a-avatar>
          {{ member.userInfo.nickname }}
        </div>
      </div>
    </div>

    <div class="mt-10">
      <a-button :disabled="hasTeam" block size="large" style="color:var(--primary-text);background: var(--primary-bg);"
                type="primary"
                @click="joinTeam(selectTeam)">加入小队
      </a-button>
    </div>
  </a-drawer>

</template>

<script>


import HorizontalPanel from '../../components/HorizontalPanel.vue'
import TeamList from '../../components/team/TeamList.vue'

import { mapActions, mapState, mapWritableState } from 'pinia'
import { teamStore } from '../../store/team'
import { Modal } from 'ant-design-vue'
import { appStore } from '../../store'
import { completeTask } from '../../apps/task/page/branch/task.ts'

export default {
  name: 'Hall',
  components: { TeamList, HorizontalPanel },
  data () {
    return {
      randomNums: [],
      settingsScroller: {
        useBothWheelAxes: true,
        swipeEasing: true,
        suppressScrollY: false,
        suppressScrollX: true,
        wheelPropagation: true
      },
      take: 100,
      page: 1,
      selectTeam: {},
      actionVisible: false,
      list: [],
      teamNavList: [{ title: '活跃小队', name: 'active' }, { title: '最新创建', name: 'latest' }],
      teamType: { title: '活跃小队', name: 'active' },
    }
  },
  computed: {
    ...mapState(teamStore, ['hasTeam']),
    ...mapWritableState(teamStore, 'teamVisible'),
    showTeam () {

      let data = []
      this.randomNums.forEach(num => {
        data.push(this.list[num])
      })
      return data
    }
  },
  methods: {
    ...mapActions(teamStore, ['getTeamList', 'updateMy', 'joinByNo']),
    ...mapActions(appStore, ['showUserCard']),
    random () {
      let randomNums = []
      while (1) {
        let randomNum = (Math.random() * this.list.length).toFixed(0)
        if (randomNum >= this.list.length) {
          continue
        }
        if (randomNums.indexOf(randomNum) >= -1) {
          randomNums.push(randomNum)
          if (randomNums.length >= 12) {
            break
          }
        }
      }
      this.randomNums = randomNums
    },
    showAction (data) {
      this.selectTeam = data.team
      this.actionVisible = true
    },
    async joinTeam (team) {
      let rs = await this.joinByNo(team.no)
      if (rs.code === 1000) {
        let result = rs.data
        if (result.status) {
          this.team = result.data
          await this.updateMy(0)
          this.teamVisible = true
          Modal.success({ content: '加入小队成功。', centered: true })
          // 支线任务点
          completeTask('Z0401')
        } else {
          Modal.error({ content: result.info, centered: true })
        }
      }
    }
  },
  async mounted () {

    let result = await this.getTeamList({
      take: this.take,
      skip: (this.page - 1) * this.take,
      type: this.teamType.name,
      cache: 1
    })
    if (result) {
      this.list = result.data
      this.random()
    }
    this.updateMy().then()
  }
}
</script>

<style scoped>

</style>
