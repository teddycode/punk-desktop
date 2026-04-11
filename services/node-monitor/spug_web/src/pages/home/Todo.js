/**
 * Copyright (c) OpenSpug Organization. https://github.com/openspug/spug
 * Copyright (c) <spug.dev@gmail.com>
 * Released under the AGPL-3.0 License.
 */
import React from 'react';
import { Card, List } from 'antd';

function TodoIndex(props) {
  return (
    <Card title={<div style={{height: '33px', lineHeight: '33px'}}>待办事项</div>} bodyStyle={{height: 234, padding: '0 24px'}}>
      <List/>
    </Card>
  )
}

export default TodoIndex