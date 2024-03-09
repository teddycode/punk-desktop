/*
 * @Author: teddycode 1055334354@qq.com
 * @Date: 2023-12-23 16:22:18
 * @LastEditors: teddycode 1055334354@qq.com
 * @LastEditTime: 2024-03-09 15:25:28
 * @Description:
 * Copyright (c) 2024 by buaa.ioase.dcl, All Rights Reserved.
 */

import { MissingHandler, createI18n } from 'vue-i18n'; //引入vue-i18n组件
import { TranslateUsingGET } from '@js/service/transaction';
import { langs } from './helper';

// Override the missing translation handler
const fetchMissing: MissingHandler =  async (locale, key): Promise<string | void> => {
  // Check if translation exists in cache
  const cacheKey = `${key}_${locale}`;
  const cachedTranslation = localStorage.getItem(cacheKey);

  if (cachedTranslation) {
    return cachedTranslation;
  }

  // Fetch translation from API
  const resp = await TranslateUsingGET(key, 'auto', locale);

  if (resp?.code === 200) {
    // Store translation in cache
    localStorage.setItem(cacheKey, resp?.data);
    return resp?.data;
  }
  console.log('翻译失败：', resp);
  return key;
};

const i18n = createI18n({
  locale: 'zh-CN', //默认显示的语言
  legacy: false, // composition AP
  globalInjection: true, //全局生效$
  silentTranslationWarn: true,
  fallbackLocale: 'en',
  messages: langs,
  missing: fetchMissing,
});

// 获取语言包的名称
export const getLangList = () => {
  return Object.keys(langs).map((key) => ({ label: langs[key]?.name, value: key }));
};

export default i18n; //将i18n暴露出去，在main.js中引入挂载
