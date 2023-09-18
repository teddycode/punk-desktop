import HomePage from "@/views/Home/Home.vue";
import About from "@/views/Home/About.vue";

let homeRoutes = [
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

export {homeRoutes};
