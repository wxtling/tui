import type { PagesType } from './types/pages';
import type { QueryType, Options } from './types/index';
import type { NavigateTo, SwitchTab, RedirectTo, ReLaunch } from './types/navigate';
import type { NavOptions, NavResOptions } from './types/nav';

import { getCurrentInstance } from 'vue';
import { Pages } from './types/pages';
import { PageEnum } from '@/enums/pageEnum';
import { isFunction } from '@/utils/is';
import { setObjMethod } from '@/utils';
import { onLoad as uniOnLoad, onUnload } from '@dcloudio/uni-app';
import { EventUUID } from '@/utils/uuid';
import { beforeEach, afterEach, Error } from './intercept';

/**
 * 拼接 URL 参数
 * @param baseUrl
 * @param obj
 * @returns
 */
export function ObjToUrlParams(baseUrl: string, obj?: QueryType): string {
  if (!obj) return baseUrl;
  let parameters = '';
  for (const key in obj) {
    let value = obj[key];
    let isAdd = true;
    switch (typeof value) {
      case 'string':
        value = 'str_t_' + value;
        break;
      case 'number':
        value = 'num_t_' + value.toString();
        break;
      case 'boolean':
        value = 'bool_t_' + value.toString();
        break;
      case 'object':
        value = 'obj_t_' + JSON.stringify(value);
        break;
      case 'function':
        value = 'fun_t_' + key;
        break;
      default:
        isAdd = false;
        break;
    }
    if (isAdd) {
      parameters += key + '=' + encodeURIComponent(value) + '&';
    }
  }
  parameters = parameters.replace(/&$/, '');
  return /\?$/.test(baseUrl) ? baseUrl + parameters : baseUrl.replace(/\/?$/, '?') + parameters;
}

/**
 * 监听页面加载，其参数为上个页面传递的数据
 * @param next (options: NavResOptions<T>) => void
 */
export function onLoad<T extends keyof NavOptions>(
  next: (options: NavResOptions<T>) => void,
): void {
  const proxy: any = getCurrentInstance()?.proxy;
  // #ifdef H5
  const EventNames: string[] = [];
  // #endif

  function getEvent(): any {
    let Event: any;
    // #ifdef APP-NVUE
    Event = proxy.$scope.eventChannel; // 兼容APP-NVUE
    // #endif

    // #ifndef APP-NVUE
    Event = proxy.getOpenerEventChannel();
    // #endif

    return Event;
  }

  uniOnLoad((obj: any = {}) => {
    const Event = getEvent();
    let options: any = <NavResOptions<T>>setObjMethod();

    for (const key in obj) {
      const values: string[] = decodeURIComponent(obj[key]).split('_t_');
      switch (values[0]) {
        case 'str':
          options[key] = values[1];
          break;
        case 'num':
          options[key] = parseFloat(values[1]);
          break;
        case 'bool':
          options[key] = values[1] === 'true';
          break;
        case 'obj':
          try {
            options[key] = JSON.parse(values[1]);
          } catch (error) {
            options[key] = values[1];
          }
          break;
        case 'fun':
          // #ifdef H5
          const ke = values[1].substring(0, values[1].lastIndexOf('_'));
          options[ke] = (...abc: any) => uni.$emit(values[1], ...abc);
          EventNames.push(values[1]);
          // #endif

          // #ifndef H5
          options[values[1]] = (...abc: any) => Event.emit(values[1], ...abc);
          // #endif

          break;
        default:
          options[key] = values[0];
          break;
      }
    }

    if (options.delivery) {
      // #ifdef H5
      uni.$once(options.delivery, (op: any) => {
        next(<NavResOptions<T>>setObjMethod(op));
      });
      // #endif

      // #ifndef H5
      Event.once(options.delivery, (op: any) => {
        next(<NavResOptions<T>>setObjMethod(op));
      });
      // #endif

      return;
    }

    return next(options);
  });

  // #ifdef H5
  onUnload(() => {
    EventNames.forEach((name) => {
      uni.$off(name);
    });
  });
  // #endif
}

/**
 * 通过路由别名，获取完整URL信息
 * @param name 路由别名
 * @param query 传递的数据
 * @returns
 */
