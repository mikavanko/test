<script>
import { reactive, computed, nextTick, ref, watchEffect } from "vue";
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
    const value = ref()

    watchEffect(()=>{
      value.value = props.modelValue
    })

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

    function onClose(){
      const link = (value.value.indexOf('://') === -1) ? 'https://' + value.value : value.value
      emit("update:modelValue", link);
    }

    return {
      isMobile,
      value,
      actions,
      onClose,
    };
  },
};
</script>

<template>
  <FieldValueWrapper
    :value="value"
    :actions="actions"
    :editMode="editMode"
    @close="onClose"
  >
    <template #component="{ setFocusRef }">
      <input
        :ref="(el) => setFocusRef(el)"
        v-model="value"
        class="url-input"
        type="text"
      />
    </template>
    <template #text="{ item }">
      <a @click.stop class="url-link" :href="item" target="_blank">{{
        item
      }}</a>
    </template>
  </FieldValueWrapper>
</template>

<style lang="scss" scoped>
.url-link {
  text-decoration: underline;
  color: $color-dark;
}
.url-input {
  @include clear-input;

  padding: 6px 5px;
  min-height: 34px;
  font-weight: 400;
  font-size: 14px;
  box-shadow: 0px 0px 10px rgba(34, 34, 34, 0.1);
  border-radius: 4px;
}
</style>
