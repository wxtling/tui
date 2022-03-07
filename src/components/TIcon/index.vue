<template>
  <view
    class="icon"
    :style="{
      width,
      height,
    }"
  >
    <TSvgImg :svg="svg" :width="width" :height="height" />
  </view>
</template>

<script lang="ts" setup>
  /** icon 图标 */
  import { watch, ref, toRaw } from 'vue';
  import md5 from 'crypto-js/md5';
  import { CacheEnum } from '@/enums/cacheEnum';
  import { propTypes } from '@/utils/propTypes';
  import { useEnv } from '@/hooks/core/useEnv';
  import TSvgImg from '@/components/TSvgImg/index.vue';

  const props = defineProps({
    // 图标
    type: propTypes.string,

    // 图标 svg 信息
    svg: propTypes.string,

    // 宽度
    width: propTypes.string.def('44rpx'),

    // 高度
    height: propTypes.string.def('44rpx'),

    // 用于图标对齐。如果您设置了自定义宽度和高度，这将很有用
    align: propTypes
      .oneOf(['left', 'right', 'center', 'top', 'middle', 'bottom', 'crop', 'meet'])
      .def('center'),

    // 设置自定义颜色
    color: propTypes.string.def('#999'),

    // 是用于旋转图标，值可以是度 90度（只有90，180和270度的旋转是可用的）
    rotate: propTypes.string,

    // 水平、垂直
    flip: propTypes.oneOf(['horizontal', 'vertical']),
  });
  
  const { getEnv } = useEnv();

  const svg = ref<string>('');

  function getIcon() {
    if (!props.type) return (svg.value = props.svg);
    const url = getEnv('ICON_URL') + '/' + props.type + '.svg';
    let data: { [x: string]: string } = toRaw({ ...props });
    delete data.type;

    const CacheKey = CacheEnum.icon + md5(url + JSON.stringify(data));
    const iconValue = uni.getStorageSync(CacheKey);
    if (iconValue) {
      svg.value = iconValue;
      return;
    }

    data.width = data.width.replace('r', '');
    data.height = data.height.replace('r', '');
    uni.request({
      url,
      data,
      responseType: 'text',
      header: {
        'content-type': 'image/svg+xml; charset=utf-8',
      },
      success: (res) => {
        svg.value = res.data as string;
        uni.setStorageSync(CacheKey, res.data);
      },
      fail: (err) => {
        console.error('获取图标异常：', err);
      },
    });
  }

  watch(props, getIcon);
  getIcon();
</script>

<style lang="scss" scoped>
  .icon {
    display: inline-block;
  }
</style>
