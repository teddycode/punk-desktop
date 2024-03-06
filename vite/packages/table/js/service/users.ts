// 仅示例
import request from '../axios/utils/request';

export function PostForAuthReq(data) {
  return request({
    url: '/users/login/auth',
    method: 'post',
    params: data,
  });
}

export function getInfo(token) {
  return request({
    url: '/users/info',
    method: 'get',
    params: { token },
  });
}

export function message() {
  return request({
    url: '/test/message',
    method: 'post',
  });
}

// 获取登录的随机数值
export function GetForLoginNonce(address: string) {
  return request({
    url: '/users/login/nonce',
    method: 'get',
    params: { address: address },
  });
}
