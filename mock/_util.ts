export function resultSuccess<T = Recordable>(result: T, { message = 'ok' } = {}) {
  return {
    code: 200,
    result,
    message,
    type: 'success',
  };
}

export function resultError(message = 'Request failed', { code = -1, result = null } = {}) {
  return {
    code,
    result,
    message,
    type: 'error',
  };
}


export interface RequestParams {
  method: string;
  headers?: Recordable;
  query: Recordable;
}
