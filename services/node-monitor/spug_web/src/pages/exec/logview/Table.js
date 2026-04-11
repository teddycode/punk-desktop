import React, { useEffect, useState } from 'react';
import { Space, Table, Modal } from 'antd';
import axios from 'axios';
import { EyeOutlined } from '@ant-design/icons';

const ComTable = () => {
  const [nodesData, setNodesData] = useState([]);
  const [currentLogs, setCurrentLogs] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);

  const fetchNodesData = async () => {
    try {
      const response = await axios.get('/api/exec/nodeMessage/');
      setNodesData(response); // 解析正确的响应结构
      console.log(response);
    } catch (error) {
      console.error("获取节点数据失败:", error);
    }
  };

  // TODO 这个是要实现应用服务的日志，不是节点服务器的日志，得显示上一个执行的应用服务名称
  const fetchNodeLogs = async (logFileName) => {
      const response = await axios.get(`/api/exec/logview/${logFileName}/`);
      setCurrentLogs(response); // 假设后端返回的数据结构中包含 `log` 字段
      console.log('------------------------');
      console.log(response);
      setIsModalVisible(true);
  };

  useEffect(() => {
    fetchNodesData();
  }, []);

  const showModal = (nodeName, nodeIp, nodePort) => {
    const logFileName = `${nodeName}(${nodeIp}:${nodePort})`;
    fetchNodeLogs(logFileName);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const columns = [
    {
      title: '节点名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '主机名称',
      dataIndex: 'hostname',
      key: 'hostname',
    },
    {
      title: '端口',
      dataIndex: 'ip',
      key: 'ip_address',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <a onClick={() => showModal(record.name, record.hostname, record.ip)}> <EyeOutlined/>查看</a>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Table columns={columns} dataSource={nodesData} rowKey="ip" />
      <Modal
        title="日志详情"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        bodyStyle={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}
      >
        <div style={{ maxHeight: '400px', overflowY: 'auto', width: '100%' }}>
          <pre>{currentLogs}</pre>
        </div>
      </Modal>
    </>
  );
};

export default ComTable;
