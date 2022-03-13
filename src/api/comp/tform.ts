import type { AreaParams, AreaResult, AreaResultDistricts } from './types';

import { defHttp } from '@/utils/http';
import { useEnv } from '@/hooks/core/useEnv';

const { getEnv } = useEnv();

enum Api {}

export function getArea(data: AreaParams = {}): Promise<AreaResultDistricts[]> {
  return new Promise((resolve, reject) => {
    defHttp
      .get<AreaResult>(
        {
          url: getEnv('AMAP_AREA'),
          data: {
            key: getEnv('AMAP_KEY'),
            ...data,
          },
        },
        {
          isRequestTransform: true,
        },
      )
      .then((res) => {
        if (res.status === '1') {
          return resolve(res.districts);
        }
        reject(res);
      })
      .catch(reject);
  });
}
