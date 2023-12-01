### vue 页面处理

以下是 vue 文件的代码内容，请按照以下要求修改：
（1）升级至 vue3 版本；
（2）尽可能将页面内的 UI 组件替换成 ant design vue 最新版本组件库；
（3）尝试简化冗余代码，修复潜在问题。
（4）将文字颜色改成深色。
具体代码如下：

### pinia 升级

```js
import { defineStore } from 'pinia';
import { useStore } from 'vuex';
import router from '@/router';

var getlocalStorage = (name, falgTrue, falgFalse, stringIs) => {
  if (name == 'themes') {
  }
  let result = null;
  let data = window.localStorage.getItem(name);
  if (data == '' || data == null) {
    if (falgTrue) result = falgTrue;
  } else {
    if (data == 'false') return false;
    if (falgTrue === true) {
      if (data == 'true') return true;
      return false;
    } else {
      result = data;
    }
  }
  if (stringIs && data) return JSON.parse(result);
  return result;
};

export const useMainStore = defineStore({
  id: 'main',
  state: () => ({
    appId: process.env.VUE_APP_ID,
    appName: process.env.VUE_APP_NAME,
    locales: getlocalStorage('locales', 'zh-cn', 'en'),
    isMenu: getlocalStorage('isMenu', true, false),
    themes: getlocalStorage('themes', false, true),
    themesColor: getlocalStorage(
      'themesColor',
      {
        primaryColor: '#1890ff',
        errorColor: '#ff4d4f',
        warningColor: '#faad14',
        successColor: '#52c41a',
        infoColor: '#909399',
      },
      false,
      true,
    ),
    isBreadcrumb: getlocalStorage('isBreadcrumb', true, false),
    isPathbar: true,
    direction: getlocalStorage('direction', true),
    modulesSize: getlocalStorage('modulesSize', 'large'),
    allloading: false,
    fixedTop: getlocalStorage('fixedTop', true, false),
    systemIndex: getlocalStorage('systemIndex', 0),
    tagView: [],
    activeTagView: '',
    authority: [],
  }),
  getters: {
    // 你可以在这里添加你需要的getter
  },
  actions: {
    initRouter(to) {
      if (to && to.meta) {
        if (to.meta.menu) {
          window.localStorage.setItem('isMenu', to.meta.menu == 'y');
          this.isMenu = to.meta.menu == 'y';
        }
        if (to && to.meta && to.meta.title) {
          this.addTagView({
            path: to.path,
            name: to.name,
            ...to.meta,
          });
        }
      }
    },
    addTagView(tag) {
      this.activeTagView = tag.path;
      if (tag.path == '/') return;
      if (!this.tagView.some((x) => x.path == tag.path)) {
        this.tagView.push(tag);
      }
    },
    editTagView(tag) {
      if (this.tagView.some((x) => x.path == tag.path)) {
        this.activeTagView = tag.path;
        this.tagView = this.tagView.filter((x) => x.path != tag.path);
      }
      this.activeTagView = tag.path;
      this.tagView.push(tag);
    },
    deleteTagView(index) {
      if (this.tagView.length <= 1) return;
      this.tagView.splice(index, 1);
      if (index >= 1 && index <= this.tagView.length) {
        if (index == 0) index = 1;
        this.activeTagView = this.tagView[index - 1].path;
        router.push(this.activeTagView);
      }
    },
    clearTagView(index) {
      this.tagView = [];
      this.activeTagView = '';
      this.systemIndex = index;
    },
    setAllStatus(all) {
      // 这里你可以添加你需要的action
    },
  },
});

// 使用store
const store = useMainStore();
```

### 状态合并

