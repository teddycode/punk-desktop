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

//dapp评论模块
//查询dapp所有评论
export function getDappCommentList(id) {
  return request({
    url: `/dComment/list/${id}`,
    method: 'get',
  });
}
//发表评论
export function addDappComent(data) {
  return request({
    url: '/dComment/save',
    method: 'post',
    data,
  });
}
//dapp评分模块
//查询dapp评分
export function getDappRatingInfo(dappId, userId) {
  return request({
    url: `/dRating/getRatingInfo/${dappId}`,
    method: 'get',
    params: {userId},
  });
}
//发表评分
export function addDappRating(data) {
  return request({
    url: '/dRating/save',
    method: 'post',
    data,
  });
}

//dapp桌面模块
//查询用户dapp桌面
export function getUserDesk(userId) {
  return request({
    url: `/dDesk/getUserDesk/${userId}`,
    method: 'get',
  });
}
//添加桌面小程序
export function addDappCard(userId,dappId){
  return request({
    url:'/dDesk/addDappCard',
    method: 'get',
    params: {userId,dappId}
  });
}
//查询是否已添加该dapp到桌面
export function getisAdded(userId,dappId){
  return request({
    url:'/dDesk/isAdded',
    method: 'get',
    params: {userId,dappId}
  });
}
