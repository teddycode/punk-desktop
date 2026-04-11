/**
 * Copyright (c) OpenSpug Organization. https://github.com/openspug/spug
 * Copyright (c) <spug.dev@gmail.com>
 * Released under the AGPL-3.0 License.
 */
import React from 'react';
import { Scene, PointLayer, LineLayer } from '@antv/l7';
import { GaodeMap } from '@antv/l7-maps';

export default class Map extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        const scene = new Scene({
            id: 'map',
            map: new GaodeMap({
                style: 'dark',// 地图样式
                center: this.props.center,
                zoom: 4,
                interact: false,
                token: '39de7b6c7891d2e900cb310ad20ac650'
            })
        });
        console.log('props point:', this.props.points);
        // scene.addImage(
        //   '00',
        //   '/data/spug/spug_web/src/pages/dashboard/PhMapPinBold.svg',
        // );
        scene.on('loaded', () => {
            // TODO 还没看到点的显示，解决一下bug
            // 创建点图层
            const pointLayer = new PointLayer()
                .source(this.props.points, {
                    parser: {
                        type: 'json',
                        x: 'lng',
                        y: 'lat',
                    },
                })
                .shape('circle') // 点的形状
                .size(10) // 点的大小
                .color('#FF0000') // 点的颜色
                .style({
                    opacity: 0.8,
                });

            // 添加点图层到场景中
            scene.addLayer(pointLayer);
            // TODO 根据节点信息生成随机线条；点上显示节点名称
            fetch('https://gw.alipayobjects.com/os/bmw-prod/e495c407-953b-44cc-8f77-87b9cf257578.json')
                .then((res) => res.json())
                .then((data) => {
                    const lineLayer = new LineLayer({})
                        .source(data, {
                            parser: {
                                type: 'json',
                                x: 'from_lon',
                                y: 'from_lat',
                                x1: 'to_lon',
                                y1: 'to_lat',
                            },
                        })
                        .size(1)
                        .shape('arc3d')
                        .color('#FF7C6A')
                        .style({
                            segmentNumber: 15,
                            opacity: 0.8,
                        });
                    scene.addLayer(lineLayer);
                });
        });
    }

    render() {
        return (
            <div id="map" style={{ width: '100%', height: '1000px', position: 'absolute' }} />
        )
    }
}
