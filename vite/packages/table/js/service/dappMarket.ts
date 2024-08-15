import request from '../axios/utils/request';

//查询某个dapp
export function getDappDetail(id) {
  return request({
    url: `/dDappinfo/getInfo/${id}`,
    method: 'get',
  });
}

export function getDapplist(pageNum,pageSize,chain,name){
  return request({
    url:'/dDappinfo/page',
    method: 'get',
    params: {pageNum,pageSize,chain,name}
  });
}

export function getisLiked(userId,dappId){
  return request({
    url:'/dLove/isLiked',
    method: 'get',
    params: {userId,dappId}
  });
}

export function dappLiked(userId,dappId){
  return request({
    url:'/dLove/dappLove',
    method: 'put',
    params: {userId,dappId}
  });
}

export function getisCollected(userId,dappId){
  return request({
    url:'/dCollect/isCollected',
    method: 'get',
    params: {userId,dappId}
  });
}

export function dappCollect(userId,dappId){
  return request({
    url:'/dCollect/dappCollect',
    method: 'put',
    params: {userId,dappId}
  });
}

export function getUserCollects(userId){
  return request({
    url:`/dCollect/getUserCollects/${userId}`,
    method: 'get',
  });
}

export function submitdapp(data){
  return request({
    url:'/dDappinfo/save',
    method: 'post',
    data
  });
}

export function getUserDapps(userId,state){
  return request({
    url:'/dDappinfo/getUserDapps',
    method: 'get',
    params: {userId,state}
  });
}