```ts
以下是三个vue store文件的名称及其内容：
（1）index.js : import { createStore } from 'vuex'
import getters from"./gettre"
import baseinfo from"./modules/baseinfo"
import userinfo from"./modules/userinfo"
export default createStore({
  state: {
  },
  mutations: {
  },
  actions: {
  },
  modules: {
    baseinfo,
    userinfo,
  },
  getters
})
（2) baseinfo.js: /*

import router from "@/router";

 var getlocalStorage=(name,falgTrue,falgFalse,stringIs)=>{
    if(name  == "themes"){

    }
    let result=null
    let data=window.localStorage.getItem(name)
    if(data=="" || data==null){
        if(falgTrue)result=falgTrue
    }else{
        if(data =='false')return false
        if(falgTrue === true ){
            if(data=="true")  return true
            return  false
        }else{
            result=data
        }
    }
    if(stringIs &&  data)return JSON.parse(result)
   return result
}
const state = {
    //  appid
    appId: process.env.VUE_APP_ID,
    //  菜单类型
    appName: process.env.VUE_APP_NAME,
    //  国际化语言
    locales:getlocalStorage("locales","zh-cn","en"),
     //  菜单类型
    isMenu: getlocalStorage("isMenu",true,false),
     //  项目主题
    themes: getlocalStorage("themes",false,true),
    // 自定义项目主题
    themesColor:getlocalStorage("themesColor",{
        primaryColor: '#1890ff',
        errorColor: '#ff4d4f',
        warningColor: '#faad14',
        successColor: '#52c41a',
        infoColor: '#909399',
      },false,true),
    // 面包屑
    isBreadcrumb: getlocalStorage("isBreadcrumb",true,false),
    // 历史菜单
    isPathbar: true,
    // 系统设置方向
    direction:getlocalStorage("direction",true),
    // 全局组件大小
    modulesSize:getlocalStorage("modulesSize",'large'),

    allloading:false, // 全局loading

    fixedTop:getlocalStorage("fixedTop",true,false), // 全局loading

    tagView: [], // 历史路由列表
    activeTagView: "", // 当前路由
    authority: [], // 功能按钮权限

}
const mutations = {
    SET_IS_MENU: (state, all) => state.isMenu = all,
    SET_IS_BREADCRUMB: (state, all) => state.isBreadcrumb = all,
    SET_IS_PATH_BAR: (state, all) => state.isPathbar = all,
    SET_DIRECTION: (state, all) => state.direction = all,
    SET_LOCALES: (state, all) => state.locales = all,
    SET_THEMES: (state, all) => state.themes = all,
    SET_THEMES_COLOR: (state, all) => state.themesColor = all,
    SET_MODULES_SIZE: (state, all) => state.modulesSize = all,
    SET_ALL_LOADING: (state, all) => state.allloading = all,
    SET_AUTHORITY: (state, all) => state.authority = all,
    SET_FIXEDTOP: (state, all) => state.fixedTop = all,
    ADD_TAG_VIEW: (state, tag) => { // 添加  tag 菜单
        state.activeTagView = tag.path
        if (tag.path == "/") return
        if (!state.tagView.some((x) => x.path == tag.path)) {
            state.tagView.push(tag)
        }
    },
    EDIT_TAG_VIEW: (state, tag) => { // 替换修改tag 菜单
        if (state.tagView.some((x) => x.path == tag.path)) {
            state.activeTagView = tag.path
            state.tagView = state.tagView.filter((x) => x.path != tag.path)
        }
        state.activeTagView = tag.path
        state.tagView.push(tag)
    },
    DELETE_TAG_VIEW: (state, index) => {  //  删除tag  菜单
        if (state.tagView.length <= 1) return;
        state.tagView.splice(index, 1)
        if (index>=1 && index<=state.tagView.length   ){
            if(index == 0)index = 1
            state.activeTagView = state.tagView[index - 1].path
            router.push(state.activeTagView)
        }
    },
    CLEAR_TAG_VIEW: (state, index) => {
        state.tagView=[]
        state.activeTagView=""
        state.systemIndex=index
    },
    SET_ALL_STATUS:(state,all)=>{

    }
}

const actions = {
    initRouter({
        state,
        commit
    }, to){
        if(to && to.meta){
            // 判断是否需要锁定菜单
            if(to.meta.menu){
                window.localStorage.setItem("isMenu", to.meta.menu=='y')
                commit('SET_IS_MENU', to.meta.menu=='y');
            }

            // 添加历史菜单
            if(to && to.meta && to.meta.title){
                commit("ADD_TAG_VIEW",{
                    path: to.path,
                    name: to.name,
                    ...to.meta
                })
            }
        }

    }
}

export default {
    namespaced: true,
    state,
    mutations,
    actions
}


(3)userinfo.js:
import {
    roles
} from "@/router/role"
import store from "@/store";
import routerList from "@/router/routerExt"
import router from "@/router";
import {
    appLogin
} from "@/axios/request"
import {mergeLocaleMessages}  from "@/common/vuei18n/index"
const state = {
    allRouter: null, // 路由列表
    allMenu: null,  // 菜单列表
}

const mutations = {
    SET_ALLROUTER: (state, all) => state.allRouter = all,
    SET_MENU: (state, all) => state.allMenu = all,

}


const actions = {
    // APP Login
    appLogin: async ({
        state,
        commit
    }, data) => {
        try {
            let res = await appLogin()
            // 添加token
            window.localStorage.setItem("token",true)
            await ResetRouter(0)
        } catch (error){
            console.log(error)
            throw new Error(error)

        }

    },
}

/**
 * @description:  初始化  页面刷新 重新匹配路由规则
 * @return {*}
 */
export async function ResetRouter(index) {
  // 获取角色的菜单选项
  let menu = await getRoleRouter()  //
  // 平铺序列号路由
  let routerinstall = await routerArrFun()
  //  路由初始化 根据权限匹配对应的路由
  var allRouter = await InitRouter(menu,routerinstall, "", true)
  console.log(allRouter)
  // 动态添加国际化配置

  store.commit("userinfo/SET_ALLROUTER", allRouter)
  // 功能权限
  store.commit("userinfo/SET_AUTHORITY", ["A","B","C"])

  // 清掉历史菜单
  store.commit("baseinfo/CLEAR_TAG_VIEW",index)
  // 动态加载路由
  await dynamicRouter(index)
  mergeLocaleMessages(allRouter)
}

// 动态路由 切换系统
const dynamicRouter = async (index)=>{
  window.localStorage.setItem("systemIndex",index)
  const allMenu=store.state.userinfo.allMenu
  if(allMenu)
  {
    allMenu.forEach(x=>{
      router.removeRoute(x.name)
    })
  }
  // 如果有404 删除
  if (router.hasRoute('redirectTo404')){
    router.removeRoute('redirectTo404')
  }
  // 添加404
  router.addRoute({
    path: '/:catchAll(.*)',
    name: "redirectTo404",
    redirect: '/error_404',
    hidden: true
  })

  const allRouter=store.state.userinfo.allRouter
  const routerAction=[allRouter[index]]
  store.commit("userinfo/SET_MENU", routerAction[0].children)
  await addDynamicRoute(routerAction)

  router.push(routerAction[0].children[0].path)
}



/**
 * @description:  调用接口获取当前角色菜单
 * @return {*}
 */
const getRoleRouter = async () => {
  let role = []
  await appLogin().then((res) => {
    console.log("获取路由成功！")
    role = roles
  })
  return role
}

/**
 * @description:  router4.0 递归添加路由
 * @useroute 路由列表
 * @parent   父级路由
 * @parentname 父级name
 */
const addDynamicRoute = async(useroute, parent,parentname) => {
  for (let i = 0; i < useroute.length; i++) {
    if (parent) {
      // 子路由path 必须加上父级path
      useroute[i].path = '/' + parent + useroute[i].path
      //  parentname 必须是父级的name
      await router.addRoute(parentname, useroute[i]);
    } else {
      await router.addRoute(useroute[i]);
    }
    if (useroute[i].children && useroute[i].children.length > 0) {
      await addDynamicRoute(useroute[i].children, (parent ? parent + '/' : "") + useroute[i].name,useroute[i].name);
    }
  }
}

/**
 * @description:   初始化平铺路由 方便匹配
 * @return {*}
 */
const routerArrFun = () => {
  const list = routerList
  let arr = []
  list.forEach((item) => arr[item.path] = item)
  return arr
}

/**
 * @description: 路由初始化 根据权限匹配对应的路由
 * @param {*} routerArr   权限列表
 * @param {*} routerinstall   初始化平铺路由 方便匹配
 * @param {*} isPaht   路由模板
 * @param {*} isType   路由规则
 * @return {*}  动态路由列表
 */
const InitRouter = (routerArr,routerinstall, isPaht, isType) => {
  const addRouter = []
  routerArr.forEach((item) => {
    let parentRouter = routerinstall[item.path]
    if(parentRouter || (!parentRouter && item.children && item.children.length)){
      if (item && item.children) {
        let routerModel = {
          ...parentRouter,
          ...item,
          title:item.en,
          path: (isType ? "/" : "") + item.path,
          //  添加模板
          component: isPaht ? () => import("@/publicView/publicView.vue") : () => import("@/layout/index.vue"),
          redirect: "",
          meta: {
            cn:item.cn,
            en:item.en,
            ... parentRouter?parentRouter.meta:"",
          }
        }
        // 递归处理子路由
        routerModel["children"] = InitRouter(item.children,routerinstall, routerModel.path, true)
        // 设置重定向
        routerModel.redirect = isPaht + routerModel.path + routerModel.children[0].path
        return addRouter.push(routerModel)
      }
      addRouter.push({
        cn:parentRouter.meta.title,
        ...parentRouter,
        ...item,
        path: "/" + item.path,
        meta: {
          ... parentRouter?parentRouter.meta:"",
          cn:item.cn,
          en:item.en,
        }
      })
    }
  })
  return addRouter
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
请按照以下要求修改和优化代码：
（1）将上述代码中的userinfo状态合并到baseinfo中，
（2）代码合并成一个内容，
（3）使用“pinia-plugin-persist”插件实现状态持久化，去掉getlocalStorage方法，
（4）改成ts，并优化代码。
```
