<script>
import { reactive, computed, nextTick, ref } from "vue";
import { isMobile } from "@/assets/js/utils";
import Contenteditable from "@/components/VContenteditable.vue";
import FieldValueWrapper from "../FieldValueWrapper.vue";

import { TYPE, TYPE_ICONS, TYPE_PLACEHOLDERS } from "../taskProperties";

import { useToast } from 'vue-toastification';
const toast = useToast();

export default {
  components: {
    FieldValueWrapper,
    Contenteditable,
  },
  emits: ["update:modelValue", "close"],
  props: {
    modelValue: {
      type: String,
      default: "",
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

    const actions = ref([
      {
        icon: "duplicate",
        on: {
          click: (e) => {
            navigator.clipboard.writeText(value.value)
              .then(() => {
                toast.success('Скопировано успешно')
              })
          },
        },
      },
    ]);

    return {
      isMobile,
      value,
      actions,
    };
  },
};
</script>

<template>
  <FieldValueWrapper
    :value="value"
    :actions="actions"
    :editMode="editMode"
    @close="$emit('close', value)"
  >
    <template #component="{ setFocusRef }">
      <div class="text-wrapper">
        <contenteditable
          class="text"
          :ref="(el) => setFocusRef(el)"
          tag="div"
          :contenteditable="true"
          :noNL="true"
          :noHTML="true"
          :spellcheck="true"
          v-model="value"
        />
      </div>
    </template>
  </FieldValueWrapper>
</template>

<style lang="scss" scoped>
.text-wrapper {
  padding: 6px 5px;
  min-height: 34px;
  box-shadow: 0px 0px 10px rgba(34, 34, 34, 0.1);
  border-radius: 4px;
}
</style>
