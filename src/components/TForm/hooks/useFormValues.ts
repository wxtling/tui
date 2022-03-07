import type { Ref, ComputedRef } from 'vue';
import type { FormSchema } from '../types/form';

import { unref } from 'vue';
import { set } from 'lodash-es';

import { isArray, isFunction, isObject, isString, isNullOrUnDef } from '@/utils/is';

interface UseFormValuesContext {
  defaultValueRef: Ref<any>;
  getSchema: ComputedRef<FormSchema[]>;
  formModel: Recordable;
  emit: (event: 'reset' | 'submit' | 'register' | 'update:model', ...args: any[]) => void;
}

export function useFormValues({
  defaultValueRef,
  getSchema,
  formModel,
  emit,
}: UseFormValuesContext) {
  function handleFormValues(values: Recordable) {
    if (!isObject(values)) {
      return {};
    }
    const res: Recordable = {};
    for (const item of Object.entries(values)) {
      let [, value] = item;
      const [key] = item;
      if (!key || (isArray(value) && value.length === 0) || isFunction(value)) {
        continue;
      }

      if (isString(value)) {
        value = value.trim();
      }

      set(res, key, value);
    }
    return res;
  }

  function initDefault() {
    const schemas = unref(getSchema);
    const obj: Recordable = {};
    schemas.forEach((item) => {
      const { defaultValue } = item;
      if (!isNullOrUnDef(defaultValue)) {
        obj[item.field] = defaultValue;
        formModel[item.field] = defaultValue;
      }
    });
    defaultValueRef.value = obj;
  }

  return {
    handleFormValues,
    initDefault,
  };
}
