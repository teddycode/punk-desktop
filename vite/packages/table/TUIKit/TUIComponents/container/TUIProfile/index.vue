<template>
  <div :class="[env.isH5 ? 'TUI-profile-h5' : '']" class="TUI-profile">
    <div v-if="!isEdit" class="profile" @click="toggleEdit">
      <header class="profile-header">
        <aside class="profile-avatar">
          <img
              :src="profile.avatar ? profile.avatar : 'https://web.sdk.qcloud.com/component/TUIKit/assets/avatar_21.png'"
              class="avatar"
              onerror="this.src='https://web.sdk.qcloud.com/component/TUIKit/assets/avatar_21.png'"
          />
        </aside>
        <ul class="profile-main">
          <li class="profile-main-item">
            <h1 class="profile-main-name">{{ profile.nick || '-' }}</h1>
            <p v-if="!env.isH5" class="gender">
              {{ profile.gender ? $t(`TUIProfile.${genderLabel[profile.gender]}`) : '' }}
            </p>
          </li>
          <li class="profile-main-item">
            <label class="profile-main-label">{{ $t('TUIProfile.用户ID') }}:</label>
            <span>{{ profile.userID }}</span>
          </li>
          <li v-if="env.isH5" class="profile-main-item">
            <label class="profile-main-label">{{ $t('TUIProfile.个性签名') }}:</label>
            <span>{{ profile.selfSignature || $t('TUIProfile.暂未设置') }}</span>
          </li>
        </ul>
      </header>
      <ul v-if="!env.isH5" class="profile-main">
        <li class="profile-main-item">
          <label class="profile-main-label">{{ $t('TUIProfile.个性签名') }}</label>
          <span>{{ profile.selfSignature || $t('TUIProfile.暂未设置') }}</span>
        </li>
        <li class="profile-main-item">
          <label class="profile-main-label">{{ $t('TUIProfile.出生年月') }}</label>
          <span>{{ profile.birthday ? profile.birthday : $t('TUIProfile.暂未设置') }}</span>
        </li>
      </ul>
      <i v-if="env.isH5" class="icon icon-right"></i>
    </div>
    <TUIProfileEdit v-else :isH5="env.isH5" :userInfo="profile" @cancel="cancel" @submit="submit"/>
  </div>
</template>
<script lang="ts">
import {defineComponent, reactive, toRefs} from 'vue';
import {useStore} from 'vuex';
import TUIProfileEdit from './components/TUIProfileEdit';

const TUIProfile = defineComponent({
  name: 'TUIProfile',
  components: {
    TUIProfileEdit,
  },
  setup(props: any, ctx: any) {
    const TUIServer: any = TUIProfile?.TUIServer;
    const data = reactive({
      profile: {},
      isEdit: false,
      genderLabel: {
        [TUIServer.TUICore.TIM.TYPES.GENDER_MALE]: '男',
        [TUIServer.TUICore.TIM.TYPES.GENDER_FEMALE]: '女',
        [TUIServer.TUICore.TIM.TYPES.GENDER_UNKNOWN]: '不显示',
      },
      env: TUIServer.TUICore.TUIEnv,
    });

    TUIProfileEdit.TUIServer = TUIServer;

    TUIServer.bind(data);

    const VuexStore = ((window as any)?.TUIKitTUICore?.isOfficial && useStore && useStore()) || {};

    const submit = async (profile: any) => {
      const options: any = {
        nick: profile.nick,
        avatar: profile.avatar,
        gender: profile.gender || TUIServer.TUICore.TIM.TYPES.GENDER_UNKNOWN,
        selfSignature: profile.selfSignature,
        birthday: profile.birthday,
      };
      if (TUIServer.TUICore.getStore().TUIProfile.profile.nick !== profile.nick) {
        (window as any)?.TUIKitTUICore?.isOfficial && VuexStore?.commit && VuexStore?.commit('handleTask', 2);
      }
      try {
        await TUIServer.updateMyProfile(options);
      } catch (error) {
        console.log(error);
      }
      if (!data.env.isH5) {
        cancel();
      }
    };

    const cancel = () => {
      if (data.env.isH5) {
        data.isEdit = false;
      } else {
        changeStatus();
      }
    };

    const changeStatus = () => {
      ctx.emit('changeStatus');
    };

    const toggleEdit = () => {
      if (data.env.isH5) {
        data.isEdit = true;
      }
    };
    return {
      ...toRefs(data),
      submit,
      cancel,
      changeStatus,
      toggleEdit,
    };
  },
});
export default TUIProfile;
</script>

<style lang="scss" scoped src="./style/index.scss"></style>
