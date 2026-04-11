import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import { AuthDiv } from 'components';
import Map from './Map'
import http from 'libs/http';
import { Row, Col, List, Skeleton, Avatar } from 'antd';

export default observer(function () {

  const [loading, setLoading] = useState(false);
  const [nodeLocateData, setNodeLocateData] = useState([]);

  useEffect(() => {
    setLoading(true);
    http.get('/api/resource/location/')
      .then(res => {
        let data = res.map(u => ({ name: u.name, lng: parseFloat(u.lng), lat: parseFloat(u.lat) }));
        setNodeLocateData(data);
        console.log("location data:", data);
      }).finally(() => setLoading(false));
  }, []);

  const getLocateCenter = () => {
    const list = nodeLocateData;
    console.log('list lenght:', list);
    if (list.length === 0) {
      return [120.19382669582967, 30.258134];
    } else {
      let sumLat = 0, sumLng = 0;
      for (let i = 0; i < list.length; i++) {
        sumLat += parseFloat(list[i].lat);
        sumLng += parseFloat(list[i].lng);
      }
      const averageLat = sumLat / list.length;
      const averageLng = sumLng / list.length;
      console.log("map center: ", averageLng, averageLat);
      return [averageLng, averageLat]
    }
  }

  const listTable = () => (
    // TODO 点击“定位”改变地图的center，
    <List
      title='节点列表'
      className="node-info-list"
      loading={loading}
      itemLayout="horizontal"
      dataSource={nodeLocateData}
      renderItem={item => (
        <List.Item
          actions={[<a key="list-loadmore-edit">定位</a>, <a key="list-loadmore-more">编辑</a>]}
        >
          <Skeleton avatar title={false} loading={loading} active>
            <List.Item.Meta
              avatar={<Avatar src={''} />}  // TODO node pic
              title={<a href="https://ant.design">{item.name}</a>}
              description="Ant Design"
            />
            <div>content</div>
          </Skeleton>
        </List.Item>
      )}
    />
  )

  return (
    <AuthDiv auth="mapnode.nodemessage.view">
      {/* TODO 美化一下，加个边框，调整间距 */}
      <Row>
        <Col span={4}>
          {listTable()}
        </Col>
        <Col span={20}>
          {!loading && <Map center={getLocateCenter()} points={nodeLocateData} />}
        </Col>
      </Row>
    </AuthDiv>
  )
});
