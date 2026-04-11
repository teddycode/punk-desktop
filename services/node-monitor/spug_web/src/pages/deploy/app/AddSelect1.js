/**
 * Copyright (c) OpenSpug Organization. https://github.com/openspug/spug
 * Copyright (c) <spug.dev@gmail.com>
 * Released under the AGPL-3.0 License.
 */
import React from 'react';
import { observer } from 'mobx-react';
import store from './store';
import styles from './index.module.css';
import { Table, Modal, message, Card } from 'antd';
import { BuildOutlined, OrderedListOutlined } from '@ant-design/icons';
import { PlusOutlined } from '@ant-design/icons';
import { http, hasPermission } from 'libs';
import axios from 'axios';
import { Action, TableCard, AuthButton } from "components";

@observer
class AddSelect1 extends React.Component {
  // 关联脚本功能
associateScript = (app_id, config_id) => {
  axios.post('/api/exec/relatedconfig/', {
    app_id: app_id,
    config_id: config_id,
  })
  .then(response => {
    if (response.outputs === 'success') {
      message.success('配置文件关联成功');
      this.closeModal();  // 关闭弹出框
    } else {
      message.error('已关联此配置文件');
    }
    console.log(response.data);
  })
  .catch(error => {
    console.error(error);
  });
};

// 关闭弹出框的功能
closeModal() {
  document.getElementById("script-modal").style.display = "none";
}


  render() {
    const modalStyle = {
      display: 'flex',
      justifyContent: 'space-around',
      backgroundColor: 'rgba(240, 242, 245, 1)',
      padding: '80px 0'
    };
    console.log(store.currentRecord.id)
    return (
      <Modal
        visible
        width={800}
        maskClosable={false}
        title="脚本模板列表"
        bodyStyle={modalStyle}
        onCancel={() => store.addVisible1 = false}
        footer={null}>
        <TableCard
        tKey="et"
        title="版本列表"
        rowKey="id"
        loading={store.isFetching}
        dataSource={store.dataSource2}
        onReload={store.fetchRecords}
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
        {hasPermission('exec.relatedConfig.edit|exec.relatedConfig.del|exec.relatedConfig.do') && (
          <Table.Column title="操作" render={info => (
            <Action>
              <Action.Button auth="exec.relatedConfig.add" onClick={() => this.associateScript(store.currentRecord.id, info.id)}>添加</Action.Button>
            </Action>
          )}/>
        )}
      </TableCard>
      </Modal>
    )
  }
}

export default AddSelect1