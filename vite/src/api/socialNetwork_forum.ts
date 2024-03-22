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
//发表帖子
export function addForum(data) {
  return request({
    url: '/forum/save',
    method: 'post',
    data,
  });
}
//根据标签查询帖子
export function getForumsByTag(tag_id) {
  return request({
    url: `/forum/getListByTag/${tag_id}`,
    method: 'get',
  });
}
