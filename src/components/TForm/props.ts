import type { PropType } from 'vue';
import type { FormSchema } from './types/form';

import { propTypes } from '@/utils/propTypes';

export const basicProps = {
  model: {
    type: Object as PropType<Recordable>,
    default: {},
  },

  // 表单配置规则
  schemas: {
    type: Array as PropType<FormSchema[]>,
    default: () => [],
  },

  // 标签宽度  固定宽度
  labelWidth: {
    type: [Number, String] as PropType<number | string>,
    default: 150,
  },

  // label 布局
  labelAlign: propTypes.oneOf(['left', 'top']).def('left'),

  // 重置时是否提交表单
  submitOnReset: propTypes.bool.def(true),

  // 额外传递到子组件的参数 values
  mergeDynamicData: {
    type: Object as PropType<Recordable>,
    default: null,
  },

  // 向表单内所有组件传递 disabled 属性，自定义组件需自行实现 disabled 接收
  disabled: propTypes.bool.def(false),

  // 自动设置表单内组件的 placeholder，自定义组件需自行实现
  autoSetPlaceHolder: propTypes.bool.def(true),

  // 在input中输入时按回车自动提交
  autoSubmitOnEnter: propTypes.bool.def(false),

  // 是否显示操作按钮
  showActionButtonGroup: propTypes.bool.def(true),

  // 显示重置按钮
  showResetButton: propTypes.bool.def(true),

  // 显示确认按钮
  showSubmitButton: propTypes.bool.def(true),

  // 	校验信息是否加入 label
  rulesMessageJoinLabel: propTypes.bool.def(true),
  
  // 自定义重置函数
  resetFunc: Function as PropType<() => Promise<void>>,
  submitFunc: Function as PropType<() => Promise<void>>,
};
