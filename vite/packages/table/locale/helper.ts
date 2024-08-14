/*
 * @Author: teddycode 1055334354@qq.com
 * @Date: 2024-03-09 12:05:47
 * @LastEditors: teddycode 1055334354@qq.com
 * @LastEditTime: 2024-03-09 16:37:13
 * @Description:
 * Copyright (c) 2024 by buaa.ioase.dcl, All Rights Reserved.
 */
import zh from './lang/zh-CN.json';
import en from './lang/en.json';
import ar from './lang/ar.json';
import bg from './lang/bg.json';
import bn from './lang/bn.json';
import cs from './lang/cs.json';
import de from './lang/de.json';
import enUS from './lang/en-US.json';
import es from './lang/es.json';
import fa from './lang/fa.json';
import fr from './lang/fr.json';
import hr from './lang/hr.json';
import hu from './lang/hu.json';
import it from './lang/it.json';
import ja from './lang/ja.json';
import ko from './lang/ko.json';
import lt from './lang/lt.json';
import pl from './lang/pl.json';
import ptBR from './lang/pt-BR.json';
import ptPT from './lang/pt-PT.json';
import ru from './lang/ru.json';
import tr from './lang/tr.json';
import uk from './lang/uk.json';
import uz from './lang/uz.json';
import vi from './lang/vi.json';
import zhTW from './lang/zh-TW.json';

// 26国语言包
export const langs = {
  'zh-CN': zh, // 中文
  'zh-TW': zhTW, // 台湾
  en, // 英文
  ar, // 阿拉伯语
  bg, //  保加利亚语
  bn, // 孟加拉
  cs, // 捷克
  de, // 德语
  'en-US': enUS,
  es, // 西班牙语
  fa, // 波斯
  fr, // 法语
  hr, // 克罗埃西亚
  hu, // 匈牙利
  it, // 意大利语
  ja, // 日语
  ko, // 韩语
  lt, // 立陶宛
  pl, // 波兰
  'pt-PB': ptBR, //
  'pt-PT': ptPT, // 葡萄牙语
  ru, // 俄国
  tr, // 土耳其语
  uk, // 	乌克兰
  uz, // 乌兹别克语
  vi, // 越南
};
// 获取语言包的名称
export const getLangList = () => {
  return Object.keys(langs).map((key) => ({ label: langs[key]?.name, value: key }));
};
