import request from '../axios/utils/request';

// 获取交易列表
export function getTransactions(page: number, size: number) {
  return request({
    url: '/transaction',
    method: 'get',
    params: {
      page,
      size,
    },
  });
}

// 根据地址获取交易列表
export function getTransactionsByAddress(address: string, page: number, size: number) {
  return request({
    url: `/transaction/address/${address}`,
    method: 'get',
    params: {
      page,
      size,
    },
  });
}

// 根据区块高度获取交易
export function getTransactionsByBlock(blockNumber: string) {
  return request({
    url: `/transaction/block/${blockNumber}`,
    method: 'get',
  });
}

// 根据哈希获取交易
export function getTransactionByHash(txHash: string) {
  return request({
    url: `/transaction/${txHash}`,
    method: 'get',
  });
}
