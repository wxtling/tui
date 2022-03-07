export type LocaleType = 'zh_CN' | 'en';

export interface LocaleList {
  text: string;

  event: LocaleType;
}

export interface LocaleSetting {
  locale: LocaleType;
  // 默认语言
  fallback: LocaleType;
  // 允许的语言
  availableLocales: LocaleType[];
}
