import ShortcutKeyRoute from "../../apps/shortcutKey/route";
//应用
import TomatoStart from '@page/app/tomato/TomatoStart.vue'
import Tomato from '@page/app/tomato/Tomato.vue'
/*待办*/
import Todo from '@page/app/todo/App.vue'
import DeckAdd from "../../apps/deck/DeckAdd.vue";
import DeckIndex from "../../apps/deck/DeckIndex.vue";
import Clipboard from "../../apps/clipboard/page/Clipboard.vue"
import WorkDesk from '@page/work/Desk.vue'
/*便签*/
import Note from '../../apps/note/index.vue'
import AIAssistant from "@page/AIAssistant/index.vue"
import DeckHome from "../../apps/deck/DeckHome.vue";

export default [
    {
        path: '/Note',
        name: 'note',
        component: Note,
        meta: {
            tab1: 'work',
            tab2: 'note'
        }
    },
    {
        path: "/deck",
        name: "deckIndex",
        component: DeckIndex,
        children: [
            {
                path: '',
                name: 'deck',
                component: DeckHome,
                meta: {
                    tab1: 'work',
                    tab2: 'deck'
                }
            },
            {
                path: "/add",
                name: 'deckAdd',
                component: DeckAdd
            }
        ]
    },
    {
        path: '/TomatoStart',
        name: 'tomatoStart',
        component: TomatoStart
    },

    {
        path: '/Tomato',
        name: 'tomato',
        component: Tomato
    },
    {
        path: '/desk',
        name: 'workDesk',
        component: WorkDesk,
        meta: {
            tab1: 'work',
            tab2: 'workDesk'
        }
    },
    {
        path: "/ai",
        name: "ai",
        component: AIAssistant,
        meta: {
            tab1: 'work',
            tab2: 'ai'
        }
    },
    {
        path: '/clipboard',
        name: 'clipboard',
        component: Clipboard,
        meta: {
            tab1: 'work',
            tab2: 'clipboard'
        }
    },
    ShortcutKeyRoute,
    {
        path: "/todo",
        name: "todo",
        component: Todo,
        meta: {
            tab1: 'work',
            tab2: 'todo'
        }
    }
]
