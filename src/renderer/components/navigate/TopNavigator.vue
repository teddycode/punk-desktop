<template>
  <div class="navbar">
    <ul>
      <li @click="onFullScreen">
        <font-awesome-icon :icon="['fas', 'expand-arrows-alt']" class="icon"/>
      </li>
      <li @click="onChangeLang">
        <font-awesome-icon :icon="['fas', 'language']" class="icon"/>
      </li>
      <li @click="onGotoHome">
        <font-awesome-icon :icon="['fas', 'home']" class="icon"/>
      </li>
      <li @click="onReturnPage">
        <font-awesome-icon :icon="['fas', 'arrow-right']" class="icon"/>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import {library} from '@fortawesome/fontawesome-svg-core'
import {faExpandArrowsAlt, faLanguage, faHome, faArrowRight} from '@fortawesome/free-solid-svg-icons'
import {useRouter} from "vue-router";
import {ref} from "vue";
import {setLanguage} from '@renderer/i18n';

library.add(faExpandArrowsAlt, faLanguage, faHome, faArrowRight)

let {ipcRenderer} = window;
export default {
  name: 'TopNavigator',
  components: {
    FontAwesomeIcon,
  },
  setup() {
    const scrFlag = ref(false);
    const langFlg = ref(false);
    const router = useRouter();

    // 切换全屏
    const onFullScreen = () => {
      ipcRenderer.send("toggle-fullscreen");
      document.body.style.overflow = scrFlag.value ? 'hidden' : 'auto';
      scrFlag.value = !scrFlag.value;
    };

    // 语言切换
    const onChangeLang = () => {
      const lang = langFlg.value ? "zh-cn" : "en";
      console.log("change language:", lang);
      setLanguage(lang);
      langFlg.value = !langFlg.value;
    };

    // 返回主页
    const onGotoHome = () => {
      router.push({name: 'HomePage'});
    };

    // 返回上一页
    const onReturnPage = () => {
// your code here
    };

    return {
      scrFlag,
      langFlg,
      onFullScreen,
      onChangeLang,
      onGotoHome,
      onReturnPage,
    };
  },
};
</script>

<style lang="scss" scoped>

.icon {
  color: white;
}

.navbar {
  top: -80px;
  width: 200px;
  height: 50px;
  margin-bottom: 0;
  background: rgba(216, 191, 216, 0.2);
  border-radius: 0;
  border: none;
  margin-left: -170px;
  transition: margin-left 0.9s;

  ul {
    width: 100%;
    height: 100%;

    li {
      float: left;
      width: 40px;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 5px;

      &:focus {
        background: #3498da;
      }

      &:hover {
        background: #3498da;
      }
    }
  }

  &:hover {
    margin-left: -20px;
  }
}

</style>
