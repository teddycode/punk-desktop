import AppViewPage from "@/views/Desktop/AppView.vue";
import FileEdit from "@/views/Desktop/FileEdit.vue";
import HomePage from "@/views/Desktop/Home.vue";

let desktopRoutes = [
    {
        path: "/index",
        name: "DesktopHomePage",
        component: HomePage,
    },
    {
        path: "/FileEdit",
        name: "FileEdit",
        component: FileEdit,
    },
    {
        path: "/AppView",
        name: "AppView",
        component: AppViewPage,
    },
];

export {desktopRoutes};
