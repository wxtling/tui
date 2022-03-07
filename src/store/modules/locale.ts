import type { LocaleSetting, LocaleType } from '@/locales/types';
import { defineStore } from 'pinia';
import { localeSetting } from '@/settings/localeSetting';
import { CacheEnum } from '@/enums/cacheEnum';
import { store } from '@/store';

const lsLocaleSetting = (uni.getStorageSync(CacheEnum.language) || localeSetting) as LocaleSetting;

interface LocaleState {
  localInfo: LocaleSetting;
}

export const useLocaleStore = defineStore({
  id: 'app-locale',
  state: (): LocaleState => ({
    localInfo: lsLocaleSetting,
  }),
  getters: {
    getLocale(): LocaleType {
      return this.localInfo?.locale ?? 'zh_CN';
    },
  },
  actions: {
    setLocaleInfo(info: Partial<LocaleSetting>) {
      this.localInfo = { ...this.localInfo, ...info };
      uni.setStorageSync(CacheEnum.language, this.localInfo);
    },
  },
});

export function useLocaleStoreWithOut() {
  return useLocaleStore(store);
}
