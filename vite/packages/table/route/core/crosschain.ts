import CrossChainLayout from '@page/core/CrossChain/layouts/CrossChainLayout.vue'
import DashboardView from '@page/core/CrossChain/Dashboard.vue'
import CreateTaskView from '@page/core/CrossChain/CreateTask/Index.vue'
import MyTasksView from '@page/core/CrossChain/MyTasks/Index.vue'
import TaskDetailView from '@page/core/CrossChain/MyTasks/Detail.vue'
import NetworkView from '@page/core/CrossChain/Network/Index.vue'
import ChainDetailView from '@page/core/CrossChain/Network/ChainDetail.vue'
import TxDetailView from '@page/core/CrossChain/Network/TxDetail.vue'
import BlockDetailView from '@page/core/CrossChain/Network/BlockDetail.vue'
import RelayView from '@page/core/CrossChain/Relay/Index.vue'
import TaskExecutionView from '@page/core/CrossChain/Relay/TaskExecution.vue'
import ManageView from '@page/core/CrossChain/Manage/Index.vue'

import { CodeOutlined } from '@ant-design/icons-vue'

/**
 * 跨链区路由
 *
 * 约束（改动前请先读）：
 *   1. 路由名 `CrossChainPage` 必须保留：桌面图标的 open.route/open.package 依赖它；
 *      layout-header.vue 也通过 matched 中是否存在该名称判断“是否处于跨链区”（决定钱包展示形态）。
 *   2. **不要**把本模块的 component 换成 ThirdLayout 再套一层布局路由。
 *      ThirdLayout 内部是 `<keep-alive><router-view/></keep-alive>`（Vue Router 不支持该写法），
 *      多一层嵌套会抛 `TypeError: Cannot read properties of null (reading 'parentNode')`，整页空白。
 *      跨链模块因此自带外壳（CrossChainLayout），并直接复用共享的 layout-header / layout-footer。
 *   3. 模块内导航由 CrossChainLayout 的 aside 提供，所有页面路由标记 noShow，
 *      避免共享顶栏再渲染一套同级横向菜单。
 *   4. 旧路径（/multi、/tasks、/tasks_created、/manager、/relayer、/user）保留为重定向并透传 query。
 */
export default {
  path: 'crosschain',
  name: 'CrossChainPage',
  redirect: { name: 'CrossChainDashboard' },
  component: CrossChainLayout,
  meta: {
    title: '跨链区',
    icon: CodeOutlined,
  },
  children: [
    {
      path: 'dashboard',
      name: 'CrossChainDashboard',
      component: DashboardView,
      meta: { title: '跨链工作台', noShow: true },
    },
    {
      path: 'create',
      name: 'CrossChainCreate',
      component: CreateTaskView,
      meta: { title: '发起跨链', noShow: true },
    },
    {
      path: 'tasks',
      name: 'CrossChainMyTasks',
      component: MyTasksView,
      meta: { title: '我的任务', noShow: true },
    },
    {
      path: 'tasks/:taskKey',
      name: 'CrossChainTaskDetail',
      component: TaskDetailView,
      meta: { title: '任务详情', noShow: true },
    },
    {
      path: 'network',
      name: 'CrossChainNetwork',
      component: NetworkView,
      meta: { title: '跨链网络', noShow: true },
    },
    {
      path: 'network/chains/:chainId',
      name: 'CrossChainNetworkChain',
      component: ChainDetailView,
      meta: { title: '链详情', noShow: true },
    },
    {
      path: 'network/txs/:txHash',
      name: 'CrossChainNetworkTx',
      component: TxDetailView,
      meta: { title: '交易详情', noShow: true },
    },
    {
      path: 'network/blocks/:blockHash',
      name: 'CrossChainNetworkBlock',
      component: BlockDetailView,
      meta: { title: '区块详情', noShow: true },
    },
    {
      path: 'relay',
      name: 'CrossChainRelay',
      component: RelayView,
      meta: { title: '中继工作台', noShow: true },
    },
    {
      path: 'relay/tasks/:taskKey',
      name: 'CrossChainRelayExecution',
      component: TaskExecutionView,
      meta: { title: '执行任务', noShow: true },
    },
    {
      path: 'manage',
      name: 'CrossChainManage',
      component: ManageView,
      meta: { title: '跨链管理', noShow: true },
    },

    /* ————— 旧路径兼容（重定向，透传 query） ————— */
    {
      path: '/multi',
      name: 'Multichain',
      redirect: (to: any) => ({ name: 'CrossChainNetwork', query: to.query }),
      meta: { noShow: true },
    },
    {
      path: '/multi/bridge/:chain_id',
      name: 'Bridge',
      redirect: (to: any) => ({
        name: 'CrossChainNetworkChain',
        params: { chainId: String(to.params.chain_id) },
        query: to.query,
      }),
      meta: { noShow: true },
    },
    {
      path: '/multi/tx/:tx_hash',
      name: 'Tx',
      redirect: (to: any) => ({
        name: 'CrossChainNetworkTx',
        params: { txHash: String(to.params.tx_hash) },
        query: to.query,
      }),
      meta: { noShow: true },
    },
    {
      path: '/multi/block/:block_hash',
      name: 'Block',
      redirect: (to: any) => ({
        name: 'CrossChainNetworkBlock',
        params: { blockHash: String(to.params.block_hash) },
        query: to.query,
      }),
      meta: { noShow: true },
    },
    {
      path: '/tasks',
      name: 'Tasks',
      redirect: (to: any) => ({ name: 'CrossChainMyTasks', query: to.query }),
      meta: { noShow: true },
    },
    {
      path: '/tasks_created',
      name: 'TasksCreated',
      redirect: (to: any) => ({ name: 'CrossChainRelay', query: to.query }),
      meta: { noShow: true },
    },
    {
      path: '/manager',
      name: 'Manager',
      redirect: (to: any) => ({ name: 'CrossChainManage', query: to.query }),
      meta: { noShow: true },
    },
    {
      path: '/relayer',
      name: 'Relay',
      redirect: (to: any) => ({ name: 'CrossChainRelay', query: to.query }),
      meta: { noShow: true },
    },
    {
      path: '/user',
      name: 'User',
      redirect: (to: any) => ({ name: 'CrossChainMyTasks', query: to.query }),
      meta: { noShow: true },
    },
  ],
}
