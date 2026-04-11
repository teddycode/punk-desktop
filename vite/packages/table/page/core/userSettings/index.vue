<template>
  <div class="user-settings">
    <div class="page-header">
      <div class="title-group">
        <h2 class="page-title">角色与功能权限设置</h2>
        <p class="page-sub">根据角色显示可用功能，直接开关启用。</p>
      </div>
      <div class="role-select">
        <a-select v-model:value="selectedRole" @change="handleRoleChange" placeholder="请选择角色" style="width: 240px;" size="middle">
          <a-select-option v-for="role in rolesOptions" :key="role.value" :value="role.value">
            {{ role.label }}
          </a-select-option>
        </a-select>
      </div>
    </div>

    <div class="feature-grid" :style="gridStyle">
      <a-card v-for="item in visibleFeatures" :key="item.key" hoverable class="feature-card" :class="cardClass" :style="cardStyle">
        <template #title>
          <div class="card-title">
            <span class="icon">
              <component :is="icons[item.key]" />
            </span>
            <span class="label">{{ item.label }}</span>
          </div>
        </template>
        <template #extra>
          <a-switch v-model:checked="permissionState[item.key]" />
        </template>
        <div class="desc">{{ featureDescriptions[item.key] }}</div>
      </a-card>
    </div>

    <div class="footer-actions">
      <a-button type="primary" class="save-btn" @click="savePermissions">
        <template #icon><SaveOutlined /></template>
        保存设置
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import {
  SwapOutlined,
  StockOutlined,
  CloudServerOutlined,
  ClusterOutlined,
  DatabaseOutlined,
  KeyOutlined,
  GlobalOutlined,
  AuditOutlined,
  SearchOutlined,
  DeploymentUnitOutlined,
  AppstoreOutlined,
  SaveOutlined,
} from '@ant-design/icons-vue';
import { getCurrentUserPermissions, updateCurrentUserPermissions, createDefaultUserPermissions } from '@js/service/usersetting';
import { getConfig } from '@js/axios/serverApi';
import { useUserStore } from '@table/store/users';
import { comStore } from '@table/store/com';

const rolesOptions = [
  { label: '管理员 (admin)', value: 'admin' },
  { label: '矿工 (miner)', value: 'miner' },
  { label: '开发者 (developer)', value: 'developer' },
  { label: '普通用户 (user)', value: 'user' },
];

const features = [
  { key: 'transfer_enabled', label: '转账功能' },
  { key: 'trading_enabled', label: '交易功能' },
  { key: 'computing_enabled', label: '计算功能' },
  { key: 'consensus_enabled', label: '共识功能' },
  { key: 'storage_enabled', label: '存储功能' },
  { key: 'crypto_enabled', label: '密码功能' },
  { key: 'network_enabled', label: '网络功能' },
  { key: 'governance_enabled', label: '治理功能' },
  { key: 'blockchain_explorer_enabled', label: '区块链浏览器' },
  { key: 'node_management_enabled', label: '节点管理' },
  { key: 'app_market_enabled', label: '应用市场' },
];

const roleFeatureMap: Record<string, string[]> = {
  admin: features.map(f => f.key),
  miner: [
    'transfer_enabled', 'trading_enabled', 'computing_enabled', 'consensus_enabled',
    'crypto_enabled', 'network_enabled', 'blockchain_explorer_enabled', 'node_management_enabled', 'app_market_enabled'
  ],
  developer: [
    'transfer_enabled', 'trading_enabled', 'computing_enabled', 'consensus_enabled', 'storage_enabled',
    'crypto_enabled', 'network_enabled', 'blockchain_explorer_enabled', 'node_management_enabled', 'app_market_enabled'
  ],
  user: [
    'transfer_enabled', 'trading_enabled', 'crypto_enabled', 'blockchain_explorer_enabled', 'app_market_enabled'
  ],
};

const icons: Record<string, any> = {
  transfer_enabled: SwapOutlined,
  trading_enabled: StockOutlined,
  computing_enabled: CloudServerOutlined,
  consensus_enabled: ClusterOutlined,
  storage_enabled: DatabaseOutlined,
  crypto_enabled: KeyOutlined,
  network_enabled: GlobalOutlined,
  governance_enabled: AuditOutlined,
  blockchain_explorer_enabled: SearchOutlined,
  node_management_enabled: DeploymentUnitOutlined,
  app_market_enabled: AppstoreOutlined,
};

