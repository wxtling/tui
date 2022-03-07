import type { Rules } from './types/validator';
import type { ComponentType } from './types/index';

import { useI18n } from '@/locales';

const { t } = useI18n();
export const rulesType: Rules = {
  phone: {
    type: 'string',
    pattern: /^[1][3,4,5,6,7,8,9][0-9]{9}$/,
    message: () => t('components.form.phone'),
  },
  tel: {
    type: 'string',
    validator: (rule, value) =>
      /^[1][3,4,5,6,7,8,9][0-9]{9}$/.test(value) ||
      /^(?:(?:\d{3}-)?\d{8}|^(?:\d{4}-)?\d{7,8})(?:-\d+)?$/.test(value),
    message: () => t('components.form.tel'),
  },
  wechat: {
    type: 'string',
    pattern: /^[a-zA-Z][-_a-zA-Z0-9]{5,19}$/,
    message: () => t('components.form.wechat'),
  },
};

/**
 * @description: 生成placeholder
 */
export function createPlaceholderMessage(component: ComponentType) {
  if (component.includes('Input') || component.includes('InputTextArea')) {
    return t('components.form.inputText');
  }
  if (
    component.includes('Select') ||
    component.includes('Picker') ||
    component.includes('PickerDate') ||
    component.includes('Radio') ||
    component.includes('Checkbox')
  ) {
    return t('components.form.chooseText');
  }
  return '';
}


export const DATE_TYPE = ['PickerDate'];


export const defaultValueComponents = ['Input', 'InputTextArea'];
