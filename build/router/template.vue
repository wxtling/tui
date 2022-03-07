<template>
  <Theme>
    <!-- $name $navigationBarTitleText -->
    $navigationBarTitleText
  </Theme>
</template>

<script lang="ts" setup>
  /**  $name  $navigationBarTitleText */
  import Theme from '@/components/Theme/index.vue';

  /**
   * 根据需求 可要 和 可不要
   * 解决微信小程序 子组件不能使用 import { onPageScroll } from '@dcloudio/uni-app';
   */
  import { onPageScroll } from '@dcloudio/uni-app';
  onPageScroll(() => {});
</script>

<style lang="scss" scoped></style>
