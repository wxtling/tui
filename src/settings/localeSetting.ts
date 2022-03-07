/**
 * 配置默认语言
 */
import type { LocaleList, LocaleType, LocaleSetting } from '@/locales/types';

/**
 * 系统语言
 */
const language = uni.getSystemInfoSync().language?.replace('-', '_') as LocaleType;

export const LOCALE: { [key: string]: LocaleType } = {
  ZH_CN: 'zh_CN',
  EN_US: 'en',
};

export const localeSetting: LocaleSetting = {
  // 语言环境
  locale: language || LOCALE.ZH_CN,
  // 默认语言
  fallback: LOCALE.ZH_CN,
  // 允许的语言
  availableLocales: [LOCALE.ZH_CN, LOCALE.EN_US],
};

// 配置语言列表
export const localeList: LocaleList[] = [
  {
    text: '简体中文',
    event: LOCALE.ZH_CN,
  },
  {
    text: 'English',
    event: LOCALE.EN_US,
  },
];
