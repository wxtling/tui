<template>
  <view class="footer">
    <view class="is-station" v-if="isStation" :style="{ paddingTop: stateH + 'px' }" />
    <view class="footer-box">
      <view class="con-box">
        <slot />
      </view>
      <view :style="{ height: stateH + 'px' }" />
    </view>
  </view>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { propTypes } from '@/utils/propTypes';
  const stateH = ref(0);

  const props = defineProps({
    // 站位
    isStation: propTypes.bool.def(true),
  });

  const { platform, safeArea, screenHeight, system } = uni.getSystemInfoSync();
  if ((platform === 'ios' || system.toLowerCase().includes('ios')) && safeArea) {
    stateH.value = screenHeight - safeArea.bottom;
  }
</script>
<style lang="scss" scoped>
  .footer {
    .is-station {
      min-height: 100rpx;
    }
    .footer-box {
      position: fixed;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 500;
      .con-box {
        height: 100rpx;
      }
    }
  }
</style>
