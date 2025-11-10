import { getConfig } from '../axios/serverApi';
import request from '../axios/utils/request';

// 获取当前用户的权限设置
export function getCurrentUserPermissions() {
  return request({
    url: '/user-permissions/current',
    method: 'get',
  });
}

// 更新当前用户的权限设置（包含角色与各功能开关）
export function updateCurrentUserPermissions(payload: Record<string, any>) {
  return request({
    // 文档要求：POST /user-permissions/current
    url: '/user-permissions/current',
    method: 'post',
    data: payload,
  });
}

// 为指定用户创建默认的权限设置（可选角色）
export function createDefaultUserPermissions(userId: number | string, role?: string) {
  const data: Record<string, any> = { userId };
  if (role) data.role = role;
  return request({
    // 文档要求：POST /user-permissions/create-default/{userId}?userRole=xxx
    url: `/user-permissions/create-default/${userId}`,
    method: 'post',
    params: role ? { userRole: role } : {},
  });
}