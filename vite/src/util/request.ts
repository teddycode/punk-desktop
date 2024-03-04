import axios from 'axios';
import message from 'ant-design-vue/es/message';

export const API_PREFIX: string = 'http://127.0.0.1:9090/api'; // local env
// export const API_PREFIX: string = 'http://123.157.213.104:18081/api'; //prod env

const instance = axios.create({
  baseURL: API_PREFIX,
  timeout: 5000,
});

// 请求发送之前的拦截器
instance.interceptors.request.use(
  (config) => {
    // 设置发送之前数据需要做什么处理
    // TODO 携带token
    return config;
  },
  (error) => {
    message.error(error);
    Promise.reject(error);
  },
);

// 设置请求接受拦截器
instance.interceptors.response.use(
  (response) => onResponseHandler(response),
  (error) => onRejectHandler(error),
);

// 请求返回业务代码处理
const onResponseHandler = (response) => {
  const { data } = response;
  if (data.code && data.code === 200) {
    return data;
  }
  message.warn(data.message || 'Response error');
  return Promise.reject(response);
};

// 请求拒绝后的错误处理
const onRejectHandler = (error) => {
  if (error.response) {
    let res = error.response;
    switch (res.status) {
      case 301:
        // store.commit("User/SET_SHOW_LOGIN", true);
        // store.commit("User/SET_USER_INFO", {});
        // store.commit("App/SET_REDIRECT", "/home");
        // localStorage.removeItem("userId");
        message.warn(res.msg || '请先登录');
        break;
      case 400:
        message.warn(res.message || res.msg || '资源不在收藏列表中');
        break;
      case 401:
        // store.commit("User/SET_SHOW_LOGIN", true);
        // store.commit("User/SET_USER_INFO", {});
        // store.commit("App/SET_REDIRECT", "/home");
        // localStorage.removeItem("userId");
        message.warn(res.msg || '请先登录');
        break;
      case 403:
        message.error(res.msg || '权限不足');
        break;
      case 404:
        message.error(res.msg || '请求资源不存在');
        break;
      case 408:
        message.error(res.message || '已经收藏过该视频');
        break;
      case 500:
        message.error(res.msg || '服务器开小差啦');
        break;
      case 504:
        message.error(res.msg || '网络请求失败');
        break;
      default:
        message.error(res.msg || res.statusText);
    }
  } else {
    message.error({
      icon: 'close',
      content: '请检查网络连接状态!',
    });
  }
};

// 将serves抛出去
export default instance;
