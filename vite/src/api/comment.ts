import request from '../util/request';

//查询帖子所有评论
export function getCommentList(id) {
  return request({
    url: `/comment/list/${id}`,
    method: 'get',
  });
}
