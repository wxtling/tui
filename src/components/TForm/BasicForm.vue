<template>
  <form @submit.prevent="handleSubmit">
    <template v-for="schema in getSchema" :key="schema.field">
      <TFormItem
        :schema="schema"
        :formProps="getProps"
        :allDefaultValues="defaultValueRef"
        :formModel="formModel"
        :setFormModel="setFormModel"
        :formActionType="formActionType"
      >
        <slot :name="schema.slot" v-if="schema.slot" />
        <TInput v-else-if="schema.component === 'TInput'" />
        <TInputNumber v-else-if="schema.component === 'TInputNumber'" />
        <TInputTextArea v-else-if="schema.component === 'TInputTextArea'" />
        <TSelect v-else-if="schema.component === 'TSelect'" />
        <TPicker v-else-if="schema.component === 'TPicker'" />
        <TPickerDate v-else-if="schema.component === 'TPickerDate'" />
        <TRadio v-else-if="schema.component === 'TRadio'" />
        <TCheckbox v-else-if="schema.component === 'TCheckbox'" />
        <TSwitch v-else-if="schema.component === 'TSwitch'" />
        <TUpload v-else-if="schema.component === 'TUpload'" />
        <TArea v-else-if="schema.component === 'TArea'" />
      </TFormItem>
    </template>
    <slot />
  </form>
</template>

<script lang="ts" setup>
  import TArea from './components/TArea.vue';
  import TInput from './components/TInput.vue';
  import TInputNumber from './components/TInputNumber.vue';
  import TInputTextArea from './components/TInputTextArea.vue';
  import TSelect from './components/TSelect.vue';
  import TPicker from './components/TPicker.vue';
  import TPickerDate from './components/TPickerDate.vue';
  import TRadio from './components/TRadio.vue';
  import TCheckbox from './components/TCheckbox.vue';
  import TSwitch from './components/TSwitch.vue';
  import TUpload from './components/TUpload.vue';

  import TFormItem from './components/TFormItem.vue';

  import type { Ref } from 'vue';
  import type { FormProps, FormSchema, FormActionType } from './types/form';

  import { ref, reactive, computed, unref, watch, onMounted } from 'vue';

  import { basicProps } from './props';
  import { DATE_TYPE } from './helper';

  import { useFormValues } from './hooks/useFormValues';
  import { useFormItemEl } from './hooks/useFormItemEl';
  import { useFormEvents } from './hooks/useFormEvents';

  import { deepMerge } from '@/utils';
  import { dateUtil } from '@/utils/dateUtil';

  const props = defineProps(basicProps);
  const emit = defineEmits(['reset', 'submit', 'register', 'update:model']);

  const formModel = reactive<Recordable>({});
  const defaultValueRef = ref<Recordable>({});
  const propsRef = ref<Partial<FormProps>>({});
  const schemaRef = ref<Nullable<FormSchema[]>>(null);

  const getProps = computed((): FormProps => {
    return { ...props, ...unref(propsRef) } as FormProps;
  });

  const getSchema = computed((): FormSchema[] => {
    const schemas: FormSchema[] = unref(schemaRef) || (unref(getProps).schemas as any);
    for (const schema of schemas) {
      const { defaultValue, component } = schema;
      if (defaultValue && DATE_TYPE.includes(component)) {
        if (Array.isArray(defaultValue)) {
          const def: any[] = [];
          defaultValue.forEach((item) => {
            def.push(dateUtil(item));
          });
          schema.defaultValue = def;
        } else {
          schema.defaultValue = dateUtil(defaultValue);
        }
      }
    }
    return schemas as FormSchema[];
  });

  const { handleFormValues, initDefault } = useFormValues({
    emit,
    getSchema,
    formModel,
    defaultValueRef,
  });

  const formItemEl = useFormItemEl({
    getSchema,
  });

  const {
    handleSubmit,
    setFieldsValue,
    clearValidate,
    validate,
    getFieldsValue,
    updateSchema,
    resetSchema,
    appendSchemaByField,
    removeSchemaByFiled,
    resetFields,
    scrollToField,
  } = useFormEvents({
    emit,
    getProps,
    formModel,
    getSchema,
    defaultValueRef,
    schemaRef: schemaRef as Ref<FormSchema[]>,
    handleFormValues,
    formItemEl,
  });

  watch(
    () => unref(getProps).model,
    () => {
      const { model } = unref(getProps);
      if (!model) return;
      setFieldsValue(model);
    },
    {
      immediate: true,
    },
  );

  watch(
    () => unref(getProps).schemas,
    (schemas) => {
      resetSchema(schemas ?? []);
    },
  );

  watch(
    () => getSchema.value,
    (schema) => {
      if (schema?.length) {
        initDefault();
      }
    },
  );

  async function setProps(formProps: Partial<FormProps>): Promise<void> {
    propsRef.value = deepMerge(unref(propsRef) || {}, formProps);
  }

  function setFormModel(key: string, value: any) {
    formModel[key] = value;
  }

  const formActionType: FormActionType = {
    getFieldsValue,
    setFieldsValue,
    resetFields,
    updateSchema,
    resetSchema,
    setProps,
    removeSchemaByFiled,
    appendSchemaByField,
    clearValidate,
    validate,
    submit: handleSubmit,
    scrollToField,
  };

  onMounted(() => {
    initDefault();
    emit('register', formActionType);
  });
</script>
