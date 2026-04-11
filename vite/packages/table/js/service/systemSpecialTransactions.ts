import request from '../axios/utils/request';

// 系统特殊交易：账户锁定
export function postAccountLockTransaction(payload: {
  addresses: string[];
  privateKey?: string;
  to?: string;
  gasLimit?: number | string;
  gasPrice?: number | string;
}) {
  return request({
    url: '/v1/transactions/account/lock',
    method: 'post',
    data: payload,
    headers: { 'Content-Type': 'application/json' },
  });
}

// 系统特殊交易：账户解锁
export function postAccountUnlockTransaction(payload: {
  addresses: string[];
  privateKey?: string;
  to?: string;
  gasLimit?: number | string;
  gasPrice?: number | string;
}) {
  return request({
    url: '/v1/transactions/account/unlock',
    method: 'post',
    data: payload,
    headers: { 'Content-Type': 'application/json' },
  });
}

