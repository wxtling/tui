<template>
  <view> </view>
</template>

<script lang="ts" setup>
  import { getArea } from '@/api/comp/tform';

  getArea().then((res) => {
    console.log(res);
  });
</script>

<style lang="scss" scoped></style>
