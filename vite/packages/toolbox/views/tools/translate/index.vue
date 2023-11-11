<template>
  <div class="h-full flex flex-col">
    <div class="flex justify-between mb-3">
      <div class="flex items-center w-full pr-3">
        <!-- 被翻译源 -->
        <a-dropdown>
          <template #overlay>
            <div
                class="xt-bg-2 xt-border xt-text flex flex-wrap rounded-xl p-2 xt-shadow"
                style="width: 520px"
            >
              <div
                  v-for="item in lang"
                  :class="{ 'xt-theme-text': fromLang.lang == item.lang }"
                  class="p-2 cursor-pointer"
                  style="width: 100px"
                  @click="fromLang = item"
              >
                {{ item.name }}
              </div>
            </div>
          </template>
          <XtButton
              btnClass=" flex justify-between px-4"
              class="flex-1"
              icon="xiangxia"
              iconPosition="postfix"
          >{{ fromLang.name }}
          </XtButton
          >
        </a-dropdown>
        <!-- 交换 -->
        <XtIcon
            icon="paixu"
            style="transform: rotate(90deg)"
            type=""
            @click="translateSwitch()"
        ></XtIcon>
        <!-- 翻译 -->
        <a-dropdown>
          <template #overlay>
            <div
                class="xt-bg-2 xt-border xt-text flex flex-wrap rounded-xl p-2 xt-shadow"
                style="width: 520px"
            >
              <div
                  v-for="item in lang.slice(1)"
                  :class="{ 'xt-theme-text': toLang.lang == item.lang }"
                  class="p-2 cursor-pointer"
                  style="width: 100px"
                  @click="toLang = item"
              >
                {{ item.name }}
              </div>
            </div>
          </template>
          <XtButton
              btnClass=" flex justify-between px-4"
              class="flex-1"
              icon="xiangxia"
              iconPosition="postfix"
          >{{ toLang.name }}
          </XtButton
          >
        </a-dropdown>
      </div>
      <div>
        <XtButton type="theme" @click="translate()">翻译</XtButton>
      </div>
    </div>
    <div class="flex flex-grow justify-between">
      <XtTextarea
          v-model:data="inputValue"
          class="h-full"
          placeholder="请输入"
          style="width: 49%"
      ></XtTextarea>
      <XtTextarea
          v-model:data="resultValue"
          class="h-full"
          style="width: 49%"
      ></XtTextarea>
    </div>
  </div>
</template>

<script>
import {translate} from "../../../store/translate";
import {mapActions, mapWritableState} from "pinia";
import {message} from "ant-design-vue";
import {lang} from "./lang";

export default {
  data() {
    return {
      lang,
    };
  },
  beforeRouteLeave(to, from, next) {
    this.inputValue = "";
    this.resultValue = "";
    this.selectLang = this.lang[1];
    next();
  },
  computed: {
    ...mapWritableState(translate, [
      "fromLang",
      "toLang",
      "inputValue",
      "resultValue",
    ]),
  },
  methods: {
    ...mapActions(translate, ["startTranslation"]),
    translateSwitch() {
      if (this.fromLang.lang === "auto") {
        message.warn("自动检测无法切换");
        return;
      }
      [this.toLang, this.fromLang] = [this.fromLang, this.toLang];
    },
    async translate() {
      this.startTranslation();
    },
  },
};
</script>

<style lang="scss" scoped></style>