const featureDescriptions: Record<string, string> = {
  transfer_enabled: '转账资产、支付与资金划转相关能力',
  trading_enabled: '撮合交易、订单管理与市场相关工具',
  computing_enabled: '计算资源与作业调度，可用于任务运行',
  consensus_enabled: '参与或配置共识流程与相关策略',
  storage_enabled: '对象与文件存储，数据持久化能力',
  crypto_enabled: '密钥与签名、哈希等密码学能力',
  network_enabled: '网络连接、节点通讯与服务暴露',
  governance_enabled: '治理与配置管理、制度策略相关',
  blockchain_explorer_enabled: '链上数据浏览与区块、交易查询',
  node_management_enabled: '节点运行维护、监控与管理工具',
  app_market_enabled: '应用市场与插件扩展、模块安装',
};

const selectedRole = ref<string>('user');

const permissionState = reactive(
  features.reduce((acc, f) => {
    acc[f.key] = false;
    return acc;
  }, {} as Record<string, boolean>)
);

const visibleFeatures = computed(() => {
  // 普通用户、矿工、开发者也显示所有功能；其他角色按角色映射展示
  if (['user', 'miner', 'developer'].includes(selectedRole.value)) {
    return features;
  }
  const allowed = new Set(roleFeatureMap[selectedRole.value] || []);
  return allowed.size ? features.filter((f) => allowed.has(f.key)) : features;
});

// user 角色：采用三列居中、固定卡片宽度，保持形状不变
const gridStyle = computed(() => {
  // 统一页面布局，所有角色使用相同的自适应网格
  const gap = 16;
  const count = visibleFeatures.value.length;
  let minWidth = 280;
  if (count <= 3) minWidth = 340;
  else if (count <= 6) minWidth = 320;
  return {
    display: 'grid',
    gridTemplateColumns: `repeat(auto-fit, minmax(${minWidth}px, 1fr))`,
    gap: `${gap}px`,
    alignContent: 'start',
  } as Record<string, string>;
});

// user 角色固定卡片宽度，不变形
const cardStyle = computed(() => {
  // 统一卡片样式，去除普通用户的固定宽度特殊处理
  return {} as Record<string, string>;
});

const cardClass = computed(() => {
  const count = visibleFeatures.value.length;
  if (count <= 3) return 'feature-card-large';
  if (count <= 6) return 'feature-card-medium';
  return 'feature-card-normal';
});

const applyRoleDefaults = (role: string) => {
  const supported = new Set(roleFeatureMap[role] || []);
  features.forEach(f => {
    permissionState[f.key] = supported.has(f.key);
  });
};

const handleRoleChange = (role: string) => {
  console.log('[UserSettings] handleRoleChange ->', role);
  applyRoleDefaults(role);
};

applyRoleDefaults(selectedRole.value);

// 映射：API camelCase -> 本地 snake_case
const apiToLocalKey: Record<string, string> = {
  transferEnabled: 'transfer_enabled',
  tradingEnabled: 'trading_enabled',
  computingEnabled: 'computing_enabled',
  consensusEnabled: 'consensus_enabled',
  storageEnabled: 'storage_enabled',
  cryptoEnabled: 'crypto_enabled',
  networkEnabled: 'network_enabled',
  governanceEnabled: 'governance_enabled',
  blockchainExplorerEnabled: 'blockchain_explorer_enabled',
  nodeManagementEnabled: 'node_management_enabled',
  appMarketEnabled: 'app_market_enabled',
};

// 映射：本地 snake_case -> API camelCase
const localToApiKey: Record<string, string> = Object.keys(apiToLocalKey)
  .reduce((acc, apiKey) => {
    const local = (apiToLocalKey as any)[apiKey];
    acc[local] = apiKey;
    return acc;
  }, {} as Record<string, string>);

