/**
 * Copyright (c) OpenSpug Organization. https://github.com/openspug/spug
 * Copyright (c) <spug.dev@gmail.com>
 * Released under the AGPL-3.0 License.
 */
import { observable } from "mobx";
import { http, includes } from 'libs';

class Store {
  ParameterTypes = {
    'string': '文本框',
    'password': '密码框',
    'select': '下拉选择'
  }
  @observable records = [];
  @observable types = [];
  @observable record = {parameters: []};
  @observable isFetching = false;
  @observable formVisible = false;

  @observable f_name;
  @observable f_type;

  get dataSource() {
    let data = this.records
    return data
  }

  fetchRecords = () => {
    this.isFetching = true;
    http.get('/api/exec/config/')
      .then(({data}) => {
        this.records = data;
      })
      .finally(() => this.isFetching = false)
  };

  showForm = (info = {interpreter: 'json', host_ids: []}) => {
    this.formVisible = true;
    this.record = info
  }
}

export default new Store()