/**
 * Copyright (c) OpenSpug Organization. https://github.com/openspug/spug
 * Copyright (c) <spug.dev@gmail.com>
 * Released under the AGPL-3.0 License.
 */
import React from 'react';
import { Row, Col } from 'antd';
import { Breadcrumb } from 'components';
import NoticeIndex from './Notice';
import TodoIndex from './Todo';
import NavIndex from './Nav';
import StatisticCard from './StatisticCard';
import AlarmTrend from './AlarmTrend';
import RequestTop from './RequestTop';
function HomeIndex() {
  return (
    <div>
      <Breadcrumb>
        <Breadcrumb.Item>首页</Breadcrumb.Item>
        <Breadcrumb.Item>工作台</Breadcrumb.Item>
      </Breadcrumb>
      <StatisticCard/>
      <Row gutter={12}>
        <Col span={16}>
          <TodoIndex/>
        </Col>
        <Col span={8}>
          <NoticeIndex/>
        </Col>
      </Row>
      <Row gutter={12}>
        <Col span={12}>
          <AlarmTrend/>
        </Col>
        <Col span={12}>
          <RequestTop/>
        </Col>
      </Row>
      <NavIndex/>
    </div>
  )
}

export default HomeIndex