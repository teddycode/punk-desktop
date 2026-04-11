/**
 * Copyright (c) OpenSpug Organization. https://github.com/openspug/spug
 * Copyright (c) <spug.dev@gmail.com>
 * Released under the AGPL-3.0 License.
 */
import React from 'react';
import { observer } from 'mobx-react';
import {
  BuildOutlined,
  DownSquareOutlined,
  ExclamationCircleOutlined,
  OrderedListOutlined,
  UpSquareOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { Table, Modal, Tag, Divider, message } from 'antd';
import { http, hasPermission } from 'libs';
import { Action, TableCard, AuthButton } from "components";
import store from './store';
import envStore from 'pages/config/environment/store';
import lds from 'lodash';
import axios from 'axios';

let deployDataCache = {};
let configDataCache = {};

function ComTable() {
  function handleDelete(e, text) {
    e.stopPropagation();
    Modal.confirm({
      title: '删除确认',
      content: `确定要删除应用【${text['name']}】?`,
      onOk: () => {
        return http.delete('/api/app/', {params: {id: text.id}})
          .then(() => {
            message.success('删除成功');
            store.fetchRecords()
          })
      }
    })
  }

  function associateScript(app_name, template_name) {
    axios.delete('/api/exec/relatedtemp/', {
      params: {
        app_name: app_name,
        template_name: template_name,
      }
    })
    .then(response => {
      if (response.outputs === 'success') {
        message.success('关联删除成功');
        // Assuming closeModal is properly bound or accessible in this scope
        closeModal();  
      } else {
        message.error('删除失败: ' + response.data.message);
      }
      console.log(response.data);
    })
    .catch(error => {
      console.error(error);
    });
  };

  function associateScript1(app_name, version_name, config_name) {
    axios.delete('/api/exec/relatedconfig/', {
      params: {
        app_name: app_name,
        config_name: config_name,
        version_name: version_name
      }
    })
    .then(response => {
      if (response.outputs === 'success') {
        message.success('关联删除成功');
        // Assuming closeModal is properly bound or accessible in this scope
        closeModal();  
      } else {
        message.error('删除失败: ' + response.data.message);
      }
      console.log(response.data);
    })
    .catch(error => {
      console.error(error);
    });
  };

  // 关闭弹出框的功能
  function closeModal() {
    document.getElementById("script-modal").style.display = "none";
  }

// 在组件内部使用 state 来控制数据更新
const [expandedData, setExpandedData] = React.useState({});
const [expandedConfigData, setExpandedConfigData] = React.useState({});


// 处理展开行
function handleExpand(expanded, row) {
  if (expanded && !row.isLoaded) {
    store.loadDeploys(row.id).then(data => {
      // 将获取到的数据存储到全局变量中
      deployDataCache[row.id] = data;
      // 更新 state 以触发重新渲染
      setExpandedData(prev => ({ ...prev, [row.id]: data }));
    });
    store.loadDeploys1(row.id).then(data => {
      configDataCache[row.id] = data;
      setExpandedConfigData(prev => ({ ...prev, [row.id]: data }));
    });
  }
}

// 渲染子表格
function expandedRowRender(record) {
  const data = expandedData[record.id] || [];
  const configData = expandedConfigData[record.id] || [];
  return (
    <>
    <Table
      rowKey="id"
      loading={data.length === 0}
      dataSource={data}
      pagination={false}>
      <Table.Column title="服务名称" dataIndex="app_name"/>
      <Table.Column title="关联脚本名称" dataIndex="template_name"/>
      {hasPermission('exec.relatedTemp.del') && (
        <Table.Column title="操作" render={info => (
          <Action>
            <Action.Button danger auth="exec.relatedTemp.del" onClick={() => associateScript(info.app_name, info.template_name)}>删除</Action.Button>
          </Action>
        )}/>
      )}
    </Table>

    <Table
      rowKey="id"
      loading={configData.length === 0}
      dataSource={configData}
      pagination={false}
      style={{ marginTop: 20 }}>
      <Table.Column title="服务名称" dataIndex="app_name"/>
      <Table.Column title="版本号" dataIndex="version_name"/>
      <Table.Column title="配置文件名称" dataIndex="config_name"/>
      {hasPermission('exec.relatedConfig.del') && (
        <Table.Column title="操作" render={info => (
          <Action>
            <Action.Button danger auth="exec.relatedConfig.del" onClick={() => associateScript1(info.app_name, info.version_name, info.config_name)}>删除</Action.Button>
          </Action>
        )}/>
      )}
    </Table>
  </>
  );
}

  return (
    <TableCard
      tKey="da"
      title="应用列表"
      rowKey="id"
      loading={store.isFetching}
      dataSource={store.dataSource}
      expandable={{expandedRowRender, expandRowByClick: true, onExpand: handleExpand}}
      onReload={store.fetchRecords}
      actions={[
        <AuthButton
          auth="deploy.app.add"
          type="primary"
          icon={<PlusOutlined/>}
          onClick={() => store.showForm()}>新建</AuthButton>
      ]}
      pagination={{
        showSizeChanger: true,
        showLessItems: true,
        showTotal: total => `共 ${total} 条`,
        pageSizeOptions: ['10', '20', '50', '100']
      }}>
      <Table.Column title="应用名称" dataIndex="name"/>
      <Table.Column title="标识符" dataIndex="key"/>
      <Table.Column ellipsis title="描述信息" dataIndex="desc"/>
      {hasPermission('deploy.app.edit|deploy.app.del') && (
        <Table.Column width={260} title="操作" render={info => (
          <Action>
            <Action.Button auth="deploy.app.edit" onClick={e => store.showExtForm(e, info.id)}>新增关联脚本</Action.Button>
            <Action.Button auth="deploy.app.edit" onClick={e => store.showExtForm1(e, info.id)}>新增关联配置文件</Action.Button>
            <Action.Button auth="deploy.app.edit" onClick={e => store.showForm(e, info)}>编辑</Action.Button>
            <Action.Button danger auth="deploy.app.del" onClick={e => handleDelete(e, info)}>删除</Action.Button>
          </Action>
        )}/>
      )}
    </TableCard>
  )
}

export default observer(ComTable)
