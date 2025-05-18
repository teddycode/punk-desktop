// 仅示例
import request from '../axios/utils/request';
import { PageParams } from './typing';
//  获取钱包分页列表
export function PostWalletPageList(data: PageParams) {
  return request({
    url: '/wallets/page',
    method: 'post',
    params: data,
  });
}

// 获取钱包统计数据
export function GetForWalletStatus(id: number) {
  return request({
    url: '/wallets/status',
    method: 'get',
    params: { id: id },
  });
}

// 更新钱包信息
export function PutForWalletInfo(data: any) {
  return request({
    url: '/wallets/info',
    method: 'put',
    data: data,
  });
}


// 获取质押信息
export function GetAccountPledge(address: string) {
  return request({
    url: '/wallets/pledge',
    method: 'get',
    params: { address: address },
  });
}