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

//用户点赞
export function userLove(userId, forumId) {
  return request({
    url: '/love/userLove',
    method: 'put',
    params:{userId, forumId},
  });
}
//用户收藏
export function userCollect(userId, forumId) {
  return request({
    url: '/collect/userCollect',
    method: 'put',
    params:{userId, forumId},
  });
}
//用户关注
export function userFollow(userId, followId) {
  return request({
    url: '/follower/follow',
    method: 'post',
    params:{userId, followId},
  });
}
