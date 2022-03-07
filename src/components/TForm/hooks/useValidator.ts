import type { TRules, Rules } from '../types/validator';
import type { ComputedRef } from 'vue';
import type { FormProps, FormSchema } from '../types/form';

import { ref, unref, computed, watchEffect, toRaw } from 'vue';
import Schema from 'async-validator';
import { cloneDeep } from 'lodash-es';

import { isFunction, isNull, isEmpty, isString } from '@/utils/is';
import { createPlaceholderMessage, rulesType } from '../helper';

export function useValidator({
  schema,
  getValues,
  formProps,
}: {
  schema: FormSchema;
  getValues: ComputedRef<{
    field: string;
    model: Recordable<any>;
    values: Recordable<any>;
    schema: FormSchema;
  }>;
  formProps: FormProps;
}) {
  const validator = new Schema({});
  const rules = ref<TRules>([]);

  watchEffect(() => {
    const { rules: defRules, component, label, rulesMessageJoinLabel, required, dynamicRules } = schema;

    if (isFunction(dynamicRules)) {
      rules.value = dynamicRules(unref(getValues)) as TRules;
    } else {
      rules.value = defRules ? (cloneDeep(defRules) as TRules) : [];
      const { rulesMessageJoinLabel: globalRulesMessageJoinLabel } = formProps;

      const joinLabel = Reflect.has(schema, 'rulesMessageJoinLabel') ? rulesMessageJoinLabel : globalRulesMessageJoinLabel;

      const defaultMsg = createPlaceholderMessage(component) + `${joinLabel ? label : ''}`;

      function asyncValidator(rule: any, value: any): Promise<void> {
        return new Promise((resolve, reject) => {
          const msg = rule.message || defaultMsg;
          if (value === undefined || isNull(value) || isEmpty(value) || (isString(value) && value.trim() === '')) {
            return reject(msg);
          }
          return resolve();
        });
      }

      const getRequired = isFunction(required) ? required(unref(getValues)) : required;

      if ((!rules || rules.value.length === 0) && getRequired) {
        rules.value = [{ required: getRequired, asyncValidator }];
      }
    }

    if (rules) {
      rules.value = rules.value.map((item) => ({
        ...item,
        ...(item.type ? rulesType[item?.type] || {} : {}),
      }));

      validator.define({
        [schema.field]: toRaw(rules.value) as unknown as Rules,
      });
    }
  });

  const getRequired = computed(() => rules.value?.some((item) => item.required === true));

  return {
    getRequired,
    validator: () => {
      const data = { [schema.field]: unref(getValues).model[schema.field] };
      return new Promise((resolve, reject) => {
        validator.validate(data, (errors) => {
          if (errors) {
            return reject(errors[0]);
          }
          return resolve(data);
        });
      });
    },
  };
}
