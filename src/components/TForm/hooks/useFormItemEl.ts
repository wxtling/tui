import type { ComputedRef } from 'vue';
import type { FormSchema } from '../types/form';

import { ref, unref } from 'vue';
import { useProvideForm } from './useContext';

import { isString, isArray } from '@/utils/is';

export interface FormItemEl {
  validate(nameList?: string | string[] | undefined): Promise<any>;
  clearValidate(name?: string | string[] | undefined): void;
  scrollToField(name: string): void;
  isFormItems: boolean;
}
export interface FormItem {
  validate: () => Promise<any>;
  clearValidate: () => void;
  scrollToField: () => void;
}

export function useFormItemEl({ getSchema }: { getSchema: ComputedRef<FormSchema[]> }): FormItemEl {
  const TFormItems = ref<{ [x: string]: FormItem | undefined }>({});

  function addField(key: string, el: FormItem) {
    TFormItems.value[key] = el;
  }

  function removeField(key: string) {
    TFormItems.value[key] = undefined;
    delete TFormItems.value[key];
  }

  useProvideForm({
    addField,
    removeField,
  });

  return {
    validate(names?: string | string[]) {
      return new Promise((resolve, reject) => {
        if (isString(names) && names) {
          return unref(TFormItems)
            [names]?.validate()
            .then((res) => {
              if (res.errors) return reject(res.errors);
              resolve(res.data);
            });
        }

        let promises: Promise<any>[] = [];

        if (isArray(names) && names.length > 0) {
          promises = names.map((key) => unref(TFormItems)[key]?.validate()) as unknown as Promise<any>[];
        } else {
          promises = Object.keys(unref(TFormItems)).map((item) => unref(TFormItems)[item]?.validate()) as unknown as Promise<any>[];
        }

        Promise.all(promises).then((res) => {
          if (res.some((item) => item.errors)) {
            return reject(res.filter((item) => item.errors).map((item) => item.errors));
          }
          let data: Recordable = {};
          res.forEach((item) => {
            data = {
              ...data,
              ...item.res,
            };
          });
          return resolve(data);
        });
      });
    },

    clearValidate(names?: string | string[]) {
      if (isString(names) && names) {
        if (unref(TFormItems)[names]) {
          return unref(TFormItems)[names]?.clearValidate();
        }
        throw '错误的 field ：' + names;
      }

      if (isArray(names) && names.length > 0) {
        names.forEach((item) => unref(TFormItems)[item]?.clearValidate());
      } else {
        Object.keys(unref(TFormItems)).forEach((item) => unref(TFormItems)[item]?.clearValidate());
      }
    },

    scrollToField(name: string) {
      if (name && unref(TFormItems)[name]) {
        return unref(TFormItems)[name]?.scrollToField();
      }
      throw '错误的 field ：' + name;
    },

    get isFormItems() {
      return Object.keys(unref(TFormItems)).length !== 0;
    },
  };
}
