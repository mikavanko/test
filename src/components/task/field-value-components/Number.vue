<script>
import { reactive, computed, nextTick, ref, watch } from "vue";
import { isMobile } from "@/assets/js/utils";
import FieldValueWrapper from "../FieldValueWrapper.vue";
import NumberModal from "../modals/VNumberModal.vue";
// import { vNumber } from '@coders-tm/vue-number-format'
import { number } from '@coders-tm/vue-number-format'
import { NUMBER_FORMAT_NAMES_TO_SIGNS, NUMBER_FORMAT } from "../taskProperties"
import { useToast } from 'vue-toastification';
const toast = useToast();

export default {
  // directives: {
  //   number: vNumber,
  // },
  components: {
    FieldValueWrapper,
    NumberModal,
    number,
  },
  emits: ["update:modelValue"],
  props: {
    modelValue: {
      type: String,
      default: "",
    },
    format: {
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
        emit("update:modelValue", parseFloat(val));
      }
    });

    const format = computed({
      get() {
        return props.format;
      },
      set(val) {
        emit("update:format", val);
      }
    });

    const formatSign = computed(() => {
      if(format.value !== NUMBER_FORMAT.NUMBER){
        return ` ${NUMBER_FORMAT_NAMES_TO_SIGNS[format.value]}`
      }else{
        return '';
      }
    })

    const state = reactive({
      isNumberModalVisible: false,
      numberModalCoords: {
        x: null,
        y: null,
      },
      number: {
        decimal: '.',
        separator: '',
        suffix: formatSign,
        precision: 2,
      }
    });

    const actions = ref([
      {
        icon: "number-123",
        on: {
          click: (e) => {
            state.isNumberModalVisible = true;
            state.numberModalCoords = {
              x: e.clientX,
              y: e.clientY,
            };
          },
        },
      },
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

    function changeFormat(action) {
      format.value = action.type;
    }

    return {
      isMobile,
      value,
      actions,
      state,
      changeFormat,
      format,
      formatSign,
    };
  },
};
</script>

<template>
  <FieldValueWrapper
    :value="value"
    :actions="actions"
    :editMode="editMode"
    closeOnEnter
  >
    <template #component="{ setFocusRef }">
      <!-- <input
        :ref="(el) => setFocusRef(el)"
        v-model.lazy="value"
        v-number="state.number"
        class="number-input"
      /> -->
      <form @submit.prevent>
        <number
          :ref="(el) => setFocusRef(el)"
          v-model="value"
          v-bind="state.number"
          class="number-input"
        />
      </form>
    </template>
    <template #text="{ item }">
      {{ item + formatSign }}
    </template>
  </FieldValueWrapper>

  <NumberModal v-model="state.isNumberModalVisible" :coords="state.numberModalCoords" :hideOnAction="!isMobile()"
    :type="format" @click="changeFormat" />
</template>

<style lang="scss" scoped>
.number-input {
  @include clear-input;

  padding: 6px 5px;
  min-height: 34px;
  font-weight: 400;
  font-size: 14px;
  box-shadow: 0px 0px 10px rgba(34, 34, 34, 0.1);
  border-radius: 4px;

  /* Chrome, Safari, Edge, Opera */
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  /* Firefox */
  &[type="number"] {
    -moz-appearance: textfield;
  }
}
</style>
