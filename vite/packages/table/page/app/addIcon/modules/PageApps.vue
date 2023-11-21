<template>
  <Icon
      :data="appList"
      :isSelect="true"
      @updateSelectApps="updateSelectApps"
  ></Icon>
</template>

<script>
import { getPageApps } from '../api/api'
import syncSelected from '../hooks/syncSelected'

export default {
  mixins: [syncSelected],
  data: {
    appList: [],
  },
  async mounted() {
    let res = await getPageApps()
    let appList = []
    res.forEach((item) => {
      if (item?.type === 'card') {
        appList.push({
          link: 'fast',
          icon: item.logo,
          name: item.name,
          path: { package: item.package, type: 'pageApp', name: item.name },
          open: {
            type: 'pageApp',
            route: item?.package,
            name: item?.name,
            params: item?.url,
            value: item?.package,
          },
        })
      }
    })
    console.log('合法的APP:', appList)
    this.appList = appList
  },
}
</script>

<style lang="scss" scoped></style>