// 加载当前权限
const setup = () => {
  const userStore = useUserStore();
  const com = comStore();

  // 获取当前用户权限设置
  const fetchCurrentPermissions = async () => {
    try {
      console.log('[UserSettings] fetchCurrentPermissions: starting...');

      // 调试：直接从 tsbApi 与 getConfig 打印 token 与请求头
      try {
        const res = await (window as any).tsbApi?.user?.get?.();
        const rawToken = res?.data?.token ?? null;
        const cfg = await getConfig();
        console.log('[UserSettings] tsbApi token:', rawToken);
        console.log('[UserSettings] Authorization header (getConfig):', cfg?.headers?.Authorization);
      } catch (e) {
        console.warn('[UserSettings] Unable to read token via tsbApi/getConfig:', e);
      }

      const response = await getCurrentUserPermissions();
      console.log('[UserSettings] fetchCurrentPermissions: raw response:', response);
      
      // 解析响应数据
      let payload = response;
      if (response && typeof response === 'object') {
        if (response.data !== undefined) {
          payload = response.data;
        } else if (response.code !== undefined) {
          payload = response;
        }
      }
      
      console.log('[UserSettings] fetchCurrentPermissions: parsed payload:', payload);
      
      let updatedFromServer = false;
      if (payload && payload !== null && typeof payload === 'object') {
        const hasPermissionFields = Object.keys(payload).some(key => 
          key.includes('Enabled') || key === 'userRole'
        );
        
        if (hasPermissionFields) {
          updatedFromServer = true;
          // 更新角色
          if (payload.userRole && typeof payload.userRole === 'string') {
            console.log('[UserSettings] payload.userRole ->', payload.userRole);
            selectedRole.value = payload.userRole;
          }

          // 更新功能开关状态
          Object.keys(apiToLocalKey).forEach(apiKey => {
            const localKey = apiToLocalKey[apiKey];
            if (payload.hasOwnProperty(apiKey) && localKey in permissionState) {
              const val = Boolean(payload[apiKey]);
              permissionState[localKey] = val;
            }
          });

          const flagsSnapshot = Object.fromEntries(
            Object.keys(apiToLocalKey).map(k => [k, !!payload?.[k]])
          );
          console.log('[UserSettings] fetched feature flags:', flagsSnapshot);
        }
      }

      // 如果服务端返回为空或不包含权限字段，则自动创建默认权限并重试
      if (!updatedFromServer) {
        console.warn('[UserSettings] No permissions found for user; creating defaults...');
        const userId = com?.user?.id;
        const role = selectedRole.value || 'user';
        if (!userId || typeof userId !== 'number') {
          console.warn('[UserSettings] Missing userId from comStore; skip default creation');
          message.warning('未获取到用户ID，无法初始化默认权限');
          return;
        }
        const createResp = await createDefaultUserPermissions(userId, role);
        console.log('[UserSettings] createDefaultUserPermissions response:', createResp);
        // 成功则再次拉取
        if (createResp && (createResp.code === 200 || createResp.data === true)) {
          console.log('[UserSettings] Defaults created; re-fetching permissions...');
          const reResp = await getCurrentUserPermissions();
          let rePayload = reResp;
          if (reResp && typeof reResp === 'object') {
            if (reResp.data !== undefined) {
              rePayload = reResp.data;
            } else if (reResp.code !== undefined) {
              rePayload = reResp;
            }
          }
          console.log('[UserSettings] re-fetch payload:', rePayload);
          if (rePayload && typeof rePayload === 'object') {
            if (rePayload.userRole && typeof rePayload.userRole === 'string') {
              selectedRole.value = rePayload.userRole;
            }
            Object.keys(apiToLocalKey).forEach(apiKey => {
              const localKey = apiToLocalKey[apiKey];
              if (rePayload.hasOwnProperty(apiKey) && localKey in permissionState) {
                permissionState[localKey] = Boolean(rePayload[apiKey]);
              }
            });
          }
        } else {
          message.warning('创建默认权限失败，稍后再试或联系管理员');
        }
      }
    } catch (error) {
      console.error('[UserSettings] fetchCurrentPermissions error:', error);
    }
  };

  // 保存权限设置
  const savePermissions = async () => {
    try {
      console.log('[UserSettings] savePermissions: starting...');

      // 调试：打印 token 与请求头，不再用 localStorage 阻塞流程
      try {
        const res = await (window as any).tsbApi?.user?.get?.();
        const rawToken = res?.data?.token ?? null;
        const cfg = await getConfig();
        console.log('[UserSettings] tsbApi token:', rawToken);
        console.log('[UserSettings] Authorization header (getConfig):', cfg?.headers?.Authorization);
      } catch (e) {
        console.warn('[UserSettings] Unable to read token via tsbApi/getConfig:', e);
      }

      const submitPayload: Record<string, any> = { userRole: selectedRole.value };
      Object.keys(permissionState).forEach(localKey => {
        const apiKey = localToApiKey[localKey];
        if (apiKey) {
          submitPayload[apiKey] = Boolean(permissionState[localKey]);
        }
      });

      console.log('[UserSettings] savePermissions: submit payload:', submitPayload);

      const response = await updateCurrentUserPermissions(submitPayload);
      console.log('[UserSettings] savePermissions: response:', response);
      
      if (response && (response.code === 200 || response.message === 'success')) {
        console.log('[UserSettings] Permissions saved successfully');
        message.success('权限设置已保存！');
      } else {
        console.warn('[UserSettings] Save may have failed:', response);
        message.warning('保存接口未返回预期结果');
      }
    } catch (error) {
      console.error('[UserSettings] savePermissions error:', error);
      message.error('保存权限失败');
    }
  };

  return {
    fetchCurrentPermissions,
    savePermissions
  };
};

