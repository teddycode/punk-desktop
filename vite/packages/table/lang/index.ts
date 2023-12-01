//语言
import { createI18n } from 'vue-i18n'; //引入vue-i18n组件
import ZH from './zh.js';
import EN from './en.js';
import { TranslateUsingGET } from '../../../src/api/transaction';

const i18n = createI18n({
  locale: 'zh-cn', //默认显示的语言
  legacy: false, // composition AP
  globalInjection: true, //全局生效$
  silentTranslationWarn: true,
  fallbackLocale: 'zh-cn', // 默认语言
  messages: {
    'zh-cn': ZH, //引入语言文件
    en: EN,
  },
});

// Override the missing translation handler
i18n.missing = async (locale, key) => {
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

export default i18n; //将i18n暴露出去，在main.js中引入挂载
