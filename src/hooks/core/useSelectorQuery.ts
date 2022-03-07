import { getCurrentInstance } from 'vue';

export function useSelectorQuery() {
  const proxy = getCurrentInstance()?.proxy;
  const query = uni.createSelectorQuery().in(proxy);

  function getBoundingClientRect(selector: string, all = false): Promise<UniApp.NodeInfo> {
    return new Promise((resolve) => {
      query[all ? 'selectAll' : 'select'](selector).boundingClientRect(resolve).exec();
    });
  }

  function getFields(selector: string, fields: UniApp.NodeField = {}, all = false): Promise<UniApp.NodeInfo> {
    return new Promise((resolve) => {
      query[all ? 'selectAll' : 'select'](selector).fields(fields, resolve).exec();
    });
  }

  return {
    query,
    getFields,
    getBoundingClientRect,
  };
}
