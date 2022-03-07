import type { App } from 'vue';
import { createPinia } from 'pinia';

const store = createPinia();

export function setupStore(app: App<any>) {
  app.use(store);
}

export { store };
