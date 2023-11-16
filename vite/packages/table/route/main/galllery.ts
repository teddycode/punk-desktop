import Bing from "@page/gallery/Bing.vue";
import Wallheaven from "@page/gallery/Wallheaven.vue";
import PickingPaper from "@page/gallery/Picking.vue";
import Lively from "@page/gallery/Lively.vue";
import PapersSetting from "@page/gallery/Setting.vue";
import My from "@page/gallery/My.vue";

export default [
    {
        path: "",
        name: "my",
        component: My,
    },
    {
        path: "",
        name: "bing",
        component: Bing,
    },
    {
        path: "",
        name: "wallheaven",
        component: Wallheaven,
    },
    {
        path: "",
        name: "pickingPaper",
        component: PickingPaper,
    },
    {
        path: "",
        name: "lively",
        component: Lively,
    },
    {
        path: "",
        name: "papersSetting",
        component: PapersSetting,
    },
]
