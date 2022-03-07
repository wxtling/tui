<template>
  <button type="default" class="button">button </button>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { propTypes } from '@/utils/propTypes';

  const props = defineProps({});
</script>
<style lang="scss" scoped>
  .button {
    background: none;
    border: none;
    line-height: 1;
    padding: 0;
    margin: 0;
    &::after {
      border: none;
    }
  }
</style>
