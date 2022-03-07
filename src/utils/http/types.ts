export type RequestType = 'GET' | 'POST' | 'PUT' | 'DELETE';
export type Server = 'tencent' | 'qiniu' | 'aliyun' | 'server';

export interface Request<T = any> {
  data: T;
  statusCode: Number;
  header: object;
}

export interface Result<T = any> {
  code: number;
  type: 'success' | 'error';
  message: string;
  result: T;
}

export interface RequestConfig {
  url: string;
  data?: object | string | any[];
  header?: object;
  method?: RequestType;
  timeout?: number;

  /**
   * 上传文件资源的路径 (只有文件上传有)
   */
  files?: TempFile;

  /**
   * 没有 URL 地址才会生效
   * 默认是环境变量 REQUEST_FILE_SERVER
   * 文件资源服务器 (只有文件上传有)
   */
  server?: Server;
}

export type RequestOptions<T = any> = {
  /**
   * 监听上传进度变化(只有文件上传有)
   */
  onProgressUpdate?: (res: T) => void;
};

export interface RequestFileConfig {
  /**
   * 上传文件资源的路径
   */
  files: TempFile;

  url?: string;

  /**
   * 文件对应的 key , 开发者在服务器端通过这个 key 可以获取到文件二进制内容
   */
  name?: string;

  /**
   *  请求中其他额外的 form data
   */
  data?: object;
  header?: object;

  timeout?: number;
  server?: Server;
}

export interface RequestFilesConfig {
  /**
   * 是要上传文件资源的路径。
   */
  files: TempFile[];

  url?: string;

  /**
   * 文件对应的 key , 开发者在服务器端通过这个 key 可以获取到文件二进制内容
   */
  name?: string;

  /**
   *  请求中其他额外的 form data
   */
  data?: object;
  header?: object;

  timeout?: number;
  server?: Server;
}

export interface Progress {
  /**
   * 上传进度百分比
   */
  progress: number;
  /**
   * 已经上传的数据长度，单位 Bytes
   */
  totalBytesSent: number;

  /**
   * 预期需要上传的数据总长度，单位 Bytes
   */
  totalBytesExpectedToSend: number;
}

export type Files = {
  <T = string>(config: RequestFileConfig, options?: RequestOptions<Progress>): Promise<T>;
  <T = string>(config: RequestFilesConfig, options?: RequestOptions<Map<number, Progress>>): Promise<T[]>;
};
