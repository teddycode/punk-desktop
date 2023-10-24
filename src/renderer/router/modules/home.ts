import HomePage from "@pages/Home/Home.vue";
import About from "@pages/Home/About.vue";

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

