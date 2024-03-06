import axios from 'axios';
import { getConfig } from './serverApi';
import { message } from 'ant-design-vue';

async function processResult(data: any) {
  if (data?.code === 200 && data.data) {
    return data?.data;
  } else {
    message.error('服务端返回错误：', data);
    return null;
  }
}

export async function get(url, params = {}) {
  const { data } = await axios.get(url, {
    params: params,
    ...(await getConfig()),
  });
  return processResult(data);
}

export async function post(url, params, options = { crud: false }) {
  let conf = await getConfig();
  if (options.crud) {
    conf.headers['Content-Type'] = 'application/json';
    const { data } = await axios.post(url, JSON.stringify(params), conf);
    return processResult(data);
  }
  const { data } = await axios.post(url, { ...params }, conf);
  return processResult(data);
}
