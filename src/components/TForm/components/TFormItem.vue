<template>
  <view class="form-item" v-if="getShow" :id="ID">
    <view :class="{ 'box-left': labelAlign === 'left', 'box-top': labelAlign === 'top' }">
      <text class="required" v-if="getRequired"> * </text>
      <label class="label" :style="labelStyle" v-if="schema.label" :for="schema.field">
        {{ schema.label }}
      </label>
      <view class="item">
        <slot />
      </view>

      <view class="border border-base" />
      <view class="border border-focus" :class="{ 'border-focus-show': isFocus }" />
      <view class="border border-error" :class="{ 'border-error-show': isError }" />
    </view>
    <view class="error-box">
      <view class="error-text" :class="{ 'error-text-show': isError }">
        {{ ErrorText }}
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
  import type { PropType } from 'vue';
  import type { FormActionType, FormProps, FormSchema } from '../types/form';

  import { ref, provide, unref, computed, onMounted, watch } from 'vue';

  import { isNumber, isFunction, isBoolean } from '@/utils/is';

  import { useValidator } from '../hooks/useValidator';
  import { useInjectItem } from '../hooks/useContext';

  import { useSelectorQuery } from '@/hooks/core/useSelectorQuery';

  const { schema, formProps, allDefaultValues, formModel, setFormModel, formActionType } = defineProps({
    schema: {
      type: Object as PropType<FormSchema>,
      default: () => ({}),
    },
    formProps: {
      type: Object as PropType<FormProps>,
      default: () => ({}),
    },
    allDefaultValues: {
      type: Object as PropType<Recordable>,
      default: () => ({}),
    },
    formModel: {
      type: Object as PropType<Recordable>,
      default: () => ({}),
    },
    setFormModel: {
      type: Function as PropType<(key: string, value: any) => void>,
      default: null,
    },
    formActionType: {
      type: Object as PropType<FormActionType>,
    },
  });

  const { addField, removeField } = useInjectItem();
  const { getBoundingClientRect } = useSelectorQuery();

  const isFocus = ref(false);
  const isError = ref(false);
  const ErrorText = ref('');

  const ID = computed(() => 'TFormItem_' + schema.field);

  const getValues = computed(() => ({
    field: schema.field,
    model: formModel,
    values: {
      ...formProps.mergeDynamicData,
      ...allDefaultValues,
      ...formModel,
    } as Recordable,
    schema: schema,
  }));

  const getShow = computed(() => {
    const { ifShow } = schema;
    let isIfShow = true;
    if (isBoolean(ifShow)) {
      isIfShow = ifShow;
    } else if (isFunction(ifShow)) {
      isIfShow = ifShow(unref(getValues));
    }
    return isIfShow;
  });

  const labelAlign = computed(() => schema.labelAlign || formProps.labelAlign);

  const labelStyle = computed(() => {
    const labelWidth = schema.labelWidth ?? formProps.labelWidth;
    return {
      width: labelAlign.value === 'top' ? 'auto' : isNumber(labelWidth) ? labelWidth + 'rpx' : labelWidth,
    };
  });

  const getComponentsProps = computed(() => {
    let componentProps: any = schema.componentProps || {};
    if (isFunction(componentProps)) {
      componentProps = componentProps({ schema, formModel, formActionType }) ?? {};
    }
    return componentProps as Recordable;
  });

  const getDisable = computed(() => {
    const { disabled: globDisabled } = formProps;
    const { dynamicDisabled } = schema;
    const { disabled: itemDisabled = false } = unref(getComponentsProps);
    let disabled = !!globDisabled || itemDisabled;
    if (isBoolean(dynamicDisabled)) {
      disabled = dynamicDisabled;
    }
    if (isFunction(dynamicDisabled)) {
      disabled = dynamicDisabled(unref(getValues));
    }
    return disabled;
  });

  const { validator, getRequired } = useValidator({
    schema,
    getValues,
    formProps,
  });

  const clearValidate = () => {
    isError.value = false;
  };

  const validate = () => {
    return new Promise((resolve, reject) => {
      validator()
        .then((data) => {
          clearValidate();
          resolve({
            data,
          });
        })
        .catch((err) => {
          ErrorText.value = err?.message;
          isError.value = true;
          resolve({
            errors: err,
          });
        });
    });
  };

  const scrollToField = async () => {
    const res = await getBoundingClientRect('#' + ID.value);
    uni.pageScrollTo({
      scrollTop: res.top,
      duration: 250,
    });
  };

  provide('TFormItem', {
    validate,
    getValues,
    getDisable,
    getComponentsProps,
    setFormModel: (value: any) => {
      setFormModel(schema.field, value);
      validate();
    },
    onFocus: () => {
      isFocus.value = true;
    },
    onBlur: () => {
      isFocus.value = false;
      validate();
    },
    onFormItemConfirm: () => {
      formProps.autoSubmitOnEnter && formActionType?.submit();
    },
  });

  function setFromEl() {
    if (getShow.value) {
      addField(schema.field, {
        validate,
        clearValidate,
        scrollToField,
      });
    } else {
      removeField(schema.field);
    }
  }

  onMounted(setFromEl);
  watch(getShow, setFromEl);
</script>

<style lang="scss" scoped>
  .form-item {
    padding: 0 30rpx 20rpx;

    .box-left {
      display: flex;
      position: relative;
      min-height: 67rpx;
      padding-bottom: 1rpx;
      .label {
        position: relative;
        display: block;
        flex-shrink: 0;
        font-size: 30rpx;
        line-height: 64rpx;
        margin-right: 24rpx;
        color: var(--xt-color-text);
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      .item {
        flex: 1;
      }

      .required {
        top: 0;
        left: -17rpx;
        line-height: 67rpx;
        position: absolute;
        color: var(--xt-color-danger);
      }
    }

    .box-top {
      position: relative;
      min-height: 67rpx;
      padding-bottom: 1rpx;
      .label {
        position: relative;
        display: block;
        max-width: 500rpx;
        line-height: 1.5;
        font-size: 28rpx;
        color: var(--xt-color-text);
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
      .item {
        flex: 1;
      }

      .required {
        top: 0;
        left: -17rpx;
        line-height: 1.5;
        position: absolute;
        color: var(--xt-color-danger);
      }
    }

    .border {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      width: 100%;
      height: 1px;
      transition: all 250ms;
    }

    .border-base {
      z-index: 1;
      background-color: var(--xt-border-color);
    }

    .border-focus {
      z-index: 2;
      transform: scale(0);
      background-color: var(--xt-color-primary);
    }

    .border-focus-show {
      transform: scale(1);
    }

    .border-error {
      z-index: 3;
      transform: scale(0);
      background-color: var(--xt-color-danger);
    }

    .border-error-show {
      transform: scale(1);
    }

    .error-box {
      height: 34rpx;
      position: relative;
      overflow: hidden;

      .error-text {
        transition: all 250ms;
        position: absolute;
        top: -20rpx;
        left: 0;
        opacity: 0;
        width: 100%;
        font-size: 24rpx;
        height: 34rpx;
        line-height: 34rpx;
        color: var(--xt-color-danger);
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      .error-text-show {
        top: 0;
        opacity: 1;
      }
    }
  }
</style>
