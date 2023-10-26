import HomePage from "@pages/DashBorad/Home.vue";
import About from "@pages/DashBorad/About.vue";

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

