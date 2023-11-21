import request from '../util/request';

export const getAllBlock = (query) => {
  console.log('get block list');
  return request({
    url: '/consensus/block/list',
    method: 'get',
    params: query,
  })
}

export const getBlockByHeight = (query) => {
  console.log('get a block by height');
  return request({
    url: '/consensus/block/byHeight',
    method: 'get',
    params: query,
  })
}

export const getBlockByHash = (query) => {
  console.log('get a block by hash');
  return request({
    url: '/consensus/block/byHash',
    method: 'get',
    params: query,
  })
}

export const getMicBlockByHeight = (query) => {
  console.log('get a micro block by height');
  return request({
    url: '/consensus/block/mic/byHeight',
    method: 'get',
    params: query,
  })
}

export const getMicBlockByHash = (query) => {
  console.log('get a micro block by hash');
  return request({
    url: '/consensus/block/mic/byHash',
    method: 'get',
    params: query,
  })
}

export const getMyBlock = (query) => {
  console.log('get my block');
  return request({
    url: '/consensus/block/mine',
    method: 'get',
    params: query,
  })
}

export const getMyMicBlock = (query) => {
  console.log('get my micro block');
  return request({
    url: '/consensus/block/mic/mine',
    method: 'get',
    params: query,
  })
}



