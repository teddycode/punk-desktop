<template>
  <!-- 快速搜索 分屏 -->
  <div
      style="
      height: 100%;
      display: flex;
      justify-content: center;
      align-content: center;
      flex-direction: column;
    "
  >
    <div
        class="p-3 rounded-md mt-3"
        style="
        background: #111;
        border: 1px solid #333;
        background-color: var(--primary-bg);
        color: var(--primary-text);
      "
        @click.stop
    >
      <div
          v-for="screen in screens"
          :class="{
          die: !screen.running && screen.key !== 'main',
          active: screen.active,
        }"
          class="pointer screen rounded-md mb-2"
          style="display: inline-block; position: relative"
          @click="click(screen)"
          @dblclick="dblclick(screen)"
      >
        <a-image
            v-if="screen.key !== 'main'"
            :height="70"
            :preview="false"
            :src="'file://' + screen.capture"
            :width="120"
            class="screen-preview"
            fallback="/public/icons/main.png"
        ></a-image>
        <a-image
            v-else
            :height="70"
            :preview="false"
            :width="120"
            class="screen-preview"
            fallback="/public/icons/logo128.png"
            src="/public/icons/main.png"
        ></a-image>
        <span v-if="screen.key !== 'main'" class="p-2 screen-title" style="">{{
            screen.title
          }}</span>
        <span
            v-else
            class="p-2 screen-title"
            style="
            left: 50%;
            top: 50%;
            font-size: 24px;
            width: 100px;
            transform: translateY(-60%) translateX(-50%);
            text-align: center;
            line-height: 30px;
            border-radius: 4px;
            background: none;
          "
        >{{ screen.title }}</span
        >
      </div>
      <div class="text-right">
        <a-button
            class="mr-3 no-dark"
            style="color: var(--primary-text)"
            @click="addScreen"
        >创建
        </a-button
        >
        <a-button style="color: var(--primary-text)" @click="tagScreen"
        >辨别
        </a-button
        >
      </div>
    </div>
    <div class="p-3" @click.stop>
      <div class="line-title text-center" style="font-size: 24px">
        <span
            v-if="!editing"
            :style="{ cursor: currentScreen.key !== 'main' ? 'text' : '' }"
            @click="toggleEdit"
        ><edit-outlined v-if="currentScreen.key !== 'main'"/>
          {{ currentScreen.title }}</span
        >
        <a-input-group v-else compact size="large">
          <a-input
              v-model:value="newTitle"
              placeholder="Enter确认"
              style="width: calc(100% - 200px)"
              @keyup.esc="toggleEdit"
              @keyup.enter="setTitle"
          ></a-input>
          <a-button size="large" @click="toggleEdit">取消</a-button>
        </a-input-group>
      </div>
      <template v-if="currentScreen.key !== 'main'">
        <a-row :gutter="[20, 20]" style="font-size: 1.2em; text-align: center">
          <a-col :span="5">
            <div class="btn relative">
              <a-switch
                  v-model:checked="currentScreen.running"
                  @change="toggleScreen"
              ></a-switch>
              <div class="mt-3">启用分屏</div>
            </div>
          </a-col>
          <a-col v-if="currentScreen.settings" :span="5">
            <div class="btn relative">
              <a-switch
                  v-model:checked="currentScreen.settings.autoRun"
              ></a-switch>
              <div class="mt-3">自启动</div>
            </div>
          </a-col>
          <a-col :span="5">
            <div class="btn" @click="restore">
              <Icon icon="huanyuan" style="font-size: 2em"></Icon>
              <div>重置缩放</div>
            </div>
          </a-col>

          <a-col v-if="false" :span="4">
            <div class="btn" @click="setTouch">
              <Icon icon="Touch" style="font-size: 2em"></Icon>
              <div>设置屏幕</div>
            </div>
          </a-col>
          <a-col :span="4">
            <div class="btn" @click="remove">
              <Icon icon="shanchu" style="font-size: 2em"></Icon>
              <div>删除屏幕</div>
            </div>
          </a-col>
        </a-row>
      </template>
    </div>
  </div>
</template>

<script>
import {mapActions, mapWritableState} from "pinia";
import {screenStore} from "../../store/screen";
import {EditOutlined} from "@ant-design/icons-vue";
import {mainIPC} from "../../js/common/screenIPC";
import {Modal} from "ant-design-vue";

export default {
  name: "ScreenManage",
  data() {
    return {
      currentScreen: {},
      editing: false,
      newTitle: "",
    };
  },
  components: {EditOutlined},
  computed: {
    ...mapWritableState(screenStore, ["screens"]),
  },

  mounted() {
    this.screens.forEach((s) => {
      if (!s.settings) {
        s.settings = {};
      }
    });
    this.screens.map((s) => {
      if (s.active) {
        this.currentScreen = s;
      }
    });
  },
  methods: {
    ...mapActions(screenStore, [
      "startupScreen",
      "tagScreen",
      "stopScreen",
      "add",
    ]),
    addScreen() {
      let s = this.add();
      this.select(s.key);
    },
    toggleScreen(checked) {
      if (checked) {
        this.startupScreen(this.currentScreen.key);
      } else {
        this.stopScreen(this.currentScreen.key);
        this.currentScreen.running = false;
      }
    },
    toggleEdit() {
      if (this.currentScreen.key === "main") return;
      this.editing = !this.editing;
      if (this.editing) {
        this.newTitle = "";
      }
    },
    setTitle() {
      this.currentScreen.title = this.newTitle;
      this.toggleEdit();
      mainIPC.sendToSub(this.currentScreen.key, "updateDetail", {
        detail: JSON.parse(JSON.stringify(this.currentScreen)),
      });
    },
    dblclick(screen) {
      if (screen.key !== "main") this.startupScreen(screen.key);
    },
    restore() {
      mainIPC.sendToSub(this.currentScreen.key, "restore");
    },
    select(key) {
      this.screens.map((s) => {
        s.active = false;
        if (s.key === key) {
          this.currentScreen = s;
          s.active = true;
        }
      });
    },
    remove() {
      Modal.confirm({
        centered: true,
        content:
            "确认删除分屏？此操作不可恢复，将丢失分屏全部的设置，请谨慎操作。",
        onOk: () => {
          this.screens.splice(
              this.screens.findIndex((s) => {
                return s.key === this.currentScreen.key;
              }),
              1
          );
          this.select("main");
        },
        okText: "确认删除",
      });
    },
    click(screen) {
      this.currentScreen = screen;
      this.screens.forEach((s) => {
        s.active = false;
      });
      screen.active = true;
    },
  },
};
</script>
<style lang="scss">
.btn {
  background: var(--mask-item-background-color);
  color: var(--font-color);
}

.screen.die {
  .ant-image-img {
    filter: grayscale(100%);
  }

  opacity: 0.7;
}

.screen {
  .ant-image-img {
    object-fit: cover;
    width: 120px !important;
    border-radius: 4px;
    height: 70px !important;
  }
}
</style>
<style lang="scss" scoped>
.screen {
  opacity: 0.7;
  border: #343434 2px solid;
  margin-right: 1em;
  background: #1c1c1c;
  cursor: pointer;

  &:hover {
    border: rgba(255, 255, 255, 0.56) 2px solid;
    opacity: 0.9;
  }
}

.screen.active {
  border: white 2px solid;
  opacity: 1;
}

.screen-title {
  position: absolute;
  bottom: 0;
  right: 0;
  color: white;
  background: rgba(51, 51, 51, 0.6);
  padding-top: 3px;
  padding-bottom: 3px;
  font-size: 13px;
}
</style>
