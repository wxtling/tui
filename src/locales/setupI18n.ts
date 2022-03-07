import type { App } from 'vue';
import type { I18nOptions } from 'vue-i18n';

import { createI18n } from 'vue-i18n';
import { localeSetting } from '@/settings/localeSetting';
import { setHtmlPageLang } from './helper';

import { useLocaleStoreWithOut } from '@/store/modules/locale';

import en from './lang/en';
import zh_CN from './lang/zh_CN';

export let i18n: ReturnType<typeof createI18n>;

function createI18nOptions(): I18nOptions {
  const localeStore = useLocaleStoreWithOut();
  const locale = localeStore.getLocale;

  setHtmlPageLang(locale);

  return {
    legacy: false,
    locale,
    messages: {
      en,
      zh_CN,
    },
    fallbackLocale: localeSetting.fallback,
    availableLocales: localeSetting.availableLocales,
    sync: true,
    silentTranslationWarn: true,
    missingWarn: false,
    silentFallbackWarn: true,
  };
}

export function setupI18n(app: App) {
  i18n = createI18n(createI18nOptions());
  app.use(i18n);
}
