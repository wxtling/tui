import type { RequestFileConfig } from '../types';
import { request } from '../request';

import EncBase64 from 'crypto-js/enc-base64';
import HmacSHA1 from 'crypto-js/hmac-sha1';

import { useEnv } from '@/hooks/core/useEnv';
import { createFileName } from '@/utils';

import { urlSafeBase64Encode } from '@/utils/Base64Encode';

const { getEnv } = useEnv();

export function AliyunRequestHook({ config, result }: request): string {
  if (result?.statusCode === 200 || result?.statusCode === 204) {
    return getEnv('ALIYUN_URL_PREFIX') + '/' + ((config.data as any)?.key || '');
  }
  throw new Error(JSON.stringify(result?.data) || '错误');
}

export async function AliyunConfig(config: RequestFileConfig): Promise<RequestFileConfig> {
  const key = getEnv('ALIYUN_PREFIX') + createFileName(config.files.name || config.files.path);

  const date = new Date();
  date.setSeconds(date.getSeconds() + 10);

  const policyText = {
    expiration: date.toISOString(),
    conditions: [
      // 限制上传大小。
      ['content-length-range', 0, 1024 * 1024 * 100],
    ],
  };

  const policy = urlSafeBase64Encode(JSON.stringify(policyText));

  const signature = HmacSHA1(policy, getEnv('ALIYUN_ACCESS_SECRET')).toString(EncBase64);

  return {
    url: getEnv('ALIYUN_HOST'),
    files: config.files,
    name: 'file',
    data: {
      key,
      policy,
      OSSAccessKeyId: getEnv('ALIYUN_ACCESS_ID'),
      signature,
    },
  };
}
