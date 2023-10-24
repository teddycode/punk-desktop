import SignUp from "@pages/Users/SignUp.vue";
import Login from "@pages/Users/Login.vue";
import InfoPage from '@pages/Users/index.vue';

export const usersRoutes: any[] = [
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

