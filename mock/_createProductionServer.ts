import type { MockMethod } from 'vite-plugin-mock';

import { mock } from 'mockjs';

import { useEnv } from '@/hooks/core/useEnv';

const modules = import.meta.globEager('./**/*.ts');

const mockModules: any[] = [];
Object.keys(modules).forEach((key) => {
  if (key.includes('/_')) {
    return;
  }
  modules[key].default && mockModules.push(...modules[key].default);
});

export function setupProdMockServer() {
  const { getEnv } = useEnv();
  function sleep(time: number) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('');
      }, time);
    });
  }

  uni.addInterceptor('request', {
    invoke: (args) => {
      let options = Object.assign({}, { ...args });

      delete options.success;
      delete options.fail;
      delete options.complete;

      const method = options.method || 'GET';
      const mockItem: MockMethod | undefined = mockModules.find(
        (item) =>
          item.method.toLowerCase() === method.toLowerCase() &&
          getEnv('BASE_URL') + item.url === options.url,
      );
      if (mockItem) {
        const toMock = async () => {
          if (mockItem.timeout) {
            await sleep(mockItem.timeout);
          }
          const response =
            typeof mockItem.response === 'function'
              ? mockItem.response({
                  method,
                  headers: options.header || {},
                  query: options.data || {},
                })
              : mockItem.response;

          args.success &&
            args.success({
              data: mock(response),
              statusCode: mockItem.statusCode || 200,
            });
        };

        toMock();
        throw `mock ${args.url}`;
      }
    },
  });
}
