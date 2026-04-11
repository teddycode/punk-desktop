import type { Router } from 'vue-router';
import { agentStore } from '@store/agent';
import type { RouteMappingItem } from '@store/agent';

const KNOWN_MAPPINGS: RouteMappingItem[] = [
  { alias: '设置页面', routeName: 'setting' },
  { alias: '基础设置', routeName: 'basicSetting' },
  { alias: 'DApp市场', routeName: 'DappMarketPage' },
  { alias: 'Dapp市场', routeName: 'DappMarketPage' },
  { alias: '我的钱包', routeName: 'myWallets' },
  { alias: '转账页面', routeName: 'TransferPage' },
  { alias: '转账', routeName: 'TransferPage' },
  { alias: '浏览器', routeName: 'browserTabs' },
  { alias: '聊天', routeName: 'chat' },
  { alias: '工作台', routeName: 'workDesk' },
  { alias: '应用中心', routeName: 'apps' },
  { alias: '我的投资', routeName: 'myInfoPage' },
  { alias: '提交DApp', routeName: 'submitDapp' },
  { alias: 'AI助手', routeName: 'ai' },
];

function prettyRouteLabel(record: { meta?: any; name?: string | symbol | null }) {
  if (record.meta && typeof record.meta.title === 'string' && record.meta.title) {
    return record.meta.title;
  }
  const routeName = String(record.name || '').trim();
  if (!routeName) return '未命名页面';
  return routeName.replace(/([a-z])([A-Z])/g, '$1 $2');
}

function buildDefaultMappings(router: Router): RouteMappingItem[] {
  const allRoutes = router
    .getRoutes()
    .filter((item) => item.name && !String(item.path || '').includes(':') && !item.redirect)
    .map((item) => ({
      routeName: String(item.name),
      label: prettyRouteLabel(item),
      path: item.path,
    }));

  const unique = new Map<string, { routeName: string; label: string }>();
  allRoutes.forEach((item) => {
    if (!unique.has(item.routeName)) {
      unique.set(item.routeName, item);
    }
  });

  const routeOptions = Array.from(unique.values()).sort((a, b) => a.label.localeCompare(b.label));

  const result: RouteMappingItem[] = [];
  const used = new Set<string>();

  KNOWN_MAPPINGS.forEach((item) => {
    const routeName = String(item.routeName).trim();
    if (router.hasRoute(routeName) && !used.has(`${item.alias}-${routeName}`)) {
      result.push({ alias: item.alias, routeName });
      used.add(`${item.alias}-${routeName}`);
    }
  });

  routeOptions.slice(0, 20).forEach((item) => {
    const alias = item.label;
    if (!used.has(`${alias}-${item.routeName}`)) {
      result.push({ alias, routeName: item.routeName });
      used.add(`${alias}-${item.routeName}`);
    }
  });

  return result;
}

/** 若本地无映射，则写入默认路由别名表 */
export function ensureAgentRouteMappings(router: Router) {
  const store = agentStore();
  store.loadRouteMappingsFromStorage();
  if (store.routeMappings.length) {
    return;
  }
  store.setRouteMappings(buildDefaultMappings(router));
}
