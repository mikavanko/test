<script>
import { reactive, computed, ref, watch, nextTick, watchEffect } from "vue";
import { isMobile } from "@/assets/js/utils";
import Modal from "@/components/VModal.vue";
import { debounce } from "lodash";
import { TYPE, TYPE_ICONS, TYPE_PLACEHOLDERS } from "./taskProperties";
import TaskModalTypes from "./TaskModalTypes.vue";
import NumberModal from "./modals/VNumberModal.vue";
import { NUMBER_FORMAT, NUMBER_FORMAT_NAMES } from "./taskProperties";

export default {
  components: {
    Modal,
    TaskModalTypes,
    NumberModal,
  },
  emits: [
    "update:modelValue",
    "update:fieldName",
    "update:field",
    "duplicate",
    "delete",
  ],
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    translateX: {
      type: String,
      default: "0%",
    },
    translateY: {
      type: String,
      default: "0%",
    },
    coords: {
      type: Object,
      default: () => null,
    },
    fieldName: {
      type: String,
      default: "",
    },
    field: {
      type: Object,
      default: () => null,
    },
    format: {
      type: String,
      default: "",
    },
  },
  setup(props, { emit }) {
    const isModalVisible = computed({
      get() {
        return props.modelValue;
      },
      set(val) {
        emit("update:modelValue", val);
      },
    });

    const format = computed({
      get() {
        return props.format;
      },
      set(val) {
        emit("update:format", val);
      }
    });

    const fieldName = ref(props.fieldName);
    watch(
      () => props.fieldName,
      (name) => {
        fieldName.value = name;
      }
    );

    const field = computed({
      get() {
        nextTick().then(()=>{
          modalRootRef.value && modalRootRef.value.setAutoPosition()
        })
        return props.field;
      },
      set(val) {
        emit("update:field", val);
      },
    });

    const nameRef = ref();
    const taskModalTypesCoords = ref(null);
    const modalRootRef = ref(null);
    const modalTypesRef = ref(null);

    const state = reactive({
      isTaskModalTypesVisible: false,
      isNumberModalVisible: false,
      numberModalCoords: null,
    });

    watchEffect(async (val) => {
      if (isModalVisible.value) {
        await nextTick();
        nameRef.value.focus();
      }
    });

    function openTaskModalTypes(e) {
      taskModalTypesCoords.value = getModalCoords();

      state.isTaskModalTypesVisible = true;
    }

    function openNumberModal(e){
      state.numberModalCoords = getModalCoords()
      state.isNumberModalVisible = true;
    }

    function getModalCoords () {
      const modalRootNode = modalRootRef.value.$refs.modalRef;
      const modalRootNodeRect = modalRootNode.getBoundingClientRect();

      return {
        x: modalRootNodeRect.right,
        y: modalRootNodeRect.top + modalRootNodeRect.height / 2,
      };
    }

    function changeFormat(action) {
      format.value = action.type;
    }

    return {
      state,
      isModalVisible,
      isMobile,
      nameRef,
      fieldName,
      field,
      TYPE,
      TYPE_ICONS,
      TYPE_PLACEHOLDERS,
      openTaskModalTypes,
      taskModalTypesCoords,
      modalRootRef,
      modalTypesRef,
      changeFormat,
      openNumberModal,
      NUMBER_FORMAT_NAMES,
    };
  },
};
</script>

<template>
  <Teleport to="body">
    <Modal
      ref="modalRootRef"
      v-model="isModalVisible"
      :showModalTop="isMobile()"
      :width="isMobile() ? '100%' : '227px'"
      :height="isMobile() ? '100%' : 'auto'"
      :padding="'10px'"
      :bgColor="'transparent'"
      :coords="$props.coords"
      autoPositionMode
      @modal-close="$emit('change-name', fieldName)"
    >
      <form class="name-form" @submit.prevent="$emit('change-name', fieldName)">
        <input
          class="name"
          ref="nameRef"
          type="text"
          placeholder="Свойство"
          v-model="fieldName"
        />
      </form>
      <div class="modal-group">
        <h4 class="modal-title">Тип свойства</h4>
        <div class="modal-field-group">
          <div class="modal-field" @click="openTaskModalTypes">
            <svg-icon
              class="modal-field-icon modal-field-icon_left"
              :name="TYPE_ICONS[$props.field.field.type]"
            />
            <div class="modal-field-name">
              {{ TYPE_PLACEHOLDERS[$props.field.field.type] }}
            </div>
            <svg-icon
              class="modal-field-icon modal-field-icon_right"
              name="chevron-right"
            />
          </div>
          <div
            class="modal-field"
            v-if="$props.field.field.type === TYPE.NUMBER"
            @click="openNumberModal"
          >
            <div class="modal-field-name">Формат</div>
            <div class="modal-field-sub-name">{{NUMBER_FORMAT_NAMES[format]}}</div>
            <svg-icon
              class="modal-field-icon modal-field-icon_right"
              name="chevron-right"
            />
          </div>
        </div>
      </div>
      <div class="modal-group">
        <div class="modal-field-group">
          <div class="modal-field" @click="$emit('duplicate')">
            <svg-icon
              class="modal-field-icon modal-field-icon_left"
              name="duplicate"
            />
            <div class="modal-field-name">Дублировать</div>
          </div>
          <div class="modal-field" @click="$emit('delete')">
            <svg-icon
              class="modal-field-icon modal-field-icon_left"
              name="trash"
            />
            <div class="modal-field-name">Удалить</div>
          </div>
        </div>
      </div>
    </Modal>

    <TaskModalTypes
      ref="modalTypesRef"
      v-model="state.isTaskModalTypesVisible"
      :coords="isMobile() ? null : taskModalTypesCoords"
      :hideOnAction="!isMobile()"
      v-model:field="field"
      :translateY="'-50%'"
    />

    <NumberModal
      v-model="state.isNumberModalVisible"
      :coords="state.numberModalCoords"
      :hideOnAction="!isMobile()"
      :type="format"
      :translateY="'-50%'"
      @click="changeFormat"
    />
  </Teleport>
</template>

<style lang="scss" scoped>
.modal-field {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 10px;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  width: 100%;
  transition: 0.3s ease;

  &:hover {
    background-color: $color-light-f;
  }

  &-icon {
    font-size: 17px;
    color: $color-dark-70;
    flex-shrink: 0;
  }

  &-name {
    font-weight: 400;
    font-size: 12px;
    line-height: 17px;
    color: $color-dark-70;
    flex-grow: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &-sub-name{
    font-weight: 400;
    font-size: 12px;
    line-height: 17px;
    color: $color-dark-40;
  }
}
.modal-title {
  font-weight: 400;
  font-size: 12px;
  line-height: 15px;
  color: $color-dark-40;
  padding: 0 10px 5px 10px;
}
.modal-field-group {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 4px;
}
.modal-group {
  padding: 10px 0;

  &:not(:last-child) {
    border-bottom: 1px solid $color-dark-10;
  }
}
.name-form {
  border-bottom: 1px solid $color-dark-10;
  padding-bottom: 10px;
}
.name {
  @include clear-input;
  padding: 5px 5px 5px 10px;
  font-weight: 400;
  font-size: 12px;
  line-height: 17px;
  border: 1px solid transparent;
  border-radius: 4px;
  transition: 0.3s ease;

  &:focus {
    border: 1px solid $color-primary;
  }

  &::placeholder {
    color: $color-dark-20;
  }
}
</style>
