/**
 * Copyright (c) OpenSpug Organization. https://github.com/openspug/spug
 * Copyright (c) <spug.dev@gmail.com>
 * Released under the AGPL-3.0 License.
 */
import React, { useState } from 'react';
import { Menu } from 'antd';
import { Breadcrumb } from 'components';
import Basic from './Basic';
import styles from './index.module.css';

function Index() {
  const [selectedKeys, setSelectedKeys] = useState(['basic'])

  return (
    <div>
      <Breadcrumb>
        <Breadcrumb.Item>首页</Breadcrumb.Item>
        <Breadcrumb.Item>个人中心</Breadcrumb.Item>
      </Breadcrumb>
      <div className={styles.container}>
        <div className={styles.left}>
          <Menu
            mode="inline"
            selectedKeys={selectedKeys}
            style={{border: 'none'}}
            onSelect={({selectedKeys}) => setSelectedKeys(selectedKeys)}>
            <Menu.Item key="basic">基本设置</Menu.Item>
          </Menu>
        </div>
        <div className={styles.right}>
          {selectedKeys[0] === 'basic' && <Basic/>}
        </div>
      </div>
    </div>
  )
}

export default Index
