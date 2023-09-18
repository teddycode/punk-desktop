import SignUp from "@/views/Users/SignUp.vue";
import Login from "@/views/Users/Login.vue";
import InfoPage from '@/views/Users/index.vue';

let usersRoutes = [
    {
        path: "/index",
        name: "UserInfoPage",
        component: InfoPage,
    },
    {
        path: "/signup",
        name: "UserSignPage",
        component: SignUp,
    },
    {
        path: "/login",
        name: "UserLoginPage",
        component: Login,
    },
];

export {usersRoutes};
