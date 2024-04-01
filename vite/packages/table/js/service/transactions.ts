// 仅示例
import request from '../axios/utils/request';
import { PageParams } from './typing';
//  获取交易的分页列表
export function PostTransactionPageList(userId: number, address: string = null, data: PageParams) {
  return request({
    url: '/transactions/page',
    method: 'post',
    params: {
      userId: userId,
      address: address,
      ...data,
    },
  });
}

// 获取交易的统计数据
export function GetForTransactionStatus(userId: number, addr: string = null) {
  return request({
    url: '/transactions/status',
    method: 'get',
    params: {
      userId: userId,
      address: addr,
    },
  });
}
