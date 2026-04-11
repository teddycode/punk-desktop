import request from '../axios/utils/request';

export function refreshAccount(address: string) {
  return request({
    url: `/accounts/refresh/${address}`,
    method: 'post',
  });
}

export function getAccountByAddress(address: string) {
  return request({
    url: `/accounts/${address}`,
    method: 'get',
  });
}

export function getAccountBalance(address: string) {
  return request({
    url: `/accounts/${address}/balance`,
    method: 'get',
  });
}

export function getAccountSecurityLevel(address: string) {
  return request({
    url: `/accounts/${address}/security-level`,
    method: 'get',
  });
}
