import type {
  Request,
  Result,
  RequestConfig,
  RequestOptions,
  RequestFileConfig,
  RequestFilesConfig,
  Progress,
  Files,
} from './types';

import { cloneDeep } from 'lodash-es';

import { useEnv } from '@/hooks/core/useEnv';
import { useI18n } from '@/locales';
import { isArray, isReqUrl } from '@/utils/is';

import { RequestTransform } from './index';

const { getEnv } = useEnv();
const { t } = useI18n();

/**
 * 当前是否有网络连接
 */
let isConnected = true;

// 获取网络类型
uni.getNetworkType({
  success: (res) => {
    isConnected = res.networkType !== 'none';
  },
});

// 监听网络状态变化
uni.onNetworkStatusChange((res) => {
  isConnected = res.networkType !== 'none';
});

export abstract class request {
  public config: RequestConfig;
  public options: RequestOptions;
  public result: Request<Result> | undefined;
  public error: any;
  public requestTask: any; // requestTask 对象
  constructor({ config, options }: { config: RequestConfig; options?: RequestOptions }) {
    this.config = config;
    this.options = options || {};
  }

  async beforeRequestHook() {}
  async requestHook(): Promise<any> | never {}
  requestCatchHook() {}
  requestComplete() {}
  resolve(un: any) {}
  reject(err: any) {}

  /**
   * 请求地址
   */
  getUrl(url: string = ''): string {
    return url && isReqUrl(url) ? url : getEnv('BASE_URL') + url;
  }

  // 显示网络不可用
  showNetworkUnavailable() {
    if (isConnected) return false;
    const msg = t('sys.api.networkUnavailable');
    uni.showToast({
      icon: 'none',
      title: msg,
    });
    return msg;
  }

  /**
   * 请求之前处理数据
   * @returns
   */
  private async createData() {
    const networkErr = this.showNetworkUnavailable();
    if (networkErr) {
      this.Error(networkErr);
      return true;
    }

    try {
      await this.beforeRequestHook();
    } catch (err) {
      this.Error(err);
      return true;
    }
  }

  /**
   * 收到开发者服务器成功返回的回调函数
   * @param result
   * @returns
   */
  private async Success(result: any) {
    this.result = result;
    this.requestComplete();
    try {
      const res = await this.requestHook();
      return this.resolve(res);
    } catch (err) {
      this.error = err;
      this.requestCatchHook();
      return this.reject(err);
    }
  }

  /**
   * 	接口调用失败的回调函数
   * @param err
   * @returns
   */
  private async Error(err: any) {
    this.error = err;
    this.requestComplete();
    this.requestCatchHook();
    return this.reject(err);
  }

  // 发起网络请求
  req<T = any>(): Promise<T> {
    return new Promise(async (resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;

      const err = await this.createData();
      if (err === true) return;

      this.requestTask = uni.request({
        ...{
          ...this.config,
          url: this.getUrl(this.config?.url),
        },
        success: (res) => this.Success(res),
        fail: (err) => this.Error(err),
      });
    });
  }

  // 文件上传
  file<T = any>(): Promise<T> {
    return new Promise(async (resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;

      const err = await this.createData();
      if (err === true) return;

      const parame = this.config as RequestFileConfig;

      this.requestTask = uni.uploadFile({
        url: this.getUrl(parame?.url),
        filePath: parame.files.path,
        name: parame.name || 'file',
        formData: parame.data,
        header: parame.header,
        timeout: parame.timeout,
        success: (res) => this.Success(res),
        fail: (err) => this.Error(err),
      });

      this.requestTask?.onProgressUpdate(this.options?.onProgressUpdate ?? (() => {}));
    });
  }
}

export function createRequest() {
  const files: Files = <T = any>(
    config: RequestFileConfig | RequestFilesConfig,
    options: any,
  ): Promise<T | T[]> => {
    const files = config.files;
    if (!isArray(files))
      return new RequestTransform({
        config: config as RequestConfig,
        options,
      }).file<T>();
    const progress = new Map<number, Progress>();
    const uploads: Promise<T>[] = files.map((files, k) => {
      progress.set(k, {
        progress: 0,
        totalBytesSent: 0,
        totalBytesExpectedToSend: 0,
      });
      return new RequestTransform({
        config: { ...config, files } as RequestConfig,
        options: {
          ...options,
          onProgressUpdate(res) {
            progress.set(k, cloneDeep(res));
            options?.onProgressUpdate(progress);
          },
        },
      }).file<T>();
    });
    return Promise.all(uploads);
  };

  return {
    get: <T = any>(config: RequestConfig, options?: RequestOptions): Promise<T> =>
      new RequestTransform({
        config: { ...config, method: 'GET' },
        options,
      }).req<T>(),
    post: <T = any>(config: RequestConfig, options?: RequestOptions): Promise<T> =>
      new RequestTransform({
        config: { ...config, method: 'POST' },
        options,
      }).req<T>(),
    put: <T = any>(config: RequestConfig, options?: RequestOptions): Promise<T> =>
      new RequestTransform({
        config: { ...config, method: 'PUT' },
        options,
      }).req<T>(),
    delete: <T = any>(config: RequestConfig, options?: RequestOptions): Promise<T> =>
      new RequestTransform({
        config: { ...config, method: 'DELETE' },
        options,
      }).req<T>(),
    files,
  };
}
