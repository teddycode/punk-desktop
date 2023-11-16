import BrowserIndex from '@page/app/browser/Index.vue';
import BrowserTabs from '@page/app/browser/Tabs.vue';

export default [
    {
        path: '',
        name: 'browser',
        component: BrowserIndex
    },
    {
        path: '/tabs',
        name: 'browserTabs',
        component: BrowserTabs
    }
]
