import type { MockMethod } from 'vite-plugin-mock';
import type { RequestParams } from './_util';

import { resultSuccess } from './_util';

const mock: MockMethod[] = [
  {
    url: '/api/logout',
    timeout: 200,
    method: 'get',
    statusCode: 200,
    response: (request: RequestParams) => { 
      return resultSuccess({ message: 'Token has been destroyed' });
    },
  },
];

export default mock;
