/**
 * Copyright (c) OpenSpug Organization. https://github.com/openspug/spug
 * Copyright (c) <spug.dev@gmail.com>
 * Released under the AGPL-3.0 License.
 */
import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react';
import { PlusOutlined, ThunderboltOutlined, BulbOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Form, Button, Radio, Tooltip, Table} from 'antd';
import { ACEditor, AuthDiv, Breadcrumb } from 'components';
import HostSelector from 'pages/host/Selector';
import TemplateSelector from './TemplateSelector';
import Parameter from './Parameter';
import Output from './Output';
import { http, cleanCommand } from 'libs';
import moment from 'moment';
import store from './store';
import store1 from 'pages/deploy/app/store'
import gStore from 'gStore';
import style from './index.module.less';

function TaskIndex() {
  const [loading, setLoading] = useState(false)
  const [interpreter, setInterpreter] = useState('sh')
  const [command, setCommand] = useState('')
  const [app_id, setAppId] = useState()
  const [histories, setHistories] = useState([])
  const [parameters, setParameters] = useState([])
  const [visible, setVisible] = useState(false)
  const [configbody, setconfigbody] = useState([])
  const [templatebody, settemplatebody] = useState([])

  useEffect(() => {
    if (!loading) {
      http.get('/api/exec/do/')
        .then(res => setHistories(res))
    }
  }, [loading])

  useEffect(() => {
    if (!command) {
      setParameters([])
    }
  }, [command])

  useEffect(() => {
    gStore.fetchUserSettings()
    return () => {
      store.host_ids = []
      if (store.showConsole) {
        store.switchConsole()
      }
    }
  }, [])

  function handleSubmit() {
    
    setLoading(true)
    console.log(app_id)
    const formData = {app_id, host_ids: store.host_ids}
    http.post('/api/exec/do/', formData)
      .then(store.switchConsole)
      .finally(() => setLoading(false))
  }

  function handleTemplate(tpl) {
    setAppId(tpl.id)
    setInterpreter(tpl.name)
    setCommand(tpl.key)
    setParameters(tpl.desc)
    store1.loadDeploys(tpl.id).then(data => settemplatebody(data));
    store1.loadDeploys1(tpl.id).then(data => setconfigbody(data));
    console.log('+++++++++++++++')
    console.log(templatebody)
    console.log(configbody)
    console.log('+++++++++++++++')
  }

  function handleClick(item) {
    store.host_ids = item.host_ids
  }

   const columns = [
    {
      title: '服务名称',
      dataIndex: 'app_name',
      ellipsis: true
    }, {
      title: '版本号',
      dataIndex: 'version_name',
    }, {
      title: '配置文件名称',
      dataIndex: 'config_name'
    }];

    const columns1 = [
      {
        title: '服务名称',
        dataIndex: 'app_name',
        ellipsis: true
      },{
        title: '脚本模板名称',
        dataIndex: 'template_name',
      }];
  

  return (
    <AuthDiv auth="exec.task.do">
      <Breadcrumb>
        <Breadcrumb.Item>首页</Breadcrumb.Item>
        <Breadcrumb.Item>批量执行</Breadcrumb.Item>
        <Breadcrumb.Item>执行任务</Breadcrumb.Item>
      </Breadcrumb>
      <div className={style.index} hidden={store.showConsole}>
        <Form layout="vertical" className={style.left}>
          <Form.Item required label="目标主机">
            <HostSelector type="button" value={store.host_ids} onChange={ids => store.host_ids = ids}/>
          </Form.Item>

          <Form.Item required label="执行命令" style={{position: 'relative'}}>
            <Button style={{float: 'left'}} icon={<PlusOutlined/>} onClick={store.switchTemplate}>从执行模版中选择</Button>
          </Form.Item>

          <Table
          rowKey="id"
          dataSource={configbody}
          columns={columns}/>

          <Table
          rowKey="id"
          dataSource={templatebody}
          columns={columns1}/>

          <Button loading={loading} icon={<ThunderboltOutlined/>} type="primary"
                  onClick={() => handleSubmit()}>开始执行</Button>
        </Form>

        <div className={style.right}>
          <div className={style.title}>
            执行记录
            <Tooltip title="多次相同的执行记录将会合并展示，每天自动清理，保留最近30条记录。">
              <QuestionCircleOutlined style={{color: '#999', marginLeft: 8}}/>
            </Tooltip>
          </div>
          <div className={style.inner}>
            {histories.map((item, index) => (
              <div key={index} className={style.item} onClick={() => handleClick(item)}>
                <div className={style[item.interpreter]}>{item.interpreter.substr(0, 2)}</div>
                <div className={style.number}>{item.host_ids.length}</div>
                {item.template_name ? (
                  <div className={style.tpl}>{item.template_name}</div>
                ) : (
                  <div className={style.command}>{item.command}</div>
                )}
                <div className={style.desc}>{moment(item.updated_at).format('MM.DD HH:mm')}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {store.showTemplate && <TemplateSelector onCancel={store.switchTemplate} onOk={handleTemplate}/>}
      <AuthDiv auth='exec.backinfo.saveinfo'>
      {store.showConsole && <Output onBack={store.switchConsole}/>}
      </AuthDiv>
      {visible && <Parameter parameters={parameters} onCancel={() => setVisible(false)} onOk={v => handleSubmit(v)}/>}
    </AuthDiv>
  )
}

export default observer(TaskIndex)
