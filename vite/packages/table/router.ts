import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
import { routes } from './route/first';
import { cardStore } from './store/card';
import { appStore } from './store';
import { useLayoutStore } from './store/baseSettings';

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});
router.beforeEach((to, from, next) => {
  //检测是否是需要记忆的
  //判断当前是某个路由的根目录，且meta里配置了记忆
  if (to.redirectedFrom) {
    if (to.redirectedFrom.meta.rememberChildrenPosition) {
      //查询记忆位置
      let rememberPosition = localStorage.getItem('router:remember:' + to?.redirectedFrom.name);
      if (rememberPosition) {
        try {
          const remRoute = JSON.parse(rememberPosition);
          if (remRoute.name !== to.name) {
            next(remRoute);
          }
        } catch (e) {
          localStorage.removeItem('router:remember:' + to?.redirectedFrom.name);
          console.error('未找到记忆路由，不做操作');
        }
      }
    }
  }
  //抽出匹配到的进行遍历，并判断其中是否存在rember位置的，如果存在记忆位置的，则将当前的位置和参数，整个存入localstorage以便下次取出
  let needWrite = from.matched.find((item) => {
    return item.meta.rememberChildrenPosition;
  });
  if (needWrite) {
    localStorage.setItem(
      'router:remember:' + needWrite.name,
      JSON.stringify({
        name: from.name,
        params: from.params,
      }),
    );
  }

  if (from.name === 'home') {
    document.body.style.setProperty('--backGroundImgBlur', '12px');
    document.body.style.setProperty('--backGroundImgLight', '0.3');
  }
  cardStore().setRouteParams(to.params);
  next();
});
router.afterEach((to, from) => {
  appStore().currentRoute = {
    name: to.name,
    params: to.params,
  };
});

/**
 * @description:   初始化面包屑&标签路由
 */
export const processRouter = () => {
  const store = useLayoutStore();
  // 获取二级菜单选项
  let routeNode = findRouteByName(routes, 'core');
  console.log('查找到的路由信息：', routeNode);
  // 保存所有菜单
  store.setMenus(routeNode?.children || []);
  // 清掉历史菜单
  store.clearTagView();
};

/**
 * @description:  获取core下的二级菜单路由信息
 */
const findRouteByName = (r: RouteRecordRaw[], name: string): RouteRecordRaw => {
  for (let i = 0; i < r.length; i++) {
    if (r[i].name === name) {
      return r[i];
    }
    if (r[i].children) {
      const childRoute = findRouteByName(r[i].children, name);
      if (childRoute) {
        return childRoute;
      }
    }
  }
  return null;
};

export { router };
