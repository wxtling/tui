<template>
  <view
    class="loading-box"
    :class="{
      'direction-top': direction === 'top',
      'direction-left': direction === 'left',
    }"
    :style="{
      minWidth: size + 'rpx',
      minHeight: size + 'rpx',
    }"
  >
    <slot />

    <view class="pa-box" v-if="modelValue">
      <view
        class="pswp-preloader-icn"
        :style="{
          width: size + 'rpx',
          height: size + 'rpx',
        }"
      >
        <view
          class="pswp-preloader-cut"
          :style="{
            width: size / 2 + 'rpx',
            height: size + 'rpx',
          }"
        >
          <view
            class="pswp-preloader-donut"
            :style="{
              width: size + 'rpx',
              height: size + 'rpx',
              borderColor: color,
              borderWidth: borderWidth + 'rpx',
              borderLeftColor: 'transparent',
              borderBottomColor: 'transparent',
            }"
          />
        </view>
      </view>
      <view class="md-text" v-if="text">{{ text }}</view>
    </view>
  </view>
</template>

<script lang="ts" setup>
  import { propTypes } from '@/utils/propTypes';

  const props = defineProps({
    // 是否显示
    modelValue: propTypes.bool.def(false),
    // 加载描述
    text: propTypes.string.def('加载中 . . .'),
    // 大小
    size: propTypes.number.def(40),
    // 圆圈的颜色
    color: propTypes.string.def('#1890ff'),
    // 圆圈的大小
    borderWidth: propTypes.number.def(5),
    // 圆圈方向
    direction: propTypes.oneOf(['left', 'top']).def('top'),
  });
</script>

<style lang="scss" scoped>
  .loading-box {
    position: relative;
    display: inline-block;
  }
  .pa-box {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(255, 255, 255, 0.8);
  }
  .pswp-preloader-icn {
    opacity: 0.75;
    animation: clockwise 500ms linear infinite;
  }

  .pswp-preloader-cut {
    position: relative;
    overflow: hidden;
    position: absolute;
    top: 0;
    left: 0;
  }

  .pswp-preloader-donut {
    box-sizing: border-box;
    border: 2px solid #999;
    border-radius: 50%;
    border-left-color: transparent;
    border-bottom-color: transparent;
    position: absolute;
    top: 0;
    left: 0;
    background: none;
    margin: 0;
    animation: donut-rotate 1000ms cubic-bezier(0.4, 0, 0.22, 1) infinite;
  }

  .md-text {
    text-align: center;
    font-size: 30rpx;
    line-height: 1.5;
    color: #999;
  }

  .direction-top {
    .pa-box {
      flex-direction: column;
    }
    .md-text {
      padding-top: 20rpx;
      padding-left: 20rpx;
    }
  }
  .direction-left {
    .pa-box {
      flex-direction: row;
    }
    .md-text {
      padding-left: 30rpx;
    }
  }

  @keyframes clockwise {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes donut-rotate {
    0% {
      transform: rotate(0);
    }
    50% {
      transform: rotate(-140deg);
    }
    100% {
      transform: rotate(0);
    }
  }
</style>
