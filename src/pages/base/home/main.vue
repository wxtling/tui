<template>
  <Theme>
  
    <TArea />

    <!-- Home 首页 -->
    <!-- <BasicForm @register="register" @submit="onSubmit" />

    <button @click="to"> to</button>

    <button @click="validate()"> validate </button>
    <button @click="validate(['phone', 'weixin'])"> validate phone weixin </button>
    <button @click="validate('weixin')"> validate weixin </button>
    <button @click="clearValidate()"> clearValidate </button>
    <button @click="clearValidate(['phone', 'weixin'])"> clearValidate phone weixin</button>
    <button @click="clearValidate('weixin')"> clearValidate weixin</button>
    <button @click="submit()"> submit </button> -->
  </Theme>
</template>

<script lang="ts" setup>
  /**  Home  首页 */
  import { ref, nextTick } from 'vue';
  import Theme from '@/components/Theme/index.vue';

  import TArea from '@/components/TForm/components/TArea.vue';

  // import { useForm } from '@/components/TForm/index';
  // import { defHttp } from '@/utils/http';
  // const [register, { submit, validate, clearValidate, scrollToField }] = useForm({
  //   schemas: [
  //     {
  //       label: '头像头像头像头像头像',
  //       field: 'avatar',
  //       component: 'TInput',
  //       required: true,
  //     },
  //     {
  //       label: '姓名',
  //       field: 'name',
  //       component: 'TInput',
  //     },
  //     {
  //       label: '电话',
  //       field: 'phone',
  //       component: 'TInput',
  //       rules: [
  //         {
  //           type: 'string',
  //           required: true,
  //         },
  //         {
  //           type: 'phone',
  //         },
  //       ],
  //     },
  //     {
  //       label: '微信号',
  //       field: 'weixin',
  //       component: 'TInput',
  //     },
  //   ],
  // });

  // function onSubmit(data: any) {
  //   console.log(data);
  // }

  // function to() {
  //   defHttp.get({
  //     url: '/api/logout',
  //   });
  // }
</script>

<style lang="scss" scoped></style>
