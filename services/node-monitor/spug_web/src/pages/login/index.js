/**
 * Copyright (c) OpenSpug Organization. https://github.com/openspug/spug
 * Copyright (c) <spug.dev@gmail.com>
 * Released under the AGPL-3.0 License.
 */
import React, { useEffect, useState } from 'react';
import { Button, Spin, Typography } from 'antd';
import { CopyrightOutlined, GithubOutlined } from '@ant-design/icons';
import styles from './login.module.css';
import history from 'libs/history';
import { clearSession, http, saveSession } from 'libs';
import logo from 'layout/logo-spug-txt.png';
import envStore from 'pages/config/environment/store';
import appStore from 'pages/config/app/store';
import requestStore from 'pages/deploy/request/store';
import execStore from 'pages/exec/task/store';
import hostStore from 'pages/host/store';

export default function () {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    envStore.records = [];
    appStore.records = [];
    requestStore.records = [];
    requestStore.deploys = [];
    hostStore.rawRecords = [];
    execStore.hosts = [];
    clearSession();
    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function bootstrap() {
    setLoading(true);
    setError('');
    http.post('/api/account/login/', {})
      .then(data => {
        saveSession(data);
        const from = history.location.state && history.location.state['from'];
        if (from) {
          history.replace(from)
        } else {
          history.replace('/home')
        }
      })
      .catch(() => {
        setLoading(false);
        setError('系统初始化失败，请检查后端服务后重试。')
      })
  }

  return (
    <div className={styles.container}>
      <div className={styles.titleContainer}>
        <div><img className={styles.logo} src={logo} alt="logo"/></div>
        <div className={styles.desc}>默认以 admin 用户进入系统</div>
      </div>
      <div className={styles.formContainer}>
        <div style={{textAlign: 'center', paddingTop: 48}}>
          {loading ? (
            <React.Fragment>
              <Spin size="large"/>
              <div style={{marginTop: 24}}>正在进入主页面...</div>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <Typography.Text type="danger">{error}</Typography.Text>
              <Button
                block
                size="large"
                type="primary"
                className={styles.button}
                style={{marginTop: 24}}
                onClick={bootstrap}>重试进入系统</Button>
            </React.Fragment>
          )}
        </div>
      </div>

      <div className={styles.footerZone}>
        <div className={styles.linksZone}>
          <a className={styles.links} title="官网" href="https://spug.cc" target="_blank"
             rel="noopener noreferrer">官网</a>
          <a className={styles.links} title="Github" href="https://github.com/openspug/spug" target="_blank"
             rel="noopener noreferrer"><GithubOutlined/></a>
          <a title="文档" href="https://spug.cc/docs/about-spug/" target="_blank"
             rel="noopener noreferrer">文档</a>
        </div>
        <div style={{color: 'rgba(0, 0, 0, .45)'}}>Copyright <CopyrightOutlined/> {new Date().getFullYear()} By OpenSpug</div>
      </div>
    </div>
  )
}
