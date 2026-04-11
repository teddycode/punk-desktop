/**
 * Copyright (c) OpenSpug Organization. https://github.com/openspug/spug
 * Copyright (c) <spug.dev@gmail.com>
 * Released under the AGPL-3.0 License.
 */
import { observable, computed, toJS } from 'mobx';
import { http, includes } from 'libs';
import lds from 'lodash';

class Store {
  @observable records = {};
  @observable record1s = {};
  @observable record2s = {};
  @observable types = [];
  @observable record = {};
  @observable deploy = {};
  @observable page = 0;
  @observable loading = {};
  @observable isReadOnly = false;
  @observable isFetching = false;
  @observable formVisible = false;
  @observable addVisible = false;
  @observable addVisible1 = false;
  @observable ext1Visible = false;
  @observable ext2Visible = false;
  @observable autoVisible = false;

  @observable f_name;
  @observable f_desc;
  @observable f_name;
  @observable f_type;

  @computed get dataSource() {
    let records = Object.values(toJS(this.records));
    if (this.f_name) records = records.filter(x => x.name.toLowerCase().includes(this.f_name.toLowerCase()));
    if (this.f_desc) records = records.filter(x => x.desc && x.desc.toLowerCase().includes(this.f_desc.toLowerCase()));
    return records
  }

  @computed get currentRecord() {
    return this.records[`a${this.app_id}`]
  }

  get dataSource1() {
    let data = this.record1s
    if (this.f_name) data = data.filter(x => includes(x.name, this.f_name))
    if (this.f_type) data = data.filter(x => includes(x.type, this.f_type))
    return data
  }

  get dataSource2() {
    let data = this.record2s
    return data
  }


  fetchRecords = () => {
    this.isFetching = true;
    http.get('/api/app/')
      .then(res => {
        const tmp = {};
        for (let item of res) {
          Object.assign(item, lds.pick(this.records[`a${item.id}`], ['isLoaded', 'deploys']));
          tmp[`a${item.id}`] = item
        }
        this.records = tmp
      })
      .finally(() => this.isFetching = false)

    http.get('/api/exec/template/')
      .then(({types, templates}) => {
        this.record1s = templates;
        this.types = types
      })
      .finally(() => this.isFetching = false)

    http.get('/api/exec/config/')
      .then(({data}) => {
        this.record2s = data;
      })
      .finally(() => this.isFetching = false)
  };


  loadDeploys = (app_id) => {
    const response = http.get('/api/exec/relatedtemp/', {params: {app_id}})
    console.log('-----------------------')
    console.log(response)
    return response
  };

  loadDeploys1 = (app_id) => {
    const response = http.get('/api/exec/relatedconfig/', {params: {app_id}})
    console.log('-----------------------')
    console.log(response)
    return response
  }

  showForm = (e, info) => {
    if (e) e.stopPropagation();
    this.record = info || {};
    this.formVisible = true;
  };

  showExtForm = (e, app_id, info, isClone, isReadOnly = false) => {
    if (e) e.stopPropagation();
    this.page = 0;
    this.app_id = app_id;
    this.isReadOnly = isReadOnly
    this.addVisible = true;
  };

  showExtForm1 = (e, app_id, info, isClone, isReadOnly = false) => {
    if (e) e.stopPropagation();
    this.page = 0;
    this.app_id = app_id;
    this.isReadOnly = isReadOnly
    this.addVisible1 = true;
  };

  showAutoDeploy = (deploy) => {
    this.deploy = deploy;
    this.autoVisible = true
  }

  addHost = () => {
    this.deploy['host_ids'].push(undefined)
  };

  editHost = (index, v) => {
    this.deploy['host_ids'][index] = v
  };

  delHost = (index) => {
    this.deploy['host_ids'].splice(index, 1)
  }
}

export default new Store()
