<script>
import { computed } from "vue";
import { isMobile } from "@/assets/js/utils";
import Checkbox from "@/components/VCheckbox.vue";

export default {
  components: {
    Checkbox,
  },
  emits: ["update:modelValue"],
  props: {
    modelValue: {
      type: null,
    },
    editMode: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { emit }) {
    const value = computed({
      get() {
        return !!parseInt(props.modelValue);
      },
      set(val) {
        emit("update:modelValue", val ? "1" : "0");
      },
    });

    return {
      isMobile,
      value,
    };
  },
};
</script>

<template>
  <div class="checkbox-wrapper" @click="editMode && (value = !value)">
    <Checkbox v-model="value" :disabled="!editMode" @click.stop />
  </div>
</template>

<style lang="scss" scoped>
.checkbox-wrapper{
  min-height: 34px;
  border-radius: 4px;
  transition: .3s ease;
  cursor: pointer;
  padding: 0 5px;
  display: flex;
  justify-content: flex-start;
  align-items: center;

  &:hover{
    background: $color-primary-10;
  }
}
</style>
