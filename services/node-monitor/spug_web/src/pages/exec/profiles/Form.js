/**
 * Copyright (c) OpenSpug Organization. https://github.com/openspug/spug
 * Copyright (c) <spug.dev@gmail.com>
 * Released under the AGPL-3.0 License.
 */
import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react';
import { Modal, Form, Input, Select, Button, Radio, Table, Tooltip, message , Typography} from 'antd';
import { ACEditor } from 'components';
import HostSelector from 'pages/host/Selector';
import { http, cleanCommand } from 'libs';
import S from './store';

export default observer(function () {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [body, setBody] = useState(S.record.body);

  function handleSubmit() {
    setLoading(true);
    const formData = form.getFieldsValue();
    formData['id'] = S.record.id;
    formData['body'] = cleanCommand(body);
    formData['host_ids'] = S.record.host_ids;
    http.post('/api/exec/config/', formData)
      .then(res => {
        message.success('操作成功');
        S.formVisible = false;
        S.fetchRecords()
      }, () => setLoading(false))
  }

  const { Text } = Typography;
  const info = S.record;
  return (
    <Modal
      visible
      width={800}
      maskClosable={false}
      title={S.record.id ? '版本发布' : '新建版本'}
      onCancel={() => S.formVisible = false}
      confirmLoading={loading}
      onOk={handleSubmit}>
      <Form form={form} initialValues={info} labelCol={{span: 6}} wrapperCol={{span: 14}}>
        <Form.Item required name="version_num" label="版本号">
          <Input placeholder="请输入版本名称"/>
        </Form.Item>
        <Form.Item required name="name" label="版本名称">
          <Input placeholder="请输入版本名称"/>
        </Form.Item>
        <Form.Item required name="interpreter" label="版本语言">
          <Radio.Group>
            <Radio.Button value="json">json</Radio.Button>
            <Radio.Button value="yaml">yaml</Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item required label="模板内容" shouldUpdate={(p, c) => p.interpreter !== c.interpreter}>
          {({getFieldValue}) => (
            <ACEditor
              mode={getFieldValue('interpreter')}
              value={body}
              onChange={val => setBody(val)}
              height="250px"/>
          )}
        </Form.Item>
        <Form.Item label="目标主机">
          <HostSelector nullable value={info.host_ids} onChange={ids => info.host_ids = ids}/>
        </Form.Item>
        <Form.Item name="desc" label="目标路径">
          <Input.TextArea placeholder="请输入配置目标路径"/>
        </Form.Item>
        <Form.Item>
        <Text type="secondary">提示：路径不需要格式后缀，后缀已经在前面选定，且确保已经开放写入权限。</Text>
      </Form.Item>
      </Form>
    </Modal>
  )
})