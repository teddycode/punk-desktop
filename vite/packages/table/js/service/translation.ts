import request from '../axios/utils/request';
import { fetchMissing } from '@table/locale';

export const TranslateUsingGET = async (from: string, to: string, text: string) => {
  return await request({
    url: '/translate/',
    method: 'GET',
    params: {
      from,
      to,
      text,
    },
  });
};

export const TextTransWrapper = (text: string) => {
  if (global.userLanguage) {
    console.log('正在翻译：', global.userLanguage, text);
    return fetchMissing(global.userLanguage, text);
  }
  return text;
};
