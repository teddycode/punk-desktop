import request from '../axios/utils/request';

//查询所有标签
export function getTagList() {
  return request({
    url: '/tag/list',
    method: 'get',
  });
}
//查询top标签
export function getTopTagList(num) {
  return request({
    url: '/tag/top',
    method: 'get',
    params:{num},
  });
}
