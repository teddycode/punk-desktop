<script>
import {onBeforeUnmount, onMounted, ref, watch,} from "vue";
import RFB from "@novnc/novnc/core/rfb";

export default {
  name: "VueVnc",
  props: {
    url: {
      type: String,
      required: true,
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
    const rfb = ref(null);
    const connected = ref(props.autoConnect);
    const timeouts = ref([]);
    const eventListeners = ref({});
    const screen = ref(null);
    const loading = ref(true);

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

    onBeforeUnmount(() => {
      disconnect();
    });

    const logger = {
      log: (...args) => {
        if (props.debug) console.log(...args);
      },
      info: (...args) => {
        if (props.debug) console.info(...args);
      },
      error: (...args) => {
        if (props.debug) console.error(...args);
      },
    };

    const getRfb = () => {
      return rfb.value;
    };

    const setRfb = (_rfb) => {
      rfb.value = _rfb;
    };

    const getConnected = () => {
      return connected.value;
    };

    const setConnected = (state) => {
      connected.value = state;
    };

    const _onConnect = () => {
      const rfb = getRfb();
      if (props.onConnect) {
        props.onConnect(rfb);
        loading.value = false;
        return;
      }

      logger.info("Connected to remote VNC.");
      loading.value = false;
    };

    const _onDisconnect = () => {
      const rfb = getRfb();
      if (props.onDisconnect) {
        props.onDisconnect(rfb);
        loading.value = true;
        return;
      }

      const connected = getConnected();
      if (connected) {
        logger.info(
            `Unexpectedly disconnected from remote VNC, retrying in ${
                props.retryDuration / 1000
            } seconds.`
        );

        timeouts.value.push(setTimeout(connect, props.retryDuration));
      } else {
        logger.info(`Disconnected from remote VNC.`);
      }
      loading.value = true;
    };

    const _onCredentialsRequired = () => {
      const rfb = getRfb();
      if (props.onCredentialsRequired) {
        props.onCredentialsRequired(rfb);
        return;
      }

      const password =
          props.rfbOptions?.credentials?.password ?? prompt("请输入密码:");
      rfb?.sendCredentials({password: password});
    };

    const _onDesktopName = (e) => {
      if (props.onDesktopName) {
        props.onDesktopName(e);
        return;
      }

      logger.info(`Desktop name is ${e.detail.name}`);
    };

    const disconnect = () => {
      const rfb = getRfb();
      try {
        if (!rfb) {
          return;
        }

        timeouts.value.forEach(clearTimeout);
        Object.keys(eventListeners.value).forEach((event) => {
          if (eventListeners.value[event]) {
            rfb.removeEventListener(event, eventListeners.value[event]);
            eventListeners.value[event] = undefined;
          }
        });
        rfb.disconnect();
        setRfb(null);
        setConnected(false);

        _onDisconnect();
      } catch (err) {
        logger.error(err);
        setRfb(null);
        setConnected(false);
      }
    };

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
        setRfb(_rfb);

        eventListeners.value.connect = _onConnect;
        eventListeners.value.disconnect = _onDisconnect;
        eventListeners.value.credentialsrequired = _onCredentialsRequired;
        eventListeners.value.securityfailure = props.onSecurityFailure;
        eventListeners.value.clipboard = props.onClipboard;
        eventListeners.value.bell = props.onBell;
        eventListeners.value.desktopname = _onDesktopName;
        eventListeners.value.capabilities = props.onCapabilities;

        Object.keys(eventListeners.value).forEach((event) => {
          if (eventListeners.value[event]) {
            _rfb.addEventListener(event, eventListeners.value[event]);
          }
        });

        setConnected(true);
      } catch (err) {
        logger.error(err);
      }
    };

    return {
      rfb,
      connected,
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
      class="vue-vnc_main"
  ></div>
  <template v-if="loading">
    <slot name="loading">
      <div class="vue-vnc_loading">Loading...</div>
    </slot>
  </template>
</template>

<style scoped>

.vue-vnc_main {
  width: 65%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

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
