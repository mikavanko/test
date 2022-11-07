<script setup>
import { reactive, provide, onMounted, onUnmounted } from "vue";

const emit = defineEmits(["submit", "update:modelValue"]);

const state = reactive({
  validateComponents: [],
});

defineProps({
  modelValue: {
    type: Object,
    default: () => {},
  },
  height: {
    type: String,
    default: "auto",
  },
  width: {
    type: String,
    default: "100%",
  },
});

onMounted(() => {
  emit("update:modelValue", state.validateComponents);
});
onUnmounted(() => {
  emit("update:modelValue", state.validateComponents);
});

provide("form", { bind, unbind });

function bind(component) {
  state.validateComponents.push(component);
}
function unbind(uid) {
  const index = state.validateComponents.findIndex((c) => c.uid === uid);
  if (index > -1) {
    state.validateComponents.splice(index, 1);
  }
}
const validate = () => {
  const errors = [];

  for (const component of state.validateComponents) {
    if (component.required) {
      const result = component.validate();

      if (result.hasError || result.hasNotRuleError) {
        errors.push(result);
      }
    }
  }
  return errors;
};

const getValues = () => {
  const values = [];

  for (const component of state.validateComponents) {
    const value = component.getValue();
    if(!component.notUse){
      values.push(value);
    }
  }
  return values;
};

const onSubmit = () => {
  const errors = validate();
  const values = getValues();

  emit("submit", { errors, values });
};
</script>

<template>
  <form
    class="form"
    @submit.prevent="onSubmit"
    :style="{
      '--height': height,
      '--width': width,
    }"
  >
    <div class="form-body">
      <slot />
    </div>
    <slot name="bottom" />
  </form>
</template>

<style lang="scss" scoped>
.form {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  height: var(--height);
  width: var(--width);

  &-row {
    margin-bottom: 20px;
  }

  &-body {
    flex-grow: 1;
    padding-bottom: 24px;

    @media all and (min-width: $xl) {
      flex-grow: 0;
    }
  }

  &-submit {
    @include submit-button();
  }
}
</style>
