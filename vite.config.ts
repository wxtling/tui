/**
 * https://vitejs.dev/config/
 */
import { ConfigEnv, UserConfig } from 'vite';
import { createVitePlugins } from './build/index';

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

export default ({ command }: ConfigEnv): UserConfig => {
  const env = dotenv.parse(fs.readFileSync(path.resolve(process.cwd(), './.env')));

  return {
    envPrefix: 'XT_',
    plugins: createVitePlugins(env, command === 'build'),
    server: {
      host: true,
      port: 3000,
      proxy: {
        '/api': {
          target: '',
          changeOrigin: true,
          ws: true,
        },
      },
    },
  };
};
