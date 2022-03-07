import { createSSRApp } from 'vue';
import App from './App.vue';
import { setupStore } from '@/store';
import { setupI18n } from '@/locales/setupI18n';

export function createApp() {
  const app = createSSRApp(App);

  /** pinia */
  setupStore(app);

  /** vue-i18n */
  setupI18n(app);

  return {
    app,
  };
}
