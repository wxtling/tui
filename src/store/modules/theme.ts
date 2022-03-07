import type { Theme, ThemeType } from '@/settings/ThemeSetting';

import { defineStore } from 'pinia';
import { store } from '@/store';
import { CacheEnum } from '@/enums/cacheEnum';
import { config, defaultTheme } from '@/settings/ThemeSetting';

interface ThemeState {
  theme: Theme;
}

const type = (uni.getStorageSync(CacheEnum.theme) || defaultTheme) as ThemeType;
const theme = config[type] as Theme;

export const useThemeStore = defineStore({
  id: 'app-theme',
  state: (): ThemeState => ({ theme }),
  getters: {
    getTheme(): Theme {
      return this.theme;
    },
  },
  actions: {
    setTheme(type: ThemeType) {
      this.theme = config[type] || theme;
      uni.setStorageSync(CacheEnum.theme, type);
    },
  },
});

export function useThemeStoreWithOut() {
  return useThemeStore(store);
}
