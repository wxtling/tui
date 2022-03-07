import type { PagesType } from './types/pages';
import type { QueryType } from './types/index';

/**
 * 路由跳转前执行
 * @param name 路由别名
 * @param options 页面参数
 * @returns Promise<any>
 */
export function beforeEach(name: PagesType, options?: QueryType): Promise<any> {
  return new Promise((resolve, reject) => {
    resolve('');
  });
}

/**
 * 路由跳转后执行
 * @param name 路由别名
 * @param options 页面参数
 * @returns
 */
export function afterEach(name: PagesType, options?: QueryType): void {}

/**
 * 路由跳转错误信息
 * @param name 路由别名
 * @param options 页面参数
 */
export function Error(error: unknown, name: PagesType, options?: QueryType): void {
  console.error(name + ' => ');
  console.error(error);
}
