<template>
  <view :style="ThemeStyle">
    <slot />
  </view>
</template>

<script lang="ts" setup>
  import { computed } from 'vue';
  import { useThemeStoreWithOut } from '@/store/modules/theme';

  const ThemeStore = useThemeStoreWithOut();

  const ThemeStyle = computed(() => {
    const theme = ThemeStore.getTheme;
    let style: any = {};
    for (const key in theme) {
      style['--' + key] = theme[key];
    }
    return style;
  });
</script>
