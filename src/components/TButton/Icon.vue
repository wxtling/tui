<template>
  <button
    type="default"
    class="button"
    @click.stop="emit('click')"
    :style="{ width: size, height: size }"
  >
    <TIcon :type="icon" :color="color" :width="iconSize" :height="iconSize" />
  </button>
</template>

<script lang="ts" setup>
  import { propTypes } from '@/utils/propTypes';
  import TIcon from '@/components/TIcon/index.vue';

  const props = defineProps({
    // 图标
    icon: propTypes.string.isRequired,
    // 图标颜色
    color: propTypes.string.def('#999'),
    // 按钮大小
    size: propTypes.string.def('44rpx'),
    // 图标大小
    iconSize: propTypes.string.def('44rpx'),
  });

  const emit = defineEmits<{ (e: 'click'): void }>();
</script>
<style lang="scss" scoped>
  .button {
    background: none;
    border: none;
    line-height: 1;
    padding: 0;
    margin: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    &::after {
      border: none;
    }
  }
</style>
