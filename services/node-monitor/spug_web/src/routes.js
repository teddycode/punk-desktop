/**
 * Copyright (c) OpenSpug Organization. https://github.com/openspug/spug
 * Copyright (c) <spug.dev@gmail.com>
 * Released under the AGPL-3.0 License.
 */
import React from 'react';
import {
  DashboardOutlined,
  DesktopOutlined,
  CloudServerOutlined,
  CodeOutlined,
  // FlagOutlined,
  ScheduleOutlined,
  DeploymentUnitOutlined,
  // MonitorOutlined,
  // AlertOutlined,
  // SettingOutlined
} from '@ant-design/icons';

import ExecLogview from './pages/exec/logview';
import ExecProfiles from './pages/exec/profiles';
import HomeIndex from './pages/home';
import HostIndex from './pages/host';
import ExecTask from './pages/exec/task';
import ExecTemplate from './pages/exec/template';
import ExecTransfer from './pages/exec/transfer';
import DeployApp from './pages/deploy/app';
// import DeployRepository from './pages/deploy/repository';
// import DeployRequest from './pages/deploy/request';
// import ScheduleIndex from './pages/schedule';
import ConfigEnvironment from './pages/config/environment';
// import ConfigService from './pages/config/service';
import ConfigApp from './pages/config/app';
import ConfigSetting from './pages/config/setting';
import MonitorIndex from './pages/monitor';
import AlarmIndex from './pages/alarm/alarm';
// import AlarmGroup from './pages/alarm/group';
// import AlarmContact from './pages/alarm/contact';
// import SystemAccount from './pages/system/account';
// import SystemRole from './pages/system/role';
import SystemSetting from './pages/system/setting';
import SystemLogin from './pages/system/login';
import WelcomeIndex from './pages/welcome/index';
import WelcomeInfo from './pages/welcome/info';
import WebSSH from './pages/ssh';

import NodeResource from './pages/dashboard/resource'
import NodeLocation from './pages/dashboard/location'

export default [
  { icon: <DesktopOutlined />, title: '工作总台', path: '/home', component: HomeIndex },
  {
    icon: <DashboardOutlined />, title: '资源监控', auth: 'dashboard.dashboard.view', path: '/dashboard',
    child: [
      { title: '主机资源', auth: 'dashboard.node.info', path: '/dashboard/node', component: NodeResource },
      { title: '地理分布', auth: 'dashboard.node.location', path: '/dashboard/location', component: NodeLocation },
    ]
  },
  {
    icon: <CloudServerOutlined />, title: '节点管理', auth: 'host.host.view', path: '/host', child: [
      { title: '节点列表', auth: 'host.host.add', path: '/host/info', component: HostIndex },
      { title: '终端操作', auth: 'host.host.ssh', path: '/host/ssh', component: WebSSH },
    ]
  },
  {
    icon: <CodeOutlined />, title: '服务管理', auth: 'exec.task.do|exec.template.view', child: [
      { title: '脚本模板', auth: 'exec.template.view', path: '/exec/template', component: ExecTemplate },
      { title: '服务组件', auth: 'deploy.app.view', path: '/deploy/app', component: DeployApp },
      { title: '日志管理', auth: 'exec.logview.do', path: '/exec/logview', component: ExecLogview },
      { title: '配置管理', auth: 'exec.profiles.do', path: '/exec/profile', component: ExecProfiles },
      { title: '服务发布', auth: 'exec.task.do', path: '/exec/task', component: ExecTask}
    ]
  },
  {
    icon: <ScheduleOutlined />, title: '磐古更新', auth: 'exec.task.do|exec.template.view', child: [
      { title: '任务执行', auth: 'exec.task.do', path: '/exec/task', component: ExecTask },
      { title: '进度管理', auth: 'exec.template.view', path: '/exec/progress', component: ExecTemplate },
    ]
  },
  // {
  //   icon: <FlagOutlined/>, title: '应用发布', auth: 'deploy.app.view|deploy.repository.view|deploy.request.view', child: [
  //     {title: '发布配置', auth: 'deploy.app.view', path: '/deploy/app', component: DeployApp},
  //     {title: '构建仓库', auth: 'deploy.repository.view', path: '/deploy/repository', component: DeployRepository},
  //     {title: '发布申请', auth: 'deploy.request.view', path: '/deploy/request', component: DeployRequest},
  //   ]
  // },
  // {
  //   icon: <ScheduleOutlined/>,
  //   title: '任务计划',
  //   auth: 'schedule.schedule.view',
  //   path: '/schedule',
  //   component: ScheduleIndex
  // },
  {
    icon: <DeploymentUnitOutlined />, title: '系统配置', auth: 'config.env.view|config.src.view|config.app.view', child: [
      { title: '监控服务', auth: 'monitor.monitor.view', path: '/config/monitor', component: MonitorIndex },
      { title: '运行环境', auth: 'config.env.view', path: '/config/environment', component: ConfigEnvironment },
      { title: '报警服务', auth: 'config.src.view', path: '/config/alarm', component: AlarmIndex },
      { title: '服务组件', auth: 'config.app.view', path: '/config/app', component: ConfigApp },
      { title: '系统日志', auth: 'system.login.view', path: '/system/login', component: SystemLogin },
      { title: '其他设置', auth: 'system.setting.view', path: '/system/setting', component: SystemSetting },
      { path: '/config/setting/:type/:id', component: ConfigSetting },
    ]
  },
  // {icon: <MonitorOutlined/>, title: '监控中心', auth: 'monitor.monitor.view', path: '/monitor', component: MonitorIndex},
  // {
  //   icon: <AlertOutlined/>, title: '报警中心', auth: 'alarm.alarm.view|alarm.contact.view|alarm.group.view', child: [
  //     {title: '报警历史', auth: 'alarm.alarm.view', path: '/alarm/alarm', component: AlarmIndex},
  //     {title: '报警联系人', auth: 'alarm.contact.view', path: '/alarm/contact', component: AlarmContact},
  //     {title: '报警联系组', auth: 'alarm.group.view', path: '/alarm/group', component: AlarmGroup},
  //   ]
  // },
  { path: '/welcome/index', component: WelcomeIndex },
  { path: '/welcome/info', component: WelcomeInfo },
]
