import type { Plugin } from 'vite';

import uni from '@dcloudio/vite-plugin-uni';

import uniAppRouter from './router';
import { configMockPlugin } from './mock';

export function createVitePlugins(env: { [x: string]: string }, isBuild: boolean) {
  const vitePlugins: (Plugin | Plugin[])[] = [
    //
    uniAppRouter({
      template: env.XT_ROUTER_TEMPLATE === 'true',
    }),

    // uni-app
    uni(),
  ];

  env.XT_USE_MOCK === 'true' && vitePlugins.push(configMockPlugin(isBuild));

  return vitePlugins;
}
