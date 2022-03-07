import type { ComputedRef, Ref } from 'vue';
import type { FormProps, FormSchema } from '../types/form';

import { unref, toRaw, nextTick } from 'vue';
import { cloneDeep, uniqBy } from 'lodash-es';

import { isArray, isFunction, isObject, isString, isNumber } from '@/utils/is';
import { deepMerge } from '@/utils';
import { dateUtil } from '@/utils/dateUtil';

import { DATE_TYPE, defaultValueComponents } from '../helper';
import { FormItemEl } from './useFormItemEl';

export interface UseFormActionContext {
  emit: (event: 'reset' | 'submit' | 'register', ...args: any[]) => void;
  getProps: ComputedRef<FormProps>;
  getSchema: ComputedRef<FormSchema[]>;
  formModel: Recordable;
  defaultValueRef: Ref<Recordable>;
  schemaRef: Ref<FormSchema[]>;
  handleFormValues: Fn;
  formItemEl: FormItemEl;
}

export function useFormEvents({ emit, getProps, formModel, getSchema, defaultValueRef, schemaRef, handleFormValues, formItemEl }: UseFormActionContext) {
  async function resetFields(): Promise<void> {
    const { resetFunc, submitOnReset } = unref(getProps);
    resetFunc && isFunction(resetFunc) && (await resetFunc());

    if (!formItemEl || !formItemEl.isFormItems) return;

    Object.keys(formModel).forEach((key) => {
      const schema = unref(getSchema).find((item) => item.field === key);
      const isInput = schema?.component && defaultValueComponents.includes(schema.component);
      formModel[key] = isInput ? defaultValueRef.value[key] || '' : defaultValueRef.value[key];
    });

    nextTick(() => clearValidate());

    emit('reset', toRaw(formModel));
    submitOnReset && handleSubmit();
  }

  async function setFieldsValue(values: Recordable): Promise<void> {
    const fields = unref(getSchema)
      .map((item) => item.field)
      .filter(Boolean);

    const validKeys: string[] = [];
    Object.keys(values).forEach((key) => {
      const schema = unref(getSchema).find((item) => item.field === key);
      let value = values[key];

      if (schema?.component && defaultValueComponents.includes(schema.component)) {
        value = isNumber(value) ? value.toString() : value;
      }

      if (Reflect.has(values, key) && fields.includes(key)) {
        if (itemIsDateType(key)) {
          if (Array.isArray(value)) {
            const arr: any[] = [];
            for (const ele of value) {
              arr.push(ele ? dateUtil(ele) : null);
            }
            formModel[key] = arr;
          } else {
            const { componentProps } = schema || {};
            let _props = componentProps as any;
            if (isFunction(_props)) {
              _props = _props({ formModel });
            }
            formModel[key] = value ? (_props?.valueFormat ? value : dateUtil(value)) : null;
          }
        } else {
          formModel[key] = value;
        }
        validKeys.push(key);
      }
    });
    validate(validKeys).catch((_) => {});
  }

  async function removeSchemaByFiled(fields: string | string[]): Promise<void> {
    const schemaList: FormSchema[] = cloneDeep(unref(getSchema));
    if (!fields) {
      return;
    }
    let fieldList: string[] = isString(fields) ? [fields] : fields;
    for (const field of fieldList) {
      _removeSchemaByFiled(field, schemaList);
    }
    schemaRef.value = schemaList;
  }

  function _removeSchemaByFiled(field: string, schemaList: FormSchema[]): void {
    if (isString(field)) {
      const index = schemaList.findIndex((schema) => schema.field === field);
      if (index !== -1) {
        delete formModel[field];
        schemaList.splice(index, 1);
      }
    }
  }

  async function appendSchemaByField(schema: FormSchema, prefixField?: string, first = false) {
    const schemaList: FormSchema[] = cloneDeep(unref(getSchema));

    const index = schemaList.findIndex((schema) => schema.field === prefixField);

    if (!prefixField || index === -1 || first) {
      first ? schemaList.unshift(schema) : schemaList.push(schema);
      schemaRef.value = schemaList;
      return;
    }
    if (index !== -1) {
      schemaList.splice(index + 1, 0, schema);
    }
    schemaRef.value = schemaList;
  }

  async function resetSchema(data: Partial<FormSchema> | Partial<FormSchema>[]) {
    let updateData: Partial<FormSchema>[] = [];
    if (isObject(data)) {
      updateData.push(data as FormSchema);
    }
    if (isArray(data)) {
      updateData = [...data];
    }

    const hasField = updateData.every((item) => Reflect.has(item, 'field') && item.field);

    if (!hasField) {
      console.error('所有需要更新的 Schema 数组的子表单必须包含 `field` 字段');
      return;
    }
    schemaRef.value = updateData as FormSchema[];
  }

  async function updateSchema(data: Partial<FormSchema> | Partial<FormSchema>[]) {
    let updateData: Partial<FormSchema>[] = [];
    if (isObject(data)) {
      updateData.push(data as FormSchema);
    }
    if (isArray(data)) {
      updateData = [...data];
    }

    const hasField = updateData.every((item) => Reflect.has(item, 'field') && item.field);

    if (!hasField) {
      console.error('所有需要更新的 Schema 数组的子表单必须包含 `field` 字段');
      return;
    }
    const schema: FormSchema[] = [];
    updateData.forEach((item) => {
      unref(getSchema).forEach((val) => {
        if (val.field === item.field) {
          const newSchema = deepMerge(val, item);
          schema.push(newSchema as FormSchema);
        } else {
          schema.push(val);
        }
      });
    });
    schemaRef.value = uniqBy(schema, 'field');
  }

  function getFieldsValue(): Recordable {
    return handleFormValues(toRaw(unref(formModel)));
  }

  function itemIsDateType(key: string) {
    return unref(getSchema).some((item) => {
      return item.field === key ? DATE_TYPE.includes(item.component) : false;
    });
  }

  async function validate(nameList?: string | string[]) {
    return await formItemEl.validate(nameList);
  }

  async function clearValidate(name?: string | string[]) {
    return await formItemEl.clearValidate(name);
  }

  async function scrollToField(name: string) {
    await formItemEl.scrollToField(name);
  }

  async function handleSubmit(): Promise<void> {
    const { submitFunc } = unref(getProps);
    if (submitFunc && isFunction(submitFunc)) {
      return await submitFunc();
    }

    try {
      await validate();
      emit('submit', getFieldsValue());
    } catch (error: any) {
      console.error(error);
    }
  }

  return {
    handleSubmit,
    clearValidate,
    validate,
    getFieldsValue,
    updateSchema,
    resetSchema,
    appendSchemaByField,
    removeSchemaByFiled,
    resetFields,
    setFieldsValue,
    scrollToField,
  };
}
