import type { RequestFileConfig } from '../types';
import { request } from '../request';

import SHA1 from 'crypto-js/sha1';
import HmacSHA1 from 'crypto-js/hmac-sha1';
import { useEnv } from '@/hooks/core/useEnv';
import { createFileName } from '@/utils';

const { getEnv } = useEnv();

function getSkewTime(offset?: number): number {
  return Date.now() + (offset || 0);
}

function KeyTime(): string {
  const now = Math.round(getSkewTime() / 1000) - 1;
  return now + ';' + (now + 900);
}

function getAuth(): string {
  const qKeyTime = KeyTime();
  // 步骤一：计算 SignKey
  const signKey = HmacSHA1(qKeyTime, getEnv('TENCENT_SECRET_KEY') as string).toString();
  // 步骤二：构成 FormatString
  const formatString = ['post', '/', '', '', ''].join('\n');

  // 步骤三：计算 StringToSign
  const stringToSign = ['sha1', qKeyTime, SHA1(formatString).toString(), ''].join('\n');

  // 步骤四：计算 Signature
  const qSignature = HmacSHA1(stringToSign, signKey).toString();

  // 步骤五：构造 Authorization
  return [
    'q-sign-algorithm=sha1',
    'q-ak=' + getEnv('TENCENT_SECRET_ID'),
    'q-sign-time=' + qKeyTime,
    'q-key-time=' + qKeyTime,
    'q-header-list=',
    'q-url-param-list=',
    'q-signature=' + qSignature,
  ].join('&');
}

export function TencentRequestHook({ config, result }: request): string {
  if (result?.statusCode === 200) {
    return getEnv('TENCENT_URL_PREFIX') + '/' + ((config.data as any)?.key || '');
  }
  throw new Error(JSON.stringify(result?.data) || '错误');
}

export async function TencentConfig(config: RequestFileConfig): Promise<RequestFileConfig> {
  const Authorization = getAuth();

  const key = getEnv('TENCENT_PREFIX') + createFileName(config.files.name || config.files.path);

  return {
    url: getEnv('TENCENT_HOST'),
    files: config.files,
    name: 'file',
    data: {
      'Content-Type': '',
      Signature: Authorization,
      key,
      success_action_status: 200,
    },
    header: {
      Authorization,
    },
  };
}
