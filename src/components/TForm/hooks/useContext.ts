import type { ComputedRef } from 'vue';
import type { FormSchema } from '../types/form';
import type { FormItem } from './useFormItemEl';

import { inject, unref, provide, computed } from 'vue';
import { createPlaceholderMessage } from '../helper';

interface FormContextProps {
  addField: (key: string, _field: FormItem) => void;
  removeField: (key: string) => void;
}

export function useProvideForm(state: FormContextProps) {
  provide('FormItemEl', state);
}

export function useInjectItem() {
  return inject('FormItemEl', {
    addField: (key: string, _field: FormItem) => {},
    removeField: (key: string) => {},
  });
}

export function useFormItem(props: Recordable) {
  const FormItem = inject<
    | {
        getValues: ComputedRef<{
          field: string;
          model: Recordable<any>;
          values: Recordable<any>;
          schema: FormSchema;
        }>;
        getComponentsProps: any;
        getDisable: boolean;
        setFormModel: (value: any) => void;
        onFocus: () => void;
        onBlur: () => void;
        validate: () => void;
        onFormItemConfirm: () => void;
      }
    | undefined
  >('TFormItem', undefined);

  const getProps = computed(() => {
    if (FormItem) {
      const getValues = unref(FormItem.getValues);
      const ComponentsProps = unref(FormItem.getComponentsProps);
      return {
        ...ComponentsProps,
        modelValue: getValues.model[getValues.field],
        disabled: unref(FormItem.getDisable),
        isClose: ComponentsProps?.isClose ?? props.isClose,
        placeholder: unref(FormItem.getComponentsProps)?.placeholder || createPlaceholderMessage(unref(FormItem.getValues).schema.component),
      };
    }
    return props;
  });

  return {
    FormItem,
    getProps,
    setFormModel: (value: string) => FormItem && FormItem.setFormModel(value),
    onFormItemFocus: () => FormItem && FormItem.onFocus(),
    onFormItemBlur: () => FormItem && FormItem.onBlur(),
    onFormItemConfirm: () => FormItem && FormItem.onFormItemConfirm(),
    validate: () => FormItem && FormItem.validate(),
  };
}
