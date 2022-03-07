import { Plugin } from 'vite';
import fs from 'fs';
import path from 'path';
import chokidar from 'chokidar';

import { resolveModule } from './getTsfiles';

import createPagesJson from './createPagesJson';

interface Config {
  template?: boolean;
  path?: string;
  pathModules?: string;
  pathConfig?: string;
}

let router = {
  template: true,
  path: 'main',
  pathModules: '/router/modules',
  pathConfig: '/router/config.ts',
};

function getRouterUrl(name: keyof typeof router) {
  return path.join((process.env.UNI_INPUT_DIR as string) + router[name]);
}

async function upData() {
  try {
    let modules: { [x: string]: any } = {};

    modules['config'] = await resolveModule(getRouterUrl('pathConfig'));
    const files = fs.readdirSync(getRouterUrl('pathModules'));
    for (let index = 0; index < files.length; index++) {
      const filename = files[index];
      let name = path.basename(filename, '.ts');
      if (name) {
        modules[name] = await resolveModule(getRouterUrl('pathModules') + '/' + filename);
      }
    }

    createPagesJson(modules, router.path, router.template);
  } catch (error) {
    console.error(error);
  }
}

export default function uniAppRouter(config: Config = {}): Plugin {
  router = { ...router, ...config };
  return {
    name: 'vite-plugin-uni-app-router',
    configResolved(resolvedConfig) {
      if (process.env.NODE_ENV === 'production') {
        upData();
      } else {
        let is_watcher = true;

        const watcher = chokidar.watch([getRouterUrl('pathModules'), getRouterUrl('pathConfig')], {
          ignored: '*.ts',
        });

        watcher.on('all', () => {
          if (is_watcher) return;
          upData();
        });

        setTimeout(() => {
          is_watcher = false;
          upData();
        }, 1000);
      }
    },
  };
}
