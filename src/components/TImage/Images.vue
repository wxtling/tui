<template>
  <slot />
</template>

<script lang="ts" setup>
  import { ref, provide } from 'vue';
  const images = ref([]);
  provide('xt_images', images.value);
</script>
