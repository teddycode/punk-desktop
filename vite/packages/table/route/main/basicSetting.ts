import Key from "@page/settings/Key.vue";
import Common from "@page/settings/Common.vue";
import BrowserSetting from "@page/settings/Browser.vue";
import Subscreen from "@page/settings/Subscreen.vue";
import BarrageSetting from "@page/settings/BarrageSetting.vue";

export default [
  {
    path: "",
    name: "common",
    component: Common,
  },
  {
    path: "/key",
    name: "key",
    component: Key,
  },
  {
    path: "/browser",
    name: "browserSetting",
    component: BrowserSetting,
  },
  {
    path: "/subscreen",
    name: "subscreen",
    component: Subscreen,
  },
  {
    path: "/barrage",
    name: "barrageSetting",
    component: BarrageSetting,
  },
]
