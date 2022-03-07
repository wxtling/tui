import type { RequestFileConfig } from '../types';
import { request } from '../request';

import EncBase64 from 'crypto-js/enc-base64';
import HmacSHA1 from 'crypto-js/hmac-sha1';

import { useEnv } from '@/hooks/core/useEnv';
import { createFileName } from '@/utils';

import { urlSafeBase64Encode, base64ToUrlSafe } from '@/utils/Base64Encode';

const { getEnv } = useEnv();

export function QiniuRequestHook({ config, result }: request): string {
  if (result?.statusCode === 200) {
    return getEnv('QINIU_URL_PREFIX') + '/' + ((config.data as any)?.key || '');
  }
  throw new Error(JSON.stringify(result?.data) || '错误');
}

export async function QiniuConfig(config: RequestFileConfig): Promise<RequestFileConfig> {
  const key = getEnv('QINIU_PREFIX') + createFileName(config.files.name || config.files.path);

  // 将上传策略序列化成为
  const putPolicy = JSON.stringify({
    scope: getEnv('QINIU_SPACE'),
    deadline: Math.floor(Date.now() / 1000) + 10,
  });

  // 对 JSON 编码的上传策略进行URL 安全的 Base64 编码
  const encodedPutPolicy = urlSafeBase64Encode(putPolicy);

  // 使用访问密钥（AK/SK）对上一步生成的待签名字符串计算HMAC-SHA1签名
  const sign = HmacSHA1(encodedPutPolicy, getEnv('QINIU_SK')).toString(EncBase64);

  // 对签名进行URL安全的Base64编码
  const encodedSign = base64ToUrlSafe(sign);

  // 将访问密钥（AK/SK）、encodedSign 和 encodedPutPolicy 用英文符号 : 连接起来
  const token = getEnv('QINIU_AK') + ':' + encodedSign + ':' + encodedPutPolicy;

  return {
    url: getEnv('QINIU_HOST'),
    files: config.files,
    name: 'file',
    data: {
      key,
      token,
    },
  };
}
