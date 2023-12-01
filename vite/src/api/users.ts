// 仅示例
import request from '../util/request';

export function users(data) {
  return request({
    url: '/user/login',
    method: 'post',
    data,
  });
}

export function getInfo(token) {
  return request({
    url: '/user/info',
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
