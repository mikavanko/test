<script setup>
const props = defineProps({
  modelValue: {
    type: Boolean,
  },
  disabled: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["update:modelValue"]);

function onChange(e) {
  emit("update:modelValue", e.target.checked);
}
</script>

<template>
  <label :class="['label', {'has-text': !$slots.default}]">
    <slot v-if="$slots.default"></slot>
    <input type="checkbox" :checked="modelValue" :disabled="disabled" @change="onChange" />
    <span class="checkmark"></span>
  </label>
</template>

<style lang="scss" scoped>
.label {
  display: block;
  position: relative;
  padding-left: 27px;
  cursor: pointer;
  font-weight: 400;
  font-size: 14px;
  line-height: 19px;
  user-select: none;
  color: $color-dark-40;

  &.has-text{
    padding-left: 0;
    .checkmark{
      position: relative;
    }
  }
}

.label input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkmark {
  position: absolute;
  display: block;
  top: 0;
  left: 0;
  height: 21px;
  width: 21px;
  border: 1px solid $color-dark-20;
  border-radius: 6px;
  background-color: transparent;
}

.label:hover input ~ .checkmark {
}

.label input:checked ~ .checkmark {
  background-color: $color-primary;
  border-color: transparent;
}

.checkmark:after {
  content: "";
  position: absolute;
  display: none;
}

.label input:checked ~ .checkmark:after {
  display: block;
}

.label .checkmark:after {
  left: 7px;
  top: 3px;
  width: 4px;
  height: 9px;
  border: solid #fff;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}
</style>
