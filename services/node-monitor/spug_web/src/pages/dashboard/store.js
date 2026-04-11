/**
 * Copyright (c) OpenSpug Organization. https://github.com/openspug/spug
 * Copyright (c) <spug.dev@gmail.com>
 * Released under the AGPL-3.0 License.
 */
import { observable, computed, toJS } from 'mobx';
import http from 'libs/http';

class Store {
  @observable nodeInfo = [];
  @observable location = [];

  @observable isInfoFetching = false;
  @observable isLocateFetching = false;
  @observable formVisible = false;
  @observable infoVisible = false;

  fetchNodeInfo = () => {
    this.isInfoFetching = true;
    http.get('/api/resource/info/')
      .then(res => {
        let list = res.map(u => JSON.parse(u))
        console.log("node data:", list);
        this.nodeInfo = list;
      })
      .catch(error => {
        console.error(error);
      }).finally(() => this.isInfoFetching = false);
  };

  fetchLocation = () => {
    this.isLocateFetching = true;
    http.get('/api/resource/location/')
      .then(res => {
        this.location = res.map(u => ({ name: u.name, lat: parseFloat(u.lat), lng: parseFloat(u.lng) }));
        console.log("location data:", toJS(this.location));
      })
      .catch(error => {
        console.error(error);
      }).finally(() => this.isLocateFetching = false);
  };

  getLocateCenter = () => {
    const list = toJS(this.location)
    console.log('list lenght:',toJS(list.length));
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
      console.log("map center: ", averageLat, averageLng);
      return [averageLat, averageLng]
    }
  }

  @computed get nodesDataSource() {
    let records = this.nodeInfo;
    console.log("node info datasource:",toJS(records));
    return records
  }

}

export default new Store()
