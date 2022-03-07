<template>
  <Loading v-model="loading">
    <view class="image" :style="style" @click="previewImage">
      <image
        v-if="!isError"
        class="image-box"
        :src="src"
        :mode="mode"
        :lazy-load="lazyLoad"
        :show-menu-by-longpress="showMenuByLongpress"
        :draggable="draggable"
        @load="onLoad"
        @error="onError"
      />
      <slot name="error" v-else>
        <view class="error-text"> 图片加载失败 </view>
      </slot>
    </view>
  </Loading>
</template>

<script lang="ts" setup>
  import { ref, computed, watch, inject, onBeforeUnmount } from 'vue';
  import { propTypes } from '@/utils/propTypes';
  import { buildUUID } from '@/utils/uuid';
  import Loading from '@/components/Loading/index.vue';
  const props = defineProps({
    // 图片资源地址
    src: propTypes.string,

    // 宽度
    width: propTypes.string.def('320px'),

    // 高度
    height: propTypes.string.def('240px'),

    //图片裁剪、缩放的模式
    mode: propTypes.string,

    //图片懒加载。只针对page与scroll-view下的image有效
    lazyLoad: propTypes.bool.def(true),

    //	图片显示动画效果 仅App-nvue 2.3.4+ Android有效
    fadeShow: propTypes.bool.def(true),

    // 微信小程序2.7.0
    showMenuByLongpress: propTypes.bool.def(false),

    // 鼠标长按是否能拖动图片
    draggable: propTypes.bool.def(true),

    // 预览图片
    preview: propTypes.bool.def(false),
  });

  const emit = defineEmits(['load', 'error']);

  const loading = ref(true);
  const isError = ref(false);
  const images = inject<string[] | undefined>('xt_images', undefined);

  const src = computed(
    () =>
      props.src ||
      `https://picsum.photos/${parseInt(props.width)}/${parseInt(props.height)}?uid=${buildUUID()}`,
  );

  const style = computed(() => ({ width: props.width, height: props.height }));

  function onLoad() {
    loading.value = false;
    emit('load');
  }

  function onError() {
    loading.value = false;
    isError.value = true;
    emit('error');
  }

  function previewImage() {
    if (!props.preview || isError.value) return;
    uni.previewImage({
      current: src.value,
      urls: images ?? [src.value],
    });
  }

  function delImages(src: string) {
    if (!images) return;
    const index = images.findIndex((url) => url === src) || -1;
    if (index !== -1) images.splice(index, 1);
  }

  function addImages(src: string, oldSrc?: string) {
    if (!props.preview || !images) return;
    images.push(src);
    if (oldSrc) delImages(oldSrc);
  }

  onBeforeUnmount(() => {
    delImages(src.value);
  });

  watch(src, addImages);
  addImages(src.value);
</script>
<style lang="scss" scoped>
  .image {
    background-color: #f5f5f5;
    display: inline-block;
  }

  .error-text {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 26rpx;
    color: #999;
  }
  .image-box {
    width: 100%;
    height: 100%;
    font-size: 0;
    vertical-align: middle;
  }
</style>
