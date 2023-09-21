import axios from 'axios';
import Message from "primevue/message";

const service = axios.create({
    url: process.env.VUE_APP_BACK_API_BASE,
    timeout: 15000,
});

service.interceptors.request.use(
    config => {
        return config;
    },
    error => {
        console.log(error);
        return Promise.reject();
    }
);

service.interceptors.response.use(
    response => {
        if (response.status === 200) {
            return response.data;
        } else {
            Promise.reject();
        }
    },
    error => {
        if (error.response) {
            let res = error.response;
            switch (res.status) {
                case 301:
                    // store.commit("User/SET_SHOW_LOGIN", true);
                    // store.commit("User/SET_USER_INFO", {});
                    // store.commit("App/SET_REDIRECT", "/home");
                    localStorage.removeItem("userId");
                    Message.warn(res.msg || "请先登录");
                    break;
                case 400:
                    Message.warn(
                        res.message || res.msg || "资源不在收藏列表中"
                    );
                    break;
                case 401:
                    // store.commit("User/SET_SHOW_LOGIN", true);
                    // store.commit("User/SET_USER_INFO", {});
                    // store.commit("App/SET_REDIRECT", "/home");
                    localStorage.removeItem("userId");
                    Message.warn(res.msg || "请先登录");
                    break;
                case 403:
                    Message.error(res.msg || "权限不足");
                    break;
                case 404:
                    Message.error(res.msg || "请求资源不存在");
                    break;
                case 408:
                    Message.error(res.message || "已经收藏过该视频");
                    break;
                case 500:
                    Message.error(res.msg || "服务器开小差啦");
                    break;
                case 504:
                    Message.error(res.msg || "网络请求失败");
                    break;
                default:
                    Message.error(res.msg || res.statusText);
            }
        } else {
            Toast({
                icon: "close",
                content: "请检查网络连接状态!",
            });
        }
        return Promise.reject();
    }
);

export default service;
