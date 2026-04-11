import React, { useEffect } from 'react';
import { observer } from 'mobx-react';
import { Statistic, Card, Row, Col, Progress } from 'antd';
import { bytesToGB } from "../utils"
import store from '../store';
import { AuthDiv } from 'components';

export default observer(function () {

  useEffect(() => {
    store.fetchNodeInfo();
    const intervalId = setInterval(store.fetchNodeInfo, 5000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <AuthDiv auth="dashbord.dashbord.view">
      <Row gutter={16}>
        {store.nodeInfo.map((item, index) => (
          <Col key={index} span={6}>
            <Card title={"主机名："+item.node_name} bordered={false}>
              <p>CPU 使用率:</p>
              <Progress
                percent={item.cpu_usage}
                percentposition={{
                  align: 'center',
                  type: 'inner',
                }}
                size={[200, 20]}
                strokeColor="#5B8FF9"
              />
              <p>内存使用率:</p>
              <Progress
                percent={item.memory_usage}
                percentposition={{
                  align: 'center',
                  type: 'inner',
                }}
                size={[200, 20]}
                strokeColor="#5AD8A6"
              />
              <p>磁盘使用率:</p>
              <Progress
                percent={item.disk_usage_percent}
                percentposition={{
                  align: 'center',
                  type: 'inner',
                }}
                size={[200, 20]}
                strokeColor="#5AD8A6"
              />
              <Row>
                <Col span={12}>
                  <p>可用内存: {item.free_memory} GB</p>
                  <p>已用内存: {item.used_memory} GB</p>
                  <p>总内存: {item.total_memory} GB</p>
                </Col>
                <Col span={12}>
                  <p>可用磁盘空间: {item.free_disk_space} GB</p>
                  <p>已用磁盘空间: {item.used_disk_space} GB</p>
                  <p>总磁盘空间: {item.total_disk_space} GB</p>
                </Col>
              </Row>
             
            </Card>
          </Col>
        ))}
      </Row>

    </AuthDiv>

  );
})