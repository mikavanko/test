<script>
import { reactive, computed, onUpdated, ref } from "vue";
import { isMobile } from "@/assets/js/utils";
import Modal from "@/components/VModal.vue";
import { debounce } from "lodash";
import { TYPE, TYPE_ICONS, TYPE_PLACEHOLDERS } from "./taskProperties";

export default {
  components: {
    Modal,
  },
  emits: ["update:modelValue", "update:fieldName"],
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
    field: {
      type: Object,
      default: () => {},
    },
    hideOnAction: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { emit }) {
    const modalRef = ref();
    
    const isModalVisible = computed({
      get() {
        return props.modelValue;
      },
      set(val) {
        emit("update:modelValue", val);
      },
    });

    const field = computed({
      get() {
        return props.field;
      },
      set(val) {
        emit("update:field", val);
      },
    });

    function changeField(e, type) {
      hideOnClick();
      field.value = {
        type: TYPE[type],
        text: TYPE_PLACEHOLDERS[type],
        icon: TYPE_ICONS[type],
      };
    }

    function hideOnClick() {
      props.hideOnAction && (isModalVisible.value = !props.hideOnAction)
    }

    return {
      // state,
      isModalVisible,
      isMobile,
      TYPE,
      TYPE_ICONS,
      TYPE_PLACEHOLDERS,
      field,
      changeField,
      modalRef,
    };
  },
};
</script>

<template>
  <Teleport to="body">
    <Modal
      ref="modalRef"
      v-model="isModalVisible"
      :showModalTop="isMobile()"
      :width="isMobile() ? '100%' : '227px'"
      :height="isMobile() ? '100%' : 'auto'"
      :padding="'10px'"
      :bgColor="'transparent'"
      :coords="$props.coords"
      :translateY="$props.translateY"
      autoPositionMode
    >
      <!-- :translateX="'0'" -->
      <!-- :captureClick="!isMobile()" -->
      <div class="modal-group">
        <h4 class="modal-title">Тип свойства</h4>
        <div class="modal-field-group">
          <div
            class="modal-field"
            v-for="(item, idx) of TYPE"
            :key="idx"
            @click="changeField($event, item)"
          >
            <svg-icon
              class="modal-field-icon modal-field-icon_left"
              :name="TYPE_ICONS[item]"
            />
            <div class="modal-field-name">{{ TYPE_PLACEHOLDERS[item] }}</div>
            <svg-icon
              v-if="field.type === item"
              class="modal-field-icon modal-field-icon_right"
              name="tick"
            />
          </div>
        </div>
      </div>
    </Modal>
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
