import {defineStore} from 'pinia';

export const useBaseStore = defineStore({
    id: 'baseboard',
    state: () => ({
        openedPages: [] as any[],
        currentPage: '',
        tagsList: [] as any[],
        collapse: false,
    }),
    actions: {
        addOpenedPage(page: any) {
            this.openedPages.push(page);
        },
        removeOpenedPage(index: number) {
            this.openedPages.splice(index, 1);
        },
        setCurrentPage(page: string) {
            this.currentPage = page;
        },
        delLastTag(index: number) {
            this.tagsList.splice(index, 1);
        },
        addTagItem(data: any) {
            this.tagsList.push(data);
        },
        clearAllTags() {
            this.tagsList = [];
        },
        closeTagsOther(data: any[]) {
            this.tagsList = data;
        },
        closeCurrentTag(route: any, router: any) {
            for (let i = 0, len = this.tagsList.length; i < len; i++) {
                const item = this.tagsList[i];
                if (item.path === route.fullPath) {
                    if (i < len - 1) {
                        router.push(this.tagsList[i + 1].path);
                    } else if (i > 0) {
                        router.push(this.tagsList[i - 1].path);
                    } else {
                        router.push('/');
                    }
                    this.tagsList.splice(i, 1);
                    break;
                }
            }
        },
        setCollapse(data: boolean) {
            this.collapse = data;
        }
    }
});
