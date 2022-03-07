<template>
  <view class="input">
    <input
      class="input-box"
      placeholder-class="form-item-input-placeholder"
      :value="getProps.modelValue"
      :placeholder="getProps.placeholder"
      :disabled="getProps.disabled"
      @input="onInput"
      @focus="onFocus"
      @blur="onBlur"
      @confirm="onConfirm"
    />
    <view class="icon" v-if="getProps.isClose && getProps.modelValue">
      <TButtonIcon icon="ion:close" size="64rpx" iconSize="36rpx" @click="onClose" />
    </view>
  </view>
</template>

<script lang="ts" setup>
  import TButtonIcon from '@/components/TButton/Icon.vue';

  import { propTypes } from '@/utils/propTypes';

  import { useFormItem } from '../hooks/useContext';

  const props = defineProps({
    modelValue: propTypes.string.def(''),
    disabled: propTypes.bool.def(false),
    placeholder: propTypes.string,
    isClose: propTypes.bool.def(true),
  });

  const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'close', 'confirm']);

  const { getProps, setFormModel, onFormItemFocus, onFormItemBlur, onFormItemConfirm } = useFormItem(props);

  function onInput({ detail: { value } }: any) {
    emit('update:modelValue', value);
    setFormModel(value);
  }

  function onFocus() {
    emit('focus');
    onFormItemFocus();
  }

  function onBlur() {
    emit('blur');
    onFormItemBlur();
  }

  function onClose() {
    emit('close');
    setFormModel('');
  }

  function onConfirm() {
    emit('confirm');
    onFormItemConfirm();
  }
</script>

<style lang="scss" scoped>
  .input {
    width: 100%;
    display: flex;
    align-items: center;

    .input-box {
      width: 100%;
      height: 64rpx;
      line-height: 64rpx;
      font-size: 30rpx;
      color: #000;
    }

    .icon {
      flex-shrink: 0;
    }
  }
  :global(.form-item-input-placeholder) {
    font-size: 28rpx;
    color: #999;
    height: 64rpx;
    line-height: 64rpx;
  }
</style>
