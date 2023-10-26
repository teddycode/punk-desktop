import HomePage from "@pages/DashBoard/Home.vue";
import About from "@pages/DashBoard/About.vue";

export const homeRoutes = [
  {
    path: "/home",
    name: "HomePage",
    component: HomePage,
  },
  {
    path: "/about",
    name: "AboutPage",
    component: About,
  },
];

