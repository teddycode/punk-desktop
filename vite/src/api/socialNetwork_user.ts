import request from '../util/request';

//查询所有用户
export function getUserList() {
  return request({
    url: '/user/list',
    method: 'get',
  });
}
//查询某个用户详细信息
export function getUserDetail(id) {
  return request({
    url: `/user/getInfo/${id}`,
    method: 'get',
  });
}

