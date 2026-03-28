import request from '../axios/utils/request';

//查询某个dapp
export function getDappDetail(id) {
  return request({
    url: `/dDappinfo/getInfo/${id}`,
    method: 'get',
  });
}

export function getDapplist(pageNum, pageSize, chain, name) {
  return request({
    url: '/dDappinfo/page',
    method: 'get',
    params: { pageNum, pageSize, chain, name }
  });
}

export function getisLiked(userId, dappId) {
  return request({
    url: '/dLove/isLiked',
    method: 'get',
    params: { userId, dappId }
  });
}

export function dappLiked(userId, dappId) {
  return request({
    url: '/dLove/dappLove',
    method: 'put',
    params: { userId, dappId }
  });
}

export function getisCollected(userId, dappId) {
  return request({
    url: '/dCollect/isCollected',
    method: 'get',
    params: { userId, dappId }
  });
}

export function dappCollect(userId, dappId) {
  return request({
    url: '/dCollect/dappCollect',
    method: 'put',
    params: { userId, dappId }
  });
}

export function getUserCollects(userId) {
  return request({
    url: `/dCollect/getUserCollects/${userId}`,
    method: 'get',
  });
}

export function submitdapp(data) {
  return request({
    url: '/dDappinfo/save',
    method: 'post',
    data
  });
}

export function getUserDapps(userId, state) {
  return request({
    url: '/dDappinfo/getUserDapps',
    method: 'get',
    params: { userId, state }
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
    params: { userId },
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
export function addDappCard(userId, dappId) {
  return request({
    url: '/dDesk/addDappCard',
    method: 'get',
    params: { userId, dappId }
  });
}

//删除桌面小程序
export function delDappCard(userId, dappId) {
  return request({
    url: '/dDesk/removeDappCard',
    method: 'delete',
    params: { userId, dappId }
  });
}

//查询是否已添加该dapp到桌面
export function getisAdded(userId, dappId) {
  return request({
    url: '/dDesk/isAdded',
    method: 'get',
    params: { userId, dappId }
  });
}

// ==================== 智能合约相关接口 ====================

//分页查询智能合约列表
export function getContractList(pageNum, pageSize, category, name) {
  return request({
    url: '/dContract/page',
    method: 'get',
    params: { pageNum, pageSize, category, name }
  });
}

//根据合约地址查询合约详情
export function getContractDetail(address) {
  return request({
    url: `/dContract/getByAddress/${address}`,
    method: 'get',
  });
}

//查询合约的关联合约列表
export function getRelatedContracts(address) {
  return request({
    url: `/dContract/getRelated/${address}`,
    method: 'get',
  });
}

// ==================== 质押投资相关接口 ====================

//提交质押投资
export function submitStaking(data) {
  return request({
    url: '/dStaking/submit',
    method: 'post',
    data
  });
}

//查询用户的所有投资记录
export function getUserStakings(userId, status) {
  return request({
    url: '/dStaking/getUserStakings',
    method: 'get',
    params: { userId, status }
  });
}

//查询质押详情
export function getStakingDetail(stakingId) {
  return request({
    url: `/dStaking/getDetail/${stakingId}`,
    method: 'get',
  });
}

//退出质押
export function withdrawStaking(stakingId) {
  return request({
    url: '/dStaking/withdraw',
    method: 'post',
    data: { stakingId }
  });
}

//查询质押收益记录
export function getStakingRevenue(stakingId, pageNum, pageSize) {
  return request({
    url: '/dStaking/getRevenue',
    method: 'get',
    params: { stakingId, pageNum, pageSize }
  });
}

//查询质押收益趋势数据
export function getStakingTrend(stakingId, period) {
  return request({
    url: '/dStaking/getTrend',
    method: 'get',
    params: { stakingId, period }
  });
}

// ==================== 扩展的 DApp 数据接口 ====================

//查询 DApp 的扩展信息（质量等级、访问量、质押等）
export function getDappExtendedInfo(dappId) {
  return request({
    url: `/dDappinfo/getExtendedInfo/${dappId}`,
    method: 'get',
  });
}

//增加 DApp 访问量
export function incrementDappVisit(dappId) {
  return request({
    url: '/dDappinfo/incrementVisit',
    method: 'post',
    data: { dappId }
  });
}
