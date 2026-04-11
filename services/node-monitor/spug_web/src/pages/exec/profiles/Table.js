/**
 * Copyright (c) OpenSpug Organization. https://github.com/openspug/spug
 * Copyright (c) <spug.dev@gmail.com>
 * Released under the AGPL-3.0 License.
 */
import React from 'react';
import { observer } from 'mobx-react';
import { Table, Modal, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { http, hasPermission } from 'libs';
import { Action, TableCard, AuthButton } from "components";
import axios from 'axios';
import store from './store';

@observer
class ComTable extends React.Component {
  componentDidMount() {
    store.fetchRecords()
  }

  handleDelete = (text) => {
    Modal.confirm({
      title: '删除确认',
      content: `确定要删除【${text['name']}】?`,
      onOk: () => {
        return http.delete('/api/exec/config/', {params: {id: text.id}})
          .then(() => {
            message.success('删除成功');
            store.fetchRecords()
          })
      }
    })
  };

  // 新增的发布功能
  publishScript = (id, desc) => {
    axios.post('/api/exec/transconfig/', {
      config_id: id,
      dst_dir: desc,
    })
    .then(response => {
      message.success('生成成功');
      console.log(response.data);
    })
    .catch(error => {
      message.error('发布失败');
      console.error(error);
    });
  };

  render() {
    return (
      <TableCard
        tKey="et"
        title="版本列表"
        rowKey="id"
        loading={store.isFetching}
        dataSource={store.dataSource}
        onReload={store.fetchRecords}
        actions={[
          <AuthButton
            auth="exec.config.add"
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
        <Table.Column title="配置文件名称" dataIndex="name"/>
        <Table.Column title="版本号" dataIndex="version_num"/>
        <Table.Column ellipsis title="配置文件内容" dataIndex="body"/>
        <Table.Column ellipsis title="路径名称" dataIndex="desc"/>
        {hasPermission('exec.config.edit|exec.config.del|exec.transconfig.do') && (
          <Table.Column title="操作" render={info => (
            <Action>
              {/* 新增的发布按钮 */}
              <Action.Button auth="exec.config.edit" onClick={() => store.showForm(info)}>编辑</Action.Button>
              <Action.Button danger auth="exec.config.del" onClick={() => this.handleDelete(info)}>删除</Action.Button>
            </Action>
          )}/>
        )}
      </TableCard>
    )
  }
}

export default ComTable