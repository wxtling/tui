import type { RequestFileConfig } from '../types';
import { request } from '../request';

/**
 * 自己的存储服务器
 * @param config
 * @returns
 */
export async function ServerConfig(config: RequestFileConfig): Promise<RequestFileConfig> {
  return config;
}

export function ServerRequestHook({ options, config }: request): string {
  return '';
}
