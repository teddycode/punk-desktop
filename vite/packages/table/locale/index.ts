/*
 * @Author: teddycode 1055334354@qq.com
 * @Date: 2023-12-23 16:22:18
 * @LastEditors: teddycode 1055334354@qq.com
 * @LastEditTime: 2024-03-09 15:25:28
 * @Description:
 * Copyright (c) 2024 by buaa.ioase.dcl, All Rights Reserved.
 */

import { MissingHandler, createI18n } from 'vue-i18n'; //引入vue-i18n组件
import { TranslateUsingGET } from '@js/service/translation';
import { langs } from './helper';
import { GetUserLocateLang } from '@table/locale/location';

// Override the missing translation handler
export const fetchMissing: MissingHandler = async (locale, key): string | void => {
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
    console.info('翻译成功=', locale, ':', key, '->', resp.data);
    return resp?.data;
  }
  console.error('翻译失败：', resp);
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

export default i18n; //将i18n暴露出去，在main.js中引入挂载
