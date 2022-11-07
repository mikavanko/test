<script>
import { reactive, computed, nextTick, ref, watch, onUnmounted } from "vue";

import { TYPE, TYPE_ICONS, TYPE_PLACEHOLDERS } from "../taskProperties";

import MultiList from "./MultiList.vue";

export default {
  components: {
    MultiList,
  },
  emits: ["update:modelValue", "option-add", "close", "option-remove", "name-changed", "color-changed"],
  props: {
    modelValue: {
      type: Array,
      default: () => [],
    },
    options: {
      type: Array,
      default: () => [],
    },
    editMode: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { emit }) {
    const value = computed({
      get() {
        return props.modelValue;
      },
      set(val) {
        emit("update:modelValue", val);
      },
    });
    return {
      value,
    };
  },
};
</script>

<template>
  <MultiList
    v-model="value"
    :options="options"
    :multiselect="false"
    :editMode="editMode"
    @option-add="$emit('option-add', $event)"
    @option-remove="$emit('option-remove', $event)"
    @name-changed="$emit('name-changed', $event)"
    @color-changed="$emit('color-changed', $event)"
    @close="$emit('close', $event)"
  />
</template>

<style lang="scss" scoped>
</style>