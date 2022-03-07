import type { TRules } from './validator';
import type { ComponentType } from './index';

export interface RenderCallbackParams {
  schema: FormSchema;
  values: Recordable;
  model: Recordable;
  field: string;
}

export interface FormProps {
  // 表单的双向绑定对象
  model?: Recordable;

  // 表单配置，  FormSchema 配置
  schemas?: FormSchema[];

  // 增加 label 宽度，表单内所有组件适用
  labelWidth?: number | string;

  //label 布局
  labelAlign?: 'left' | 'top';

  // 重置时是否提交表单
  submitOnReset?: boolean;

  // 额外传递到子组件的参数 values
  mergeDynamicData?: Recordable;

  // 向表单内所有组件传递 disabled 属性，自定义组件需自行实现 disabled 接收
  disabled?: boolean;

  // 自动设置表单内组件的 placeholder，自定义组件需自行实现
  autoSetPlaceHolder?: boolean;

  // 在input中输入时按回车自动提交
  autoSubmitOnEnter?: boolean;

  //是否显示操作按钮(重置/提交)
  showActionButtonGroup?: boolean;

  // 是否显示重置按钮
  showResetButton?: boolean;

  // 是否显示提交按钮
  showSubmitButton?: boolean;

  // 	校验信息是否加入 label
  rulesMessageJoinLabel?: boolean;

  // 自定义重置按钮逻辑() => Promise<void>;
  resetFunc?: () => Promise<void>;

  // 自定义提交按钮逻辑() => Promise<void>;
  submitFunc?: () => Promise<void>;
}

export interface FormActionType {
  /**
   * 提交表单
   */
  submit: () => Promise<void>;

  /**
   * 设置表单字段值
   */
  setFieldsValue: <T>(values: T) => Promise<void>;

  /**
   * 重置表单值
   */
  resetFields: () => Promise<void>;

  /**
   * 获取表单值
   */
  getFieldsValue: () => Recordable;

  /**
   * 清空校验
   */
  clearValidate: (name?: string | string[]) => Promise<void>;

  /**
   * 更新表单的 schema, 只更新函数所传的参数
   */
  updateSchema: (data: Partial<FormSchema> | Partial<FormSchema>[]) => Promise<void>;
  resetSchema: (data: Partial<FormSchema> | Partial<FormSchema>[]) => Promise<void>;
  /**
   * 设置表单 Props
   */
  setProps: (formProps: Partial<FormProps>) => Promise<void>;

  /**
   *  根据 field 删除 Schema
   */
  removeSchemaByFiled: (field: string | string[]) => Promise<void>;

  /**
   * 插入到指定 filed 后面，如果没传指定 field，则插入到最后,当 first = true 时插入到第一个位置
   */
  appendSchemaByField: (schema: FormSchema, prefixField?: string, first?: boolean) => Promise<void>;

  /**
   * 校验整个表单
   */
  validate: (nameList?: string | string[]) => Promise<any>;

  /**
   * 滚动到对应字段位置
   */
  scrollToField: (name: string) => Promise<void>;
}

export type RegisterFn = (formInstance: FormActionType) => void;

export type UseFormReturnType = [RegisterFn, FormActionType];

export interface FormSchema {
  // 字段名
  field: string;

  // 标签名
  label?: string;

  // 覆盖统一设置的 labelWidth
  labelWidth?: string | number;

  // 覆盖统一设置的 labelAlign
  labelAlign?: 'left' | 'top';

  // 组件类型
  component: ComponentType;

  // 所渲染的组件的 props
  componentProps?:
    | ((opt: {
        schema: FormSchema;
        formActionType: FormActionType;
        formModel: Recordable;
      }) => Recordable)
    | object;

  // 校验规则
  rules?: TRules;

  // 	校验信息是否加入 label
  rulesMessageJoinLabel?: boolean;
  
  // 简化 rules 配置，为 true 则转化成 [{required:true}]
  required?: boolean | ((renderCallbackParams: RenderCallbackParams) => boolean);

  // 默认值
  defaultValue?: any;

  // 自定义 slot，渲染组件
  slot?: string;

  // 动态判断当前组件是否显示
  ifShow?: boolean | ((renderCallbackParams: RenderCallbackParams) => boolean);

  // 动态判断当前组件是否禁用
  dynamicDisabled?: boolean | ((renderCallbackParams: RenderCallbackParams) => boolean);

  // 动态判返当前组件你校验规则
  dynamicRules?: (renderCallbackParams: RenderCallbackParams) => TRules;
}
