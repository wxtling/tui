import type { RequestConfig, RequestOptions, RequestFileConfig, Server } from './types';
import { request, createRequest } from './request';

import { useEnv } from '@/hooks/core/useEnv';

import { ServerConfig, ServerRequestHook } from './server/index';
import { AliyunConfig, AliyunRequestHook } from './server/aliyun';
import { QiniuConfig, QiniuRequestHook } from './server/qiniu';
import { TencentConfig, TencentRequestHook } from './server/tencent';

const { getEnv } = useEnv();

export class RequestTransform extends request {
  constructor(op: { config: RequestConfig; options?: RequestOptions }) {
    super(op);
  }

  /**
   * 处理请求数据。如果数据不是预期格式，可直接抛出错误
   */
  async requestHook(): Promise<any> | never {
    // 文件处理
    switch (this.config.server) {
      case 'server':
        return ServerRequestHook(this);
      case 'tencent':
        return TencentRequestHook(this);
      case 'qiniu':
        return QiniuRequestHook(this);
      case 'aliyun':
        return AliyunRequestHook(this);
    }

    if (this.result && this.result.statusCode === 200) {
      const { code, result } = this.result.data;
      if (code === 200) {
        return result;
      }
    }

    throw new Error((this.result?.data?.message || JSON.stringify(this.result?.data)) as string);
  }

  /**
   * 请求之前处理 config
   */
  async beforeRequestHook() {
    // 文件上传处理
    if (this.config.files && !this.config.url) {
      const server = this.config.server || getEnv('REQUEST_FILE_SERVER');
      switch (server) {
        case 'server':
          this.config = (await ServerConfig(this.config as RequestFileConfig)) as RequestConfig;
          break;
        case 'tencent':
          this.config = (await TencentConfig(this.config as RequestFileConfig)) as RequestConfig;
          break;
        case 'qiniu':
          this.config = (await QiniuConfig(this.config as RequestFileConfig)) as RequestConfig;
          break;
        case 'aliyun':
          this.config = (await AliyunConfig(this.config as RequestFileConfig)) as RequestConfig;
          break;
      }
      this.config.server = server as Server;
      return;
    }
  }

  /**
   * 响应错误处理
   */
  requestCatchHook() {
    console.error('CatchHook =>', this);
  }

  /**
   *  接口调用结束的回调函数（调用成功、失败都会执行）
   */
  requestComplete() {
    console.log('Complete =>', this);
  }
}

export const defHttp = createRequest();
