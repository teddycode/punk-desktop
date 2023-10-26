<template>
  <div class="navbar">
    <ul>
      <li @click="onFullBox">
        <font-awesome-icon :icon="['fas', 'expand-arrows-alt']" style="color: white;"/>
      </li>
      <li @click="onChangeLang">
        <font-awesome-icon :icon="['fas', 'language']" style="color: white;"/>
      </li>
      <li @click="onGotoHome">
        <font-awesome-icon :icon="['fas', 'home']" style="color: white;"/>
      </li>
      <li>
        <font-awesome-icon :icon="['fas', 'arrow-right']" style="color: white;"/>
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
import {setLanguage} from "@renderer/i18n";

library.add(faExpandArrowsAlt, faLanguage, faHome, faArrowRight)

export default {
  name: 'TopNavItem',
  components: {
    FontAwesomeIcon,
  },
  setup() {
    const scrFlag = ref(false);
    const langFlg = ref(false);
    const router = useRouter();

    const onFullBox = () => {
      window?.electronAPI?.toggleFullScreen();
      document.body.style.overflow = scrFlag.value ? 'hidden' : 'auto';
      scrFlag.value = !scrFlag.value;
    };

    const onChangeLang = () => {
      const lang = langFlg.value ? "zh-cn" : "en";
      console.log("change language:", lang);
      setLanguage(lang);
      langFlg.value = !langFlg.value;
    };

    const onGotoHome = () => {
      router.push({name: 'HomePage'});
    };

    const showResource = () => {
// your code here
    };

    return {
      scrFlag,
      langFlg,
      onFullBox,
      onChangeLang,
      onGotoHome,
      showResource,
    };
  },
};
</script>

<style lang="scss" scoped>
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
