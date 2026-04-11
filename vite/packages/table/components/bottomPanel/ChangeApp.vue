<template>
  <div>
    <div class="m-3" style="width: 320px; margin: auto; text-align: center; margin-top: 1.5em; margin-bottom: 0.5em">
      <a-text strong style="font-size: 20px; color: black">任务管理器</a-text>
    </div>

    <div style="max-width: 1200px; margin: auto">
      <RunningApps @closeChangeApp="$emit('closeChangeApp')" />
    </div>

    <div class="p-5 text-base no-drag">
      <div class="w-96 justify-between flex flex-row absolute bottom-8 left-1/2 -translate-x-1/2">
        <div v-for="item in listData" class="flex justify-center items-center" style="width: 56px; height: 56px">
          <Icon
            :icon="item.icon"
            class="pointer"
            style="width: 32px; height: 32px; color: white"
            @click.stop="clickListItem(item)"
          ></Icon>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import navigationData from '../../js/data/tableData';
import { appsStore } from '../../store/apps';
import { mapWritableState } from 'pinia';
import RunningApps from './RunningApps.vue';

export default {
  name: 'ChangeApp',
  components: { RunningApps },
  props: {
    tab: {
      type: String,
      default: 'apps',
    },
    full: {
      type: Boolean,
      default: false,
    },
  },
  created() {
    navigationData.sendThis(this);
  },
  computed: {
    ...mapWritableState(appsStore, ['runningApps', 'runningAppsInfo', 'runningTableApps']),
    listData() {
      return navigationData.systemAppList.slice(0, 5);
    },
  },
  methods: {},
};
</script>
