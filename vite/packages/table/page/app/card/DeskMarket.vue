<template>
  <!-- 方案列表 -->
  <div class="flex flex-row w-full item-wrapper" style="height: 100%">
    <div :style="wrapperStyle" class="item-content">
      <div v-if="displayItems.length==0" class="text-center w-full">
        <a-empty description="暂无分享" image="/img/test/load-ail.png"></a-empty>
      </div>
      <template v-for="(item, index) in displayItems" v-else :key="item.id">
        <xt-task v-if="index == 0" :modelValue="m03025" @cb="previewKay(item)">
          <div :style="deskItemStyle" class="pointer recommend mb-2"
               @click="previewKay(item)">
            <div class=" cover-wrapper" style="">
              <!-- <a-image :width="328" :height="185" :preview="false" src="../../../../../public/img/test/deckImg.jpg" /> -->
              <img :src="item.cover" class="cover-preview"/>
            </div>
            <div style="padding: 0 14px 14px">
              <div class="title"><strong class="mr-2">{{ item.alias || item.title }}</strong>
                <span v-for="x in item.tags?.split(',')" v-if="item.tags"
                      :key="x"
                      class="label">{{ x }}</span>
              </div>
              <div class="flex justify-between items-center mt-3" style="font-size: 14px;color: var(--secondary-text);">
                <span class="flex items-center">
                  <div @click="showCard(item.id)">
                    <a-avatar :size="32" :src="item.userInfo?.avatar"></a-avatar>
                  </div>
                  <span class="ml-3" style="color: var(--secondary-text);">{{ item.userInfo?.nickname }}</span>
                </span>
                <span style="color: var(--secondary-text);">
                  <span>
                    <Icon class="mr-2" icon="dianzan"></Icon>
                    <span>{{ item.support }}</span>
                  </span>
                  <span class="ml-3">
                    <Icon class="mr-2" icon="xiazai"></Icon>
                    <span>{{ item.count }}</span>
                  </span>
                </span>
              </div>
            </div>
          </div>
        </xt-task>

        <div v-else :style="deskItemStyle" class="pointer recommend mb-2"
             @click="previewKay(item)">
          <div class=" cover-wrapper" style="">
            <!-- <a-image :width="328" :height="185" :preview="false" src="../../../../../public/img/test/deckImg.jpg" /> -->
            <img :src="item.cover" class="cover-preview"/>
          </div>
          <div style="padding: 0 14px 14px">
            <div class="title"><strong class="mr-2">{{ item.alias || item.title }}</strong>
              <span v-for="x in item.tags?.split(',')" v-if="item.tags"
                    :key="x"
                    class="label">{{ x }}</span>
            </div>
            <div class="flex justify-between items-center mt-3" style="font-size: 14px;color: var(--secondary-text);">
              <span class="flex items-center">
                <div @click="showCard(item.id)">
                  <a-avatar :size="32" :src="item.userInfo?.avatar"></a-avatar>
                </div>
                <span class="ml-3" style="color: var(--secondary-text);">{{ item.userInfo?.nickname }}</span>
              </span>
              <span style="color: var(--secondary-text);">
                <span>
                  <Icon class="mr-2" icon="dianzan"></Icon>
                  <span>{{ item.support }}</span>
                </span>
                <span class="ml-3">
                  <Icon class="mr-2" icon="xiazai"></Icon>
                  <span>{{ item.count }}</span>
                </span>
              </span>
            </div>
          </div>
        </div>
      </template>

    </div>
  </div>
  <!-- 预览 -->
  <!-- <DeskPreview :scheme="scheme" :showModal="showModal" @closePreview="closePreview"></DeskPreview> -->
</template>

<script>
import { appStore } from '../../../store'
import { mapActions, mapWritableState } from 'pinia'
import { taskStore } from '../../../apps/task/store'
// import DeskPreview from '../../../components/desk/DeskPreview.vue';
export default {
  name: 'DeskMarket',
  components: {
    // DeskPreview
  },
  computed: {
    ...mapWritableState(taskStore, ['taskID', 'step']),
    m03025 () {
      return this.taskID == 'M0302' && this.step == 5
    }
  },
  data () {
    return {
      displayItems: [],
      // 方案
      // scheme: {},
      // 预览
      showModal: false,
      // 添加
      openDrawer: false
    }
  },
  props: {
    wrapperStyle: {
      type: Object,
      default: {
        height: '100%'
      }

    },
    //排序列表
    items: {
      type: Array,
      default: () => [],
    },

    deskItemStyle: {
      type: String,
      default: () => ''
    }
  },
  watch: {
    items: {
      immediate: true,
      handler () {
        let items = JSON.parse(JSON.stringify(this.items))
        this.displayItems = items.map(item => {
          let itemNew = {
            ...item,
            ...item.data
          }
          return itemNew
        })
        console.log(this.displayItems)
      }
    },

  },
  methods: {
    ...mapActions(appStore, ['showUserCard']),
    showCard (id) {
      this.showUserCard(id)
    },
    mySort (data, property, asc) {
      let datas = [...data]
      return datas.sort(function (a, b) {
        a = a[property]
        b = b[property]
        if (asc) return a - b
        else return b - a
      })
    },
    previewKay (item) {
      console.log(item)
      this.$emit('openPreview', {
        scheme: {
          ...item,
          dataNanoid: item.nanoid
        }, showModal: true
      })
      // this.scheme = item
      // this.showModal = true
    },
    closePreview () {
      // this.showModal = false
    }
  }
}
</script>

<style lang="scss" scoped>
.item-content {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  overflow: auto;
  justify-content: center;
}

.item-content::-webkit-scrollbar {
  display: none;
}

.recommend {
  background: var(--secondary-bg);
  border-radius: 12px;
  width: 356px;
  margin: 0 8px 16px;
  overflow: hidden;

  .title {
    font-size: 18px;
    color: var(--primary-text);
    margin: 10px 0;
    font-weight: 500;
  }

  .label {
    background: rgba(255, 255, 255, 0.4);
    border-radius: 4px;
    font-size: 14px;
    padding: 0 8px;
    color: var(--secondary-text);
    margin-right: 12px;
  }
}

.prompt-modal {
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px;
  z-index: 99;

  .head-icon {
    width: 100%;
    display: flex;
    justify-content: space-between;
    height: 10%;

    .icon {
      background: #2A2A2A;
      border-radius: 12px;
      width: 48px;
      height: 48px;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
    }
  }

  .foot {
    display: flex;
    justify-items: center;
    align-items: end;
    height: 10%;

    > div {
      background: rgba(0, 0, 0, 0.30);
      border-radius: 12px;
      height: 48px;
      line-height: 48px;
      padding: 0 25px;
      font-size: 16px;
      color: var(--secondary-text);
    }
  }
}

.add-scheme {
  background: #2A2A2A;
  border-radius: 12px;
  width: 80px;
  height: 48px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.drawer-center {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 30%;
}

.cover-preview {
  border-radius: 5px;
  object-fit: contain;
  left: 50%;
  transform: translateX(-50%) translateY(-50%);
  top: 50%;
  max-width: calc(100%);
  max-height: calc(100%);
  position: absolute;
}

.cover-wrapper {
  height: 200px;
  margin: 10px;
  position: relative;
}
</style>
