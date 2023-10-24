import AppViewPage from "@pages/Desktop/AppView.vue";
import FileEdit from "@pages/Desktop/FileEdit.vue";
import HomePage from "@pages/Desktop/Home.vue";

export const desktopRoutes = [
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

