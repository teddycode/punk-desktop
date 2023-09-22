<script>
import {onMounted, ref, watch} from "vue";
import RFB from "@novnc/novnc/core/rfb";

export default {
  props: {
    url: {
      type: String,
      required: true,
    },
    style: {
      type: [String, Object],
      default: "",
    },
    rfbOptions: {
      type: Object,
      default: () => ({}),
    },
    autoConnect: {
      type: Boolean,
      default: true,
    },
    retryDuration: {
      type: Number,
      default: 3000,
    },
    debug: {
      type: Boolean,
      default: false,
    },
    viewOnly: {
      type: Boolean,
      default: false,
    },
    focusOnClick: {
      type: Boolean,
      default: false,
    },
    clipViewport: {
      type: Boolean,
      default: false,
    },
    dragViewport: {
      type: Boolean,
      default: false,
    },
    scaleViewport: {
      type: Boolean,
      default: false,
    },
    resizeSession: {
      type: Boolean,
      default: false,
    },
    showDotCursor: {
      type: Boolean,
      default: false,
    },
    background: {
      type: String,
      default: "",
    },
    qualityLevel: {
      type: Number,
      default: 6,
    },
    compressionLevel: {
      type: Number,
      default: 2,
    },
    onConnect: {
      type: Function,
      default: null,
    },
    onDisconnect: {
      type: Function,
      default: null,
    },
    onCredentialsRequired: {
      type: Function,
      default: null,
    },
    onSecurityFailure: {
      type: Function,
      default: null,
    },
    onClipboard: {
      type: Function,
      default: null,
    },
    onBell: {
      type: Function,
      default: null,
    },
    onDesktopName: {
      type: Function,
      default: null,
    },
    onCapabilities: {
      type: Function,
      default: null,
    },
  },
  setup(props) {
    const screen = ref(null);
    const loading = ref(true);
    const rfb = ref(null);
    const connected = ref(props.autoConnect);
    const timeouts = ref([]);

    const connect = () => {
      try {
        if (connected.value && rfb.value) {
          disconnect();
        }

        if (!screen.value) {
          return;
        }

        screen.value.innerHTML = "";

        console.log(
            `创建vnc连接。容器：${screen.value}；wss链接：${props.url}；rfb配置参数：${props.rfbOptions}`
        );
        const _rfb = new RFB(screen.value, props.url, props.rfbOptions);

        _rfb.viewOnly = props.viewOnly;
        _rfb.focusOnClick = props.focusOnClick;
        _rfb.clipViewport = props.clipViewport;
        _rfb.dragViewport = props.dragViewport;
        _rfb.resizeSession = props.resizeSession;
        _rfb.scaleViewport = props.scaleViewport;
        _rfb.showDotCursor = props.showDotCursor;
        _rfb.background = props.background;
        _rfb.qualityLevel = props.qualityLevel;
        _rfb.compressionLevel = props.compressionLevel;
        rfb.value = _rfb;

        _rfb.addEventListener("connect", onConnect);
        _rfb.addEventListener("disconnect", onDisconnect);
        _rfb.addEventListener("credentialsrequired", onCredentialsRequired);
        _rfb.addEventListener("securityfailure", props.onSecurityFailure);
        _rfb.addEventListener("clipboard", props.onClipboard);
        _rfb.addEventListener("bell", props.onBell);
        _rfb.addEventListener("desktopname", onDesktopName);
        _rfb.addEventListener("capabilities", props.onCapabilities);

        connected.value = true;
      } catch (err) {
        console.error(err);
      }
    };

    const disconnect = () => {
      try {
        if (!rfb.value) {
          return;
        }

        timeouts.value.forEach(clearTimeout);
        rfb.value.disconnect();
        rfb.value = null;
        connected.value = false;
      } catch (err) {
        console.error(err);
        rfb.value = null;
        connected.value = false;
      }
    };

    const onConnect = () => {
      if (props.onConnect) {
        props.onConnect(rfb.value);
        loading.value = false;
        return;
      }

      console.info("Connected to remote VNC.");
      loading.value = false;
    };

    const onDisconnect = () => {
      if (props.onDisconnect) {
        props.onDisconnect(rfb.value);
        loading.value = true;
        return;
      }

      if (connected.value) {
        console.info(
            `Unexpectedly disconnected from remote VNC, retrying in ${
                props.retryDuration / 1000
            } seconds.`
        );

        timeouts.value.push(setTimeout(connect, props.retryDuration));
      } else {
        console.info(`Disconnected from remote VNC.`);
      }
      loading.value = true;
    };

    const onCredentialsRequired = () => {
      if (props.onCredentialsRequired) {
        props.onCredentialsRequired(rfb.value);
        return;
      }

      const password =
          props.rfbOptions.credentials?.password ?? prompt("请输入密码:");
      rfb.value.sendCredentials({password});
    };

    const onDesktopName = (e) => {
      if (props.onDesktopName) {
        props.onDesktopName(e);
        return;
      }

      console.info(`Desktop name is ${e.detail.name}`);
    };

    watch(
        () => props.url,
        (url) => {
          connect();
        }
    );

    onMounted(() => {
      if (props.autoConnect) {
        connect();
      }
    });

    return {
      screen,
      loading,
    };
  },
};
</script>

<template>
  <div
      v-show="!loading"
      ref="screen"
      :style="props.style"
      class="vue-vnc_main"
  ></div>
  <template v-if="loading">
    <slot name="loading">
      <div class="vue-vnc_loading">Loading...</div>
    </slot>
  </template>
</template>

<style scoped>
.vue-vnc_main,
.vue-vnc_loading {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  background-color: #ffffff;
}

.vue-vnc_loading {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
  color: #333333;
}
</style>
