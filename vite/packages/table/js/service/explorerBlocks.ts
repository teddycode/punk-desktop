import request from '../axios/utils/request';

// 获取区块列表
export function getBlocks(page: number, size: number) {
  return request({
    url: '/blocks',
    method: 'get',
    params: {
      page,
      size,
    },
  });
}

// 根据哈希获取区块
export function getBlockByHash(blockHash: string) {
  return request({
    url: `/blocks/hash/${blockHash}`,
    method: 'get',
  });
}

// 获取最新区块
export function getLatestBlock() {
  return request({
    url: '/blocks/latest',
    method: 'get',
  });
}

// 根据区块号获取区块
export function getBlockByNumber(blockNumber: string) {
  return request({
    url: `/blocks/${blockNumber}`,
    method: 'get',
  });
}