export function getUrl(name: PagesType, query?: QueryType) {
  return ObjToUrlParams(Pages[name], query);
}

/**
 * 通过url 地址，获取路由别名信息
 * @param url
 * @returns 路由别名
 */
export function getUrlName(url?: string): PagesType | undefined {
  if (!url) return;
  let name: PagesType | undefined;
  for (const key in Pages) {
    if ((Pages as any)[key] === url) {
      name = key as any;
      break;
    }
  }
  return name;
}

/**
 * 保留当前页面，跳转到应用内的某个页面
 * @param name 模块配置中的 name
 * @param options 参数
 * @returns
 */
const optType = ['animationType', 'animationDuration']; // 不传递的参数
export const navigateTo: NavigateTo = (
  name: PagesType,
  options?: Options,
  delivery?: 'implicit',
) => {
  return new Promise(async (resolve, reject) => {
    let query: QueryType = {};
    let opt: Options & { events?: { [x: string]: (...abc: any) => void } } = {};
    for (const key in options) {
      const value = options[key];
      if (isFunction(value) && delivery !== 'implicit') {
        // #ifndef H5
        opt['events'] = opt['events'] || {};
        opt['events'][key] = value;
        // #endif

        // #ifdef H5
        const name = EventUUID(key);
        uni.$on(name, value);
        query[name] = value;
        continue;
        // #endif
      }
      if (optType.includes(key)) {
        opt[key] = value;
        continue;
      }
      query[key] = value as any;
    }

    try {
      await beforeEach(name, query);
    } catch (err) {
      Error(err, name, query);
      return reject(err);
    }

    let onParams: string = '';
    if (delivery === 'implicit') {
      onParams = EventUUID('onParams');
    }

    uni.navigateTo({
      url:
        '/' +
        getUrl(
          name,
          delivery === 'implicit'
            ? {
                delivery: onParams,
              }
            : query,
        ),
      success: (res) => {
        if (delivery === 'implicit') {
          // #ifdef H5
          setTimeout(() => {
            uni.$emit(onParams, query);
          }, 30);
          // #endif

          // #ifndef H5
          res.eventChannel.emit(onParams, query);
          // #endif
        }

        resolve(res);
        afterEach(name, query);
      },
      fail: (err) => {
        reject(err);
        Error(err, name, query);
      },
      ...opt,
    });
  });
};

function toRouter(
  type: 'switchTab' | 'redirectTo' | 'reLaunch',
  name: PagesType,
  query?: QueryType,
) {
  return new Promise(async (resolve, reject) => {
    try {
      await beforeEach(name, query);
    } catch (err) {
      Error(err, name, query);
      return reject(err);
    }

    uni[type]({
      url: '/' + getUrl(name, query),
      success: (res) => {
        resolve(res);
        afterEach(name, query);
      },
      fail: (err) => {
        reject(err);
        Error(err, name, query);
      },
    });
  });
}

/**
 * 跳转到 tabBar 页面，并关闭其他所有非 tabBar 页面
 * @param name 模块配置中的 name
 * @param query 参数
 * @returns
 */
export const switchTab: SwitchTab = (name: PagesType) => {
  return toRouter('switchTab', name);
};

/**
 * 关闭当前页面，跳转到应用内的某个页面
 * @param name 模块配置中的 name
 * @param query 参数
 * @returns
 */
export const redirectTo: RedirectTo = (name: PagesType, query?: QueryType) => {
  return toRouter('redirectTo', name, query);
};

/**
 * 关闭所有页面，打开到应用内的某个页面。
 * @param name 模块配置中的 name
 * @param query 参数
 * @returns
 */
export const reLaunch: ReLaunch = (name: PagesType, query?: QueryType) => {
  return toRouter('reLaunch', name, query);
};

/**
 * 路由返回上一级
 * @param delta 返回的页面数，如果 delta 大于现有页面数，则返回到首页。
 */
export function navigateBack(delta = 1) {
  return (uni.navigateBack({ delta }) as unknown as Promise<any>).catch(() => {
    switchTab(PageEnum.BASE_HOME);
  });
}
