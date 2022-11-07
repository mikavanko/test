<script>
import { reactive, computed, nextTick, ref } from "vue";
import { isMobile } from "@/assets/js/utils";
import FieldValueWrapper from "../FieldValueWrapper.vue";

import { TYPE, TYPE_ICONS, TYPE_PLACEHOLDERS } from "../taskProperties";

import { useToast } from 'vue-toastification';
const toast = useToast();

export default {
  components: {
    FieldValueWrapper,
  },
  emits: ["update:modelValue", "close"],
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
      <input
        :ref="(el) => setFocusRef(el)"
        v-model="value"
        class="phone-input"
        type="tel"
      />
    </template>
    <template #text="{ item }">
      <a @click.stop class="phone-link" :href="`tel:${item}`">{{ item }}</a>
    </template>
  </FieldValueWrapper>
</template>

<style lang="scss" scoped>
.phone-link {
  text-decoration: underline;
  color: $color-dark;
}
.phone-input {
  @include clear-input;

  padding: 6px 5px;
  min-height: 34px;
  font-weight: 400;
  font-size: 14px;
  box-shadow: 0px 0px 10px rgba(34, 34, 34, 0.1);
  border-radius: 4px;
}
</style>
