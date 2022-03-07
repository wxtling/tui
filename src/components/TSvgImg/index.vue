<template>
  <image class="image" :src="src" :style="style" />
</template>

<script lang="ts" setup>
  import { computed } from 'vue';
  import { propTypes } from '@/utils/propTypes';

  const props = defineProps({
    svg: propTypes.string.isRequired,
    // 宽度
    width: propTypes.string.def('750rpx'),
    // 高度
    height: propTypes.string.def('750rpx'),
  });

  const src = computed(
    () =>
      'data:image/svg+xml,' +
      encodeURIComponent(props.svg).replace(/'/g, '%27').replace(/"/g, '%22'),
  );

  const style = computed(() => ({ width: props.width, height: props.height }));
</script>
<style lang="scss" scoped>
  .image {
    width: 100%;
    height: 100%;
    display: inline-block;
  }
</style>
