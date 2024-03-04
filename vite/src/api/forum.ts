import request from '../util/request';

//查询所有帖子
export function getForumList() {
  return request({
    url: '/forum/list',
    method: 'get',
  });
}

//查询某个帖子
export function getForumDetail(id) {
  return request({
    url: `/forum/getInfo/${id}`,
    method: 'get',
  });
}
