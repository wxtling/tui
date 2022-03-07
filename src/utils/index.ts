import { unref } from 'vue';
import md5 from 'crypto-js/md5';

import { isObject, isString } from '@/utils/is';
import { formatToDateTime } from '@/utils/dateUtil';
import { buildUUID } from '@/utils/uuid';
/**
 * 给对象添加一些自定义方法
 * @param obj Object 实例
 * @returns Object
 */
export function setObjMethod<T = object>(obj: object = {}) {
  return Object.assign(
    Object.create({
      get(key: keyof T, value: any) {
        const v = (this as any)[key];
        return v === undefined ? value : v;
      },
    }),
    obj,
  ) as T;
}

export function getDynamicProps<T, U>(props: T): Partial<U> {
  const ret: Recordable = {};

  Object.keys(props).map((key) => {
    ret[key] = unref((props as Recordable)[key]);
  });

  return ret as Partial<U>;
}

/**
 * 深度 合并
 * @param src
 * @param target
 * @returns
 */
export function deepMerge<T = any>(src: any = {}, target: any = {}): T {
  let key: string;
  for (key in target) {
    src[key] = isObject(src[key]) ? deepMerge(src[key], target[key]) : (src[key] = target[key]);
  }
  return src;
}

/**
 * 提示
 * @param data 提示内容
 * @param {string} icon 提示图标
 */
export function Toast(
  data?: UniApp.ShowToastOptions | string,
  icon?: 'success' | 'error',
  duration = 2500,
) {
  if (!data) return;
  data = isString(data) ? { title: data } : data;
  uni.showToast({
    duration,
    icon: icon || 'none',
    ...data,
  });
}

/**
 * 获取后缀名
 * @param path
 * @returns
 */
export function getFileSuffix(path: string) {
  return path.split('.').pop()?.toLowerCase();
}

/**
 * 生成文件名
 * @param path
 * @returns
 */
export function createFileName(path: string) {
  return md5(formatToDateTime() + buildUUID(14)) + '.' + getFileSuffix(path);
}