// 初始化setup
const { fetchCurrentPermissions, savePermissions } = setup();

onMounted(async () => {
  console.log('[UserSettings] onMounted: fetching current permissions');
  // 调试：打印 token 与请求头
  try {
    const res = await (window as any).tsbApi?.user?.get?.();
    const rawToken = res?.data?.token ?? null;
    const cfg = await getConfig();
    console.log('[UserSettings] onMounted tsbApi token:', rawToken);
    console.log('[UserSettings] onMounted Authorization header (getConfig):', cfg?.headers?.Authorization);
  } catch (e) {
    console.warn('[UserSettings] onMounted: Unable to read token via tsbApi/getConfig:', e);
  }
  await fetchCurrentPermissions();
});
</script>

<style scoped>
.user-settings {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--primary-bg);
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: linear-gradient(90deg, rgba(99, 102, 241, 0.12), rgba(56, 189, 248, 0.12));
  border-bottom: 1px solid rgba(120, 120, 120, 0.18);
}

.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--primary-text);
}
.page-sub {
  margin: 4px 0 0 0;
  color: var(--secondary-text);
  font-size: 13px;
}

.feature-grid {
  flex: 1;
  padding: 16px 20px 8px 20px;
}

.feature-card {
  min-height: 140px;
  border-radius: 10px;
}
.feature-card-large {
  min-height: 160px;
}
.feature-card-medium {
  min-height: 150px;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon :deep(svg) {
  width: 18px;
  height: 18px;
  color: var(--primary-text);
}

.desc {
  color: var(--secondary-text);
  font-size: 13px;
}

.footer-actions {
  display: flex;
  justify-content: center; /* 居中 */
  padding: 14px 20px 22px 20px; /* 更宽更舒适 */
  border-top: 1px solid rgba(120, 120, 120, 0.15);
  background: transparent;
}

:deep(.save-btn) {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  height: 48px; /* 变大 */
  padding: 0 24px; /* 变宽 */
  font-size: 16px; /* 文本更明显 */
  border: none;
  border-radius: 12px; /* 更圆润 */
  color: #fff;
  background: linear-gradient(135deg, #6366f1, #06b6d4);
  background-size: 200% 200%;
  animation: gradientFlow 6s ease infinite;
  box-shadow: 0 10px 24px rgba(99, 102, 241, 0.35), 0 3px 10px rgba(6, 182, 212, 0.25);
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

:deep(.save-btn:hover) {
  transform: translateY(-2px);
  box-shadow: 0 14px 30px rgba(99, 102, 241, 0.45), 0 6px 14px rgba(6, 182, 212, 0.35);
}

:deep(.save-btn .anticon) {
  font-size: 18px; /* 图标也更大一点 */
}
</style>